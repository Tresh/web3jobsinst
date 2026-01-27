import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// WJI Referral Program deadline: Sunday 23:59 UTC
// Set to Feb 2, 2025 23:59:59 UTC as example - adjust as needed
const REFERRAL_DEADLINE = new Date("2025-02-02T23:59:59Z");
const DAILY_REFERRAL_CAP = 100;

interface WJIAwardRequest {
  action: "check_referral_on_approval" | "award_daily_activity" | "generate_code";
  user_id: string;
  referrer_id?: string;
  activity_type?: "task" | "course" | "module";
  reference_id?: string;
  signup_ip?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: WJIAwardRequest = await req.json();
    const { action, user_id, referrer_id, activity_type, reference_id, signup_ip } = body;

    // Check if referral period is still active
    const now = new Date();
    const isReferralActive = now <= REFERRAL_DEADLINE;

    if (action === "generate_code") {
      // Generate referral code for approved scholar
      const { data: existingCode } = await supabase
        .from("scholar_referral_codes")
        .select("referral_code")
        .eq("user_id", user_id)
        .maybeSingle();

      if (existingCode) {
        return new Response(
          JSON.stringify({ success: true, referral_code: existingCode.referral_code }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate unique code
      let code: string;
      let isUnique = false;
      do {
        const { data: codeData } = await supabase.rpc("generate_referral_code");
        code = codeData;
        const { data: existing } = await supabase
          .from("scholar_referral_codes")
          .select("id")
          .eq("referral_code", code)
          .maybeSingle();
        isUnique = !existing;
      } while (!isUnique);

      const { error: insertError } = await supabase
        .from("scholar_referral_codes")
        .insert({ user_id, referral_code: code });

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ success: true, referral_code: code }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "check_referral_on_approval") {
      // Called when a scholarship application is approved
      // Check if this user was referred
      const { data: referral } = await supabase
        .from("scholar_referrals")
        .select("*, scholar_referral_codes!inner(user_id, is_enabled)")
        .eq("referred_user_id", user_id)
        .maybeSingle();

      if (!referral) {
        return new Response(
          JSON.stringify({ success: true, message: "No referral found for this user" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if already awarded
      if (referral.wji_awarded) {
        return new Response(
          JSON.stringify({ success: true, message: "WJI already awarded for this referral" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if referral period is still active
      if (!isReferralActive) {
        return new Response(
          JSON.stringify({ success: true, message: "Referral period has ended" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if referrer is enabled
      const referrerCode = referral.scholar_referral_codes;
      if (!referrerCode?.is_enabled) {
        return new Response(
          JSON.stringify({ success: true, message: "Referrer is disabled" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const referrerUserId = referral.referrer_user_id;

      // FRAUD CHECK 1: Self-referral
      if (referrerUserId === user_id) {
        await supabase.from("referral_fraud_flags").insert({
          referrer_user_id: referrerUserId,
          referred_user_id: user_id,
          rule_triggered: "self_referral",
          details: { message: "User tried to refer themselves" },
        });
        return new Response(
          JSON.stringify({ success: false, message: "Self-referral detected" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // FRAUD CHECK 2: Daily referral cap
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from("wji_transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", referrerUserId)
        .eq("transaction_type", "referral")
        .gte("created_at", todayStart.toISOString());

      if ((todayCount || 0) >= DAILY_REFERRAL_CAP) {
        await supabase.from("referral_fraud_flags").insert({
          referrer_user_id: referrerUserId,
          referred_user_id: user_id,
          rule_triggered: "referral_cap_exceeded",
          details: { daily_count: todayCount, cap: DAILY_REFERRAL_CAP },
        });
        return new Response(
          JSON.stringify({ success: false, message: "Daily referral cap exceeded" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // FRAUD CHECK 3: IP abuse (if signup_ip available)
      if (referral.signup_ip) {
        const { count: ipCount } = await supabase
          .from("scholar_referrals")
          .select("*", { count: "exact", head: true })
          .eq("referrer_user_id", referrerUserId)
          .eq("signup_ip", referral.signup_ip);

        if ((ipCount || 0) > 3) {
          await supabase.from("referral_fraud_flags").insert({
            referrer_user_id: referrerUserId,
            referred_user_id: user_id,
            rule_triggered: "ip_abuse",
            details: { ip: referral.signup_ip, count: ipCount },
          });
          return new Response(
            JSON.stringify({ success: false, message: "Suspicious IP activity detected" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // All checks passed - award WJI to referrer
      // 1. Update or create WJI balance
      const { data: existingBalance } = await supabase
        .from("wji_balances")
        .select("balance")
        .eq("user_id", referrerUserId)
        .maybeSingle();

      if (existingBalance) {
        await supabase
          .from("wji_balances")
          .update({ balance: existingBalance.balance + 1 })
          .eq("user_id", referrerUserId);
      } else {
        await supabase
          .from("wji_balances")
          .insert({ user_id: referrerUserId, balance: 1 });
      }

      // 2. Create transaction record
      await supabase.from("wji_transactions").insert({
        user_id: referrerUserId,
        amount: 1,
        transaction_type: "referral",
        reference_id: user_id,
        description: `Referral bonus for referring a new scholar`,
      });

      // 3. Mark referral as awarded
      await supabase
        .from("scholar_referrals")
        .update({ wji_awarded: true, wji_awarded_at: new Date().toISOString() })
        .eq("id", referral.id);

      return new Response(
        JSON.stringify({ success: true, message: "WJI awarded to referrer", amount: 1 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "award_daily_activity") {
      // Award WJI for daily activity (task, course, module completion)
      // Only for referred scholars during the referral period

      if (!isReferralActive) {
        return new Response(
          JSON.stringify({ success: true, message: "Referral period has ended" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if user was referred
      const { data: referral } = await supabase
        .from("scholar_referrals")
        .select("id")
        .eq("referred_user_id", user_id)
        .maybeSingle();

      if (!referral) {
        return new Response(
          JSON.stringify({ success: true, message: "User was not referred" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Determine WJI amount based on activity type
      let wjiAmount = 0;
      switch (activity_type) {
        case "task":
          wjiAmount = 1;
          break;
        case "course":
          wjiAmount = 3;
          break;
        case "module":
          wjiAmount = 2;
          break;
        default:
          wjiAmount = 1;
      }

      // Check for duplicate (same reference_id on same day)
      if (reference_id) {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const { data: existing } = await supabase
          .from("wji_transactions")
          .select("id")
          .eq("user_id", user_id)
          .eq("reference_id", reference_id)
          .gte("created_at", todayStart.toISOString())
          .maybeSingle();

        if (existing) {
          return new Response(
            JSON.stringify({ success: true, message: "Already awarded for this activity today" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Update or create WJI balance
      const { data: existingBalance } = await supabase
        .from("wji_balances")
        .select("balance")
        .eq("user_id", user_id)
        .maybeSingle();

      if (existingBalance) {
        await supabase
          .from("wji_balances")
          .update({ balance: existingBalance.balance + wjiAmount })
          .eq("user_id", user_id);
      } else {
        await supabase
          .from("wji_balances")
          .insert({ user_id, balance: wjiAmount });
      }

      // Create transaction record
      await supabase.from("wji_transactions").insert({
        user_id,
        amount: wjiAmount,
        transaction_type: activity_type || "activity",
        reference_id: reference_id || null,
        description: `Daily ${activity_type} completion bonus`,
      });

      return new Response(
        JSON.stringify({ success: true, message: "WJI awarded for activity", amount: wjiAmount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("WJI Referral Handler Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BroadcastRequest {
  audience: "scholars" | "all_users";
  subject: string;
  body: string;
}

interface EmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

// Resend batch API allows up to 100 emails per call
const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 600; // Respect 2 req/sec limit

// Simple email validation
const isValidEmail = (email: string | null | undefined): boolean => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0) return false;
  // Basic email regex - must have @ and at least one character on each side
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  console.log("=== BROADCAST EMAIL START ===");
  console.log("RESEND_API_KEY configured:", !!resendApiKey);

  if (!resendApiKey) {
    console.error("RESEND_API_KEY is not configured!");
    return new Response(
      JSON.stringify({ success: false, error: "RESEND_API_KEY not configured" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    let sentByUserId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      sentByUserId = user?.id || null;
    }

    const { audience, subject, body }: BroadcastRequest = await req.json();
    console.log("Request:", { audience, subject: subject?.substring(0, 50) });

    if (!subject || !body) {
      return new Response(
        JSON.stringify({ success: false, error: "Subject and body are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let rawRecipients: { email: string; full_name: string | null }[] = [];

    if (audience === "scholars") {
      const { data: scholars, error } = await supabase
        .from("scholarship_applications")
        .select("email, full_name")
        .eq("status", "approved");

      if (error) throw error;
      rawRecipients = scholars || [];
    } else if (audience === "all_users") {
      const { data: users, error } = await supabase
        .from("profiles")
        .select("email, full_name")
        .not("email", "is", null);

      if (error) throw error;
      rawRecipients = users || [];
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid audience type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Filter out invalid emails
    const recipients = rawRecipients.filter(r => isValidEmail(r.email));
    const skippedCount = rawRecipients.length - recipients.length;
    
    console.log(`Total raw recipients: ${rawRecipients.length}`);
    console.log(`Valid recipients: ${recipients.length}`);
    console.log(`Skipped (invalid email): ${skippedCount}`);

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No valid recipients found", 
          emailsSent: 0,
          skippedInvalidEmails: skippedCount 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create campaign record
    const bodyPreview = body.length > 500 ? body.substring(0, 500) + "..." : body;
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .insert({
        subject,
        body_preview: bodyPreview,
        audience,
        total_recipients: recipients.length,
        queued_count: recipients.length,
        sending_count: 0,
        delivered_count: 0,
        failed_count: 0,
        status: "sending",
        sent_by: sentByUserId || "00000000-0000-0000-0000-000000000000",
      })
      .select()
      .single();

    if (campaignError) {
      console.error("Failed to create campaign:", campaignError);
    }

    const campaignId = campaign?.id;
    console.log("Campaign created:", campaignId);

    // Create delivery records for all valid recipients
    if (campaignId) {
      const deliveryRecords = recipients.map((r) => ({
        campaign_id: campaignId,
        recipient_email: r.email.trim(),
        recipient_name: r.full_name,
        status: "queued",
      }));
      await supabase.from("email_deliveries").insert(deliveryRecords);
    }

    // Helper to generate email HTML
    const generateEmailHtml = (recipientName: string | null) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📢 ${subject}</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${recipientName || "there"},</p>
    <div style="font-size: 16px; white-space: pre-wrap;">${body}</div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center; margin-bottom: 0;">
      Web3 Jobs Institute<br>
      Building the future of Web3 talent
    </p>
  </div>
</body>
</html>`;

    let emailsSent = 0;
    let emailsFailed = 0;
    const errors: string[] = [];

    // Process in batches using Resend Batch API
    const totalBatches = Math.ceil(recipients.length / BATCH_SIZE);
    console.log(`Processing ${recipients.length} emails in ${totalBatches} batches`);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const batch = recipients.slice(start, start + BATCH_SIZE);
      
      console.log(`Batch ${batchIndex + 1}/${totalBatches}: ${batch.length} emails`);

      // Mark batch as sending
      if (campaignId) {
        const batchEmails = batch.map(r => r.email.trim());
        await supabase
          .from("email_deliveries")
          .update({ status: "sending", updated_at: new Date().toISOString() })
          .eq("campaign_id", campaignId)
          .in("recipient_email", batchEmails);
      }

      // Prepare batch payload for Resend Batch API
      const batchPayload: EmailPayload[] = batch.map(recipient => ({
        from: "Web3 Jobs Institute <noreply@web3jobsinstitute.careers>",
        to: [recipient.email.trim()],
        subject: subject,
        html: generateEmailHtml(recipient.full_name),
      }));

      try {
        // Use Resend Batch API - sends up to 100 emails in one call
        const batchResult = await resend.batch.send(batchPayload);
        
        console.log(`Batch ${batchIndex + 1} result:`, JSON.stringify(batchResult).substring(0, 200));

        // Resend batch.send returns { data: { data: [...] } } on success or { data: null, error: {...} } on failure
        const hasData = batchResult.data && (Array.isArray(batchResult.data) || (batchResult.data as any).data);
        
        if (hasData && !batchResult.error) {
          // All emails in batch sent successfully
          emailsSent += batch.length;
          
          if (campaignId) {
            const batchEmails = batch.map(r => r.email.trim());
            await supabase
              .from("email_deliveries")
              .update({ status: "delivered", updated_at: new Date().toISOString() })
              .eq("campaign_id", campaignId)
              .in("recipient_email", batchEmails);
          }
          console.log(`Batch ${batchIndex + 1}: SUCCESS - ${batch.length} emails sent`);
        } else if (batchResult.error) {
          console.error(`Batch ${batchIndex + 1} failed:`, batchResult.error);
          emailsFailed += batch.length;
          errors.push(`Batch ${batchIndex + 1}: ${batchResult.error.message || "Unknown error"}`);
          
          if (campaignId) {
            const batchEmails = batch.map(r => r.email.trim());
            await supabase
              .from("email_deliveries")
              .update({ 
                status: "failed", 
                failure_reason: batchResult.error.message || "Batch send failed",
                updated_at: new Date().toISOString() 
              })
              .eq("campaign_id", campaignId)
              .in("recipient_email", batchEmails);
          }
        }
      } catch (batchError) {
        const errorMessage = batchError instanceof Error ? batchError.message : String(batchError);
        console.error(`Batch ${batchIndex + 1} exception:`, errorMessage);
        emailsFailed += batch.length;
        errors.push(`Batch ${batchIndex + 1}: ${errorMessage}`);
        
        if (campaignId) {
          const batchEmails = batch.map(r => r.email.trim());
          await supabase
            .from("email_deliveries")
            .update({ 
              status: "failed", 
              failure_reason: errorMessage,
              updated_at: new Date().toISOString() 
            })
            .eq("campaign_id", campaignId)
            .in("recipient_email", batchEmails);
        }
      }

      // Update campaign progress
      if (campaignId) {
        await supabase
          .from("email_campaigns")
          .update({
            queued_count: Math.max(0, recipients.length - start - batch.length),
            delivered_count: emailsSent,
            failed_count: emailsFailed,
          })
          .eq("id", campaignId);
      }

      // Rate limit: wait between batches
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    // Finalize campaign
    if (campaignId) {
      let finalStatus = "completed";
      if (emailsFailed > 0 && emailsSent > 0) {
        finalStatus = "partially_failed";
      } else if (emailsFailed > 0 && emailsSent === 0) {
        finalStatus = "failed";
      }

      await supabase
        .from("email_campaigns")
        .update({
          queued_count: 0,
          sending_count: 0,
          delivered_count: emailsSent,
          failed_count: emailsFailed,
          status: finalStatus,
          completed_at: new Date().toISOString(),
        })
        .eq("id", campaignId);
      
      console.log(`Campaign completed: ${finalStatus}, sent=${emailsSent}, failed=${emailsFailed}`);
    }

    console.log("=== BROADCAST EMAIL COMPLETE ===");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Broadcast email sent to ${emailsSent} recipients`,
        emailsSent,
        emailsFailed,
        totalRecipients: recipients.length,
        skippedInvalidEmails: skippedCount,
        campaignId,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in admin-broadcast-email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

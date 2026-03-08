import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reference } = await req.json();
    if (!reference) {
      return new Response(JSON.stringify({ error: "reference required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify with Paystack
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${paystackSecretKey}` },
      }
    );
    const verifyData = await verifyRes.json();

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (verifyData.data?.status === "success") {
      // Update order
      const { data: order } = await adminClient
        .from("product_orders")
        .select("*, products(*)")
        .eq("paystack_reference", reference)
        .single();

      if (order && order.status !== "success") {
        await adminClient
          .from("product_orders")
          .update({
            status: "success",
            paystack_transaction_id: String(verifyData.data.id),
          })
          .eq("id", order.id);

        // Increment downloads
        if (order.products) {
          await adminClient
            .from("products")
            .update({ downloads_count: (order.products as any).downloads_count + 1 })
            .eq("id", order.product_id);
        }
      }

      return new Response(
        JSON.stringify({
          status: "success",
          download_url: order?.products ? (order.products as any).download_url : null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Update order as failed
      await adminClient
        .from("product_orders")
        .update({ status: verifyData.data?.status || "failed" })
        .eq("paystack_reference", reference);

      return new Response(
        JSON.stringify({ status: verifyData.data?.status || "failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Verify error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

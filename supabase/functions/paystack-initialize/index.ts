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
    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email;

    const { product_id, email, callback_url } = await req.json();
    if (!product_id) {
      return new Response(JSON.stringify({ error: "product_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up product price from DB
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: product, error: productError } = await adminClient
      .from("products")
      .select("*")
      .eq("id", product_id)
      .eq("is_published", true)
      .single();

    if (productError || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerEmail = email || userEmail;
    const reference = `prod_${product_id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // For free products, just create order as success
    if (product.price === 0) {
      const { error: orderError } = await adminClient
        .from("product_orders")
        .insert({
          user_id: userId,
          product_id: product_id,
          email: customerEmail,
          amount: 0,
          currency: product.currency,
          paystack_reference: reference,
          status: "success",
        });

      if (orderError) {
        console.error("Order insert error:", orderError);
        return new Response(JSON.stringify({ error: "Failed to create order" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Increment downloads
      await adminClient
        .from("products")
        .update({ downloads_count: product.downloads_count + 1 })
        .eq("id", product_id);

      return new Response(
        JSON.stringify({ free: true, download_url: product.download_url, reference }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Paystack transaction
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: product.price, // already in kobo
          reference,
          currency: product.currency,
          callback_url: callback_url || undefined,
          metadata: {
            product_id,
            product_title: product.title,
            user_id: userId,
          },
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      console.error("Paystack init failed:", paystackData);
      return new Response(
        JSON.stringify({ error: "Payment initialization failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create pending order
    const { error: orderError } = await adminClient
      .from("product_orders")
      .insert({
        user_id: userId,
        product_id: product_id,
        email: customerEmail,
        amount: product.price,
        currency: product.currency,
        paystack_reference: reference,
        status: "pending",
      });

    if (orderError) {
      console.error("Order insert error:", orderError);
    }

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        access_code: paystackData.data.access_code,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

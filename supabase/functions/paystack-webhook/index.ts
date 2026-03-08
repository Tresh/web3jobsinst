import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

async function verifySignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();

    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY")!;
    const isValid = await verifySignature(body, signature, secret);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);
    console.log("Webhook event:", event.event);

    if (event.event === "charge.success") {
      const { reference, amount, id: transaction_id } = event.data;

      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Find order by reference
      const { data: order, error: orderError } = await adminClient
        .from("product_orders")
        .select("*")
        .eq("paystack_reference", reference)
        .single();

      if (orderError || !order) {
        console.error("Order not found for reference:", reference);
        return new Response("OK", { status: 200 });
      }

      // Prevent duplicate fulfillment
      if (order.status === "success") {
        console.log("Order already fulfilled:", reference);
        return new Response("OK", { status: 200 });
      }

      // Verify amount matches
      if (order.amount !== amount) {
        console.error("Amount mismatch:", { expected: order.amount, got: amount });
        await adminClient
          .from("product_orders")
          .update({ status: "failed", paystack_transaction_id: String(transaction_id) })
          .eq("id", order.id);
        return new Response("OK", { status: 200 });
      }

      // Update order to success
      await adminClient
        .from("product_orders")
        .update({
          status: "success",
          paystack_transaction_id: String(transaction_id),
        })
        .eq("id", order.id);

      // Increment downloads count
      const { data: product } = await adminClient
        .from("products")
        .select("downloads_count")
        .eq("id", order.product_id)
        .single();

      if (product) {
        await adminClient
          .from("products")
          .update({ downloads_count: product.downloads_count + 1 })
          .eq("id", order.product_id);
      }

      console.log("Order fulfilled:", reference);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Error", { status: 500 });
  }
});

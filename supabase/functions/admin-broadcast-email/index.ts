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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY not configured" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    const { audience, subject, body }: BroadcastRequest = await req.json();

    if (!subject || !body) {
      return new Response(
        JSON.stringify({ success: false, error: "Subject and body are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let recipients: { email: string; full_name: string | null }[] = [];

    if (audience === "scholars") {
      // Get all approved scholars
      const { data: scholars, error } = await supabase
        .from("scholarship_applications")
        .select("email, full_name")
        .eq("status", "approved");

      if (error) throw error;
      recipients = scholars || [];
    } else if (audience === "all_users") {
      // Get all users from profiles table
      const { data: users, error } = await supabase
        .from("profiles")
        .select("email, full_name")
        .not("email", "is", null);

      if (error) throw error;
      recipients = (users || []).filter(u => u.email);
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid audience type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No recipients found", emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let emailsSent = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      if (!recipient.email) continue;

      const emailHtml = `
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
    <p style="font-size: 18px; margin-top: 0;">Hi ${recipient.full_name || "there"},</p>
    
    <div style="font-size: 16px; white-space: pre-wrap;">${body}</div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center; margin-bottom: 0;">
      Web3 Jobs Institute<br>
      Building the future of Web3 talent
    </p>
  </div>
</body>
</html>
      `;

      try {
        await resend.emails.send({
          from: "Web3 Jobs Institute <noreply@web3jobsinstitute.careers>",
          to: [recipient.email],
          subject: subject,
          html: emailHtml,
        });
        emailsSent++;
      } catch (emailError) {
        console.error(`Failed to send email to ${recipient.email}:`, emailError);
        errors.push(recipient.email);
      }
    }

    console.log(`Broadcast email sent to ${emailsSent} recipients`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Broadcast email sent to ${emailsSent} recipients`,
        emailsSent,
        totalRecipients: recipients.length,
        errors: errors.length > 0 ? errors : undefined
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

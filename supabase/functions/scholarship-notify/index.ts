import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  user_id: string;
  type: "status_change" | "new_task" | "task_approved" | "task_rejected" | "module_unlocked";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  send_email?: boolean;
  email?: string;
  full_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, type, title, message, metadata, send_email, email, full_name }: NotificationRequest = await req.json();

    // Create in-app notification
    const { error: notifError } = await supabase
      .from("scholarship_notifications")
      .insert({
        user_id,
        type,
        title,
        message,
        metadata: metadata || {},
      });

    if (notifError) {
      console.error("Error creating notification:", notifError);
      throw notifError;
    }

    console.log(`Notification created for user ${user_id}: ${title}`);

    // Send email if requested and RESEND_API_KEY is configured
    if (send_email && resendApiKey && email) {
      try {
        const resend = new Resend(resendApiKey);
        
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${full_name || "Scholar"},</p>
    <p style="font-size: 16px;">Great news! <strong>Your scholarship application has been approved!</strong></p>
    <p style="font-size: 16px;">You are now officially part of the Web3 Jobs Institute Scholarship Program. Your journey to building skills, earning rewards, and joining our community starts now.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://web3jobsinstitute.careers/dashboard/scholarship" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Access Your Scholarship Portal</a>
    </div>
    <p style="font-size: 14px; color: #666;">Here's what you can do next:</p>
    <ul style="font-size: 14px; color: #666;">
      <li>Complete your daily check-ins to build streaks</li>
      <li>Explore available tasks and earn XP</li>
      <li>Connect with fellow scholars in the community</li>
    </ul>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center; margin-bottom: 0;">
      Web3 Jobs Institute<br>
      Building the future of Web3 talent
    </p>
  </div>
</body>
</html>
        `;

        const emailResponse = await resend.emails.send({
          from: "Web3 Jobs Institute <noreply@web3jobsinstitute.careers>",
          to: [email],
          subject: "🎉 Your Scholarship Application Has Been Approved!",
          html: emailHtml,
        });

        console.log(`Approval email sent to ${email}:`, emailResponse);
      } catch (emailError) {
        console.error("Error sending approval email:", emailError);
        // Don't throw - email failure shouldn't fail the whole request
      }
    } else if (send_email && !resendApiKey) {
      console.log("Email requested but RESEND_API_KEY not configured");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification created" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in scholarship-notify:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

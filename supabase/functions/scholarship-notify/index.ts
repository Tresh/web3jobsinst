import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, type, title, message, metadata }: NotificationRequest = await req.json();

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

    // Get user email for email notification
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", user_id)
      .single();

    console.log(`Notification created for user ${user_id}: ${title}`);
    console.log(`Email would be sent to: ${profile?.email}`);

    // Note: Email sending requires RESEND_API_KEY setup
    // For now, just log that email would be sent

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

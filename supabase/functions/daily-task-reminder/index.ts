import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email send");
      return new Response(
        JSON.stringify({ success: false, message: "RESEND_API_KEY not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    // Get all approved scholars
    const { data: scholars, error: scholarsError } = await supabase
      .from("scholarship_applications")
      .select("id, user_id, email, full_name, program_id")
      .eq("status", "approved");

    if (scholarsError) {
      console.error("Error fetching scholars:", scholarsError);
      throw scholarsError;
    }

    if (!scholars || scholars.length === 0) {
      console.log("No approved scholars found");
      return new Response(
        JSON.stringify({ success: true, message: "No approved scholars to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get all active tasks
    const { data: activeTasks, error: tasksError } = await supabase
      .from("scholarship_tasks")
      .select("id, title, program_id, is_global")
      .eq("status", "active")
      .eq("is_published", true);

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    if (!activeTasks || activeTasks.length === 0) {
      console.log("No active tasks found");
      return new Response(
        JSON.stringify({ success: true, message: "No active tasks to remind about" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get all approved submissions
    const { data: approvedSubmissions, error: submissionsError } = await supabase
      .from("scholarship_task_submissions")
      .select("task_id, user_id")
      .eq("status", "approved");

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      throw submissionsError;
    }

    // Create a set of completed task-user pairs for fast lookup
    const completedSet = new Set(
      (approvedSubmissions || []).map(s => `${s.user_id}-${s.task_id}`)
    );

    let emailsSent = 0;
    const errors: string[] = [];

    for (const scholar of scholars) {
      // Find tasks applicable to this scholar (global or matching program)
      const applicableTasks = activeTasks.filter(task => 
        task.is_global || task.program_id === scholar.program_id
      );

      // Find incomplete tasks for this scholar
      const incompleteTasks = applicableTasks.filter(task => 
        !completedSet.has(`${scholar.user_id}-${task.id}`)
      );

      if (incompleteTasks.length === 0) {
        continue; // Scholar has completed all tasks
      }

      // Build task list HTML
      const taskListHtml = incompleteTasks
        .map(task => `<li style="margin-bottom: 8px;">${task.title}</li>`)
        .join("");

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Daily Task Reminder</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${scholar.full_name || "Scholar"},</p>
    <p style="font-size: 16px;">You have <strong>${incompleteTasks.length} task${incompleteTasks.length > 1 ? 's' : ''}</strong> waiting to be completed!</p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 12px 0; font-weight: bold; color: #92400e;">📋 Your Pending Tasks:</p>
      <ul style="margin: 0; padding-left: 20px; color: #78350f;">
        ${taskListHtml}
      </ul>
    </div>

    <p style="font-size: 16px; color: #666;">
      <strong>💡 Remember:</strong> Completing tasks earns you XP, which directly affects your ranking and progression in the scholarship program!
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://web3jobsinstitute.careers/dashboard/scholarship" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Complete Your Tasks Now</a>
    </div>

    <p style="font-size: 14px; color: #999; text-align: center;">
      Don't let these tasks expire! Every XP counts towards your success.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
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
          to: [scholar.email],
          subject: `⏰ You have ${incompleteTasks.length} pending task${incompleteTasks.length > 1 ? 's' : ''} - Complete them to earn XP!`,
          html: emailHtml,
        });
        emailsSent++;
        console.log(`Reminder email sent to ${scholar.email}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${scholar.email}:`, emailError);
        errors.push(scholar.email);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Daily reminder emails sent`,
        emailsSent,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in daily-task-reminder:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

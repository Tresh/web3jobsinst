import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap,
  Plus,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  ListTodo,
  BookOpen,
  Send,
  Zap,
  ExternalLink,
  Search,
  ArrowUpAZ,
  ArrowDownAZ,
  Mail,
  Gift,
  FolderCheck,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import type {
  ScholarshipProgram,
  ScholarshipApplication,
  ScholarshipTask,
  ScholarshipTaskSubmission,
  ScholarshipModule,
} from "@/types/scholarship";
import { TasksTab, OverviewTab, ReferrersTab, EmailHistoryTab, AdminOffersTab, AdminPOWTab } from "@/components/admin/scholarship";
import { AdminModulesTab } from "@/components/admin/scholarship/AdminModulesTab";
import { Link2 } from "lucide-react";

const AdminScholarships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([]);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [tasks, setTasks] = useState<ScholarshipTask[]>([]);
  const [submissions, setSubmissions] = useState<(ScholarshipTaskSubmission & { task?: ScholarshipTask; applicant?: ScholarshipApplication })[]>([]);
  const [modules, setModules] = useState<ScholarshipModule[]>([]);
  
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplication | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<(ScholarshipTaskSubmission & { task?: ScholarshipTask; applicant?: ScholarshipApplication }) | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [submissionFilter, setSubmissionFilter] = useState<string>("pending");
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("all");
  
  // Batch selection and search/sort states
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [isBatchApproving, setIsBatchApproving] = useState(false);
  const [isBatchRejecting, setIsBatchRejecting] = useState(false);
  
  // Batch selection for submissions
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<Set<string>>(new Set());
  const [isBatchApprovingSubs, setIsBatchApprovingSubs] = useState(false);
  const [isBatchRejectingSubs, setIsBatchRejectingSubs] = useState(false);

  // Form states
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  
  // Email broadcast states
  const [emailAudience, setEmailAudience] = useState<"scholars" | "all_users">("scholars");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    telegram_link: "",
    max_applications: "",
    application_deadline: "",
  });

  const [newModule, setNewModule] = useState({
    program_id: "",
    title: "",
    description: "",
    unlock_type: "day" as "day" | "task" | "manual",
    unlock_day: "",
    order_index: "0",
  });

  const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number) => {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), ms)
      ),
    ]);
  };

  const fetchProgramsFirst = async () => {
    setLoadError(null);
    setIsLoading(true);
    setIsLoadingPrograms(true);
    try {
      const progsRes = await withTimeout(
        supabase.from("scholarship_programs").select("*").order("created_at", { ascending: false }),
        8000
      );
      if ((progsRes as any).error) throw (progsRes as any).error;
      const progs = ((((progsRes as any).data || []) as unknown) as ScholarshipProgram[]) ?? [];
      setPrograms(progs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setLoadError(message);
      setPrograms([]);
    } finally {
      setIsLoadingPrograms(false);
      setIsLoading(false);
    }
  };

  const fetchNonBlockingData = async () => {
    setIsLoadingTasks(true);
    setIsLoadingApplications(true);
    setIsLoadingSubmissions(true);
    setIsLoadingModules(true);

    const tasksPromise = (async () => {
      try {
        const res = await withTimeout(
          supabase.from("scholarship_tasks").select("*").order("created_at", { ascending: false }),
          8000
        );
        if ((res as any).error) throw (res as any).error;
        setTasks(((((res as any).data || []) as unknown) as ScholarshipTask[]) ?? []);
      } catch {
        setTasks([]);
      } finally {
        setIsLoadingTasks(false);
      }
    })();

    const appsPromise = (async () => {
      try {
        // Paginate to fetch ALL applications (Supabase has 1000 row limit)
        const PAGE_SIZE = 1000;
        const allApplications: ScholarshipApplication[] = [];
        let page = 0;
        
        while (true) {
          const res = await withTimeout(
            supabase
              .from("scholarship_applications")
              .select("*")
              .order("created_at", { ascending: false })
              .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
            8000
          );
          if ((res as any).error) throw (res as any).error;
          const batch = ((res as any).data || []) as ScholarshipApplication[];
          allApplications.push(...batch);
          if (batch.length < PAGE_SIZE) break;
          page++;
        }
        
        setApplications(allApplications);
      } catch {
        setApplications([]);
      } finally {
        setIsLoadingApplications(false);
      }
    })();

    const subsPromise = (async () => {
      try {
        // Fetch submissions with task data joined to ensure xp_value is always available
        const res = await withTimeout(
          supabase
            .from("scholarship_task_submissions")
            .select("*, scholarship_tasks!inner(id, title, xp_value, task_type, status, program_id)")
            .order("created_at", { ascending: false }),
          8000
        );
        if ((res as any).error) throw (res as any).error;
        const subsRaw = (((res as any).data || []) as any[]) ?? [];
        // Map the joined task data to the expected structure
        const mappedSubs = subsRaw.map((sub) => ({
          ...sub,
          task: sub.scholarship_tasks ? {
            id: sub.scholarship_tasks.id,
            title: sub.scholarship_tasks.title,
            xp_value: sub.scholarship_tasks.xp_value,
            task_type: sub.scholarship_tasks.task_type,
            status: sub.scholarship_tasks.status,
            program_id: sub.scholarship_tasks.program_id,
          } : undefined,
        }));
        setSubmissions(mappedSubs as unknown as typeof submissions);
      } catch {
        setSubmissions([]);
      } finally {
        setIsLoadingSubmissions(false);
      }
    })();

    const modulesPromise = (async () => {
      try {
        const res = await withTimeout(
          supabase.from("scholarship_modules").select("*").order("order_index", { ascending: true }),
          8000
        );
        if ((res as any).error) throw (res as any).error;
        setModules(((((res as any).data || []) as unknown) as ScholarshipModule[]) ?? []);
      } catch {
        setModules([]);
      } finally {
        setIsLoadingModules(false);
      }
    })();

    await Promise.allSettled([tasksPromise, appsPromise, subsPromise, modulesPromise]);

    // Enrich submissions with applicant data (task data is already joined from DB)
    setSubmissions((prev) =>
      (prev || []).map((sub) => {
        const applicant = applications.find((a) => a.user_id === (sub as any).user_id);
        return { ...(sub as any), applicant };
      }) as unknown as typeof submissions
    );
  };

  const fetchData = async () => {
    await fetchProgramsFirst();
    void fetchNonBlockingData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Program functions
  const handleCreateProgram = async () => {
    if (!newProgram.title) {
      toast({ title: "Error", description: "Please enter a program title", variant: "destructive" });
      return;
    }
    setIsCreatingProgram(true);

    const { error } = await supabase.from("scholarship_programs").insert({
      title: newProgram.title,
      description: newProgram.description || null,
      telegram_link: newProgram.telegram_link || null,
      max_applications: newProgram.max_applications ? parseInt(newProgram.max_applications) : null,
      application_deadline: newProgram.application_deadline || null,
      is_active: false,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Program created" });
      setNewProgram({ title: "", description: "", telegram_link: "", max_applications: "", application_deadline: "" });
      fetchData();
    }
    setIsCreatingProgram(false);
  };

  const toggleProgramActive = async (programId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("scholarship_programs")
      .update({ is_active: !currentStatus })
      .eq("id", programId);

    if (!error) fetchData();
  };

  // Application functions
  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: "pending" | "approved" | "rejected" | "waitlist",
    startDate?: string
  ) => {
    const updateData: Record<string, unknown> = { status: newStatus };
    
    if (newStatus === "rejected" && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }
    if (newStatus === "approved" && startDate) {
      updateData.scholarship_start_date = startDate;
    }
    // Always save admin notes if provided
    if (adminNotes.trim()) {
      updateData.admin_notes = adminNotes.trim();
    }

    const { error } = await supabase
      .from("scholarship_applications")
      .update(updateData)
      .eq("id", applicationId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated", description: `Application ${newStatus}` });
      
      const app = applications.find((a) => a.id === applicationId);
      if (app) {
        // Create in-app notification
        await supabase.from("scholarship_notifications").insert({
          user_id: app.user_id,
          title: newStatus === "approved" ? "Scholarship Approved! 🎉" : `Application ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          message: newStatus === "approved"
            ? "Congratulations! Your scholarship application has been approved. Access your portal now."
            : newStatus === "rejected"
            ? rejectionReason || "Your application was not accepted at this time."
            : "Your application status has been updated.",
          type: "status_change",
        });

        // Send email notification for approvals via edge function
        if (newStatus === "approved") {
          try {
            await supabase.functions.invoke("scholarship-notify", {
              body: {
                user_id: app.user_id,
                type: "status_change",
                title: "Scholarship Approved! 🎉",
                message: "Congratulations! Your scholarship application has been approved.",
                send_email: true,
                email: app.email,
                full_name: app.full_name,
              },
            });
          } catch (emailErr) {
            console.error("Email notification failed:", emailErr);
          }

          // Check and award WJI referral bonus to referrer
          try {
            await supabase.functions.invoke("wji-referral-handler", {
              body: {
                action: "check_referral_on_approval",
                user_id: app.user_id,
              },
            });
          } catch (wjiErr) {
            console.error("WJI referral check failed:", wjiErr);
          }
        }
      }

      setSelectedApplication(null);
      setRejectionReason("");
      setAdminNotes("");
      fetchData();
    }
  };

  // Submission review
  const reviewSubmission = async (submissionId: string, approved: boolean, xpValue: number) => {
    const updateData: Record<string, unknown> = {
      status: approved ? "approved" : "rejected",
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    };

    if (approved) {
      updateData.xp_awarded = xpValue;
    } else if (rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    const { error } = await supabase
      .from("scholarship_task_submissions")
      .update(updateData)
      .eq("id", submissionId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    if (approved && selectedSubmission?.applicant) {
      const currentXp = selectedSubmission.applicant.total_xp || 0;
      await supabase
        .from("scholarship_applications")
        .update({ total_xp: currentXp + xpValue })
        .eq("user_id", selectedSubmission.user_id);
    }

    if (selectedSubmission) {
      await supabase.from("scholarship_notifications").insert({
        user_id: selectedSubmission.user_id,
        title: approved ? "Task Approved! 🎉" : "Task Rejected",
        message: approved
          ? `Your submission for "${selectedSubmission.task?.title}" was approved. You earned ${xpValue} XP!`
          : `Your submission for "${selectedSubmission.task?.title}" was rejected. ${rejectionReason || "Please try again."}`,
        type: approved ? "task_approved" : "task_rejected",
        metadata: { submission_id: submissionId },
      });

      // Check for first task completion to award WJI referral bonus
      if (approved) {
        try {
          await supabase.functions.invoke("wji-referral-handler", {
            body: { 
              action: "check_first_task_completion", 
              user_id: selectedSubmission.user_id 
            },
          });
        } catch (err) {
          console.error("Error checking referral WJI award:", err);
        }
      }
    }

    toast({ title: approved ? "Submission approved" : "Submission rejected" });
    setSelectedSubmission(null);
    setRejectionReason("");
    fetchData();
  };

  // Module functions
  const handleCreateModule = async () => {
    if (!newModule.title || !newModule.program_id) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }
    setIsCreatingModule(true);

    const { error } = await supabase.from("scholarship_modules").insert({
      program_id: newModule.program_id,
      title: newModule.title,
      description: newModule.description || null,
      unlock_type: newModule.unlock_type,
      unlock_day: newModule.unlock_day ? parseInt(newModule.unlock_day) : null,
      order_index: parseInt(newModule.order_index) || 0,
      is_published: false,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Module created" });
      setNewModule({ program_id: "", title: "", description: "", unlock_type: "day", unlock_day: "", order_index: "0" });
      fetchData();
    }
    setIsCreatingModule(false);
  };

  const toggleModulePublished = async (moduleId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("scholarship_modules")
      .update({ is_published: !currentStatus })
      .eq("id", moduleId);

    if (!error) fetchData();
  };

  // Filter, search, and sort applications
  const filteredApplications = (() => {
    let result = statusFilter === "all"
      ? applications
      : applications.filter((a) => a.status === statusFilter);
    
    // Search by name or email
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.full_name.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query)
      );
    }
    
    // Sort alphabetically
    if (sortOrder) {
      result = [...result].sort((a, b) => {
        const comparison = a.full_name.localeCompare(b.full_name);
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }
    
    return result;
  })();

  const filteredSubmissions = submissionFilter === "all"
    ? submissions
    : submissions.filter((s) => s.status === submissionFilter);
  
  // Batch selection helpers for applications
  const toggleApplicationSelection = (id: string) => {
    setSelectedApplicationIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pendingApps = filteredApplications.filter((a) => a.status === "pending");
    if (selectedApplicationIds.size === pendingApps.length && pendingApps.length > 0) {
      setSelectedApplicationIds(new Set());
    } else {
      setSelectedApplicationIds(new Set(pendingApps.map((a) => a.id)));
    }
  };

  // Batch selection helpers for submissions
  const toggleSubmissionSelection = (id: string) => {
    setSelectedSubmissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAllSubmissions = () => {
    const pendingSubs = filteredSubmissions.filter((s) => s.status === "pending");
    if (selectedSubmissionIds.size === pendingSubs.length && pendingSubs.length > 0) {
      setSelectedSubmissionIds(new Set());
    } else {
      setSelectedSubmissionIds(new Set(pendingSubs.map((s) => s.id)));
    }
  };

  // Batch approve submissions
  const batchApproveSubmissions = async () => {
    if (selectedSubmissionIds.size === 0) return;
    setIsBatchApprovingSubs(true);

    try {
      const subsToApprove = filteredSubmissions.filter(
        (s) => selectedSubmissionIds.has(s.id) && s.status === "pending"
      );

      for (const sub of subsToApprove) {
        const xpValue = sub.task?.xp_value || 0;
        const { error } = await supabase
          .from("scholarship_task_submissions")
          .update({
            status: "approved",
            xp_awarded: xpValue,
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", sub.id)
          .eq("status", "pending"); // Only update if still pending (idempotent)

        if (!error && xpValue > 0) {
          // Award XP - the trigger handles this but we also update directly for safety
          const applicant = applications.find((a) => a.user_id === sub.user_id);
          if (applicant) {
            const currentXp = applicant.total_xp || 0;
            await supabase
              .from("scholarship_applications")
              .update({ total_xp: currentXp + xpValue })
              .eq("user_id", sub.user_id);
          }

          // Create notification
          await supabase.from("scholarship_notifications").insert({
            user_id: sub.user_id,
            title: "Task Approved! 🎉",
            message: `Your submission for "${sub.task?.title}" was approved. You earned ${xpValue} XP!`,
            type: "task_approved",
            metadata: { submission_id: sub.id },
          });
        }
      }

      toast({ title: "Batch approved", description: `${subsToApprove.length} submission(s) approved` });
      setSelectedSubmissionIds(new Set());
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to batch approve", variant: "destructive" });
    } finally {
      setIsBatchApprovingSubs(false);
    }
  };

  // Batch reject submissions
  const batchRejectSubmissions = async () => {
    if (selectedSubmissionIds.size === 0) return;
    setIsBatchRejectingSubs(true);

    try {
      const subsToReject = filteredSubmissions.filter(
        (s) => selectedSubmissionIds.has(s.id) && s.status === "pending"
      );

      for (const sub of subsToReject) {
        const { error } = await supabase
          .from("scholarship_task_submissions")
          .update({
            status: "rejected",
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
            rejection_reason: "Rejected via batch action",
          })
          .eq("id", sub.id)
          .eq("status", "pending");

        if (!error) {
          await supabase.from("scholarship_notifications").insert({
            user_id: sub.user_id,
            title: "Task Rejected",
            message: `Your submission for "${sub.task?.title}" was rejected.`,
            type: "task_rejected",
            metadata: { submission_id: sub.id },
          });
        }
      }

      toast({ title: "Batch rejected", description: `${subsToReject.length} submission(s) rejected` });
      setSelectedSubmissionIds(new Set());
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to batch reject", variant: "destructive" });
    } finally {
      setIsBatchRejectingSubs(false);
    }
  };

  // Send broadcast email handler
  const handleSendBroadcastEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({ title: "Missing fields", description: "Subject and body are required", variant: "destructive" });
      return;
    }

    setIsSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-broadcast-email", {
        body: {
          audience: emailAudience,
          subject: emailSubject,
          body: emailBody,
        },
      });

      if (error) throw error;

      toast({
        title: "Emails sent successfully",
        description: `Sent to ${data.emailsSent} recipient(s)`,
      });

      // Clear form
      setEmailSubject("");
      setEmailBody("");
    } catch (err) {
      console.error("Failed to send broadcast email:", err);
      toast({ title: "Error", description: "Failed to send broadcast email", variant: "destructive" });
    } finally {
      setIsSendingEmail(false);
    }
  };


  const batchApproveApplications = async () => {
    if (selectedApplicationIds.size === 0) {
      toast({ title: "No applications selected", variant: "destructive" });
      return;
    }

    setIsBatchApproving(true);
    const startDate = new Date().toISOString().split("T")[0];
    const idsToApprove = Array.from(selectedApplicationIds);
    
    try {
      // Update all applications atomically
      const { error: updateError } = await supabase
        .from("scholarship_applications")
        .update({
          status: "approved",
          scholarship_start_date: startDate,
        })
        .in("id", idsToApprove);

      if (updateError) throw updateError;

      // Get the applications for notifications
      const approvedApps = applications.filter((a) => idsToApprove.includes(a.id));
      
      // Create notifications for all approved users
      const notifications = approvedApps.map((app) => ({
        user_id: app.user_id,
        title: "Scholarship Approved! 🎉",
        message: "Congratulations! Your scholarship application has been approved. Access your portal now.",
        type: "status_change",
      }));

      if (notifications.length > 0) {
        await supabase.from("scholarship_notifications").insert(notifications);
      }

      // Trigger email notifications and WJI referral checks via edge functions
      for (const app of approvedApps) {
        try {
          await supabase.functions.invoke("scholarship-notify", {
            body: {
              user_id: app.user_id,
              type: "status_change",
              title: "Scholarship Approved! 🎉",
              message: "Congratulations! Your scholarship application has been approved.",
              send_email: true,
              email: app.email,
              full_name: app.full_name,
            },
          });
        } catch (emailErr) {
          console.error("Email notification failed for:", app.email, emailErr);
        }

        // Check and award WJI referral bonus to referrer
        try {
          await supabase.functions.invoke("wji-referral-handler", {
            body: {
              action: "check_referral_on_approval",
              user_id: app.user_id,
            },
          });
        } catch (wjiErr) {
          console.error("WJI referral check failed for:", app.user_id, wjiErr);
        }
      }

      toast({
        title: "Batch approval complete",
        description: `${idsToApprove.length} applications approved successfully`,
      });
      
      setSelectedApplicationIds(new Set());
      fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Batch approval failed", description: message, variant: "destructive" });
    } finally {
      setIsBatchApproving(false);
    }
  };

  // Batch reject function
  const batchRejectApplications = async () => {
    if (selectedApplicationIds.size === 0) {
      toast({ title: "No applications selected", variant: "destructive" });
      return;
    }

    setIsBatchRejecting(true);
    const idsToReject = Array.from(selectedApplicationIds);
    
    try {
      // Update all applications atomically
      const { error: updateError } = await supabase
        .from("scholarship_applications")
        .update({
          status: "rejected",
        })
        .in("id", idsToReject);

      if (updateError) throw updateError;

      toast({
        title: "Batch rejection complete",
        description: `${idsToReject.length} applications rejected`,
      });
      
      setSelectedApplicationIds(new Set());
      fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Batch rejection failed", description: message, variant: "destructive" });
    } finally {
      setIsBatchRejecting(false);
    }
  };

  const safeFormatDate = (value: unknown, fmt: string) => {
    if (!value) return null;
    try {
      const d = new Date(value as string);
      if (Number.isNaN(d.getTime())) return null;
      return format(d, fmt);
    } catch {
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="outline" className="border-primary/30 text-primary">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="border-destructive/30 text-destructive">Rejected</Badge>;
      case "waitlist":
        return <Badge variant="outline" className="border-warning/30 text-warning">Waitlist</Badge>;
      default:
        return <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">Pending</Badge>;
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="outline" className="border-primary/30 text-primary">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="border-destructive/30 text-destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">Pending</Badge>;
    }
  };

  const handleNavigate = (tab: string, filter?: string) => {
    setActiveTab(tab);
    if (filter) {
      if (tab === "applications") setStatusFilter(filter);
      if (tab === "tasks") setTaskStatusFilter(filter);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            Scholarship Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage programs, applications, tasks, and modules
          </p>
        </div>
      </div>

      {loadError && (
        <Card className="border-dashed mb-6">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Loading issue: {loadError}. Showing empty states.
            </p>
            <Button variant="outline" onClick={() => fetchData()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="w-4 h-4" />
            Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2">
            <Send className="w-4 h-4" />
            Submissions ({submissions.filter((s) => s.status === "pending").length} pending)
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2">
            <Users className="w-4 h-4" />
            Applications ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Modules ({modules.length})
          </TabsTrigger>
          <TabsTrigger value="programs" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Programs ({programs.length})
          </TabsTrigger>
          <TabsTrigger value="referrers" className="gap-2">
            <Link2 className="w-4 h-4" />
            Referrers
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="offers" className="gap-2">
            <Gift className="w-4 h-4" />
            Offers
          </TabsTrigger>
          <TabsTrigger value="pow" className="gap-2">
            <FolderCheck className="w-4 h-4" />
            Proof of Work
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <OverviewTab
            programs={programs}
            applications={applications}
            tasks={tasks}
            isLoadingPrograms={isLoadingPrograms}
            isLoadingApplications={isLoadingApplications}
            isLoadingTasks={isLoadingTasks}
            onNavigate={handleNavigate}
          />
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <TasksTab
            tasks={tasks}
            programs={programs}
            applications={applications}
            submissions={submissions}
            isLoading={isLoadingTasks}
            userId={user?.id}
            onRefetch={fetchData}
          />
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>Task Submissions</CardTitle>
                  <CardDescription>Review and approve/reject scholar task submissions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSubmissionIds.size > 0 && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        {selectedSubmissionIds.size} selected
                      </span>
                      <Button
                        size="sm"
                        onClick={batchApproveSubmissions}
                        disabled={isBatchApprovingSubs || isBatchRejectingSubs}
                      >
                        {isBatchApprovingSubs ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Approve Selected
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={batchRejectSubmissions}
                        disabled={isBatchApprovingSubs || isBatchRejectingSubs}
                      >
                        {isBatchRejectingSubs ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        Reject Selected
                      </Button>
                    </>
                  )}
                  <Select value={submissionFilter} onValueChange={(v) => {
                    setSubmissionFilter(v);
                    setSelectedSubmissionIds(new Set());
                  }}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSubmissions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            filteredSubmissions.filter((s) => s.status === "pending").length > 0 &&
                            selectedSubmissionIds.size === filteredSubmissions.filter((s) => s.status === "pending").length
                          }
                          onCheckedChange={toggleSelectAllSubmissions}
                          aria-label="Select all pending submissions"
                        />
                      </TableHead>
                      <TableHead>Scholar</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Submission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          {sub.status === "pending" ? (
                            <Checkbox
                              checked={selectedSubmissionIds.has(sub.id)}
                              onCheckedChange={() => toggleSubmissionSelection(sub.id)}
                              aria-label={`Select submission from ${sub.applicant?.full_name}`}
                            />
                          ) : (
                            <span className="w-4 h-4 block" />
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{sub.applicant?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{sub.applicant?.email}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{sub.task?.title || "Unknown Task"}</p>
                          <Badge variant="secondary" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            {sub.task?.xp_value || 0} XP
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sub.submission_url && (
                            <a
                              href={sub.submission_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-sm"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Submission
                            </a>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {safeFormatDate(sub.created_at, "MMM d, yyyy HH:mm") || "—"}
                          </p>
                        </TableCell>
                        <TableCell>{getSubmissionStatusBadge(sub.status)}</TableCell>
                        <TableCell className="text-right">
                          {sub.status === "pending" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedSubmission(sub)}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Review Submission</DialogTitle>
                                  <DialogDescription>Approve or reject this task submission</DialogDescription>
                                </DialogHeader>
                                {selectedSubmission && (
                                  <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <Label className="text-muted-foreground">Scholar</Label>
                                        <p className="font-medium">{selectedSubmission.applicant?.full_name}</p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">Task</Label>
                                        <p className="font-medium">{selectedSubmission.task?.title}</p>
                                      </div>
                                    </div>
                                    {selectedSubmission.submission_url && (
                                      <div>
                                        <Label className="text-muted-foreground">Submission Link</Label>
                                        <a
                                          href={selectedSubmission.submission_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline flex items-center gap-2"
                                        >
                                          {selectedSubmission.submission_url}
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      </div>
                                    )}
                                    {selectedSubmission.submission_text && (
                                      <div>
                                        <Label className="text-muted-foreground">Notes</Label>
                                        <p className="text-sm bg-secondary p-2 rounded">{selectedSubmission.submission_text}</p>
                                      </div>
                                    )}
                                    <div className="space-y-2">
                                      <Label>Rejection Reason (if rejecting)</Label>
                                      <Textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Reason for rejection..."
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        className="bg-primary hover:bg-primary/90"
                                        onClick={() => reviewSubmission(
                                          selectedSubmission.id,
                                          true,
                                          selectedSubmission.task?.xp_value || 0
                                        )}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Approve (+{selectedSubmission.task?.xp_value} XP)
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => reviewSubmission(selectedSubmission.id, false, 0)}
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSubmissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No submissions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          {/* Search, Sort, Filter Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waitlist">Waitlist</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc")}
              className="gap-2"
            >
              {sortOrder === "asc" ? (
                <ArrowUpAZ className="w-4 h-4" />
              ) : sortOrder === "desc" ? (
                <ArrowDownAZ className="w-4 h-4" />
              ) : (
                <ArrowUpAZ className="w-4 h-4 text-muted-foreground" />
              )}
              {sortOrder === "asc" ? "A–Z" : sortOrder === "desc" ? "Z–A" : "Sort"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {filteredApplications.length} applications
            </span>
          </div>

          {/* Batch Actions Bar - shows when there are pending applications in the current view */}
          {filteredApplications.some((a) => a.status === "pending") && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={
                      selectedApplicationIds.size > 0 &&
                      selectedApplicationIds.size === filteredApplications.filter((a) => a.status === "pending").length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm">
                    {selectedApplicationIds.size > 0
                      ? `${selectedApplicationIds.size} selected`
                      : "Select all pending"}
                  </span>
                </div>
                {selectedApplicationIds.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={batchApproveApplications}
                      disabled={isBatchApproving || isBatchRejecting}
                      className="gap-2"
                    >
                      {isBatchApproving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve Selected ({selectedApplicationIds.size})
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={batchRejectApplications}
                      disabled={isBatchApproving || isBatchRejecting}
                      className="gap-2"
                    >
                      {isBatchRejecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject Selected
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isLoadingApplications ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <Card key={app.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Checkbox for pending applications */}
                        {app.status === "pending" && (
                          <Checkbox
                            checked={selectedApplicationIds.has(app.id)}
                            onCheckedChange={() => toggleApplicationSelection(app.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">
                            {app.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{app.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.email} • {app.preferred_track}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {app.status === "approved" && (
                          <Badge variant="outline" className="gap-1">
                            <Zap className="w-3 h-3" />
                            {app.total_xp} XP
                          </Badge>
                        )}
                        {getStatusBadge(app.status)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Application Review</DialogTitle>
                              <DialogDescription>Review and update application status</DialogDescription>
                            </DialogHeader>
                            {selectedApplication && (
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label className="text-muted-foreground">Full Name</Label>
                                    <p className="font-medium">{selectedApplication.full_name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="font-medium">{selectedApplication.email}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Telegram</Label>
                                    <p className="font-medium">{selectedApplication.telegram_username}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Twitter</Label>
                                    <p className="font-medium">{selectedApplication.twitter_handle}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Track</Label>
                                    <p className="font-medium">{selectedApplication.preferred_track}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Hours/Week</Label>
                                    <p className="font-medium">{selectedApplication.hours_per_week}</p>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Why Scholarship</Label>
                                  <p className="text-sm bg-secondary p-3 rounded-lg">{selectedApplication.why_scholarship}</p>
                                </div>

                                {/* Show existing admin notes if any */}
                                {selectedApplication.admin_notes && (
                                  <div>
                                    <Label className="text-muted-foreground">Previous Admin Notes</Label>
                                    <p className="text-sm bg-muted p-3 rounded-lg italic">{selectedApplication.admin_notes}</p>
                                  </div>
                                )}

                                {/* Show rejection reason if rejected */}
                                {selectedApplication.status === "rejected" && selectedApplication.rejection_reason && (
                                  <div>
                                    <Label className="text-muted-foreground">Rejection Reason</Label>
                                    <p className="text-sm bg-destructive/10 text-destructive p-3 rounded-lg">{selectedApplication.rejection_reason}</p>
                                  </div>
                                )}

                                <div className="space-y-4 pt-4 border-t">
                                  <div className="space-y-2">
                                    <Label>Start Date (for approval)</Label>
                                    <Input
                                      type="date"
                                      id="startDate"
                                      defaultValue={new Date().toISOString().split("T")[0]}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Admin Notes (internal, not shown to applicant)</Label>
                                    <Textarea
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Internal notes about this application..."
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Rejection Reason (shown to applicant if rejected)</Label>
                                    <Textarea
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Reason for rejection..."
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const startInput = document.getElementById("startDate") as HTMLInputElement;
                                      updateApplicationStatus(
                                        selectedApplication.id,
                                        "approved",
                                        startInput?.value
                                      );
                                    }}
                                    className="bg-primary hover:bg-primary/90"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateApplicationStatus(selectedApplication.id, "waitlist")}
                                  >
                                    <Clock className="w-4 h-4 mr-1" />
                                    Waitlist
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateApplicationStatus(selectedApplication.id, "rejected")}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredApplications.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">No applications found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules">
          <AdminModulesTab
            programs={programs}
            modules={modules}
            isLoading={isLoadingModules}
            onRefetch={fetchData}
          />
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Program
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Program Title *</Label>
                  <Input
                    value={newProgram.title}
                    onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                    placeholder="e.g., Spring 2026 Cohort"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram Link</Label>
                  <Input
                    value={newProgram.telegram_link}
                    onChange={(e) => setNewProgram({ ...newProgram, telegram_link: e.target.value })}
                    placeholder="https://t.me/..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  placeholder="Program description..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Applications</Label>
                  <Input
                    type="number"
                    value={newProgram.max_applications}
                    onChange={(e) => setNewProgram({ ...newProgram, max_applications: e.target.value })}
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Application Deadline</Label>
                  <Input
                    type="datetime-local"
                    value={newProgram.application_deadline}
                    onChange={(e) => setNewProgram({ ...newProgram, application_deadline: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateProgram} disabled={isCreatingProgram}>
                {isCreatingProgram && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Program
              </Button>
            </CardContent>
          </Card>

          {isLoadingPrograms ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : programs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No programs created yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {programs.map((program) => (
                <Card key={program.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{program.title}</h3>
                          <Badge variant={program.is_active ? "default" : "secondary"}>
                            {program.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{program.description}</p>
                        {program.application_deadline && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Deadline: {safeFormatDate(program.application_deadline, "MMM d, yyyy") || "—"}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={program.is_active}
                          onCheckedChange={() => toggleProgramActive(program.id, program.is_active)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {program.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Referrers Tab */}
        <TabsContent value="referrers">
          <ReferrersTab />
        </TabsContent>

        {/* Email Broadcast Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Send Broadcast Email
              </CardTitle>
              <CardDescription>
                Send a custom email to all scholars or all platform users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={emailAudience} onValueChange={(v: "scholars" | "all_users") => setEmailAudience(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scholars">All Scholars (approved applicants)</SelectItem>
                    <SelectItem value="all_users">All Platform Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write your email message here..."
                  rows={8}
                />
              </div>
              <Button 
                onClick={handleSendBroadcastEmail} 
                disabled={isSendingEmail || !emailSubject.trim() || !emailBody.trim()}
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {/* Email History */}
          <EmailHistoryTab />
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers">
          <AdminOffersTab />
        </TabsContent>

        {/* Proof of Work Tab */}
        <TabsContent value="pow">
          <AdminPOWTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminScholarships;

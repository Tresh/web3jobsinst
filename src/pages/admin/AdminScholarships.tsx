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
  Calendar,
  Zap,
  ExternalLink,
  Edit,
  Trash2,
  StopCircle,
  Play,
  Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";
import type {
  ScholarshipProgram,
  ScholarshipApplication,
  ScholarshipTask,
  ScholarshipTaskSubmission,
  ScholarshipModule,
} from "@/types/scholarship";
import { TASK_TYPE_LABELS, TASK_STATUS_LABELS, TaskType, TaskStatus } from "@/types/scholarship";

const AdminScholarships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([]);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [tasks, setTasks] = useState<ScholarshipTask[]>([]);
  const [submissions, setSubmissions] = useState<(ScholarshipTaskSubmission & { task?: ScholarshipTask; applicant?: ScholarshipApplication })[]>([]);
  const [modules, setModules] = useState<ScholarshipModule[]>([]);
  
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplication | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<(ScholarshipTaskSubmission & { task?: ScholarshipTask; applicant?: ScholarshipApplication }) | null>(null);
  const [selectedTask, setSelectedTask] = useState<ScholarshipTask | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [submissionFilter, setSubmissionFilter] = useState<string>("pending");
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("all");

  // Form states
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    telegram_link: "",
    max_applications: "",
    application_deadline: "",
  });

  const [newTask, setNewTask] = useState({
    program_id: "",
    title: "",
    description: "",
    task_type: "custom" as TaskType,
    xp_value: "10",
    due_date: "",
    start_date: "",
    external_link: "",
    is_global: true,
    status: "draft" as TaskStatus,
  });

  const [editTask, setEditTask] = useState({
    id: "",
    program_id: "",
    title: "",
    description: "",
    task_type: "custom" as TaskType,
    xp_value: "10",
    due_date: "",
    start_date: "",
    external_link: "",
    is_global: true,
    status: "draft" as TaskStatus,
  });

  const [newModule, setNewModule] = useState({
    program_id: "",
    title: "",
    description: "",
    unlock_type: "day" as "day" | "task" | "manual",
    unlock_day: "",
    order_index: "0",
  });

  const fetchData = async () => {
    setIsLoading(true);

    const [progsRes, appsRes, tasksRes, subsRes, modsRes] = await Promise.all([
      supabase.from("scholarship_programs").select("*").order("created_at", { ascending: false }),
      supabase.from("scholarship_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("scholarship_tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("scholarship_task_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("scholarship_modules").select("*").order("order_index", { ascending: true }),
    ]);

    setPrograms((progsRes.data || []) as unknown as ScholarshipProgram[]);
    setApplications((appsRes.data || []) as unknown as ScholarshipApplication[]);
    setTasks((tasksRes.data || []) as unknown as ScholarshipTask[]);
    setModules((modsRes.data || []) as unknown as ScholarshipModule[]);

    // Enrich submissions with task and applicant data
    const enrichedSubmissions = (subsRes.data || []).map((sub) => {
      const task = (tasksRes.data || []).find((t) => t.id === sub.task_id);
      const applicant = (appsRes.data || []).find((a) => a.user_id === sub.user_id);
      return { ...sub, task, applicant };
    });
    setSubmissions(enrichedSubmissions as unknown as typeof submissions);

    setIsLoading(false);
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

    const { error } = await supabase
      .from("scholarship_applications")
      .update(updateData)
      .eq("id", applicationId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated", description: `Application ${newStatus}` });
      
      // Create notification for user
      const app = applications.find((a) => a.id === applicationId);
      if (app) {
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
      }

      setSelectedApplication(null);
      setRejectionReason("");
      fetchData();
    }
  };

  // Task functions
  const handleCreateTask = async () => {
    if (!newTask.title) {
      toast({ title: "Error", description: "Please enter a task title", variant: "destructive" });
      return;
    }
    setIsCreatingTask(true);

    const { error } = await supabase.from("scholarship_tasks").insert({
      program_id: newTask.program_id || null,
      title: newTask.title,
      description: newTask.description || null,
      task_type: newTask.task_type,
      xp_value: parseInt(newTask.xp_value) || 10,
      due_date: newTask.due_date || null,
      start_date: newTask.start_date || null,
      external_link: newTask.external_link || null,
      is_global: newTask.is_global,
      is_published: newTask.status === "active",
      status: newTask.status,
      created_by: user?.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task created successfully" });
      // Notify approved scholars if task is active
      if (newTask.status === "active") {
        const approvedApps = applications.filter((a) => a.status === "approved");
        const notifications = approvedApps.map((app) => ({
          user_id: app.user_id,
          title: "New Task Available",
          message: `A new task "${newTask.title}" has been assigned. Complete it to earn ${newTask.xp_value} XP.`,
          type: "new_task" as const,
        }));
        if (notifications.length > 0) {
          await supabase.from("scholarship_notifications").insert(notifications);
        }
      }
      setNewTask({ program_id: "", title: "", description: "", task_type: "custom", xp_value: "10", due_date: "", start_date: "", external_link: "", is_global: true, status: "draft" });
      fetchData();
    }
    setIsCreatingTask(false);
  };

  const handleUpdateTask = async () => {
    if (!editTask.id || !editTask.title) {
      toast({ title: "Error", description: "Invalid task data", variant: "destructive" });
      return;
    }
    setIsEditingTask(true);

    const wasActive = selectedTask?.status === "active";
    const isNowActive = editTask.status === "active";

    const { error } = await supabase
      .from("scholarship_tasks")
      .update({
        program_id: editTask.program_id || null,
        title: editTask.title,
        description: editTask.description || null,
        task_type: editTask.task_type,
        xp_value: parseInt(editTask.xp_value) || 10,
        due_date: editTask.due_date || null,
        start_date: editTask.start_date || null,
        external_link: editTask.external_link || null,
        is_global: editTask.is_global,
        is_published: editTask.status === "active",
        status: editTask.status,
      })
      .eq("id", editTask.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task updated successfully" });
      // Notify scholars if task just became active
      if (!wasActive && isNowActive) {
        const approvedApps = applications.filter((a) => a.status === "approved");
        const notifications = approvedApps.map((app) => ({
          user_id: app.user_id,
          title: "New Task Available",
          message: `A new task "${editTask.title}" has been assigned. Complete it to earn ${editTask.xp_value} XP.`,
          type: "new_task" as const,
        }));
        if (notifications.length > 0) {
          await supabase.from("scholarship_notifications").insert(notifications);
        }
      }
      setShowEditDialog(false);
      setSelectedTask(null);
      fetchData();
    }
    setIsEditingTask(false);
  };

  const handleEndTask = async (taskId: string) => {
    const { error } = await supabase
      .from("scholarship_tasks")
      .update({ status: "ended", is_published: false })
      .eq("id", taskId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task ended", description: "The task is no longer active for scholars" });
      fetchData();
    }
  };

  const handleActivateTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const { error } = await supabase
      .from("scholarship_tasks")
      .update({ status: "active", is_published: true })
      .eq("id", taskId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task activated", description: "The task is now visible to approved scholars" });
      // Notify scholars
      if (task) {
        const approvedApps = applications.filter((a) => a.status === "approved");
        const notifications = approvedApps.map((app) => ({
          user_id: app.user_id,
          title: "New Task Available",
          message: `A new task "${task.title}" has been assigned. Complete it to earn ${task.xp_value} XP.`,
          type: "new_task" as const,
        }));
        if (notifications.length > 0) {
          await supabase.from("scholarship_notifications").insert(notifications);
        }
      }
      fetchData();
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    const { error } = await supabase
      .from("scholarship_tasks")
      .delete()
      .eq("id", selectedTask.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task deleted" });
      setShowDeleteDialog(false);
      setSelectedTask(null);
      fetchData();
    }
  };

  const openEditDialog = (task: ScholarshipTask) => {
    setSelectedTask(task);
    setEditTask({
      id: task.id,
      program_id: task.program_id || "",
      title: task.title,
      description: task.description || "",
      task_type: task.task_type,
      xp_value: task.xp_value.toString(),
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : "",
      start_date: task.start_date ? new Date(task.start_date).toISOString().slice(0, 16) : "",
      external_link: task.external_link || "",
      is_global: task.is_global,
      status: task.status,
    });
    setShowEditDialog(true);
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

    // Update user's XP if approved
    if (approved && selectedSubmission?.applicant) {
      const currentXp = selectedSubmission.applicant.total_xp || 0;
      await supabase
        .from("scholarship_applications")
        .update({ total_xp: currentXp + xpValue })
        .eq("user_id", selectedSubmission.user_id);
    }

    // Create notification
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

  const filteredApplications = statusFilter === "all"
    ? applications
    : applications.filter((a) => a.status === statusFilter);

  const filteredSubmissions = submissionFilter === "all"
    ? submissions
    : submissions.filter((s) => s.status === submissionFilter);

  const filteredTasks = taskStatusFilter === "all"
    ? tasks
    : tasks.filter((t) => t.status === taskStatusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500">Rejected</Badge>;
      case "waitlist":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Waitlist</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-500">Pending</Badge>;
    }
  };

  const getTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><Play className="w-3 h-3 mr-1" />Active</Badge>;
      case "ended":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><StopCircle className="w-3 h-3 mr-1" />Ended</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
    }
  };

  const getSubmissionCountForTask = (taskId: string) => {
    return submissions.filter((s) => s.task_id === taskId).length;
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="flex-wrap">
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
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          {/* Create New Task Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Task
              </CardTitle>
              <CardDescription>
                Create tasks for approved scholarship students to complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Task Title *</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g., Retweet our announcement"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select
                    value={newTask.task_type}
                    onValueChange={(v) => setNewTask({ ...newTask, task_type: v as TaskType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task instructions and what scholars need to do..."
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  External Link (X/Twitter URL)
                </Label>
                <Input
                  value={newTask.external_link}
                  onChange={(e) => setNewTask({ ...newTask, external_link: e.target.value })}
                  placeholder="https://x.com/... (optional - will show as 'Go to X' button)"
                />
                <p className="text-xs text-muted-foreground">
                  If provided, scholars will see a "Go to X" button to open this link
                </p>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>XP Value</Label>
                  <Input
                    type="number"
                    value={newTask.xp_value}
                    onChange={(e) => setNewTask({ ...newTask, xp_value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={newTask.start_date}
                    onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End/Due Date</Label>
                  <Input
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newTask.status}
                    onValueChange={(v) => setNewTask({ ...newTask, status: v as TaskStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (hidden)</SelectItem>
                      <SelectItem value="active">Active (visible to scholars)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Program (optional)</Label>
                  <Select
                    value={newTask.program_id}
                    onValueChange={(v) => setNewTask({ ...newTask, program_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Programs</SelectItem>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={newTask.is_global}
                    onCheckedChange={(v) => setNewTask({ ...newTask, is_global: v })}
                  />
                  <Label>Global task (visible to all approved scholars)</Label>
                </div>
              </div>
              <Button onClick={handleCreateTask} disabled={isCreatingTask} className="w-full sm:w-auto">
                {isCreatingTask && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Task
              </Button>
            </CardContent>
          </Card>

          {/* Task List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Tasks</CardTitle>
                <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.external_link && (
                            <a 
                              href={task.external_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Has external link
                            </a>
                          )}
                          {task.is_global && <Badge variant="outline" className="mt-1 text-xs">Global</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{TASK_TYPE_LABELS[task.task_type]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Zap className="w-3 h-3 mr-1" />
                          {task.xp_value}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getSubmissionCountForTask(task.id)} submitted</span>
                      </TableCell>
                      <TableCell>{getTaskStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {task.start_date && <p>Start: {format(new Date(task.start_date), "MMM d")}</p>}
                          {task.due_date && <p>End: {format(new Date(task.due_date), "MMM d")}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {task.status === "draft" && (
                            <Button size="sm" variant="outline" onClick={() => handleActivateTask(task.id)}>
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {task.status === "active" && (
                            <Button size="sm" variant="outline" onClick={() => handleEndTask(task.id)}>
                              <StopCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(task)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => { setSelectedTask(task); setShowDeleteDialog(true); }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit Task Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Update task details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Task Title *</Label>
                  <Input
                    value={editTask.title}
                    onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select
                    value={editTask.task_type}
                    onValueChange={(v) => setEditTask({ ...editTask, task_type: v as TaskType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editTask.description}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  External Link
                </Label>
                <Input
                  value={editTask.external_link}
                  onChange={(e) => setEditTask({ ...editTask, external_link: e.target.value })}
                  placeholder="https://x.com/..."
                />
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>XP Value</Label>
                  <Input
                    type="number"
                    value={editTask.xp_value}
                    onChange={(e) => setEditTask({ ...editTask, xp_value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={editTask.start_date}
                    onChange={(e) => setEditTask({ ...editTask, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={editTask.due_date}
                    onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editTask.status}
                    onValueChange={(v) => setEditTask({ ...editTask, status: v as TaskStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editTask.is_global}
                  onCheckedChange={(v) => setEditTask({ ...editTask, is_global: v })}
                />
                <Label>Global task</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateTask} disabled={isEditingTask}>
                {isEditingTask && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Task Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteTask}>Delete Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Select value={submissionFilter} onValueChange={setSubmissionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Submission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.applicant?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{sub.applicant?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{sub.task?.title || "Unknown Task"}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.task?.xp_value} XP
                      </p>
                    </TableCell>
                    <TableCell>
                      {sub.submission_url && (
                        <a
                          href={sub.submission_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-sm"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {sub.submission_text && (
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {sub.submission_text}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      {sub.status === "pending" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedSubmission(sub)}>
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Review Submission</DialogTitle>
                              <DialogDescription>
                                Review and approve/reject this submission
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSubmission && (
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label className="text-muted-foreground">Task</Label>
                                  <p className="font-medium">{selectedSubmission.task?.title}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">User</Label>
                                  <p className="font-medium">{selectedSubmission.applicant?.full_name}</p>
                                </div>
                                {selectedSubmission.submission_url && (
                                  <div>
                                    <Label className="text-muted-foreground">Submission URL</Label>
                                    <a
                                      href={selectedSubmission.submission_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center gap-1"
                                    >
                                      {selectedSubmission.submission_url}
                                      <ExternalLink className="w-3 h-3" />
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
                                    className="bg-green-600 hover:bg-green-700"
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
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No submissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
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
            <span className="text-sm text-muted-foreground">
              {filteredApplications.length} applications
            </span>
          </div>

          <div className="space-y-3">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
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

                              {selectedApplication.status === "pending" && (
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
                                    <Label>Rejection Reason (if rejecting)</Label>
                                    <Textarea
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Reason for rejection..."
                                    />
                                  </div>
                                </div>
                              )}

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
                                  className="bg-green-600 hover:bg-green-700"
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
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Module
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Module Title *</Label>
                  <Input
                    value={newModule.title}
                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                    placeholder="e.g., Week 1: Foundations"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Program *</Label>
                  <Select
                    value={newModule.program_id}
                    onValueChange={(v) => setNewModule({ ...newModule, program_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  placeholder="Module description..."
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Unlock Type</Label>
                  <Select
                    value={newModule.unlock_type}
                    onValueChange={(v) => setNewModule({ ...newModule, unlock_type: v as "day" | "task" | "manual" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Unlock on Day</SelectItem>
                      <SelectItem value="task">Unlock after Task</SelectItem>
                      <SelectItem value="manual">Manual Unlock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unlock Day (if day-based)</Label>
                  <Input
                    type="number"
                    value={newModule.unlock_day}
                    onChange={(e) => setNewModule({ ...newModule, unlock_day: e.target.value })}
                    placeholder="e.g., 7"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Order Index</Label>
                  <Input
                    type="number"
                    value={newModule.order_index}
                    onChange={(e) => setNewModule({ ...newModule, order_index: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateModule} disabled={isCreatingModule}>
                {isCreatingModule && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Module
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {modules.map((mod) => (
              <Card key={mod.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{mod.title}</h3>
                        <Badge variant="secondary">Order: {mod.order_index}</Badge>
                        <Badge variant="outline">{mod.unlock_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{mod.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={mod.is_published}
                        onCheckedChange={() => toggleModulePublished(mod.id, mod.is_published)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {mod.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

          <div className="space-y-3">
            {programs.map((prog) => (
              <Card key={prog.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{prog.title}</h3>
                      <p className="text-sm text-muted-foreground">{prog.description}</p>
                      {prog.application_deadline && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Deadline: {format(new Date(prog.application_deadline), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={prog.is_active}
                        onCheckedChange={() => toggleProgramActive(prog.id, prog.is_active)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {prog.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminScholarships;
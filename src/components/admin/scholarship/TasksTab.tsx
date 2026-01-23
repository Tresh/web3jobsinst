import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Loader2,
  Eye,
  Clock,
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
  TaskType,
  TaskStatus,
} from "@/types/scholarship";
import { TASK_TYPE_LABELS } from "@/types/scholarship";

interface TasksTabProps {
  tasks: ScholarshipTask[];
  programs: ScholarshipProgram[];
  applications: ScholarshipApplication[];
  submissions: ScholarshipTaskSubmission[];
  isLoading: boolean;
  userId?: string;
  onRefetch: () => void;
}

export function TasksTab({
  tasks,
  programs,
  applications,
  submissions,
  isLoading,
  userId,
  onRefetch,
}: TasksTabProps) {
  const { toast } = useToast();
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScholarshipTask | null>(null);
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("all");

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

  const safeTaskTypeLabel = (taskType: string) => {
    return TASK_TYPE_LABELS[taskType as keyof typeof TASK_TYPE_LABELS] || taskType || "Unknown";
  };

  const getTaskAssignmentLabel = (task: ScholarshipTask) => {
    if (task.is_global) return "All approved";
    if (task.program_id) {
      const p = programs.find((x) => x.id === task.program_id);
      return p?.title || "Program";
    }
    return "Unassigned";
  };

  const getTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="border-primary/30 text-primary"><Play className="w-3 h-3 mr-1" />Active</Badge>;
      case "ended":
        return <Badge variant="outline" className="border-destructive/30 text-destructive"><StopCircle className="w-3 h-3 mr-1" />Ended</Badge>;
      default:
        return <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
    }
  };

  const getSubmissionCountForTask = (taskId: string) => {
    return submissions.filter((s) => s.task_id === taskId).length;
  };

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
      created_by: userId,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task created successfully" });
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
      onRefetch();
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
      onRefetch();
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
      onRefetch();
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
      onRefetch();
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
      onRefetch();
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

  const filteredTasks = taskStatusFilter === "all"
    ? tasks
    : tasks.filter((t) => t.status === taskStatusFilter);

  return (
    <div className="space-y-6">
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
            <div>
              <CardTitle>Existing Tasks</CardTitle>
              <CardDescription>
                View, edit, end, or delete tasks. Ended tasks are hidden from scholars but kept in history.
              </CardDescription>
            </div>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
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
                      <Badge variant="secondary">{safeTaskTypeLabel(task.task_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Zap className="w-3 h-3 mr-1" />
                        {task.xp_value}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getTaskAssignmentLabel(task)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getSubmissionCountForTask(task.id)} submitted</span>
                    </TableCell>
                    <TableCell>{getTaskStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {safeFormatDate(task.created_at, "MMM d, yyyy") || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {task.start_date && (
                          <p>Start: {safeFormatDate(task.start_date, "MMM d") || "—"}</p>
                        )}
                        {task.due_date && (
                          <p>End: {safeFormatDate(task.due_date, "MMM d") || "—"}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedTask(task)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Task Details</DialogTitle>
                              <DialogDescription>Read-only view of this task.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-4">
                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-muted-foreground">Title</Label>
                                  <p className="font-medium">{selectedTask?.title || "—"}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Status</Label>
                                  <div className="pt-1">{selectedTask ? getTaskStatusBadge(selectedTask.status) : "—"}</div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Type</Label>
                                  <p className="font-medium">{selectedTask ? safeTaskTypeLabel(selectedTask.task_type) : "—"}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">XP</Label>
                                  <p className="font-medium">{selectedTask?.xp_value ?? "—"}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Assigned</Label>
                                  <p className="font-medium">{selectedTask ? getTaskAssignmentLabel(selectedTask) : "—"}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Created</Label>
                                  <p className="font-medium">
                                    {selectedTask ? safeFormatDate(selectedTask.created_at, "MMM d, yyyy") || "—" : "—"}
                                  </p>
                                </div>
                              </div>
                              {selectedTask?.description && (
                                <div>
                                  <Label className="text-muted-foreground">Description</Label>
                                  <p className="text-sm bg-secondary p-3 rounded-lg">{selectedTask.description}</p>
                                </div>
                              )}
                              {selectedTask?.external_link && (
                                <div>
                                  <Label className="text-muted-foreground">External Link</Label>
                                  <a
                                    href={selectedTask.external_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline inline-flex items-center gap-2"
                                  >
                                    {selectedTask.external_link}
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
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
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No scholarship tasks created yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
}

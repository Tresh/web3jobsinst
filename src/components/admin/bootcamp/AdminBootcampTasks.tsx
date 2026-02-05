import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ListTodo, ExternalLink } from "lucide-react";
import type { BootcampTask } from "@/types/bootcamp";

interface AdminBootcampTasksProps {
  bootcampId: string;
}

const AdminBootcampTasks = ({ bootcampId }: AdminBootcampTasksProps) => {
  const [tasks, setTasks] = useState<BootcampTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [bootcampId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bootcamp_tasks")
        .select("*")
        .eq("bootcamp_id", bootcampId)
        .order("day_number", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTasks((data as BootcampTask[]) || []);
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskPublished = async (task: BootcampTask) => {
    setUpdating(task.id);
    try {
      const { error } = await supabase
        .from("bootcamp_tasks")
        .update({ is_published: !task.is_published })
        .eq("id", task.id);

      if (error) throw error;

      toast.success(task.is_published ? "Task unpublished" : "Task published");
      fetchTasks();
    } catch (err: any) {
      toast.error("Failed to update task", { description: err.message });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No tasks created yet</p>
        <p className="text-sm">The bootcamp host will create tasks for participants</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Day</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>XP Value</TableHead>
          <TableHead>Published</TableHead>
          <TableHead>Link</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
              <Badge variant="outline">Day {task.day_number || "-"}</Badge>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{task.title}</p>
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {task.task_type.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>{task.xp_value} XP</TableCell>
            <TableCell>
              <Switch
                checked={task.is_published}
                onCheckedChange={() => toggleTaskPublished(task)}
                disabled={updating === task.id}
              />
            </TableCell>
            <TableCell>
              {task.external_link ? (
                <Button variant="ghost" size="sm" asChild>
                  <a href={task.external_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminBootcampTasks;

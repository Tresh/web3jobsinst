import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  useProductSocialTasks,
  useCreateSocialTask,
  useDeleteSocialTask,
  getPlatformLabel,
  getTaskTypeLabel,
} from "@/hooks/useProductSocialTasks";
import { toast } from "sonner";

const platforms = ["x", "youtube", "tiktok", "instagram", "telegram"];
const taskTypes = ["follow", "retweet", "like", "subscribe", "join", "comment"];

const SocialTasksManager = ({ productId }: { productId: string }) => {
  const { data: tasks = [], isLoading } = useProductSocialTasks(productId);
  const createTask = useCreateSocialTask();
  const deleteTask = useDeleteSocialTask();

  const [platform, setPlatform] = useState("x");
  const [taskType, setTaskType] = useState("follow");
  const [targetUrl, setTargetUrl] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!targetUrl.trim()) {
      toast.error("Target URL is required");
      return;
    }
    createTask.mutate(
      {
        product_id: productId,
        platform,
        task_type: taskType,
        target_url: targetUrl.trim(),
        description: description.trim() || null,
        order_index: tasks.length,
      },
      {
        onSuccess: () => {
          toast.success("Task added");
          setTargetUrl("");
          setDescription("");
        },
      }
    );
  };

  const handleDelete = (taskId: string) => {
    deleteTask.mutate(taskId, { onSuccess: () => toast.success("Task removed") });
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold">Social Tasks (users must complete to access)</Label>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
              <Badge variant="outline" className="text-xs shrink-0">
                {getPlatformLabel(task.platform)}
              </Badge>
              <span className="text-sm flex-1 truncate">
                {getTaskTypeLabel(task.task_type)} — {task.target_url}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => handleDelete(task.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No social tasks. Product access is unrestricted.</p>
      )}

      <div className="border border-border rounded-lg p-3 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Add new task</p>
        <div className="grid grid-cols-2 gap-2">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((p) => (
                <SelectItem key={p} value={p}>{getPlatformLabel(p)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={taskType} onValueChange={setTaskType}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taskTypes.map((t) => (
                <SelectItem key={t} value={t}>{getTaskTypeLabel(t)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Target URL (e.g. https://x.com/account)"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          className="h-8 text-xs"
        />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-8 text-xs"
        />
        <Button
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs"
          onClick={handleAdd}
          disabled={createTask.isPending}
        >
          <Plus className="h-3 w-3 mr-1" />Add Task
        </Button>
      </div>
    </div>
  );
};

export default SocialTasksManager;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ListTodo, Plus, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { TasksTab } from "@/components/admin/scholarship";
import type {
  ScholarshipProgram,
  ScholarshipApplication,
  ScholarshipTask,
  ScholarshipTaskSubmission,
} from "@/types/scholarship";

const AdminScholarshipTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([]);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [tasks, setTasks] = useState<ScholarshipTask[]>([]);
  const [submissions, setSubmissions] = useState<ScholarshipTaskSubmission[]>([]);

  const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number) => {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), ms)
      ),
    ]);
  };

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [progsRes, tasksRes, appsRes, subsRes] = await Promise.all([
        withTimeout(
          supabase.from("scholarship_programs").select("*").order("created_at", { ascending: false }),
          8000
        ),
        withTimeout(
          supabase.from("scholarship_tasks").select("*").order("created_at", { ascending: false }),
          8000
        ),
        withTimeout(
          supabase.from("scholarship_applications").select("*").order("created_at", { ascending: false }),
          8000
        ),
        withTimeout(
          supabase.from("scholarship_task_submissions").select("*").order("created_at", { ascending: false }),
          8000
        ),
      ]);

      if ((progsRes as any).error) throw (progsRes as any).error;
      if ((tasksRes as any).error) throw (tasksRes as any).error;
      if ((appsRes as any).error) throw (appsRes as any).error;
      if ((subsRes as any).error) throw (subsRes as any).error;

      setPrograms(((progsRes as any).data || []) as ScholarshipProgram[]);
      setTasks(((tasksRes as any).data || []) as ScholarshipTask[]);
      setApplications(((appsRes as any).data || []) as ScholarshipApplication[]);
      setSubmissions(((subsRes as any).data || []) as ScholarshipTaskSubmission[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setLoadError(message);
      toast({ title: "Error loading data", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check if there are no programs - block task creation
  const hasNoPrograms = !isLoading && programs.length === 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/scholarships">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scholarships
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
              <ListTodo className="w-8 h-8 text-primary" />
              Scholarship Tasks
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage tasks for approved scholarship students
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {loadError && (
        <Card className="border-destructive/50 mb-6">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">
                Failed to load data: {loadError}
              </p>
            </div>
            <Button variant="outline" onClick={() => fetchData()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Programs Warning */}
      {hasNoPrograms && (
        <Card className="border-dashed mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5 text-warning" />
              No Scholarship Programs Found
            </CardTitle>
            <CardDescription>
              You must create a Scholarship Program before you can add tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/scholarships">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create a Program First
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Tab Content - Only show if not loading and has programs */}
      {!isLoading && !hasNoPrograms && (
        <TasksTab
          tasks={tasks}
          programs={programs}
          applications={applications}
          submissions={submissions}
          isLoading={false}
          userId={user?.id}
          onRefetch={fetchData}
        />
      )}
    </div>
  );
};

export default AdminScholarshipTasks;

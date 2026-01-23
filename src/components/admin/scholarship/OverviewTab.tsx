import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { ScholarshipProgram, ScholarshipApplication, ScholarshipTask } from "@/types/scholarship";

interface OverviewTabProps {
  programs: ScholarshipProgram[];
  applications: ScholarshipApplication[];
  tasks: ScholarshipTask[];
  isLoadingPrograms: boolean;
  isLoadingApplications: boolean;
  isLoadingTasks: boolean;
  onNavigate: (tab: string, filter?: string) => void;
}

export function OverviewTab({
  programs,
  applications,
  tasks,
  isLoadingPrograms,
  isLoadingApplications,
  isLoadingTasks,
  onNavigate,
}: OverviewTabProps) {
  const activeTasks = tasks.filter((t) => t.status === "active");
  const endedTasks = tasks.filter((t) => t.status === "ended");
  const approvedApps = applications.filter((a) => a.status === "approved");
  const pendingApps = applications.filter((a) => a.status === "pending");
  const rejectedApps = applications.filter((a) => a.status === "rejected");

  return (
    <div className="space-y-6">
      {/* Scholarship Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>Scholarship Programs</span>
            {isLoadingPrograms ? (
              <Badge variant="secondary">Loading…</Badge>
            ) : (
              <Badge variant="secondary">{programs.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>Programs must exist before tasks can be meaningfully assigned.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPrograms && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading programs…
            </div>
          )}
          {!isLoadingPrograms && programs.length === 0 && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">No Scholarship Program Created Yet</p>
              <Button onClick={() => onNavigate("programs")}>Create Scholarship Program</Button>
            </div>
          )}
          {!isLoadingPrograms && programs.length > 0 && (
            <div className="space-y-2">
              {programs.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.title}</span>
                  <span className="text-muted-foreground">{p.is_active ? "Active" : "Inactive"}</span>
                </div>
              ))}
              {programs.length > 3 && (
                <Button variant="outline" size="sm" onClick={() => onNavigate("programs")}>
                  View all programs
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>Active Tasks</span>
            {isLoadingTasks ? (
              <Badge variant="secondary">Loading…</Badge>
            ) : (
              <Badge variant="secondary">{activeTasks.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>Tasks visible to approved scholars (status: Active).</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTasks ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading tasks…
            </div>
          ) : activeTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active tasks yet.</p>
          ) : (
            <div className="space-y-2">
              {activeTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t.title}</span>
                  <span className="text-muted-foreground">{t.xp_value} XP</span>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => onNavigate("tasks")}>
                Manage tasks
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed/Ended Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>Completed Tasks (Ended)</span>
            {isLoadingTasks ? (
              <Badge variant="secondary">Loading…</Badge>
            ) : (
              <Badge variant="secondary">{endedTasks.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>Ended tasks are hidden from scholars but remain in history.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTasks ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading tasks…
            </div>
          ) : endedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ended tasks yet.</p>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onNavigate("tasks", "ended")}>
              View ended tasks
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Approved Scholars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>Approved Scholars</span>
            {isLoadingApplications ? (
              <Badge variant="secondary">Loading…</Badge>
            ) : (
              <Badge variant="secondary">{approvedApps.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>Users approved into a scholarship program.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApplications ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading scholars…
            </div>
          ) : approvedApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved scholars yet.</p>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onNavigate("applications", "approved")}>
              View approved scholars
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pending Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>Pending Applications</span>
            {isLoadingApplications ? (
              <Badge variant="secondary">Loading…</Badge>
            ) : (
              <Badge variant="secondary">{pendingApps.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingApplications ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading applications…
            </div>
          ) : pendingApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending applications.</p>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onNavigate("applications", "pending")}>
              Review pending
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Rejected Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>Rejected Applications</span>
            {isLoadingApplications ? (
              <Badge variant="secondary">Loading…</Badge>
            ) : (
              <Badge variant="secondary">{rejectedApps.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingApplications ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading applications…
            </div>
          ) : rejectedApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rejected applications.</p>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onNavigate("applications", "rejected")}>
              View rejected
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

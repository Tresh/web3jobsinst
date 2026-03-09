import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldCheck, Users, Zap, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DiscrepancyRow {
  user_id: string;
  full_name: string;
  old_xp: number;
  expected_xp: number;
  adjustment: number;
}

interface AuditLogRow {
  id: string;
  user_id: string;
  full_name: string;
  old_xp: number;
  correct_xp: number;
  adjustment: number;
  task_xp: number;
  module_xp: number;
  checkin_xp: number;
  audit_source: string;
  created_at: string;
}

interface SummaryStats {
  total_students: number;
  students_correct: number;
  students_with_discrepancy: number;
  students_over_counted: number;
  students_under_counted: number;
  total_xp_to_correct: number;
}

export default function AdminXpAudit() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dryRunResults, setDryRunResults] = useState<DiscrepancyRow[]>([]);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [lastFixAt, setLastFixAt] = useState<string | null>(null);

  // Live summary stats from DB
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<SummaryStats>({
    queryKey: ["xp-audit-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("reconcile_scholarship_xp", { dry_run: true });
      if (error) throw error;
      const rows = (data || []) as DiscrepancyRow[];
      const over = rows.filter((r) => r.adjustment < 0).length;
      const under = rows.filter((r) => r.adjustment > 0).length;
      const totalXp = rows.reduce((sum, r) => sum + Math.abs(r.adjustment), 0);

      // Get total approved students
      const { count } = await supabase
        .from("scholarship_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      return {
        total_students: count || 0,
        students_correct: (count || 0) - rows.length,
        students_with_discrepancy: rows.length,
        students_over_counted: over,
        students_under_counted: under,
        total_xp_to_correct: totalXp,
      };
    },
    staleTime: 30_000,
  });

  // Audit log history
  const { data: auditLog = [], isLoading: logLoading, refetch: refetchLog } = useQuery<AuditLogRow[]>({
    queryKey: ["xp-audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xp_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as AuditLogRow[];
    },
  });

  const runDryRun = async () => {
    setIsDryRunning(true);
    try {
      const { data, error } = await supabase.rpc("reconcile_scholarship_xp", { dry_run: true });
      if (error) throw error;
      setDryRunResults((data || []) as DiscrepancyRow[]);
      toast({ title: `Dry run complete — ${(data || []).length} discrepancies found` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Dry run failed", description: msg, variant: "destructive" });
    } finally {
      setIsDryRunning(false);
    }
  };

  const runFix = async () => {
    if (!window.confirm(`This will correct XP for ${stats?.students_with_discrepancy ?? 0} students and log all changes. Proceed?`)) return;
    setIsFixing(true);
    try {
      const { error } = await supabase.rpc("reconcile_scholarship_xp", { dry_run: false });
      if (error) throw error;
      setLastFixAt(new Date().toISOString());
      toast({ title: "XP reconciliation complete ✅", description: "All discrepancies have been corrected and logged." });
      await Promise.all([refetchStats(), refetchLog()]);
      setDryRunResults([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Fix failed", description: msg, variant: "destructive" });
    } finally {
      setIsFixing(false);
    }
  };

  const displayRows = dryRunResults.length > 0 ? dryRunResults : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            XP Integrity Audit
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Audit, reconcile, and protect scholarship student XP data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runDryRun} disabled={isDryRunning || isFixing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isDryRunning ? "animate-spin" : ""}`} />
            {isDryRunning ? "Scanning..." : "Run Audit Scan"}
          </Button>
          <Button
            onClick={runFix}
            disabled={isFixing || isDryRunning || (stats?.students_with_discrepancy ?? 0) === 0}
            className="bg-primary text-primary-foreground"
          >
            <Zap className={`h-4 w-4 mr-2 ${isFixing ? "animate-pulse" : ""}`} />
            {isFixing ? "Fixing..." : "Apply Corrections"}
          </Button>
        </div>
      </div>

      {lastFixAt && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md px-4 py-2">
          <CheckCircle2 className="h-4 w-4" />
          Last correction applied at {new Date(lastFixAt).toLocaleString()}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs">Total Students</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? "—" : (stats?.total_students ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Approved</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs">XP Correct</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {statsLoading ? "—" : (stats?.students_correct ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Accurate</span>
            </div>
          </CardContent>
        </Card>

        <Card className={stats?.students_with_discrepancy ? "border-amber-200 dark:border-amber-800" : ""}>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs">Discrepancies</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-2xl font-bold ${stats?.students_with_discrepancy ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
              {statsLoading ? "—" : (stats?.students_with_discrepancy ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-muted-foreground">Need fix</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs">Under-counted</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {statsLoading ? "—" : (stats?.students_under_counted ?? 0).toLocaleString()}
            </div>
            <span className="text-xs text-muted-foreground">Missing XP</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs">Over-counted</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {statsLoading ? "—" : (stats?.students_over_counted ?? 0).toLocaleString()}
            </div>
            <span className="text-xs text-muted-foreground">Excess XP</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs">Total Δ XP</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-primary">
              {statsLoading ? "—" : (stats?.total_xp_to_correct ?? 0).toLocaleString()}
            </div>
            <span className="text-xs text-muted-foreground">To correct</span>
          </CardContent>
        </Card>
      </div>

      {/* XP Source Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">XP Formula</CardTitle>
          <CardDescription className="text-xs">
            Expected XP = Task XP (approved submissions) + Module XP (completed modules) + Check-in XP (daily streaks + bonuses)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 text-xs">
            <Badge variant="secondary">✅ Task submissions (approved)</Badge>
            <Badge variant="secondary">📚 Module completions (xp_value)</Badge>
            <Badge variant="secondary">🔥 Daily check-ins (xp_awarded + bonus_xp)</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Discrepancies | Audit Log */}
      <Tabs defaultValue="discrepancies">
        <TabsList>
          <TabsTrigger value="discrepancies">
            Discrepancy Report
            {displayRows.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {displayRows.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="log">
            Correction Log
            {auditLog.length > 0 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {auditLog.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discrepancies" className="mt-4">
          {displayRows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">
                {stats?.students_with_discrepancy === 0
                  ? "All student XP values are accurate ✅"
                  : "Click 'Run Audit Scan' to see discrepancies"}
              </p>
              <p className="text-sm mt-1">
                {stats?.students_with_discrepancy === 0
                  ? "No corrections needed"
                  : `${stats?.students_with_discrepancy ?? 0} students may have discrepancies`}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Current XP</TableHead>
                    <TableHead className="text-right">Expected XP</TableHead>
                    <TableHead className="text-right">Adjustment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayRows.map((row) => (
                    <TableRow key={row.user_id}>
                      <TableCell>
                        <div className="font-medium text-sm">{row.full_name || "—"}</div>
                        <div className="text-xs text-muted-foreground font-mono">{row.user_id.slice(0, 8)}…</div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{row.old_xp.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">{row.expected_xp.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span className={row.adjustment > 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}>
                          {row.adjustment > 0 ? "+" : ""}{row.adjustment.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.adjustment > 0 ? "secondary" : "destructive"} className="text-xs">
                          {row.adjustment > 0 ? "Under-counted" : "Over-counted"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          {logLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading audit log…</div>
          ) : auditLog.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <History className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No corrections applied yet</p>
              <p className="text-sm mt-1">Correction history will appear here after applying fixes</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Old XP</TableHead>
                    <TableHead className="text-right">Corrected XP</TableHead>
                    <TableHead className="text-right">Δ XP</TableHead>
                    <TableHead className="text-right">Task XP</TableHead>
                    <TableHead className="text-right">Check-in XP</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{row.full_name || "—"}</div>
                        <div className="text-xs text-muted-foreground font-mono">{row.user_id.slice(0, 8)}…</div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">{row.old_xp.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">{row.correct_xp.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span className={row.adjustment > 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}>
                          {row.adjustment > 0 ? "+" : ""}{row.adjustment.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">{(row.task_xp || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">{(row.checkin_xp || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{row.audit_source}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Integrity check info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            XP Integrity Protection Active
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• A database trigger (<code className="font-mono bg-muted px-1 rounded">validate_scholarship_xp_update</code>) is active on <code className="font-mono bg-muted px-1 rounded">scholarship_applications</code>.</p>
          <p>• It <strong>blocks XP decreases</strong> from non-admin operations and logs admin-initiated changes.</p>
          <p>• XP can only increase via approved task/module/check-in events, or via a privileged admin reconciliation.</p>
          <p>• All corrections are permanently logged in <code className="font-mono bg-muted px-1 rounded">xp_audit_log</code> for full transparency.</p>
        </CardContent>
      </Card>
    </div>
  );
}

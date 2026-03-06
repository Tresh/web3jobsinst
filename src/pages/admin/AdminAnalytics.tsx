import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, Rocket, Bug, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";

const AdminAnalytics = () => {
  // Total counts
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-analytics-stats"],
    queryFn: async () => {
      const [users, scholars, bootcamps, bugs] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("scholarship_applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("bootcamps").select("*", { count: "exact", head: true }),
        supabase.from("bug_reports").select("*", { count: "exact", head: true }).eq("status", "new"),
      ]);
      return {
        totalUsers: users.count || 0,
        approvedScholars: scholars.count || 0,
        totalBootcamps: bootcamps.count || 0,
        openBugs: bugs.count || 0,
      };
    },
  });

  // User signups over last 30 days
  const { data: signupData, isLoading: signupsLoading } = useQuery({
    queryKey: ["admin-analytics-signups"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: true });

      // Group by day
      const grouped: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const day = format(subDays(new Date(), i), "MMM d");
        grouped[day] = 0;
      }
      
      (data || []).forEach((row) => {
        const day = format(new Date(row.created_at), "MMM d");
        if (grouped[day] !== undefined) grouped[day]++;
      });

      return Object.entries(grouped).map(([date, count]) => ({ date, signups: count }));
    },
  });

  // Scholarship status breakdown
  const { data: scholarshipBreakdown, isLoading: scholarLoading } = useQuery({
    queryKey: ["admin-analytics-scholarship-breakdown"],
    queryFn: async () => {
      const { data } = await supabase
        .from("scholarship_applications")
        .select("status");
      
      const counts: Record<string, number> = { pending: 0, approved: 0, rejected: 0, waitlist: 0 };
      (data || []).forEach((row) => {
        const s = (row as any).status as string;
        counts[s] = (counts[s] || 0) + 1;
      });
      return Object.entries(counts).map(([status, count]) => ({ status, count }));
    },
  });

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-primary" },
    { label: "Approved Scholars", value: stats?.approvedScholars, icon: GraduationCap, color: "text-primary" },
    { label: "Bootcamps", value: stats?.totalBootcamps, icon: Rocket, color: "text-primary" },
    { label: "Open Bugs", value: stats?.openBugs, icon: Bug, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform insights and engagement metrics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{s.value?.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Signup chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            User Signups (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {signupsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Scholarship breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4" />
            Scholarship Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scholarLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scholarshipBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="status" tick={{ fontSize: 12 }} width={80} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;

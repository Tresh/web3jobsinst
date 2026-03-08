import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, Rocket, Bug, TrendingUp, MessageSquare, BookOpen, Briefcase, Award, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { format, subDays } from "date-fns";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--accent))", "hsl(var(--muted-foreground))"];

const AdminAnalytics = () => {
  // Total counts
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-analytics-stats"],
    queryFn: async () => {
      const [users, scholars, bootcamps, bugs, conversations, internships, learnfi, talents] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("scholarship_applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("bootcamps").select("*", { count: "exact", head: true }),
        supabase.from("bug_reports").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("conversations").select("*", { count: "exact", head: true }),
        supabase.from("internship_profiles").select("*", { count: "exact", head: true }),
        supabase.from("learnfi_programs").select("*", { count: "exact", head: true }),
        supabase.from("talent_profiles" as any).select("*", { count: "exact", head: true }),
      ]);
      return {
        totalUsers: users.count || 0,
        approvedScholars: scholars.count || 0,
        totalBootcamps: bootcamps.count || 0,
        openBugs: bugs.count || 0,
        totalConversations: conversations.count || 0,
        totalInternships: internships.count || 0,
        totalLearnFi: learnfi.count || 0,
        totalTalents: talents.count || 0,
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

  // Bootcamp participation stats
  const { data: bootcampStats, isLoading: bootcampLoading } = useQuery({
    queryKey: ["admin-analytics-bootcamp-stats"],
    queryFn: async () => {
      const [participants, submissions, approvedSubs] = await Promise.all([
        supabase.from("bootcamp_participants").select("*", { count: "exact", head: true }),
        supabase.from("bootcamp_task_submissions").select("*", { count: "exact", head: true }),
        supabase.from("bootcamp_task_submissions").select("*", { count: "exact", head: true }).eq("status", "approved"),
      ]);
      return {
        totalParticipants: participants.count || 0,
        totalSubmissions: submissions.count || 0,
        approvedSubmissions: approvedSubs.count || 0,
      };
    },
  });

  // Messages activity last 14 days
  const { data: messageActivity, isLoading: messagesLoading } = useQuery({
    queryKey: ["admin-analytics-messages"],
    queryFn: async () => {
      const fourteenDaysAgo = subDays(new Date(), 14).toISOString();
      const { data } = await supabase
        .from("messages")
        .select("created_at")
        .gte("created_at", fourteenDaysAgo);

      const grouped: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const day = format(subDays(new Date(), i), "MMM d");
        grouped[day] = 0;
      }

      (data || []).forEach((row) => {
        const day = format(new Date(row.created_at), "MMM d");
        if (grouped[day] !== undefined) grouped[day]++;
      });

      return Object.entries(grouped).map(([date, count]) => ({ date, messages: count }));
    },
  });

  // Page traffic last 30 days
  const { data: pageTraffic, isLoading: trafficLoading } = useQuery({
    queryKey: ["admin-analytics-page-traffic"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data } = await supabase
        .from("analytics_events")
        .select("created_at, page_path")
        .eq("event_type", "page_view")
        .gte("created_at", thirtyDaysAgo);

      // Daily traffic
      const dailyGrouped: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const day = format(subDays(new Date(), i), "MMM d");
        dailyGrouped[day] = 0;
      }

      // Top pages
      const pageCount: Record<string, number> = {};

      (data || []).forEach((row) => {
        const day = format(new Date(row.created_at!), "MMM d");
        if (dailyGrouped[day] !== undefined) dailyGrouped[day]++;
        const path = row.page_path || "/";
        pageCount[path] = (pageCount[path] || 0) + 1;
      });

      const daily = Object.entries(dailyGrouped).map(([date, views]) => ({ date, views }));
      const topPages = Object.entries(pageCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([page, views]) => ({ page, views }));

      return { daily, topPages, totalViews: data?.length || 0 };
    },
  });

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-primary" },
    { label: "Approved Scholars", value: stats?.approvedScholars, icon: GraduationCap, color: "text-primary" },
    { label: "Bootcamps", value: stats?.totalBootcamps, icon: Rocket, color: "text-primary" },
    { label: "Open Bugs", value: stats?.openBugs, icon: Bug, color: "text-destructive" },
    { label: "Conversations", value: stats?.totalConversations, icon: MessageSquare, color: "text-primary" },
    { label: "Intern Profiles", value: stats?.totalInternships, icon: Briefcase, color: "text-primary" },
    { label: "LearnFi Programs", value: stats?.totalLearnFi, icon: BookOpen, color: "text-primary" },
    { label: "Talent Profiles", value: stats?.totalTalents, icon: Award, color: "text-primary" },
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

      {/* Page Traffic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4" />
            Page Views (Last 30 Days) — {pageTraffic?.totalViews?.toLocaleString() || 0} total
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trafficLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={pageTraffic?.daily}>
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
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Pages + Signup chart side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trafficLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-2">
                {(pageTraffic?.topPages || []).map((p, i) => (
                  <div key={p.page} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate max-w-[70%]">
                      <span className="text-foreground font-medium mr-2">{i + 1}.</span>
                      {p.page}
                    </span>
                    <span className="font-medium text-foreground">{p.views}</span>
                  </div>
                ))}
                {(!pageTraffic?.topPages || pageTraffic.topPages.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No page view data yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scholarship breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" />
              Scholarship Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scholarLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={scholarshipBreakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {(scholarshipBreakdown || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bootcamp engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="h-4 w-4" />
              Bootcamp Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bootcampLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="grid grid-cols-3 gap-4 py-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{bootcampStats?.totalParticipants}</div>
                  <p className="text-xs text-muted-foreground mt-1">Participants</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{bootcampStats?.totalSubmissions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Submissions</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{bootcampStats?.approvedSubmissions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Approved</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Messages Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Messaging Activity (Last 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messagesLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={messageActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="messages" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;

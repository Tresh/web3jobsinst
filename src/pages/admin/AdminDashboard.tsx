import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, BookOpen, Package, Megaphone, TrendingUp, UserCheck, Clock, Activity,
  GraduationCap, Rocket, Bug, Zap, FileEdit, ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
  href?: string;
}

const StatCard = ({ title, value, description, icon, trend, href }: StatCardProps) => {
  const content = (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{value}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{description}</p>
          {trend && <p className="text-xs sm:text-sm text-primary mt-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" /><span className="truncate">{trend}</span></p>}
        </div>
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">{icon}</div>
      </div>
    </div>
  );
  return href ? <Link to={href}>{content}</Link> : content;
};

interface RecentItem {
  action: string;
  detail: string;
  time: string;
  icon: React.ElementType;
  href?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, newUsersToday: 0, totalScholarships: 0, pendingScholarships: 0,
    totalBootcamps: 0, totalLearnFi: 0, pendingLearnFi: 0, pendingTutors: 0,
    totalBugReports: 0, pendingEditRequests: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const [
        usersRes, newUsersRes, scholarsRes, pendScholarsRes,
        bootcampsRes, learnfiRes, pendLearnfiRes, tutorsRes,
        bugsRes, editReqsRes, recentUsersRes, recentScholarsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("scholarship_applications").select("*", { count: "exact", head: true }),
        supabase.from("scholarship_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("bootcamps").select("*", { count: "exact", head: true }),
        supabase.from("learnfi_programs").select("*", { count: "exact", head: true }),
        supabase.from("learnfi_programs").select("*", { count: "exact", head: true }).eq("status", "pending_approval"),
        supabase.from("tutor_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("bug_reports").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("learnfi_edit_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("full_name, email, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("scholarship_applications").select("full_name, status, created_at").order("created_at", { ascending: false }).limit(3),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        newUsersToday: newUsersRes.count || 0,
        totalScholarships: scholarsRes.count || 0,
        pendingScholarships: pendScholarsRes.count || 0,
        totalBootcamps: bootcampsRes.count || 0,
        totalLearnFi: learnfiRes.count || 0,
        pendingLearnFi: pendLearnfiRes.count || 0,
        pendingTutors: tutorsRes.count || 0,
        totalBugReports: bugsRes.count || 0,
        pendingEditRequests: editReqsRes.count || 0,
      });

      const activity: RecentItem[] = [];
      (recentUsersRes.data || []).forEach((u: any) => {
        activity.push({ action: "New user registered", detail: u.full_name || u.email || "Unknown", time: u.created_at, icon: Users, href: "/admin/users" });
      });
      (recentScholarsRes.data || []).forEach((s: any) => {
        activity.push({ action: `Scholarship ${s.status}`, detail: s.full_name, time: s.created_at, icon: GraduationCap, href: "/admin/scholarships" });
      });
      activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivity(activity.slice(0, 8));
      setIsLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Overview of your platform activity and pending actions.</p>
      </div>

      {/* Pending Actions */}
      {(stats.pendingScholarships > 0 || stats.pendingLearnFi > 0 || stats.pendingTutors > 0 || stats.pendingEditRequests > 0 || stats.totalBugReports > 0) && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Needs Attention</h2>
          <div className="flex flex-wrap gap-2">
            {stats.pendingScholarships > 0 && <Link to="/admin/scholarships"><Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">{stats.pendingScholarships} pending scholarships</Badge></Link>}
            {stats.pendingLearnFi > 0 && <Link to="/admin/learnfi"><Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">{stats.pendingLearnFi} pending programs</Badge></Link>}
            {stats.pendingTutors > 0 && <Link to="/admin/tutors"><Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">{stats.pendingTutors} pending tutors</Badge></Link>}
            {stats.pendingEditRequests > 0 && <Link to="/admin/learnfi"><Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">{stats.pendingEditRequests} edit requests</Badge></Link>}
            {stats.totalBugReports > 0 && <Link to="/admin/bug-reports"><Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">{stats.totalBugReports} new bugs</Badge></Link>}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} description={`${stats.newUsersToday} new today`} icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />} href="/admin/users" />
        <StatCard title="Scholarships" value={stats.totalScholarships} description={`${stats.pendingScholarships} pending`} icon={<GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />} href="/admin/scholarships" />
        <StatCard title="Bootcamps" value={stats.totalBootcamps} description="Total bootcamps" icon={<Rocket className="h-5 w-5 sm:h-6 sm:w-6" />} href="/admin/bootcamps" />
        <StatCard title="LearnFi Programs" value={stats.totalLearnFi} description={`${stats.pendingLearnFi} pending`} icon={<Zap className="h-5 w-5 sm:h-6 sm:w-6" />} href="/admin/learnfi" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: "Review Scholarships", desc: `${stats.pendingScholarships} pending`, icon: GraduationCap, href: "/admin/scholarships" },
            { title: "Manage Users", desc: `${stats.totalUsers} total`, icon: UserCheck, href: "/admin/users" },
            { title: "LearnFi Programs", desc: `${stats.pendingLearnFi} pending`, icon: Zap, href: "/admin/learnfi" },
            { title: "Tutor Applications", desc: `${stats.pendingTutors} pending`, icon: BookOpen, href: "/admin/tutors" },
            { title: "Bootcamps", desc: `${stats.totalBootcamps} total`, icon: Rocket, href: "/admin/bootcamps" },
            { title: "Bug Reports", desc: `${stats.totalBugReports} new`, icon: Bug, href: "/admin/bug-reports" },
          ].map((action) => (
            <Link key={action.title} to={action.href} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                <action.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-4 sm:p-6">
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((item, index) => (
                  <Link key={index} to={item.href || "#"} className="flex items-center gap-3 sm:gap-4 py-2 sm:py-3 border-b border-border last:border-0 hover:bg-secondary/50 rounded px-2 -mx-2 transition-colors">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{item.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">{format(new Date(item.time), "MMM d, HH:mm")}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">System Health</h2>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-primary text-sm sm:text-base">All Systems Operational</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Database, authentication, and storage are running smoothly</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  BookOpen,
  Package,
  Megaphone,
  TrendingUp,
  UserCheck,
  Clock,
  Activity,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}

const StatCard = ({ title, value, description, icon, trend }: StatCardProps) => (
  <div className="bg-card border border-border rounded-xl p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        {trend && (
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </div>
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
    </div>
  </div>
);

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const QuickActionCard = ({ title, description, icon, href }: QuickActionProps) => (
  <a
    href={href}
    className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group"
  >
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  </a>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    totalCourses: 0,
    totalProducts: 0,
    activeCampaigns: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch user count from profiles
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: userCount || 0,
        newUsersToday: 0, // Would need timestamp filter
        totalCourses: 48, // From static data
        totalProducts: 8, // From static data
        activeCampaigns: 5, // From static data
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered accounts"
          icon={<Users className="h-6 w-6" />}
          trend="+12% this month"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          description="Available courses"
          icon={<BookOpen className="h-6 w-6" />}
        />
        <StatCard
          title="Digital Products"
          value={stats.totalProducts}
          description="Listed products"
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard
          title="Active Campaigns"
          value={stats.activeCampaigns}
          description="Running campaigns"
          icon={<Megaphone className="h-6 w-6" />}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Add New Course"
            description="Create a new course for the platform"
            icon={<BookOpen className="h-5 w-5" />}
            href="/admin/courses"
          />
          <QuickActionCard
            title="Manage Users"
            description="View and manage user accounts"
            icon={<UserCheck className="h-5 w-5" />}
            href="/admin/users"
          />
          <QuickActionCard
            title="Create Campaign"
            description="Launch a new marketing campaign"
            icon={<Megaphone className="h-5 w-5" />}
            href="/admin/campaigns"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="space-y-4">
            {[
              { action: "New user registered", time: "2 minutes ago", icon: Users },
              { action: "Course updated", time: "15 minutes ago", icon: BookOpen },
              { action: "Campaign started", time: "1 hour ago", icon: Megaphone },
              { action: "Product listed", time: "3 hours ago", icon: Package },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 py-3 border-b border-border last:border-0"
              >
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div>
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-600">All Systems Operational</p>
              <p className="text-sm text-muted-foreground">
                Database, authentication, and storage are running smoothly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

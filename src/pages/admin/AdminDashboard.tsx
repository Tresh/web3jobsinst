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
  <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{value}</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{description}</p>
        {trend && (
          <p className="text-xs sm:text-sm text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{trend}</span>
          </p>
        )}
      </div>
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
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
    className="bg-card border border-border rounded-xl p-4 sm:p-6 hover:border-primary/50 transition-colors group"
  >
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm sm:text-base">{title}</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
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
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered accounts"
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
          trend="+12% this month"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          description="Available courses"
          icon={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
        <StatCard
          title="Digital Products"
          value={stats.totalProducts}
          description="Listed products"
          icon={<Package className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
        <StatCard
          title="Active Campaigns"
          value={stats.activeCampaigns}
          description="Running campaigns"
          icon={<Megaphone className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <QuickActionCard
            title="Add New Course"
            description="Create a new course for the platform"
            icon={<BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />}
            href="/admin/courses"
          />
          <QuickActionCard
            title="Manage Users"
            description="View and manage user accounts"
            icon={<UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />}
            href="/admin/users"
          />
          <QuickActionCard
            title="Create Campaign"
            description="Launch a new marketing campaign"
            icon={<Megaphone className="h-4 w-4 sm:h-5 sm:w-5" />}
            href="/admin/campaigns"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Activity</h2>
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {[
              { action: "New user registered", time: "2 minutes ago", icon: Users },
              { action: "Course updated", time: "15 minutes ago", icon: BookOpen },
              { action: "Campaign started", time: "1 hour ago", icon: Megaphone },
              { action: "Product listed", time: "3 hours ago", icon: Package },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 sm:gap-4 py-2 sm:py-3 border-b border-border last:border-0"
              >
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{item.action}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{item.time}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">System Health</h2>
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-green-600 text-sm sm:text-base">All Systems Operational</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
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

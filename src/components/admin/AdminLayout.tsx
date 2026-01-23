import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  BookOpen,
  Package,
  Users,
  Megaphone,
  UserCog,
  Settings,
  LogOut,
  Home,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import logo from "@/assets/logo.png";

const adminNavItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Courses",
    icon: BookOpen,
    href: "/admin/courses",
  },
  {
    title: "Products",
    icon: Package,
    href: "/admin/products",
  },
  {
    title: "Talents",
    icon: Users,
    href: "/admin/talents",
  },
  {
    title: "Campaigns",
    icon: Megaphone,
    href: "/admin/campaigns",
  },
  {
    title: "Scholarships",
    icon: GraduationCap,
    href: "/admin/scholarships",
  },
];

const settingsNavItems = [
  {
    title: "User Management",
    icon: UserCog,
    href: "/admin/users",
  },
  {
    title: "Roles & Permissions",
    icon: ShieldCheck,
    href: "/admin/roles",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

const AdminLayout = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4 border-b border-border">
            <Link to="/admin" className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">Admin Panel</span>
                <span className="text-xs text-muted-foreground">Web3 Jobs Institute</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-2">
            {/* Main Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                Content Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        className="h-10"
                      >
                        <Link to={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Settings Navigation */}
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {settingsNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        className="h-10"
                      >
                        <Link to={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Back to Site */}
            <SidebarGroup className="mt-auto pt-4">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-10">
                      <Link to="/">
                        <Home className="h-4 w-4" />
                        <span>Back to Site</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => signOut()}
                      className="h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{profile?.full_name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

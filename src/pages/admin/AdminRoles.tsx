import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldCheck, ShieldAlert, Info } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  admin: boolean;
  moderator: boolean;
}

const defaultPermissions: Permission[] = [
  {
    id: "manage_courses",
    name: "Manage Courses",
    description: "Create, edit, and delete courses",
    admin: true,
    moderator: true,
  },
  {
    id: "manage_products",
    name: "Manage Products",
    description: "Create, edit, and delete digital products",
    admin: true,
    moderator: true,
  },
  {
    id: "manage_campaigns",
    name: "Manage Campaigns",
    description: "Create, edit, and delete campaigns",
    admin: true,
    moderator: true,
  },
  {
    id: "manage_talents",
    name: "Manage Talents",
    description: "Approve and manage talent listings",
    admin: true,
    moderator: true,
  },
  {
    id: "view_users",
    name: "View Users",
    description: "View user profiles and activity",
    admin: true,
    moderator: true,
  },
  {
    id: "manage_users",
    name: "Manage Users",
    description: "Edit user profiles and status",
    admin: true,
    moderator: false,
  },
  {
    id: "manage_roles",
    name: "Manage Roles",
    description: "Assign and modify user roles",
    admin: true,
    moderator: false,
  },
  {
    id: "view_analytics",
    name: "View Analytics",
    description: "Access platform analytics and reports",
    admin: true,
    moderator: true,
  },
  {
    id: "manage_settings",
    name: "Manage Settings",
    description: "Modify platform settings and configuration",
    admin: true,
    moderator: false,
  },
  {
    id: "delete_content",
    name: "Delete Content",
    description: "Permanently delete any content",
    admin: true,
    moderator: false,
  },
];

const AdminRoles = () => {
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const handlePermissionChange = (permissionId: string, role: "admin" | "moderator") => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only admins can modify permissions",
        variant: "destructive",
      });
      return;
    }

    // Admin permissions cannot be changed
    if (role === "admin") {
      toast({
        title: "Cannot modify",
        description: "Admin permissions cannot be changed",
        variant: "destructive",
      });
      return;
    }

    setPermissions((prev) =>
      prev.map((p) =>
        p.id === permissionId ? { ...p, [role]: !p[role] } : p
      )
    );

    toast({
      title: "Permission updated",
      description: "Role permissions have been updated",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <p className="text-muted-foreground mt-1">
          Configure what each role can do on the platform
        </p>
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Admin</h3>
              <p className="text-sm text-muted-foreground">Full access</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Administrators have complete control over the platform, including user management and system settings.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Moderator</h3>
              <p className="text-sm text-muted-foreground">Content management</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Moderators can manage content like courses, products, and campaigns but cannot manage users or settings.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">User</h3>
              <p className="text-sm text-muted-foreground">Standard access</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Regular users can browse content, enroll in courses, and manage their own profile.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900 dark:text-blue-100">Permission Matrix</p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Admin permissions are locked and cannot be modified. Moderator permissions can be customized by admins.
          </p>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Permission</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center w-[120px]">Admin</TableHead>
              <TableHead className="text-center w-[120px]">Moderator</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell className="text-muted-foreground">{permission.description}</TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={permission.admin}
                    disabled
                    className="data-[state=checked]:bg-primary"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={permission.moderator}
                    onCheckedChange={() => handlePermissionChange(permission.id, "moderator")}
                    disabled={!isAdmin}
                    className="data-[state=checked]:bg-primary"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminRoles;

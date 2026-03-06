import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Search, Shield, UserX, Loader2, Eye } from "lucide-react";

type AppRole = "admin" | "moderator" | "user";

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  provider: string | null;
  created_at: string;
  role: AppRole;
}

const PAGE_SIZE = 30;

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { user: currentUser, isAdmin } = useAuth();
  const { toast } = useToast();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
      setUsers([]);
      setHasMore(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = useCallback(async (pageNum: number, append = false) => {
    if (!append) setIsLoading(true);
    else setIsLoadingMore(true);
    
    try {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (debouncedSearch) {
        query = query.or(`full_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      const [{ data: profiles, error: pErr, count }, { data: roles, error: rErr }] = await Promise.all([
        query,
        supabase.from("user_roles").select("*"),
      ]);

      if (pErr) throw pErr;
      if (rErr) throw rErr;

      if (count !== null) setTotalCount(count);

      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRoles = (roles || []).filter((r) => r.user_id === profile.user_id);
        let highestRole: AppRole = "user";
        if (userRoles.some((r) => r.role === "admin")) highestRole = "admin";
        else if (userRoles.some((r) => r.role === "moderator")) highestRole = "moderator";
        return { ...profile, role: highestRole };
      });

      if (append) {
        setUsers(prev => [...prev, ...usersWithRoles]);
      } else {
        setUsers(usersWithRoles);
      }

      setHasMore(usersWithRoles.length === PAGE_SIZE);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setIsLoading(false);
    setIsLoadingMore(false);
  }, [debouncedSearch, toast]);

  useEffect(() => {
    fetchUsers(0);
  }, [fetchUsers]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, true);
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    if (!isAdmin) { toast({ title: "Permission denied", variant: "destructive" }); return; }
    setUpdatingUser(userId);
    try {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
      if (error) throw error;
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u)));
      toast({ title: `Role updated to ${newRole}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setUpdatingUser(null);
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    if (role === "admin") return "default" as const;
    if (role === "moderator") return "secondary" as const;
    return "outline" as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts, roles, and view activity</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Badge variant="secondary">
          {totalCount !== null ? `${totalCount} total` : `${users.length} users`}
        </Badge>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Provider</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link to={`/admin/users/${u.user_id}`} className="flex items-center gap-3 hover:opacity-80">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{u.full_name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-primary hover:underline">{u.full_name || "No name"}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="outline" className="capitalize">{u.provider || "email"}</Badge></TableCell>
                    <TableCell><Badge variant={getRoleBadgeVariant(u.role)} className="capitalize"><Shield className="h-3 w-3 mr-1" />{u.role}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon"><Link to={`/admin/users/${u.user_id}`}><Eye className="w-4 h-4" /></Link></Button>
                        {u.user_id !== currentUser?.id ? (
                          <Select value={u.role} onValueChange={(v) => updateUserRole(u.user_id, v as AppRole)} disabled={updatingUser === u.user_id || !isAdmin}>
                            <SelectTrigger className="w-28">{updatingUser === u.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}</SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : <span className="text-sm text-muted-foreground px-2">You</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground"><UserX className="h-8 w-8 mx-auto mb-2 opacity-50" />No users found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            {hasMore && users.length > 0 && (
              <div className="flex justify-center py-4 border-t border-border">
                <Button variant="outline" onClick={loadMore} disabled={isLoadingMore}>
                  {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search, CheckCircle, Eye, Star, Users, Clock, Plus, Loader2,
} from "lucide-react";
import type { Bootcamp, BootcampStatus } from "@/types/bootcamp";
import BootcampCreateDialog from "@/components/admin/bootcamp/BootcampCreateDialog";

const PAGE_SIZE = 30;

const statusColors: Record<BootcampStatus, string> = {
  draft: "bg-secondary text-secondary-foreground",
  pending_approval: "bg-accent text-accent-foreground",
  approved: "bg-primary/10 text-primary",
  active: "bg-primary/20 text-primary",
  completed: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminBootcamps = () => {
  const navigate = useNavigate();
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
      setBootcamps([]);
      setHasMore(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchBootcamps = useCallback(async (pageNum: number, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      let query = supabase
        .from("bootcamps")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,host_name.ilike.%${debouncedSearch}%`);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const items = (data as unknown as Bootcamp[]) || [];
      if (count !== null) setTotalCount(count);

      if (append) {
        setBootcamps(prev => [...prev, ...items]);
      } else {
        setBootcamps(items);
      }
      setHasMore(items.length === PAGE_SIZE);
    } catch (err: any) {
      toast.error("Failed to load bootcamps", { description: err.message });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchBootcamps(0);
  }, [fetchBootcamps]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBootcamps(nextPage, true);
  };

  const toggleFeatured = async (bootcamp: Bootcamp) => {
    try {
      const { error } = await supabase
        .from("bootcamps")
        .update({ is_featured: !bootcamp.is_featured })
        .eq("id", bootcamp.id);
      if (error) throw error;
      toast.success(bootcamp.is_featured ? "Removed from featured" : "Added to featured");
      setPage(0);
      setBootcamps([]);
      setHasMore(true);
      fetchBootcamps(0);
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const stats = {
    total: totalCount ?? bootcamps.length,
    pending: bootcamps.filter((b) => b.status === "pending_approval").length,
    active: bootcamps.filter((b) => b.status === "active").length,
    totalParticipants: bootcamps.reduce((sum, b) => sum + b.current_participants, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bootcamp Management</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Bootcamp
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Clock className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Bootcamps</p><p className="text-2xl font-bold">{stats.total}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-accent rounded-lg"><Clock className="w-5 h-5 text-accent-foreground" /></div><div><p className="text-sm text-muted-foreground">Pending Approval</p><p className="text-2xl font-bold">{stats.pending}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-primary/20 rounded-lg"><CheckCircle className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold">{stats.active}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-secondary rounded-lg"><Users className="w-5 h-5 text-secondary-foreground" /></div><div><p className="text-sm text-muted-foreground">Total Participants</p><p className="text-2xl font-bold">{stats.totalParticipants}</p></div></div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search bootcamps..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); setBootcamps([]); setHasMore(true); }}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="active">Active (Ongoing)</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bootcamps Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bootcamp</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" /></TableCell></TableRow>
              ) : bootcamps.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No bootcamps found</TableCell></TableRow>
              ) : (
                bootcamps.map((bootcamp) => (
                  <TableRow key={bootcamp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/bootcamps/${bootcamp.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {bootcamp.is_featured && <Star className="w-4 h-4 text-primary fill-primary" />}
                        <div>
                          <p className="font-medium">{bootcamp.title}</p>
                          <p className="text-xs text-muted-foreground">{bootcamp.duration_days} days</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{bootcamp.host_name}</TableCell>
                    <TableCell><span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">{bootcamp.bootcamp_type === "free" ? "Free" : `$${bootcamp.price_amount}`}</span></TableCell>
                    <TableCell>{bootcamp.current_participants} / {bootcamp.max_participants}</TableCell>
                    <TableCell><span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${statusColors[bootcamp.status]}`}>{bootcamp.status.replace("_", " ")}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/admin/bootcamps/${bootcamp.id}`); }}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleFeatured(bootcamp); }}><Star className={`w-4 h-4 ${bootcamp.is_featured ? "text-primary fill-primary" : ""}`} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {hasMore && bootcamps.length > 0 && !loading && (
            <div className="flex justify-center py-4 border-t border-border">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <BootcampCreateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={() => { setPage(0); setBootcamps([]); setHasMore(true); fetchBootcamps(0); }} />
    </div>
  );
};

export default AdminBootcamps;

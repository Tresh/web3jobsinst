import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Clock,
} from "lucide-react";

interface TalentRow {
  id: string;
  user_id: string;
  headline: string;
  bio: string | null;
  category: string;
  skills: string[];
  hourly_rate: number | null;
  availability: string;
  rating: number;
  completed_projects: number;
  is_published: boolean;
  is_approved: boolean;
  admin_notes: string | null;
  created_at: string;
  full_name: string;
  avatar_url: string | null;
}

const AdminTalents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [talents, setTalents] = useState<TalentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();

  const fetchTalents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("talent_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching talents:", error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setTalents([]);
      setLoading(false);
      return;
    }

    const userIds = data.map((t: any) => t.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", userIds);

    const merged = data.map((t: any) => {
      const p = profiles?.find((pr) => pr.user_id === t.user_id);
      return {
        ...t,
        full_name: p?.full_name || "Unknown",
        avatar_url: p?.avatar_url || null,
      };
    }) as TalentRow[];

    setTalents(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchTalents();
  }, []);

  const handleApprove = async (talentId: string) => {
    const { error } = await supabase
      .from("talent_profiles")
      .update({ is_approved: true })
      .eq("id", talentId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Approved", description: "Talent profile is now live on the marketplace." });
    fetchTalents();
  };

  const handleReject = async (talentId: string) => {
    const { error } = await supabase
      .from("talent_profiles")
      .update({ is_approved: false })
      .eq("id", talentId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Rejected", description: "Talent profile has been unapproved." });
    fetchTalents();
  };

  const filtered = talents.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.headline.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "pending") return matchesSearch && !t.is_approved;
    if (activeTab === "approved") return matchesSearch && t.is_approved;
    return matchesSearch;
  });

  const pendingCount = talents.filter((t) => !t.is_approved).length;
  const approvedCount = talents.filter((t) => t.is_approved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Talent Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve talent profiles for the marketplace
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Users className="w-4 h-4" />
              All ({talents.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search talents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Talent</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((talent) => (
                    <TableRow key={talent.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={talent.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {talent.full_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{talent.full_name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{talent.headline}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {talent.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {talent.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{talent.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {talent.hourly_rate ? `$${talent.hourly_rate}/hr` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={talent.availability === "available" ? "default" : "secondary"}
                          className="gap-1"
                        >
                          {talent.availability === "available" ? "Available" : "Busy"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {talent.is_approved ? (
                          <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!talent.is_approved ? (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(talent.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(talent.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Unapprove
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No talent profiles found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTalents;
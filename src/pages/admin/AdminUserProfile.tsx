import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Shield, Loader2, Users, GraduationCap, Rocket, Zap,
  BookOpen, Target, Trophy, Briefcase, Mail, Calendar, Globe,
} from "lucide-react";
import { format } from "date-fns";

type AppRole = "admin" | "moderator" | "user";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  provider: string | null;
  headline: string | null;
  created_at: string;
  role: AppRole;
}

const AdminUserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(false);

  // Activity data
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [bootcampParts, setBootcampParts] = useState<any[]>([]);
  const [learnfiParts, setLearnfiParts] = useState<any[]>([]);
  const [tutorApps, setTutorApps] = useState<any[]>([]);
  const [internshipProfiles, setInternshipProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    const fetchAll = async () => {
      const [profileRes, roleRes, scholRes, bootRes, learnRes, tutorRes, internRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("scholarship_applications").select("id, full_name, email, status, total_xp, current_streak, program_id, created_at").eq("user_id", userId),
        supabase.from("bootcamp_participants").select("bootcamp_id, total_xp, tasks_completed, status, joined_at").eq("user_id", userId),
        supabase.from("learnfi_participants").select("program_id, total_xp, missions_completed, status, joined_at").eq("user_id", userId),
        supabase.from("tutor_applications").select("id, full_name, email, expertise, status, created_at").eq("user_id", userId),
        supabase.from("internship_profiles").select("id, full_name, primary_skill_category, is_approved, created_at").eq("user_id", userId),
      ]);

      if (profileRes.data) {
        const roles = (roleRes.data || []) as any[];
        let role: AppRole = "user";
        if (roles.some(r => r.role === "admin")) role = "admin";
        else if (roles.some(r => r.role === "moderator")) role = "moderator";
        setProfile({ ...profileRes.data, role } as UserProfile);
      }

      setScholarships(scholRes.data || []);
      setBootcampParts(bootRes.data || []);
      setLearnfiParts(learnRes.data || []);
      setTutorApps(tutorRes.data || []);
      setInternshipProfiles(internRes.data || []);
      setIsLoading(false);
    };
    fetchAll();
  }, [userId]);

  const updateRole = async (newRole: AppRole) => {
    if (!userId || !isAdmin) return;
    setUpdatingRole(true);
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: `Role updated to ${newRole}` });
      setProfile(p => p ? { ...p, role: newRole } : p);
    }
    setUpdatingRole(false);
  };

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!profile) return <div className="p-6"><Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button><p className="mt-4 text-muted-foreground">User not found</p></div>;

  const statusBadge = (s: string) => {
    const v: Record<string, "default" | "secondary" | "destructive" | "outline"> = { approved: "default", pending: "secondary", rejected: "destructive", active: "default" };
    return <Badge variant={v[s] || "outline"}>{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-lg">{profile.full_name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{profile.full_name || "No name"}</h1>
              {profile.headline && <p className="text-muted-foreground">{profile.headline}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {profile.email}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {format(new Date(profile.created_at), "PPP")}</span>
                {profile.provider && <Badge variant="outline" className="capitalize">{profile.provider}</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={profile.role === "admin" ? "default" : profile.role === "moderator" ? "secondary" : "outline"} className="capitalize">
                <Shield className="w-3 h-3 mr-1" /> {profile.role}
              </Badge>
              {isAdmin && profile.user_id !== currentUser?.id && (
                <Select value={profile.role} onValueChange={(v) => updateRole(v as AppRole)} disabled={updatingRole}>
                  <SelectTrigger className="w-32">{updatingRole ? <Loader2 className="w-4 h-4 animate-spin" /> : <SelectValue />}</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Tabs */}
      <Tabs defaultValue="scholarships">
        <TabsList className="flex-wrap">
          <TabsTrigger value="scholarships" className="gap-1"><GraduationCap className="w-3 h-3" /> Scholarships ({scholarships.length})</TabsTrigger>
          <TabsTrigger value="bootcamps" className="gap-1"><Rocket className="w-3 h-3" /> Bootcamps ({bootcampParts.length})</TabsTrigger>
          <TabsTrigger value="learnfi" className="gap-1"><Zap className="w-3 h-3" /> LearnFi ({learnfiParts.length})</TabsTrigger>
          <TabsTrigger value="tutors" className="gap-1"><BookOpen className="w-3 h-3" /> Tutors ({tutorApps.length})</TabsTrigger>
          <TabsTrigger value="internships" className="gap-1"><Briefcase className="w-3 h-3" /> Internships ({internshipProfiles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="scholarships">
          {scholarships.length === 0 ? <p className="text-muted-foreground py-4 text-center">No scholarship applications</p> : (
            <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>XP</TableHead><TableHead>Streak</TableHead><TableHead>Applied</TableHead></TableRow></TableHeader>
              <TableBody>{scholarships.map((s: any) => (
                <TableRow key={s.id}><TableCell className="font-medium">{s.full_name}</TableCell><TableCell>{statusBadge(s.status)}</TableCell>
                  <TableCell><Trophy className="inline w-3 h-3 mr-1" />{s.total_xp}</TableCell><TableCell>{s.current_streak}🔥</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(s.created_at), "PP")}</TableCell></TableRow>
              ))}</TableBody></Table>
          )}
        </TabsContent>

        <TabsContent value="bootcamps">
          {bootcampParts.length === 0 ? <p className="text-muted-foreground py-4 text-center">Not in any bootcamps</p> : (
            <Table><TableHeader><TableRow><TableHead>Bootcamp</TableHead><TableHead>XP</TableHead><TableHead>Tasks</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
              <TableBody>{bootcampParts.map((b: any) => (
                <TableRow key={b.bootcamp_id}><TableCell className="font-medium">{b.bootcamp_id.slice(0, 8)}...</TableCell>
                  <TableCell>{b.total_xp}</TableCell><TableCell>{b.tasks_completed}</TableCell><TableCell>{statusBadge(b.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(b.joined_at), "PP")}</TableCell></TableRow>
              ))}</TableBody></Table>
          )}
        </TabsContent>

        <TabsContent value="learnfi">
          {learnfiParts.length === 0 ? <p className="text-muted-foreground py-4 text-center">No LearnFi participation</p> : (
            <Table><TableHeader><TableRow><TableHead>Program</TableHead><TableHead>XP</TableHead><TableHead>Missions</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
              <TableBody>{learnfiParts.map((l: any) => (
                <TableRow key={l.program_id}><TableCell className="font-medium">{l.program_id.slice(0, 8)}...</TableCell>
                  <TableCell>{l.total_xp}</TableCell><TableCell>{l.missions_completed}</TableCell><TableCell>{statusBadge(l.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(l.joined_at), "PP")}</TableCell></TableRow>
              ))}</TableBody></Table>
          )}
        </TabsContent>

        <TabsContent value="tutors">
          {tutorApps.length === 0 ? <p className="text-muted-foreground py-4 text-center">No tutor applications</p> : (
            <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Expertise</TableHead><TableHead>Status</TableHead><TableHead>Applied</TableHead></TableRow></TableHeader>
              <TableBody>{tutorApps.map((t: any) => (
                <TableRow key={t.id}><TableCell className="font-medium">{t.full_name}</TableCell><TableCell>{t.expertise}</TableCell>
                  <TableCell>{statusBadge(t.status)}</TableCell><TableCell className="text-muted-foreground text-sm">{format(new Date(t.created_at), "PP")}</TableCell></TableRow>
              ))}</TableBody></Table>
          )}
        </TabsContent>

        <TabsContent value="internships">
          {internshipProfiles.length === 0 ? <p className="text-muted-foreground py-4 text-center">No internship profiles</p> : (
            <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Skill</TableHead><TableHead>Approved</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
              <TableBody>{internshipProfiles.map((i: any) => (
                <TableRow key={i.id}><TableCell className="font-medium">{i.full_name}</TableCell><TableCell>{i.primary_skill_category}</TableCell>
                  <TableCell>{i.is_approved ? <Badge>Approved</Badge> : <Badge variant="secondary">Pending</Badge>}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(i.created_at), "PP")}</TableCell></TableRow>
              ))}</TableBody></Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserProfile;

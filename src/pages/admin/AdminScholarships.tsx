import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Plus, Loader2, Eye, CheckCircle, XCircle, Clock, Users } from "lucide-react";

interface ScholarshipProgram {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  max_applications: number | null;
  application_deadline: string | null;
  telegram_link: string | null;
  created_at: string;
}

interface ScholarshipApplication {
  id: string;
  user_id: string;
  program_id: string;
  status: string;
  full_name: string;
  email: string;
  telegram_username: string;
  twitter_handle: string;
  country: string;
  age_range: string;
  main_goal: string;
  hours_per_week: string;
  preferred_track: string;
  why_scholarship: string;
  created_at: string;
}

const AdminScholarships = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([]);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    telegram_link: "",
    max_applications: "",
    application_deadline: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    
    const { data: progs } = await supabase
      .from("scholarship_programs")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: apps } = await supabase
      .from("scholarship_applications")
      .select("*")
      .order("created_at", { ascending: false });

    setPrograms(progs || []);
    setApplications(apps || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProgram = async () => {
    if (!newProgram.title) {
      toast({
        title: "Error",
        description: "Please enter a program title",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    const { error } = await supabase.from("scholarship_programs").insert({
      title: newProgram.title,
      description: newProgram.description || null,
      telegram_link: newProgram.telegram_link || null,
      max_applications: newProgram.max_applications ? parseInt(newProgram.max_applications) : null,
      application_deadline: newProgram.application_deadline || null,
      is_active: false,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Program created",
        description: "The scholarship program has been created.",
      });
      setNewProgram({
        title: "",
        description: "",
        telegram_link: "",
        max_applications: "",
        application_deadline: "",
      });
      fetchData();
    }

    setIsCreating(false);
  };

  const toggleProgramActive = async (programId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("scholarship_programs")
      .update({ is_active: !currentStatus })
      .eq("id", programId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchData();
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: "pending" | "approved" | "rejected" | "waitlist") => {
    const { error } = await supabase
      .from("scholarship_applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Application status changed to ${newStatus}`,
      });
      setSelectedApplication(null);
      fetchData();
    }
  };

  const filteredApplications = statusFilter === "all"
    ? applications
    : applications.filter((a) => a.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500">Rejected</Badge>;
      case "waitlist":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Waitlist</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-500">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            Scholarship Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage programs and review applications
          </p>
        </div>
      </div>

      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="applications" className="gap-2">
            <Users className="w-4 h-4" />
            Applications ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="programs" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Programs ({programs.length})
          </TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waitlist">Waitlist</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Showing {filteredApplications.length} applications
            </span>
          </div>

          <div className="space-y-3">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">
                          {app.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{app.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.email} • {app.preferred_track}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.status)}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Application Review</DialogTitle>
                            <DialogDescription>
                              Review and update application status
                            </DialogDescription>
                          </DialogHeader>
                          {selectedApplication && (
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label className="text-muted-foreground">Full Name</Label>
                                  <p className="font-medium">{selectedApplication.full_name}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Email</Label>
                                  <p className="font-medium">{selectedApplication.email}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Telegram</Label>
                                  <p className="font-medium">{selectedApplication.telegram_username}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Twitter</Label>
                                  <p className="font-medium">{selectedApplication.twitter_handle}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Country</Label>
                                  <p className="font-medium">{selectedApplication.country}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Age Range</Label>
                                  <p className="font-medium">{selectedApplication.age_range}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Track</Label>
                                  <p className="font-medium">{selectedApplication.preferred_track}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Hours/Week</Label>
                                  <p className="font-medium">{selectedApplication.hours_per_week}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Main Goal</Label>
                                <p className="font-medium">{selectedApplication.main_goal}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Why they want this scholarship</Label>
                                <p className="text-sm bg-secondary p-3 rounded-lg">
                                  {selectedApplication.why_scholarship}
                                </p>
                              </div>
                              <div className="flex gap-2 pt-4 border-t">
                                <Button
                                  size="sm"
                                  onClick={() => updateApplicationStatus(selectedApplication.id, "approved")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateApplicationStatus(selectedApplication.id, "waitlist")}
                                >
                                  <Clock className="w-4 h-4 mr-1" />
                                  Waitlist
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateApplicationStatus(selectedApplication.id, "rejected")}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredApplications.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No applications found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          {/* Create New Program */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Program
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Program Title *</Label>
                  <Input
                    value={newProgram.title}
                    onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                    placeholder="e.g., Web3 Scholarship Q1 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram Link</Label>
                  <Input
                    value={newProgram.telegram_link}
                    onChange={(e) => setNewProgram({ ...newProgram, telegram_link: e.target.value })}
                    placeholder="https://t.me/..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  placeholder="Program description..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Applications</Label>
                  <Input
                    type="number"
                    value={newProgram.max_applications}
                    onChange={(e) => setNewProgram({ ...newProgram, max_applications: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Application Deadline</Label>
                  <Input
                    type="datetime-local"
                    value={newProgram.application_deadline}
                    onChange={(e) => setNewProgram({ ...newProgram, application_deadline: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateProgram} disabled={isCreating}>
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Program
              </Button>
            </CardContent>
          </Card>

          {/* Existing Programs */}
          <div className="space-y-3">
            {programs.map((program) => {
              const programApps = applications.filter((a) => a.program_id === program.id);
              return (
                <Card key={program.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{program.title}</h3>
                          <Badge variant={program.is_active ? "default" : "secondary"}>
                            {program.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {programApps.length} applications • Created {new Date(program.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${program.id}`} className="text-sm">Active</Label>
                          <Switch
                            id={`active-${program.id}`}
                            checked={program.is_active}
                            onCheckedChange={() => toggleProgramActive(program.id, program.is_active)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminScholarships;

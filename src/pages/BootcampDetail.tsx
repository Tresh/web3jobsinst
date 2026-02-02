import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBootcamp } from "@/hooks/useBootcamps";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  Trophy,
  CheckCircle,
  Zap,
  Play,
} from "lucide-react";
import BootcampOverview from "@/components/bootcamp/BootcampOverview";
import BootcampTasks from "@/components/bootcamp/BootcampTasks";
import BootcampCommunityAdvanced from "@/components/bootcamp/BootcampCommunityAdvanced";
import BootcampLeaderboard from "@/components/bootcamp/BootcampLeaderboard";
import BootcampParticipants from "@/components/bootcamp/BootcampParticipants";

const BootcampDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    bootcamp,
    participation,
    tasks,
    submissions,
    leaderboard,
    participants,
    loading,
    error,
    submitTask,
    refetch,
  } = useBootcamp(id);
  const [activeTab, setActiveTab] = useState("overview");

  const handleApply = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/bootcamps/${id}/apply`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavbar />
        <main className="pt-20 px-4">
          <div className="max-w-7xl mx-auto py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-12 bg-muted rounded w-2/3" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !bootcamp) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavbar />
        <main className="pt-20 px-4">
          <div className="max-w-7xl mx-auto py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Bootcamp Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The bootcamp you're looking for doesn't exist."}</p>
            <Link to="/bootcamps">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bootcamps
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isParticipant = !!participation;
  const isCompleted = bootcamp.status === "completed";
  const canJoin = !isParticipant && bootcamp.registration_open && 
    bootcamp.current_participants < bootcamp.max_participants && !isCompleted;

  // Calculate days remaining
  const getDaysInfo = () => {
    if (!bootcamp.start_date) return null;
    const startDate = new Date(bootcamp.start_date);
    const endDate = bootcamp.end_date ? new Date(bootcamp.end_date) : 
      new Date(startDate.getTime() + bootcamp.duration_days * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now < startDate) {
      const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { type: "starting", days: daysUntilStart };
    } else if (now < endDate) {
      const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const daysRemaining = bootcamp.duration_days - daysPassed;
      return { type: "ongoing", daysPassed, daysRemaining, total: bootcamp.duration_days };
    } else {
      return { type: "ended" };
    }
  };

  const daysInfo = getDaysInfo();

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />
      
      <main className="pt-20">
        {/* Header */}
        <section className="py-8 px-4 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            <Link to="/bootcamps" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bootcamps
            </Link>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Side - Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {bootcamp.bootcamp_type === "free" ? (
                    <Badge variant="outline" className="border-green-500 text-green-500">Free</Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500 text-amber-500">Paid</Badge>
                  )}
                  {isCompleted ? (
                    <Badge variant="secondary">Completed</Badge>
                  ) : bootcamp.status === "active" ? (
                    <Badge className="bg-green-500/10 text-green-500">Ongoing</Badge>
                  ) : (
                    <Badge className="bg-primary/10 text-primary">Registration Open</Badge>
                  )}
                  {isParticipant && (
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Joined
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold">{bootcamp.title}</h1>
                <p className="text-muted-foreground">
                  Hosted by <span className="text-foreground font-medium">{bootcamp.host_name}</span>
                </p>

                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{bootcamp.duration_days} Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{bootcamp.current_participants} / {bootcamp.max_participants} Participants</span>
                  </div>
                  {bootcamp.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Started {new Date(bootcamp.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {!isParticipant && canJoin && (
                  <div className="pt-4">
                    <Button size="lg" onClick={handleApply}>
                      Apply to Join
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Side - Stats Card */}
              {isParticipant && (
                <Card className="lg:w-80 shrink-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <span className="font-medium">XP Earned</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">{participation.total_xp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">Tasks Completed</span>
                      </div>
                      <span className="text-2xl font-bold">{participation.tasks_completed}</span>
                    </div>
                    {daysInfo && daysInfo.type === "ongoing" && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Play className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Day</span>
                        </div>
                        <span className="text-2xl font-bold">{daysInfo.daysPassed} / {daysInfo.total}</span>
                      </div>
                    )}
                    {leaderboard.length > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-500" />
                          <span className="font-medium">Your Rank</span>
                        </div>
                        <span className="text-2xl font-bold">
                          #{leaderboard.find((l) => l.user_id === user?.id)?.rank || "-"}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Content Tabs */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {isParticipant && (
                  <>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="community">Community</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    <TabsTrigger value="participants">Participants</TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="overview">
                <BootcampOverview 
                  bootcamp={bootcamp} 
                  isParticipant={isParticipant}
                  onJoin={handleApply}
                  canJoin={canJoin}
                />
              </TabsContent>

              {isParticipant && (
                <>
                  <TabsContent value="tasks">
                    <BootcampTasks 
                      tasks={tasks} 
                      submissions={submissions}
                      bootcamp={bootcamp}
                      onSubmit={submitTask}
                      refetch={refetch}
                    />
                  </TabsContent>

                  <TabsContent value="community">
                    <BootcampCommunityAdvanced 
                      bootcampId={bootcamp.id}
                      isCompleted={isCompleted}
                    />
                  </TabsContent>

                  <TabsContent value="leaderboard">
                    <BootcampLeaderboard 
                      leaderboard={leaderboard}
                      currentUserId={user?.id}
                    />
                  </TabsContent>

                  <TabsContent value="participants">
                    <BootcampParticipants 
                      participants={participants}
                      currentUserId={user?.id}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BootcampDetail;

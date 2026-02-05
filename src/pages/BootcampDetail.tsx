import { useParams, useNavigate, Link } from "react-router-dom";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBootcamp } from "@/hooks/useBootcamps";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Users,
  Clock,
} from "lucide-react";
import BootcampOverview from "@/components/bootcamp/BootcampOverview";
import { BootcampSchoolLayout } from "@/components/bootcamp/school";

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
  const isOpen = bootcamp.status === "approved" || bootcamp.status === "active";
  const canJoin = !isParticipant && bootcamp.registration_open && 
    bootcamp.current_participants < bootcamp.max_participants && isOpen;

  // If user is a participant, show the School layout
  if (isParticipant) {
    return (
      <BootcampSchoolLayout
        bootcamp={bootcamp}
        participation={participation}
        tasks={tasks}
        submissions={submissions}
        leaderboard={leaderboard}
        participants={participants}
        onSubmitTask={submitTask}
        refetch={refetch}
      />
    );
  }

  // Non-participant view (public bootcamp page)
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

                {canJoin && (
                  <div className="pt-4">
                    <Button size="lg" onClick={handleApply}>
                      Apply to Join
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content - Overview Only for Non-Participants */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <BootcampOverview 
              bootcamp={bootcamp} 
              isParticipant={false}
              onJoin={handleApply}
              canJoin={canJoin}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BootcampDetail;

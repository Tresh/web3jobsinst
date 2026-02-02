import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBootcamps } from "@/hooks/useBootcamps";
import { Rocket, Clock, Users, ArrowRight, Calendar, Plus, Loader2 } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

const DashboardBootcamps = () => {
  const { joinedBootcamps, hostedBootcamps, loading } = useMyBootcamps();

  const getBootcampProgress = (bootcamp: typeof joinedBootcamps[0]) => {
    if (!bootcamp.start_date) return { currentDay: 0, totalDays: bootcamp.duration_days };
    
    const startDate = parseISO(bootcamp.start_date);
    const today = new Date();
    const daysPassed = differenceInDays(today, startDate) + 1;
    const currentDay = Math.min(Math.max(daysPassed, 1), bootcamp.duration_days);
    
    return { currentDay, totalDays: bootcamp.duration_days };
  };

  const getStatusBadge = (bootcamp: typeof joinedBootcamps[0]) => {
    if (bootcamp.status === "completed") {
      return <Badge variant="secondary">Completed</Badge>;
    }
    if (bootcamp.status === "active") {
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Ongoing</Badge>;
    }
    if (bootcamp.status === "approved") {
      return <Badge className="bg-accent text-accent-foreground hover:bg-accent/80">Starting Soon</Badge>;
    }
    if (bootcamp.status === "pending_approval") {
      return <Badge variant="outline">Pending Approval</Badge>;
    }
    return <Badge variant="outline">{bootcamp.status}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const allBootcamps = [...joinedBootcamps, ...hostedBootcamps.filter(
    (h) => !joinedBootcamps.some((j) => j.id === h.id)
  )];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Rocket className="w-7 h-7 text-primary" />
            My Bootcamps
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your joined and hosted bootcamps
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/bootcamps">
              Browse Bootcamps
            </Link>
          </Button>
          <Button asChild>
            <Link to="/bootcamps/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Bootcamp
            </Link>
          </Button>
        </div>
      </div>

      {/* Joined Bootcamps Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Joined Bootcamps</h2>
        
        {joinedBootcamps.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Rocket className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">No bootcamps joined yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join a bootcamp to start learning with a community
              </p>
              <Button asChild>
                <Link to="/bootcamps">
                  Explore Bootcamps
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {joinedBootcamps.map((bootcamp) => {
              const { currentDay, totalDays } = getBootcampProgress(bootcamp);
              const progress = (currentDay / totalDays) * 100;

              return (
                <Card key={bootcamp.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{bootcamp.title}</CardTitle>
                      {getStatusBadge(bootcamp)}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Hosted by {bootcamp.host_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Duration
                        </span>
                        <span className="font-medium">{totalDays} Days</span>
                      </div>
                      
                      {bootcamp.status === "active" && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Current Day
                            </span>
                            <span className="font-medium text-primary">
                              Day {currentDay} of {totalDays}
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </>
                      )}

                      {bootcamp.start_date && bootcamp.status === "approved" && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Starts</span>
                          <span className="font-medium">
                            {format(parseISO(bootcamp.start_date), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button asChild className="w-full">
                      <Link to={`/bootcamps/${bootcamp.id}`}>
                        {bootcamp.status === "completed" ? "View Bootcamp" : "Enter Bootcamp"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Hosted Bootcamps Section */}
      {hostedBootcamps.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Bootcamps You Host</h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hostedBootcamps.map((bootcamp) => (
              <Card key={bootcamp.id} className="hover:shadow-md transition-shadow border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{bootcamp.title}</CardTitle>
                    {getStatusBadge(bootcamp)}
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {bootcamp.current_participants} / {bootcamp.max_participants} Participants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{bootcamp.duration_days} Days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <Badge variant="outline">
                        {bootcamp.bootcamp_type === "free" ? "Free" : `$${bootcamp.price_amount}`}
                      </Badge>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/bootcamps/${bootcamp.id}`}>
                      Manage Bootcamp
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBootcamps;

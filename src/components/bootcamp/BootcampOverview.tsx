import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Calendar, Target, BookOpen } from "lucide-react";
import type { Bootcamp } from "@/types/bootcamp";

interface BootcampOverviewProps {
  bootcamp: Bootcamp;
  isParticipant: boolean;
  onJoin: () => void;
  canJoin: boolean;
}

const BootcampOverview = ({ bootcamp, isParticipant, onJoin, canJoin }: BootcampOverviewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>About This Bootcamp</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {bootcamp.description || "No description provided."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              What You'll Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <span className="text-muted-foreground">Complete daily tasks designed by industry experts</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <span className="text-muted-foreground">Earn XP and climb the leaderboard</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <span className="text-muted-foreground">Connect with a community of like-minded learners</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <span className="text-muted-foreground">Build practical skills through hands-on challenges</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Daily Tasks</h4>
              <p className="text-sm text-muted-foreground">
                Each day, new tasks will be unlocked for you to complete. Tasks expire after 24 hours, 
                so make sure to stay on top of your progress!
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">XP & Leaderboard</h4>
              <p className="text-sm text-muted-foreground">
                Complete tasks to earn XP. The more tasks you complete, the higher you'll climb 
                on the leaderboard. Top performers will be recognized!
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Community</h4>
              <p className="text-sm text-muted-foreground">
                Connect with fellow participants, share your progress, and support each other 
                in the private community chat.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bootcamp Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Duration</span>
              </div>
              <span className="font-medium">{bootcamp.duration_days} Days</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Participants</span>
              </div>
              <span className="font-medium">{bootcamp.current_participants} / {bootcamp.max_participants}</span>
            </div>
            {bootcamp.start_date && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Start Date</span>
                </div>
                <span className="font-medium">
                  {new Date(bootcamp.start_date).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Type</span>
              {bootcamp.bootcamp_type === "free" ? (
                <Badge variant="outline" className="border-green-500 text-green-500">Free</Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500 text-amber-500">
                  ${bootcamp.price_amount}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {!isParticipant && canJoin && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-2">Ready to Start?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join this bootcamp and start your journey today!
              </p>
              <Button onClick={onJoin} className="w-full" size="lg">
                Join Bootcamp
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Host</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {bootcamp.host_name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium">{bootcamp.host_name}</p>
                <p className="text-sm text-muted-foreground">Bootcamp Host</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BootcampOverview;

import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Twitter, 
  Users, 
  MessageSquare, 
  Heart,
  Repeat,
  ExternalLink
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const communityHighlights = [
  {
    id: "1",
    type: "tweet",
    author: "@web3_learner",
    content: "Just completed my 15th task on @Web3JobsInst! 🚀 Building in public has never felt more rewarding. Day 15 of 30! #Web3 #BuildInPublic",
    likes: 47,
    retweets: 12,
  },
  {
    id: "2",
    type: "tweet",
    author: "@crypto_sarah",
    content: "The scholarship program at Web3 Jobs Institute is different. Real tasks, real XP, real proof of work. Not just theory. 💪",
    likes: 89,
    retweets: 23,
  },
  {
    id: "3",
    type: "tweet",
    author: "@defi_marcus",
    content: "Ranked #5 on the leaderboard this week! 🏆 The gamification makes learning addictive. See you at the top! #Web3Jobs",
    likes: 156,
    retweets: 34,
  },
];

const BuildInPublicSection = () => {
  const navigate = useNavigate();
  const { data: stats } = usePlatformStats();

  const communityStats = [
    { label: "Community Members", value: `${((stats?.totalSignups || 2109) / 1000).toFixed(1)}K+` },
    { label: "Active Scholars", value: `${(stats?.activeScholars || 1193).toLocaleString()}+` },
    { label: "Countries Represented", value: `${stats?.countries || 37}+` },
  ];

  return (
    <section className="bg-foreground py-16 md:py-24">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <Badge variant="secondary" className="mb-4 bg-background/10 text-background border-0">
              Build In Public
            </Badge>
            
            <h2 className="text-2xl md:text-3xl font-bold text-background mb-4">
              Learn Publicly.{" "}
              <span className="text-primary">Grow Together.</span>
            </h2>
            
            <p className="text-background/60 mb-6">
              Our community believes in learning out loud. Share your progress, 
              celebrate wins, and connect with builders from around the world.
            </p>

            {/* Community Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {communityStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-background">
                    {stat.value}
                  </div>
                  <div className="text-xs text-background/60">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm text-background">Share progress on Twitter/X</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-sm text-background">Join our Telegram community</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm text-background">Engage in bootcamp discussions</span>
              </div>
            </div>

            <Button variant="outline" onClick={() => window.open("https://twitter.com/Web3JobsInst", "_blank")} className="border-background/20 text-background hover:bg-background/10">
              Follow on Twitter
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Right - Social Proof */}
          <div className="space-y-4">
            {communityHighlights.map((tweet) => (
              <Card key={tweet.id} className="bg-background/5 border-background/10 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Twitter className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-background mb-1">
                        {tweet.author}
                      </div>
                      <p className="text-sm text-background/70 mb-3">
                        {tweet.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-background/50">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          {tweet.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat className="w-3.5 h-3.5" />
                          {tweet.retweets}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuildInPublicSection;

import { Users, Target, Trophy, MessageCircle } from "lucide-react";

const CommunitySection = () => {
  return (
    <section id="community" className="section-container section-padding">
      <div className="text-center mb-12">
        <span className="badge-minimal mb-6 inline-block">Community</span>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-balance">
          Learn With a Web3 Community
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join a private community of builders, creators, and learners all working 
          toward the same goal: thriving in Web3.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-minimal card-minimal-accent p-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-foreground mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Private Community</h3>
          <p className="text-sm text-muted-foreground">
            Exclusive access to like-minded builders
          </p>
        </div>

        <div className="card-minimal card-minimal-accent p-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-foreground mb-4">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Weekly Challenges</h3>
          <p className="text-sm text-muted-foreground">
            Practical tasks to sharpen your skills
          </p>
        </div>

        <div className="card-minimal card-minimal-accent p-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-foreground mb-4">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Progress Tracking</h3>
          <p className="text-sm text-muted-foreground">
            See your growth and achievements
          </p>
        </div>

        <div className="card-minimal card-minimal-accent p-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-foreground mb-4">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Networking</h3>
          <p className="text-sm text-muted-foreground">
            Connect with founders and creators
          </p>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;

import { Users, Target, Trophy, MessageCircle } from "lucide-react";

const CommunitySection = () => {
  return (
    <section id="community" className="section-container section-padding">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 text-sm font-medium text-primary bg-orange-100 rounded-full mb-6">
          Community
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
          Learn With a Web3 Community
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join a private community of builders, creators, and learners all working 
          toward the same goal: thriving in Web3.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-elevated p-6 text-center group">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Private Community</h3>
          <p className="text-sm text-muted-foreground">
            Exclusive access to like-minded builders
          </p>
        </div>

        <div className="card-elevated p-6 text-center group">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Weekly Challenges</h3>
          <p className="text-sm text-muted-foreground">
            Practical tasks to sharpen your skills
          </p>
        </div>

        <div className="card-elevated p-6 text-center group">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Progress Tracking</h3>
          <p className="text-sm text-muted-foreground">
            See your growth and achievements
          </p>
        </div>

        <div className="card-elevated p-6 text-center group">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
            <MessageCircle className="w-6 h-6" />
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

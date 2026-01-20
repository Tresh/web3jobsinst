import { Award, Briefcase, Users, Rocket } from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "Proof of Work > Certificates",
    description:
      "Build real projects that showcase your skills, not just credentials.",
  },
  {
    icon: Briefcase,
    title: "Real Projects",
    description:
      "Work on actual Web3 projects that add to your portfolio.",
  },
  {
    icon: Users,
    title: "Community Feedback",
    description:
      "Get feedback from peers and mentors in the Web3 industry.",
  },
  {
    icon: Award,
    title: "Job & Collab Access",
    description:
      "Connect directly with opportunities through our network.",
  },
];

const WhyDifferentSection = () => {
  return (
    <section className="section-container section-padding">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Why These Courses Are Different
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We don't just teach theory. We help you build proof of work and connect you to real opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-background border border-secondary rounded-xl p-6 text-center hover:border-primary/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyDifferentSection;

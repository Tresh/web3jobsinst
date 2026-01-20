import { BookOpen, Briefcase, Award, Users } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Web3-Focused Education",
    description: "Practical curriculum designed for the decentralized economy",
  },
  {
    icon: Briefcase,
    title: "Real-World Skills",
    description: "Learn by doing with hands-on projects and live challenges",
  },
  {
    icon: Award,
    title: "Job & Collaboration Access",
    description: "Connect directly with Web3 projects and opportunities",
  },
  {
    icon: Users,
    title: "Certificates & Proof of Skill",
    description: "Earn verifiable credentials that matter in Web3",
  },
];

const ValueStrip = () => {
  return (
    <section className="section-container py-16 md:py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="card-elevated p-6 text-center group"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValueStrip;

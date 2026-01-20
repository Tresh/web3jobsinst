import { Megaphone, Share2, Code2, Bot, TrendingUp, Video, Award } from "lucide-react";

const courses = [
  {
    icon: Megaphone,
    title: "Meme Coin Marketing",
    description: "Master viral marketing strategies for token launches",
  },
  {
    icon: Share2,
    title: "Web3 Social Media Management",
    description: "Build and grow communities across crypto platforms",
  },
  {
    icon: Code2,
    title: "Web3 Full-Stack Development",
    description: "Build decentralized applications from scratch",
  },
  {
    icon: Bot,
    title: "Telegram Outreach Bot",
    description: "Automate 10,000+ DMs/month for growth",
  },
  {
    icon: TrendingUp,
    title: "Forex & Degen Trading",
    description: "Technical analysis and risk management",
  },
  {
    icon: Video,
    title: "Content Creation & Monetization",
    description: "Create and monetize Web3 content",
  },
];

const ProgramsSection = () => {
  return (
    <section id="programs" className="bg-gray-50 section-padding">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-primary bg-orange-100 rounded-full mb-6">
            Programs
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Courses & Programs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practical, industry-relevant courses designed to get you earning in Web3
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div
              key={index}
              className="card-elevated bg-card p-6 group relative overflow-hidden"
            >
              {/* Coming Soon Badge */}
              <div className="absolute top-4 right-4">
                <span className="badge-coming-soon">Coming Soon</span>
              </div>

              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                <course.icon className="w-6 h-6" />
              </div>

              <h3 className="font-semibold text-lg text-foreground mb-2 pr-24">
                {course.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-4">
                {course.description}
              </p>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Award className="w-3.5 h-3.5" />
                <span>Certificate Included</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;

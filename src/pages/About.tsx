import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Users, Zap, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const About = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleScholarshipClick = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/dashboard/scholarship" } } });
      return;
    }
    navigate("/dashboard/scholarship");
  };

  const values = [
    {
      icon: Target,
      title: "Practical Skills",
      description: "We focus on income-driven Web3 skills that translate directly into real opportunities, not just theory.",
    },
    {
      icon: Users,
      title: "Community First",
      description: "Our ecosystem combines structured learning with an active community and direct access to jobs and collaborations.",
    },
    {
      icon: Zap,
      title: "Real Outcomes",
      description: "Whether you're looking to land your first Web3 role or build your own digital business, we help make it happen.",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Work from anywhere in the world and get paid in crypto. No borders, no barriers.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="section-container py-12 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4 md:mb-6 inline-block">About Us</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-6 text-balance">
              About <span className="text-primary">Web3 Jobs Institute</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Web3 Jobs Institute is built for beginners, creators, builders, and freelancers who want to 
              thrive in the decentralized economy. We focus on practical, income-driven Web3 skills that 
              translate directly into real opportunities.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-card section-padding">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Our <span className="text-primary">Mission</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To democratize access to Web3 education and opportunities. We believe that anyone, 
                regardless of their background or location, should be able to build a successful 
                career in the decentralized economy. Our mission is to provide the skills, network, 
                and opportunities to make that vision a reality.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-container section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              What We Believe
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our core values guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="card-minimal p-6 hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary/10 border-t border-border section-padding">
          <div className="section-container text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Start Your Web3 Journey?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join our free scholarship program and get guided step by step through your Web3 career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleScholarshipClick}>
                Apply for Scholarship
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/courses">Explore Courses</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;

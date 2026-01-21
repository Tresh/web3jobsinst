import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Briefcase, Star, MapPin, Zap, Users, Shield, Clock } from "lucide-react";
import ScholarshipFormDialog from "@/components/ScholarshipFormDialog";
import TutorFormDialog from "@/components/TutorFormDialog";
import ComingSoonDialog from "@/components/ComingSoonDialog";

const talentCategories = [
  { name: "Developers", count: 120, icon: "💻" },
  { name: "Designers", count: 85, icon: "🎨" },
  { name: "Marketers", count: 95, icon: "📢" },
  { name: "Writers", count: 70, icon: "✍️" },
  { name: "Traders", count: 60, icon: "📈" },
  { name: "Community Managers", count: 45, icon: "👥" },
];

const featuredTalent = [
  {
    id: "1",
    name: "Alex Chen",
    role: "Smart Contract Developer",
    skills: ["Solidity", "Rust", "Auditing"],
    rating: 4.9,
    projects: 23,
    location: "Remote",
    available: true,
  },
  {
    id: "2",
    name: "Sarah Kim",
    role: "Web3 UI/UX Designer",
    skills: ["Figma", "NFT Art", "Branding"],
    rating: 4.8,
    projects: 31,
    location: "Remote",
    available: true,
  },
  {
    id: "3",
    name: "Marcus Johnson",
    role: "DeFi Marketing Lead",
    skills: ["Growth", "Twitter", "KOL Mgmt"],
    rating: 4.7,
    projects: 18,
    location: "Remote",
    available: false,
  },
  {
    id: "4",
    name: "Elena Rodriguez",
    role: "Technical Writer",
    skills: ["Documentation", "Whitepapers", "Blogs"],
    rating: 5.0,
    projects: 42,
    location: "Remote",
    available: true,
  },
];

const TalentMarket = () => {
  const [scholarshipOpen, setScholarshipOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState("");

  const handleComingSoon = (title: string) => {
    setComingSoonTitle(title);
    setComingSoonOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="section-container py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6 inline-block">
              Talent Marketplace
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Find <span className="text-primary">Web3 Talent</span> That Delivers
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Connect with verified freelancers, developers, designers, and marketers 
              ready to build and scale your Web3 projects.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for skills, roles, or projects..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-secondary bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onFocus={() => handleComingSoon("Search Feature")}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => handleComingSoon("Browse Talent")}>
                Browse Talent
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => handleComingSoon("Join as Talent")}>
                Join as Talent
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="section-container pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary/30 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Verified Talent</p>
            </div>
            <div className="bg-secondary/30 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-foreground">1,200+</p>
              <p className="text-sm text-muted-foreground">Projects Completed</p>
            </div>
            <div className="bg-secondary/30 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-foreground">98%</p>
              <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
            <div className="bg-secondary/30 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-foreground">50+</p>
              <p className="text-sm text-muted-foreground">Skills Categories</p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-secondary/30 section-padding">
          <div className="section-container">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Explore by <span className="text-primary">Category</span>
              </h2>
              <p className="text-muted-foreground">
                Find the right talent for your project
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {talentCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleComingSoon(category.name)}
                  className="card-minimal p-4 text-center hover:border-primary/30 transition-colors group"
                >
                  <span className="text-3xl mb-2 block">{category.icon}</span>
                  <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.count} available
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Talent */}
        <section className="section-container section-padding">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Featured <span className="text-primary">Talent</span>
            </h2>
            <p className="text-muted-foreground">
              Top-rated professionals ready to work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTalent.map((talent) => (
              <button
                key={talent.id}
                onClick={() => handleComingSoon(talent.name)}
                className="card-minimal p-5 text-left hover:border-primary/30 transition-colors group"
              >
                {/* Avatar placeholder */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-2xl">
                  {talent.name.charAt(0)}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {talent.name}
                  </h3>
                  {talent.available && (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3">{talent.role}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {talent.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-secondary text-xs text-muted-foreground rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    <span>{talent.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    <span>{talent.projects} projects</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => handleComingSoon("View All Talent")}>
              View All Talent
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Why Choose */}
        <section className="bg-secondary/30 section-padding">
          <div className="section-container">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Why Choose Our <span className="text-primary">Talent Market</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Verified Talent</h3>
                <p className="text-sm text-muted-foreground">
                  All talent goes through our verification process
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Web3 Native</h3>
                <p className="text-sm text-muted-foreground">
                  Specialists in blockchain, DeFi, and crypto
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Fast Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Find the right talent within 24-48 hours
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Escrow protection for all projects
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Become a Tutor CTA */}
        <section className="section-container section-padding">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-10 md:p-14">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Share Your Expertise
              </h2>
              <p className="text-muted-foreground mb-8">
                Become a tutor and earn royalties by teaching what you know. 
                Create courses, share knowledge, and build passive income.
              </p>
              <Button size="lg" onClick={() => setTutorOpen(true)}>
                Become a Tutor
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary/5 border-t border-primary/10 section-padding">
          <div className="section-container text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Whether you're looking to hire or get hired, join our community today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setScholarshipOpen(true)}>
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
      
      <ScholarshipFormDialog open={scholarshipOpen} onOpenChange={setScholarshipOpen} />
      <TutorFormDialog open={tutorOpen} onOpenChange={setTutorOpen} />
      <ComingSoonDialog
        open={comingSoonOpen}
        onOpenChange={setComingSoonOpen}
        title={comingSoonTitle}
        onScholarshipClick={() => setScholarshipOpen(true)}
      />
    </div>
  );
};

export default TalentMarket;

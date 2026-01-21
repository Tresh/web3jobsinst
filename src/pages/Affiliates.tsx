import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Users, Share2, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Affiliates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleScholarshipClick = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/dashboard/scholarship" } } });
      return;
    }
    navigate("/dashboard/scholarship");
  };

  const features = [
    {
      icon: Share2,
      title: "Promote Products",
      description: "Share courses and digital products with your unique affiliate link.",
    },
    {
      icon: DollarSign,
      title: "Earn Commissions",
      description: "Get a percentage of every sale made through your referral link.",
    },
    {
      icon: Users,
      title: "Build Your Network",
      description: "Grow your audience while helping others discover Web3 education.",
    },
    {
      icon: TrendingUp,
      title: "Track Performance",
      description: "Access real-time analytics on your referrals and earnings.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="section-container py-12 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4 md:mb-6 inline-block">
              Coming Soon
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-6 text-balance">
              <span className="text-primary">Affiliate</span> Program
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 md:mb-8">
              Refer and earn by promoting Web3 Jobs Institute courses and products. 
              Join our affiliate program and start earning commissions on every sale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" disabled className="opacity-70">
                Join Waitlist
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-secondary/30 section-padding">
          <div className="section-container">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                How It <span className="text-primary">Works</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Earn passive income by sharing products you believe in
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="card-minimal p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="section-container section-padding">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Why Join?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <h3 className="font-bold text-xl text-foreground mb-3">
                  💰 Competitive Commissions
                </h3>
                <p className="text-muted-foreground">
                  Earn up to 30% commission on every sale. The more you refer, the more you earn.
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <h3 className="font-bold text-xl text-foreground mb-3">
                  📊 Real-time Dashboard
                </h3>
                <p className="text-muted-foreground">
                  Track your referrals, conversions, and earnings with our intuitive affiliate dashboard.
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <h3 className="font-bold text-xl text-foreground mb-3">
                  🎁 Exclusive Resources
                </h3>
                <p className="text-muted-foreground">
                  Get access to marketing materials, banners, and content to help you promote effectively.
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <h3 className="font-bold text-xl text-foreground mb-3">
                  ⚡ Fast Payouts
                </h3>
                <p className="text-muted-foreground">
                  Get paid in crypto or fiat. Monthly payouts with no minimum threshold.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary/5 border-t border-primary/10 section-padding">
          <div className="section-container text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Get Notified When We Launch
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join our scholarship program to be the first to know when the affiliate program goes live.
            </p>
            <Button size="lg" onClick={handleScholarshipClick}>
              Apply for Scholarship
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Affiliates;

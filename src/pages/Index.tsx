import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BugReportButton from "@/components/BugReportButton";
import MarketplaceHero from "@/components/home/MarketplaceHero";
import CorePathways from "@/components/home/CorePathways";
import WhatsHappening from "@/components/home/WhatsHappening";
import MarketplacePreview from "@/components/home/MarketplacePreview";
import TalentHiringSection from "@/components/home/TalentHiringSection";
import LiveActivityFeed from "@/components/home/LiveActivityFeed";
import ScholarshipOnramp from "@/components/home/ScholarshipOnramp";
import BuildInPublicSection from "@/components/home/BuildInPublicSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Dynamic Hero with Live Stats */}
        <MarketplaceHero />
        
        {/* Live Activity Ticker */}
        <LiveActivityFeed />
        
        {/* 4 Core Entry Pathways */}
        <CorePathways />
        
        {/* What's Happening Now - Live Platform Activity */}
        <WhatsHappening />
        
        {/* Marketplace Preview - Courses, Products, Bootcamps */}
        <MarketplacePreview />
        
        {/* Talent & Hiring Section */}
        <TalentHiringSection />
        
        {/* Scholarship as Free On-ramp */}
        <ScholarshipOnramp />
        
        {/* Community & Build in Public */}
        <BuildInPublicSection />
        
        {/* Final CTA */}
        <CTASection />
      </main>
      <Footer />
      <BugReportButton />
    </div>
  );
};

export default Index;

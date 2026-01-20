import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ValueStrip from "@/components/ValueStrip";
import AboutSection from "@/components/AboutSection";
import ScholarshipSection from "@/components/ScholarshipSection";
import ProgramsSection from "@/components/ProgramsSection";
import JobsSection from "@/components/JobsSection";
import CollabSection from "@/components/CollabSection";
import CommunitySection from "@/components/CommunitySection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ValueStrip />
        <AboutSection />
        <ScholarshipSection />
        <ProgramsSection />
        <JobsSection />
        <CollabSection />
        <CommunitySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

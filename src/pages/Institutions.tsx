import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Building, 
  BookOpen, 
  Award, 
  Users, 
  Briefcase, 
  Target,
  Layout,
  GraduationCap,
  Trophy,
  Megaphone,
  Search
} from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import OpportunitiesStrip from "@/components/OpportunitiesStrip";
import InstitutionApplicationForm from "@/components/institutions/InstitutionApplicationForm";
import { categoryLabels } from "@/data/institutionsData";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const portalFeatures = [
  { icon: Layout, title: "Branded portal", description: "Your own customized learning hub" },
  { icon: Building, title: "Custom landing page", description: "Showcase your ecosystem's education" },
  { icon: BookOpen, title: "Course catalog", description: "Organize and publish official courses" },
  { icon: Target, title: "Learning tracks", description: "Create structured learning paths" },
  { icon: Award, title: "Certificates", description: "Issue official verifiable credentials" },
  { icon: Users, title: "Talent pipeline", description: "Build your developer workforce" },
  { icon: Megaphone, title: "Campaigns", description: "Run educational campaigns" },
  { icon: Trophy, title: "Bounties", description: "Incentivize learning with rewards" },
  { icon: Briefcase, title: "Hiring access", description: "Direct access to trained talent" },
];

const whatCanDo = [
  "Upload official courses",
  "Run bootcamps",
  "Host certifications",
  "Onboard talent",
  "Train developers",
  "Educate users",
  "Build workforce pipelines",
];

const Institutions = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch approved institutions from DB
  const { data: approvedInstitutions = [], isLoading: loadingInstitutions } = useQuery({
    queryKey: ["approved-institutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institution_applications")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        organization_name: string;
        ecosystem_category: string;
        official_email: string;
        logo_url: string | null;
        website: string;
        community_size: string;
        planned_courses: string;
      }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-muted-foreground mb-6">
            <Building className="w-4 h-4" />
            For Protocols, DAOs & Companies
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Launch Your Learning Portal on Web3 Jobs Institute
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create your own branded education hub, train your ecosystem, onboard talent, 
            and distribute official knowledge globally.
          </p>
          <Button size="lg" onClick={scrollToForm}>
            Apply as a Verified Institution
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* What Is a Verified Institution */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              What Is a Verified Institution?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              A Verified Institution is a protocol, DAO, company, or ecosystem that gets a dedicated 
              portal on Web3 Jobs Institute.
            </p>
          </div>
          <div className="bg-background border border-border rounded-xl p-6 md:p-8">
            <h3 className="font-semibold text-foreground mb-4">They can:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {whatCanDo.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Institution Portal Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Institution Portal Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run world-class education for your ecosystem
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portalFeatures.map((feature) => (
              <Card key={feature.title} className="border-border">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Institution Directory */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Verified Institutions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore learning portals from leading protocols and ecosystems
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {institutions.map((institution) => (
              <Link key={institution.id} to={`/institutions/${institution.slug}`}>
                <Card className="border-border bg-background hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={institution.logo}
                        alt={institution.name}
                        className="w-10 h-10 rounded-full object-cover bg-secondary"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{institution.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {categoryLabels[institution.category]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{institution.coursesCount} courses</span>
                      <span>{institution.learnersCount.toLocaleString()} learners</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-muted-foreground text-sm">
              Want to join these industry leaders?{" "}
              <button onClick={scrollToForm} className="text-primary hover:underline">
                Apply below
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section ref={formRef} className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Apply as a Verified Institution
            </h2>
            <p className="text-muted-foreground">
              Join leading protocols and ecosystems on Web3 Jobs Institute
            </p>
          </div>
          <InstitutionApplicationForm />
        </div>
      </section>

      <OpportunitiesStrip />
      <Footer />
    </div>
  );
};

export default Institutions;

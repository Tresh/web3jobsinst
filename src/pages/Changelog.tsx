import { useState } from "react";
import { Link } from "react-router-dom";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Wrench, Sparkles, Shield, Zap } from "lucide-react";

interface ChangelogEntry {
  date: string;
  version?: string;
  title: string;
  type: "feature" | "improvement" | "fix" | "security";
  items: string[];
}

const typeConfig = {
  feature: { label: "Feature", icon: Sparkles, className: "bg-primary/10 text-primary border-primary/20" },
  improvement: { label: "Improvement", icon: Wrench, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  fix: { label: "Fix", icon: Zap, className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  security: { label: "Security", icon: Shield, className: "bg-green-500/10 text-green-500 border-green-500/20" },
};

// This is the published changelog — update from CHANGELOG.txt when ready
const changelog: ChangelogEntry[] = [
  {
    date: "2026-02-24",
    title: "Email Broadcast & LearnFi Course Linking",
    type: "feature",
    items: [
      "Email broadcast now supports Individual and Bulk send modes with user search",
      "LearnFi program form: course linking now has autocomplete dropdown",
    ],
  },
  {
    date: "2026-02-24",
    title: "Admin & User Workflow Overhaul",
    type: "improvement",
    items: [
      "LearnFi edit request workflow — users request, admins approve, users edit",
      "Enhanced Admin Dashboard with real-time metrics and 'Needs Attention' bar",
      "Admin User Profile page with cross-platform activity history",
      "UserHoverCards for quick user context across admin",
    ],
  },
  {
    date: "2026-02-24",
    title: "Tutor Application System",
    type: "feature",
    items: [
      "Live 'Apply as Tutor' form replacing Coming Soon state",
      "Admin Tutors management with review/approve workflow",
    ],
  },
  {
    date: "2026-02-23",
    title: "Platform Foundation",
    type: "feature",
    items: [
      "Scholarship portal with daily check-ins, modules, referrals, XP system",
      "Bootcamp system with applications, tasks, community, voice rooms, leaderboard",
      "LearnFi Learn-to-Earn hub with token/paid/internship reward models",
      "Course infrastructure with Strapi CMS and Vimeo integration",
      "Admin broadcast email with Resend batch API and delivery tracking",
      "Bug reporting, role-based access control, and onboarding flow",
    ],
  },
];

const Changelog = () => {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />
      <main className="max-w-3xl mx-auto px-4 py-20 sm:py-28">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Changelog</h1>
          <p className="text-muted-foreground text-lg">
            What's new and improved on the platform.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border hidden sm:block" />

          <div className="space-y-8">
            {changelog.map((entry, i) => {
              const config = typeConfig[entry.type];
              const Icon = config.icon;
              return (
                <div key={i} className="relative flex gap-4 sm:gap-6">
                  {/* Timeline dot */}
                  <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-secondary border border-border items-center justify-center z-10">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Card className="flex-1">
                    <CardContent className="pt-5 pb-4 px-5">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className={config.className}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{entry.date}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{entry.title}</h3>
                      <ul className="space-y-1.5">
                        {entry.items.map((item, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-primary mt-1 shrink-0">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Changelog;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Wrench, Zap, Shield, Loader2 } from "lucide-react";

const typeConfig = {
  feature: { label: "Feature", icon: Sparkles, className: "bg-primary/10 text-primary border-primary/20" },
  improvement: { label: "Improvement", icon: Wrench, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  fix: { label: "Fix", icon: Zap, className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  security: { label: "Security", icon: Shield, className: "bg-green-500/10 text-green-500 border-green-500/20" },
};

const Changelog = () => {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["changelog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("changelog_entries")
        .select("*")
        .eq("is_published", true)
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />
      <main className="max-w-3xl mx-auto px-4 py-20 sm:py-28">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Changelog</h1>
          <p className="text-muted-foreground text-lg">What's new and improved on the platform.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No updates yet. Check back soon!</p>
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border hidden sm:block" />
            <div className="space-y-8">
              {entries.map((entry: any, i: number) => {
                const config = typeConfig[entry.type as keyof typeof typeConfig] || typeConfig.feature;
                const Icon = config.icon;
                const items: string[] = Array.isArray(entry.items) ? entry.items : [];
                return (
                  <div key={entry.id || i} className="relative flex gap-4 sm:gap-6">
                    <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-secondary border border-border items-center justify-center z-10">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Card className="flex-1">
                      <CardContent className="pt-5 pb-4 px-5">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="outline" className={config.className}>{config.label}</Badge>
                          <span className="text-xs text-muted-foreground">{entry.date}</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{entry.title}</h3>
                        <ul className="space-y-1.5">
                          {items.map((item, j) => (
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Changelog;

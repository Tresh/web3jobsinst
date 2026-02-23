import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const SKILL_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "web_development", label: "Web Development" },
  { value: "mobile_development", label: "Mobile Development" },
  { value: "design", label: "UI/UX Design" },
  { value: "marketing", label: "Digital Marketing" },
  { value: "content_creation", label: "Content Creation" },
  { value: "data_science", label: "Data Science" },
  { value: "blockchain", label: "Blockchain / Web3" },
  { value: "video_editing", label: "Video Editing" },
  { value: "community_management", label: "Community Management" },
  { value: "project_management", label: "Project Management" },
  { value: "general", label: "General" },
];

const SKILL_LEVELS = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const PAID_OPTIONS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid Only" },
  { value: "unpaid", label: "Unpaid" },
  { value: "both", label: "Both" },
];

interface InternshipFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedLevel: string;
  onLevelChange: (value: string) => void;
  selectedPaid: string;
  onPaidChange: (value: string) => void;
  onClearAll: () => void;
}

const InternshipFilterSheet = ({
  open,
  onOpenChange,
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  selectedPaid,
  onPaidChange,
  onClearAll,
}: InternshipFilterSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] bg-background overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 mt-6">
          {/* Category */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Category</h4>
            <div className="flex flex-wrap gap-2">
              {SKILL_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onCategoryChange(c.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedCategory === c.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Skill Level</h4>
            <div className="flex flex-wrap gap-2">
              {SKILL_LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => onLevelChange(l.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedLevel === l.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Paid Preference */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Paid Preference</h4>
            <div className="flex flex-wrap gap-2">
              {PAID_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => onPaidChange(p.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedPaid === p.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onClearAll} className="mt-2">
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InternshipFilterSheet;

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Briefcase, MapPin } from "lucide-react";
import { type Talent } from "@/data/talentsData";

const ITEMS_PER_PAGE = 8;

interface TalentGridProps {
  talents: Talent[];
  onTalentClick: (talent: Talent) => void;
}

const TalentGrid = ({ talents, onTalentClick }: TalentGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(talents.length / ITEMS_PER_PAGE);

  const paginatedTalents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return talents.slice(start, start + ITEMS_PER_PAGE);
  }, [talents, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [talents]);

  if (talents.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No talents found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paginatedTalents.map((talent) => (
          <TalentCard
            key={talent.id}
            talent={talent}
            onClick={() => onTalentClick(talent)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="icon"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

interface TalentCardProps {
  talent: Talent;
  onClick: () => void;
}

const TalentCard = ({ talent, onClick }: TalentCardProps) => {
  const initials = talent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className="group text-left w-full bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-150"
    >
      {/* Header with avatar and availability */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg font-bold text-primary">
          {initials}
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
          talent.available 
            ? "bg-green-500/20 text-green-400" 
            : "bg-secondary text-muted-foreground"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${talent.available ? "bg-green-500" : "bg-muted-foreground"}`} />
          {talent.available ? "Available" : "Busy"}
        </div>
      </div>

      {/* Name and title */}
      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
        {talent.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">{talent.title}</p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {talent.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 bg-secondary text-xs text-muted-foreground rounded-md"
          >
            {skill}
          </span>
        ))}
        {talent.skills.length > 3 && (
          <span className="px-2 py-0.5 bg-secondary/50 text-xs text-muted-foreground rounded-md">
            +{talent.skills.length - 3}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
          <span className="font-medium text-foreground">{talent.rating}</span>
        </div>
        <div className="flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{talent.completedProjects} projects</span>
        </div>
        {talent.hourlyRate && (
          <span className="font-medium text-foreground">${talent.hourlyRate}/hr</span>
        )}
      </div>
    </button>
  );
};

export default TalentGrid;

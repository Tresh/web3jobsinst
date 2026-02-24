import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Briefcase, MessageSquare } from "lucide-react";
import { type TalentProfileWithUser, TALENT_CATEGORIES } from "@/hooks/useTalentProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useStartConversation } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 8;

interface TalentGridProps {
  talents: TalentProfileWithUser[];
}

const TalentGrid = ({ talents }: TalentGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTalent, setSelectedTalent] = useState<TalentProfileWithUser | null>(null);

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedTalents.map((talent) => (
          <TalentCard
            key={talent.id}
            talent={talent}
            onClick={() => setSelectedTalent(talent)}
          />
        ))}
      </div>

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

      {selectedTalent && (
        <TalentDetailModal
          talent={selectedTalent}
          onClose={() => setSelectedTalent(null)}
        />
      )}
    </div>
  );
};

interface TalentCardProps {
  talent: TalentProfileWithUser;
  onClick: () => void;
}

const TalentCard = ({ talent, onClick }: TalentCardProps) => {
  const initials = talent.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const categoryLabel = TALENT_CATEGORIES.find((c) => c.value === talent.category)?.label || talent.category;

  return (
    <button
      onClick={onClick}
      className="group text-left w-full bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all duration-150"
    >
      {/* Avatar area */}
      <div className="relative aspect-square bg-muted overflow-hidden flex items-center justify-center">
        <Avatar className="w-24 h-24">
          <AvatarImage src={talent.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-3xl font-bold text-primary w-24 h-24">
            {initials}
          </AvatarFallback>
        </Avatar>
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-[10px] font-medium rounded-full ${
            talent.availability === "available"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}>
            {talent.availability === "available" ? "Available" : "Busy"}
          </span>
        </div>
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-medium bg-card text-foreground rounded-full border border-border">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors mb-1">
          {talent.full_name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {talent.headline}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Briefcase className="w-3 h-3" />
            <span>{talent.completed_projects} projects</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-xs font-medium text-foreground">{Number(talent.rating).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

interface TalentDetailModalProps {
  talent: TalentProfileWithUser;
  onClose: () => void;
}

const TalentDetailModal = ({ talent, onClose }: TalentDetailModalProps) => {
  const initials = talent.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const categoryLabel = TALENT_CATEGORIES.find((c) => c.value === talent.category)?.label || talent.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={talent.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{talent.full_name}</h2>
            <p className="text-muted-foreground">{talent.headline}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{categoryLabel}</Badge>
              <span className={`text-xs flex items-center gap-1 ${talent.availability === "available" ? "text-primary" : "text-muted-foreground"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${talent.availability === "available" ? "bg-primary" : "bg-muted-foreground"}`} />
                {talent.availability === "available" ? "Available" : "Busy"}
              </span>
            </div>
          </div>
        </div>

        {talent.bio && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">{talent.bio}</p>
          </div>
        )}

        {talent.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {talent.skills.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-secondary rounded-lg">
            <div className="flex items-center justify-center gap-1 text-lg font-bold">
              <Star className="w-4 h-4 text-primary fill-primary" />
              {Number(talent.rating).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div className="text-center p-3 bg-secondary rounded-lg">
            <div className="text-lg font-bold">{talent.completed_projects}</div>
            <p className="text-xs text-muted-foreground">Projects</p>
          </div>
          {talent.hourly_rate && (
            <div className="text-center p-3 bg-secondary rounded-lg">
              <div className="text-lg font-bold">${talent.hourly_rate}</div>
              <p className="text-xs text-muted-foreground">Per hour</p>
            </div>
          )}
        </div>

        {talent.portfolio_links.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Portfolio</h3>
            <div className="space-y-2">
              {talent.portfolio_links.map((link) => (
                <a
                  key={link}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-primary hover:underline truncate"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <ContactButton talent={talent} />
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const ContactButton = ({ talent }: { talent: TalentProfileWithUser }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startConversation } = useStartConversation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.id === talent.user_id) {
      toast({ title: "That's you!", description: "You can't message yourself." });
      return;
    }
    setLoading(true);
    const convoId = await startConversation(talent.user_id);
    setLoading(false);
    if (convoId) {
      navigate("/dashboard/messages");
    }
  };

  return (
    <Button className="flex-1" onClick={handleContact} disabled={loading}>
      <MessageSquare className="w-4 h-4 mr-2" />
      {loading ? "Starting..." : "Contact"}
    </Button>
  );
};

export default TalentGrid;

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useOtherUserVisibility } from "@/hooks/useMessageSettings";
import {
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Star,
  Trophy,
  ExternalLink,
  MessageSquare,
  Shield,
} from "lucide-react";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onBackToChat?: () => void;
}

interface UserData {
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
  } | null;
  scholarshipStatus: string | null;
  internshipProfile: {
    primary_skill_category: string;
    skill_level: string;
    internship_status: string;
    portfolio_link: string | null;
  } | null;
  talentProfile: {
    category: string;
    hourly_rate: number | null;
    availability: string;
    portfolio_links: string[] | null;
  } | null;
  totalXp: number;
  bootcampCount: number;
}

const UserProfileModal = ({
  open,
  onOpenChange,
  userId,
  onBackToChat,
}: UserProfileModalProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { visibility, loading: visibilityLoading } = useOtherUserVisibility(userId);

  useEffect(() => {
    if (!userId || !open) return;

    const fetchUserData = async () => {
      setLoading(true);

      // Fetch all data in parallel
      const [profileRes, scholarRes, internRes, talentRes, xpRes, bootcampRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, avatar_url, headline")
            .eq("user_id", userId)
            .maybeSingle(),
          supabase
            .from("scholarship_applications")
            .select("status")
            .eq("user_id", userId)
            .eq("status", "approved")
            .maybeSingle(),
          supabase
            .from("internship_profiles")
            .select("primary_skill_category, skill_level, internship_status, portfolio_link")
            .eq("user_id", userId)
            .eq("is_public", true)
            .maybeSingle(),
          supabase
            .from("talent_profiles")
            .select("category, hourly_rate, availability, portfolio_links")
            .eq("user_id", userId)
            .eq("is_approved", true)
            .maybeSingle(),
          supabase
            .from("scholarship_applications")
            .select("total_xp")
            .eq("user_id", userId)
            .maybeSingle(),
          supabase
            .from("bootcamp_participants")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
        ]);

      setUserData({
        profile: profileRes.data,
        scholarshipStatus: scholarRes.data ? "approved" : null,
        internshipProfile: internRes.data as UserData["internshipProfile"],
        talentProfile: talentRes.data as UserData["talentProfile"],
        totalXp: (xpRes.data as { total_xp?: number })?.total_xp || 0,
        bootcampCount: bootcampRes.count || 0,
      });
      setLoading(false);
    };

    fetchUserData();
  }, [userId, open]);

  const name = userData?.profile?.full_name || "Unknown";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleBackToChat = () => {
    onOpenChange(false);
    onBackToChat?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {onBackToChat && (
              <Button variant="ghost" size="icon" onClick={handleBackToChat}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <DialogTitle>User Profile</DialogTitle>
          </div>
        </DialogHeader>

        {loading || visibilityLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : userData ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={userData.profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{name}</h3>
                {userData.profile?.headline && (
                  <p className="text-sm text-muted-foreground">
                    {userData.profile.headline}
                  </p>
                )}
                <div className="flex gap-2 mt-1">
                  {userData.scholarshipStatus === "approved" &&
                    visibility?.show_scholarship_status !== false && (
                      <Badge variant="secondary" className="text-xs">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        Scholar
                      </Badge>
                    )}
                </div>
              </div>
            </div>

            {/* XP & Activity Stats */}
            {visibility?.show_xp_stats !== false && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                    <p className="text-lg font-bold">{userData.totalXp}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                  {visibility?.show_bootcamp_activity !== false && (
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <Star className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">{userData.bootcampCount}</p>
                      <p className="text-xs text-muted-foreground">Bootcamps</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Internship Profile */}
            {userData.internshipProfile &&
              visibility?.show_internship_info !== false && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4" />
                      Internship Profile
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Skill</span>
                        <span className="capitalize">
                          {userData.internshipProfile.primary_skill_category.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Level</span>
                        <span className="capitalize">
                          {userData.internshipProfile.skill_level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                          variant={
                            userData.internshipProfile.internship_status ===
                            "open_to_internship"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {userData.internshipProfile.internship_status
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Badge>
                      </div>
                      {userData.internshipProfile.portfolio_link && (
                        <a
                          href={userData.internshipProfile.portfolio_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-xs mt-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}

            {/* Talent Profile */}
            {userData.talentProfile &&
              visibility?.show_talent_profile !== false && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4" />
                      Talent Profile
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="capitalize">
                          {userData.talentProfile.skill_category.replace("_", " ")}
                        </span>
                      </div>
                      {userData.talentProfile.hourly_rate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rate</span>
                          <span>${userData.talentProfile.hourly_rate}/hr</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Availability</span>
                        <Badge
                          variant={
                            userData.talentProfile.availability_status === "available"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs capitalize"
                        >
                          {userData.talentProfile.availability_status}
                        </Badge>
                      </div>
                      {userData.talentProfile.portfolio_url && (
                        <a
                          href={userData.talentProfile.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-xs mt-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}

            {/* Back to Chat Button */}
            {onBackToChat && (
              <Button className="w-full" onClick={handleBackToChat}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Back to Chat
              </Button>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Profile not found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;

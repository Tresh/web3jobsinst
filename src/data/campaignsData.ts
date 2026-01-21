export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: "social" | "referral" | "airdrop" | "content" | "community";
  reward: string;
  participants: number;
  maxParticipants: number;
  deadline: string;
  status: "active" | "ended" | "upcoming" | "coming_soon";
  project: string;
  requirements: string[];
}

export type CampaignType = Campaign["type"];
export type CampaignStatus = Campaign["status"];

export const campaignTypes: { value: CampaignType; label: string }[] = [
  { value: "social", label: "Social Media" },
  { value: "referral", label: "Refer to Earn" },
  { value: "airdrop", label: "Airdrop" },
  { value: "content", label: "Content Creation" },
  { value: "community", label: "Community" },
];

export const campaignStatuses: { value: CampaignStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "coming_soon", label: "Coming Soon" },
  { value: "ended", label: "Ended" },
];

export const campaigns: Campaign[] = [
  {
    id: "1",
    title: "First 200 to Post About KOLs3",
    description: "Be among the first 200 people to post about KOLs3 on X (Twitter) and share the prize pool.",
    type: "social",
    reward: "$1,000 Prize Pool",
    participants: 0,
    maxParticipants: 200,
    deadline: "2025-02-15",
    status: "coming_soon",
    project: "KOLs3",
    requirements: ["Post on X with #KOLs3", "Tag @KOLs3Official", "Minimum 100 followers"],
  },
];

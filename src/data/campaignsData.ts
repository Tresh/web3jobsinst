export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: "social" | "referral" | "airdrop" | "content" | "community";
  reward: string;
  participants: number;
  maxParticipants: number;
  deadline: string;
  status: "active" | "ended" | "upcoming";
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
  { value: "ended", label: "Ended" },
];

export const campaigns: Campaign[] = [
  {
    id: "1",
    title: "First 1000 to Post About KOLs3",
    description: "Be among the first 1000 people to post about KOLs3 on X (Twitter) and earn rewards.",
    type: "social",
    reward: "$50 in tokens",
    participants: 342,
    maxParticipants: 1000,
    deadline: "2025-02-15",
    status: "active",
    project: "KOLs3",
    requirements: ["Post on X with #KOLs3", "Tag @KOLs3Official", "Minimum 100 followers"],
  },
  {
    id: "2",
    title: "Refer 5 Friends Campaign",
    description: "Refer 5 friends to Web3 Jobs Institute and earn exclusive rewards for each successful referral.",
    type: "referral",
    reward: "$25 per referral",
    participants: 156,
    maxParticipants: 500,
    deadline: "2025-03-01",
    status: "active",
    project: "Web3 Jobs Institute",
    requirements: ["Share your referral link", "Friends must sign up", "Complete onboarding"],
  },
  {
    id: "3",
    title: "DeFi Protocol Launch Airdrop",
    description: "Participate in the early testing phase and qualify for the upcoming airdrop.",
    type: "airdrop",
    reward: "Token Airdrop",
    participants: 2500,
    maxParticipants: 5000,
    deadline: "2025-02-28",
    status: "active",
    project: "DeFi Protocol X",
    requirements: ["Complete testnet tasks", "Hold minimum balance", "Join Discord"],
  },
  {
    id: "4",
    title: "Create Tutorial Content",
    description: "Create video or written tutorials about Web3 development and earn per approved submission.",
    type: "content",
    reward: "$100 per tutorial",
    participants: 45,
    maxParticipants: 100,
    deadline: "2025-04-01",
    status: "active",
    project: "Web3 Jobs Institute",
    requirements: ["Quality content", "Original work", "Minimum 5 minutes or 1000 words"],
  },
  {
    id: "5",
    title: "Community Ambassador Program",
    description: "Become a community ambassador and help grow our ecosystem while earning monthly rewards.",
    type: "community",
    reward: "$200/month",
    participants: 28,
    maxParticipants: 50,
    deadline: "2025-01-31",
    status: "upcoming",
    project: "Web3 Jobs Institute",
    requirements: ["Active community member", "10+ hours/week", "Previous experience preferred"],
  },
  {
    id: "6",
    title: "NFT Collection Promo",
    description: "Share and promote the new NFT collection launch across social platforms.",
    type: "social",
    reward: "Free NFT Mint",
    participants: 1000,
    maxParticipants: 1000,
    deadline: "2025-01-15",
    status: "ended",
    project: "CryptoArt DAO",
    requirements: ["Tweet about collection", "Join Discord", "Follow on X"],
  },
  {
    id: "7",
    title: "Bug Bounty Program",
    description: "Find and report bugs in our platform to earn rewards based on severity.",
    type: "community",
    reward: "$50-$500",
    participants: 89,
    maxParticipants: 200,
    deadline: "2025-06-01",
    status: "active",
    project: "Web3 Jobs Institute",
    requirements: ["Technical knowledge", "Detailed reports", "Reproducible bugs"],
  },
  {
    id: "8",
    title: "Trading Competition",
    description: "Join our trading competition and win prizes based on your PnL performance.",
    type: "airdrop",
    reward: "$10,000 prize pool",
    participants: 450,
    maxParticipants: 1000,
    deadline: "2025-02-20",
    status: "upcoming",
    project: "DEX Platform",
    requirements: ["Minimum $100 trading volume", "KYC verified", "Valid account"],
  },
];

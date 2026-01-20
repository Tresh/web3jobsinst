// Course and Learning Path Data for Web3 Jobs Institute

// Path images
import marketerImg from "@/assets/paths/marketer.png";
import traderImg from "@/assets/paths/trader.png";
import vibecoderImg from "@/assets/paths/vibecoder.png";
import developerImg from "@/assets/paths/developer.png";
import communityImg from "@/assets/paths/community.png";
import creatorImg from "@/assets/paths/creator.png";
import freelancerImg from "@/assets/paths/freelancer.png";
import founderImg from "@/assets/paths/founder.png";

// Course category images
import foundationsImg from "@/assets/courses/foundations.png";
import marketingImg from "@/assets/courses/marketing.png";
import tradingImg from "@/assets/courses/trading.png";
import creatorCourseImg from "@/assets/courses/creator.png";
import aiImg from "@/assets/courses/ai.png";
import developmentImg from "@/assets/courses/development.png";

export const categories = [
  "Foundations",
  "Marketing & Growth",
  "Trading & Alpha",
  "Creator Economy",
  "Vibecoding & No-Code",
  "Development",
  "Community & DAO",
  "Sales & Partnerships",
  "Research & Data",
  "AI & Automation",
  "Onchain & DeFi",
  "Leadership & Strategy",
  "Freelancing",
  "Project Management",
] as const;

export type Category = typeof categories[number];

export const levels = ["Beginner", "Intermediate", "Advanced"] as const;
export type Level = typeof levels[number];

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  courseCount: number;
  image: string;
}

export interface Course {
  id: string;
  title: string;
  level: Level;
  category: Category;
  description: string;
  skillOutcome: string;
  duration?: string;
  hasCertificate: boolean;
  isComingSoon: boolean;
  learningPathIds?: string[];
  image: string;
}

// Map categories to images
export const categoryImages: Record<Category, string> = {
  "Foundations": foundationsImg,
  "Marketing & Growth": marketingImg,
  "Trading & Alpha": tradingImg,
  "Creator Economy": creatorCourseImg,
  "Vibecoding & No-Code": vibecoderImg,
  "Development": developmentImg,
  "Community & DAO": communityImg,
  "Sales & Partnerships": marketingImg,
  "Research & Data": tradingImg,
  "AI & Automation": aiImg,
  "Onchain & DeFi": tradingImg,
  "Leadership & Strategy": founderImg,
  "Freelancing": freelancerImg,
  "Project Management": founderImg,
};

export const learningPaths: LearningPath[] = [
  {
    id: "web3-marketer",
    name: "Web3 Marketer",
    description: "Master growth, community, and go-to-market strategies for Web3.",
    courseCount: 12,
    image: marketerImg,
  },
  {
    id: "trader",
    name: "Trader",
    description: "Learn to read markets, manage risk, and find alpha.",
    courseCount: 8,
    image: traderImg,
  },
  {
    id: "vibecoder",
    name: "Vibecoder",
    description: "Build apps and tools without writing traditional code.",
    courseCount: 10,
    image: vibecoderImg,
  },
  {
    id: "developer",
    name: "Developer",
    description: "Master smart contracts, dApps, and blockchain development.",
    courseCount: 15,
    image: developerImg,
  },
  {
    id: "community-manager",
    name: "Community Manager",
    description: "Build and nurture thriving Web3 communities.",
    courseCount: 9,
    image: communityImg,
  },
  {
    id: "creator",
    name: "Creator",
    description: "Monetize your content and build your brand onchain.",
    courseCount: 11,
    image: creatorImg,
  },
  {
    id: "freelancer",
    name: "Freelancer",
    description: "Get paid in crypto for your skills worldwide.",
    courseCount: 7,
    image: freelancerImg,
  },
  {
    id: "founder",
    name: "Founder",
    description: "Launch and scale your Web3 startup from zero to one.",
    courseCount: 14,
    image: founderImg,
  },
];

export const courses: Course[] = [
  // Foundations
  {
    id: "web3-101",
    title: "Web3 Fundamentals",
    level: "Beginner",
    category: "Foundations",
    description: "Understand blockchains, wallets, and the decentralized web.",
    skillOutcome: "Navigate the Web3 ecosystem confidently",
    duration: "2 hours",
    hasCertificate: true,
    isComingSoon: false,
    image: foundationsImg,
  },
  {
    id: "crypto-wallets",
    title: "Mastering Crypto Wallets",
    level: "Beginner",
    category: "Foundations",
    description: "Set up, secure, and use wallets like a pro.",
    skillOutcome: "Manage assets safely across chains",
    duration: "1.5 hours",
    hasCertificate: true,
    isComingSoon: false,
    image: foundationsImg,
  },
  {
    id: "defi-basics",
    title: "DeFi Essentials",
    level: "Beginner",
    category: "Foundations",
    description: "Learn lending, borrowing, and yield strategies.",
    skillOutcome: "Use DeFi protocols confidently",
    duration: "3 hours",
    hasCertificate: true,
    isComingSoon: true,
    image: foundationsImg,
  },
  // Marketing & Growth
  {
    id: "web3-marketing-101",
    title: "Web3 Marketing Fundamentals",
    level: "Beginner",
    category: "Marketing & Growth",
    description: "Learn the unique dynamics of marketing in Web3.",
    skillOutcome: "Create effective Web3 marketing campaigns",
    duration: "2.5 hours",
    hasCertificate: true,
    isComingSoon: false,
    learningPathIds: ["web3-marketer"],
    image: marketingImg,
  },
  {
    id: "twitter-growth",
    title: "Twitter/X Growth for Web3",
    level: "Intermediate",
    category: "Marketing & Growth",
    description: "Build your personal brand and grow your audience.",
    skillOutcome: "Grow to 10K+ engaged followers",
    duration: "2 hours",
    hasCertificate: true,
    isComingSoon: false,
    learningPathIds: ["web3-marketer", "creator"],
    image: marketingImg,
  },
  {
    id: "meme-coin-marketing",
    title: "Meme Coin Marketing Mastery",
    level: "Advanced",
    category: "Marketing & Growth",
    description: "Viral strategies for token launches and community hype.",
    skillOutcome: "Launch and market meme tokens",
    duration: "4 hours",
    hasCertificate: true,
    isComingSoon: true,
    learningPathIds: ["web3-marketer"],
    image: marketingImg,
  },
  // Trading & Alpha
  {
    id: "trading-basics",
    title: "Crypto Trading Basics",
    level: "Beginner",
    category: "Trading & Alpha",
    description: "Learn charts, indicators, and entry/exit strategies.",
    skillOutcome: "Execute profitable trades",
    duration: "3 hours",
    hasCertificate: true,
    isComingSoon: false,
    learningPathIds: ["trader"],
    image: tradingImg,
  },
  {
    id: "onchain-analysis",
    title: "Onchain Analysis",
    level: "Intermediate",
    category: "Trading & Alpha",
    description: "Read blockchain data to find alpha opportunities.",
    skillOutcome: "Identify trends before they go mainstream",
    duration: "4 hours",
    hasCertificate: true,
    isComingSoon: true,
    learningPathIds: ["trader"],
    image: tradingImg,
  },
  {
    id: "defi-trading",
    title: "Advanced DeFi Trading",
    level: "Advanced",
    category: "Trading & Alpha",
    description: "Leverage, perpetuals, and advanced DeFi strategies.",
    skillOutcome: "Trade across DeFi protocols",
    duration: "5 hours",
    hasCertificate: true,
    isComingSoon: true,
    learningPathIds: ["trader"],
    image: tradingImg,
  },
  // Creator Economy
  {
    id: "nft-creation",
    title: "NFT Creation & Monetization",
    level: "Beginner",
    category: "Creator Economy",
    description: "Create, mint, and sell your digital art and collectibles.",
    skillOutcome: "Launch your first NFT collection",
    duration: "3 hours",
    hasCertificate: true,
    isComingSoon: false,
    learningPathIds: ["creator"],
    image: creatorCourseImg,
  },
  {
    id: "content-monetization",
    title: "Web3 Content Monetization",
    level: "Intermediate",
    category: "Creator Economy",
    description: "Monetize newsletters, videos, and podcasts with crypto.",
    skillOutcome: "Build sustainable creator income",
    duration: "2.5 hours",
    hasCertificate: true,
    isComingSoon: true,
    learningPathIds: ["creator"],
    image: creatorCourseImg,
  },
  // Vibecoding & No-Code
  {
    id: "vibecoding-intro",
    title: "Introduction to Vibecoding",
    level: "Beginner",
    category: "Vibecoding & No-Code",
    description: "Build Web3 apps using AI and no-code tools.",
    skillOutcome: "Create functional dApps without coding",
    duration: "3 hours",
    hasCertificate: true,
    isComingSoon: false,
    learningPathIds: ["vibecoder"],
    image: vibecoderImg,
  },
  {
    id: "ai-app-building",
    title: "AI-Powered App Building",
    level: "Intermediate",
    category: "Vibecoding & No-Code",
    description: "Use AI tools to prototype and build faster.",
    skillOutcome: "Ship products 10x faster",
    duration: "4 hours",
    hasCertificate: true,
    isComingSoon: true,
    learningPathIds: ["vibecoder"],
    image: vibecoderImg,
  },
  // Development
  {
    id: "solidity-basics",
    title: "Solidity Fundamentals",
    level: "Beginner",
    category: "Development",
    description: "Write your first smart contracts on Ethereum.",
    skillOutcome: "Deploy smart contracts to mainnet",
    duration: "6 hours",
    hasCertificate: true,
    isComingSoon: false,
    learningPathIds: ["developer"],
    image: developmentImg,
  },
  {
    id: "dapp-development",
    title: "Full-Stack dApp Development",
    level: "Intermediate",
    category: "Development",
    description: "Build complete decentralized applications.",
    skillOutcome: "Launch production-ready dApps",
    duration: "10 hours",
    hasCertificate: true,
    isComingSoon: true,
    learningPathIds: ["developer"],
    image: developmentImg,
  },
  {
    id: "smart-contract-security",
    title: "Smart Contract Security",
    level: "Advanced",
    category: "Development",
    description: "Audit and secure smart contracts from vulnerabilities.",
    skillOutcome: "Identify and fix security issues",
    duration: "8 hours",
    hasCertificate: true,
    isComingSoon: true,
    learningPathIds: ["developer"],
    image: developmentImg,
  },
  // Community & DAO
  {
    id: "community-building",
    title: "Web3 Community Building",
    level: "Beginner",
    category: "Community & DAO",
    description: "Build and grow engaged crypto communities.",
    skillOutcome: "Manage thriving Discord servers",
    duration: "3 hours",
    hasCertificate: true,
    isComingSoon: false,
    learningPathIds: ["community-manager"],
    image: communityImg,
  },
  {
    id: "dao-operations",
    title: "DAO Operations & Governance",
    level: "Intermediate",
    category: "Community & DAO",
    description: "Run effective decentralized organizations.",
    skillOutcome: "Contribute to DAO governance",
    duration: "4 hours",
    hasCertificate: true,
    isComingSoon: true,
    learningPathIds: ["community-manager", "founder"],
    image: communityImg,
  },
  // Sales & Partnerships
  {
    id: "web3-sales",
    title: "Web3 Sales & BD",
    level: "Intermediate",
    category: "Sales & Partnerships",
    description: "Close deals and build partnerships in crypto.",
    skillOutcome: "Land enterprise Web3 clients",
    duration: "3 hours",
    hasCertificate: true,
    isComingSoon: true,
    image: marketingImg,
  },
  // Research & Data
  {
    id: "crypto-research",
    title: "Crypto Research Methods",
    level: "Intermediate",
    category: "Research & Data",
    description: "Conduct thorough research on projects and protocols.",
    skillOutcome: "Write professional research reports",
    duration: "4 hours",
    hasCertificate: true,
    isComingSoon: true,
    image: tradingImg,
  },
  // AI & Automation
  {
    id: "ai-web3",
    title: "AI Tools for Web3",
    level: "Beginner",
    category: "AI & Automation",
    description: "Leverage AI to automate and scale Web3 work.",
    skillOutcome: "Automate repetitive tasks with AI",
    duration: "2 hours",
    hasCertificate: true,
    isComingSoon: false,
    image: aiImg,
  },
  // Onchain & DeFi
  {
    id: "yield-farming",
    title: "Yield Farming Strategies",
    level: "Intermediate",
    category: "Onchain & DeFi",
    description: "Maximize returns across DeFi protocols.",
    skillOutcome: "Build diversified yield portfolios",
    duration: "4 hours",
    hasCertificate: true,
    isComingSoon: true,
    image: tradingImg,
  },
  // Leadership & Strategy
  {
    id: "web3-leadership",
    title: "Web3 Leadership",
    level: "Advanced",
    category: "Leadership & Strategy",
    description: "Lead teams and projects in the decentralized world.",
    skillOutcome: "Build and lead remote Web3 teams",
    duration: "5 hours",
    hasCertificate: true,
    isComingSoon: true,
    learningPathIds: ["founder"],
    image: founderImg,
  },
  // Freelancing
  {
    id: "freelance-web3",
    title: "Freelancing in Web3",
    level: "Beginner",
    category: "Freelancing",
    description: "Find clients and get paid in crypto worldwide.",
    skillOutcome: "Land your first Web3 freelance gig",
    duration: "2 hours",
    hasCertificate: true,
    isComingSoon: false,
    learningPathIds: ["freelancer"],
    image: freelancerImg,
  },
  {
    id: "global-payments",
    title: "Global Crypto Payments",
    level: "Intermediate",
    category: "Freelancing",
    description: "Invoice and receive payments across borders.",
    skillOutcome: "Get paid from anywhere seamlessly",
    duration: "1.5 hours",
    hasCertificate: true,
    isComingSoon: true,
    learningPathIds: ["freelancer"],
    image: freelancerImg,
  },
  // Project Management
  {
    id: "web3-pm",
    title: "Web3 Project Management",
    level: "Intermediate",
    category: "Project Management",
    description: "Manage crypto projects from ideation to launch.",
    skillOutcome: "Ship Web3 products on time",
    duration: "4 hours",
    hasCertificate: true,
    isComingSoon: true,
    learningPathIds: ["founder"],
    image: founderImg,
  },
];

export const categoryDescriptions: Record<Category, string> = {
  "Foundations": "Master the building blocks of blockchain and Web3.",
  "Marketing & Growth": "Learn to grow projects, build audiences, and drive adoption.",
  "Trading & Alpha": "Develop skills to navigate markets and find opportunities.",
  "Creator Economy": "Monetize your creativity in the decentralized world.",
  "Vibecoding & No-Code": "Build apps and tools without traditional coding.",
  "Development": "Write smart contracts and build decentralized applications.",
  "Community & DAO": "Build and manage thriving Web3 communities.",
  "Sales & Partnerships": "Close deals and form strategic partnerships.",
  "Research & Data": "Analyze projects and make data-driven decisions.",
  "AI & Automation": "Leverage AI to work smarter in Web3.",
  "Onchain & DeFi": "Navigate and profit from decentralized finance.",
  "Leadership & Strategy": "Lead teams and drive strategic initiatives.",
  "Freelancing": "Work globally and get paid in crypto.",
  "Project Management": "Ship Web3 projects effectively.",
};

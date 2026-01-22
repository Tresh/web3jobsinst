export type InstitutionCategory = "L1" | "L2" | "DeFi" | "Infra" | "NFT" | "AI" | "DAO";

export interface Institution {
  id: string;
  name: string;
  slug: string;
  logo: string;
  category: InstitutionCategory;
  description: string;
  coursesCount: number;
  learnersCount: number;
  verified: boolean;
}

export const institutions: Institution[] = [
  {
    id: "1",
    name: "Solana Foundation",
    slug: "solana",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
    category: "L1",
    description: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.",
    coursesCount: 12,
    learnersCount: 4500,
    verified: true,
  },
  {
    id: "2",
    name: "Base",
    slug: "base",
    logo: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
    category: "L2",
    description: "Base is a secure, low-cost, builder-friendly Ethereum L2 built to bring the next billion users onchain.",
    coursesCount: 8,
    learnersCount: 3200,
    verified: true,
  },
  {
    id: "3",
    name: "Polygon",
    slug: "polygon",
    logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    category: "L2",
    description: "Polygon is a decentralized Ethereum scaling platform enabling developers to build scalable user-friendly dApps.",
    coursesCount: 15,
    learnersCount: 5800,
    verified: true,
  },
  {
    id: "4",
    name: "Arbitrum",
    slug: "arbitrum",
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
    category: "L2",
    description: "Arbitrum is a suite of Ethereum scaling solutions enabling high-throughput, low-cost smart contracts.",
    coursesCount: 10,
    learnersCount: 2900,
    verified: true,
  },
  {
    id: "5",
    name: "Chainlink",
    slug: "chainlink",
    logo: "https://cryptologos.cc/logos/chainlink-link-logo.png",
    category: "Infra",
    description: "Chainlink is the industry-standard Web3 services platform connecting smart contracts to real-world data.",
    coursesCount: 7,
    learnersCount: 2100,
    verified: true,
  },
  {
    id: "6",
    name: "Uniswap",
    slug: "uniswap",
    logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
    category: "DeFi",
    description: "Uniswap is the largest decentralized exchange protocol for swapping cryptocurrency tokens on Ethereum.",
    coursesCount: 5,
    learnersCount: 1800,
    verified: true,
  },
  {
    id: "7",
    name: "NEAR Protocol",
    slug: "near",
    logo: "https://cryptologos.cc/logos/near-protocol-near-logo.png",
    category: "L1",
    description: "NEAR is a user-friendly, carbon-neutral blockchain, built from the ground up to be performant and secure.",
    coursesCount: 9,
    learnersCount: 2400,
    verified: true,
  },
  {
    id: "8",
    name: "Avalanche",
    slug: "avalanche",
    logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
    category: "L1",
    description: "Avalanche is an open, programmable smart contracts platform for decentralized applications.",
    coursesCount: 11,
    learnersCount: 3100,
    verified: true,
  },
];

export const categoryLabels: Record<InstitutionCategory, string> = {
  L1: "Layer 1",
  L2: "Layer 2",
  DeFi: "DeFi",
  Infra: "Infrastructure",
  NFT: "NFT",
  AI: "AI",
  DAO: "DAO",
};

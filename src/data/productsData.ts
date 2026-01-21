export type ProductCategory = "all" | "ebooks" | "tools" | "bots" | "templates" | "materials";
export type ProductPriceType = "all" | "free" | "paid";

export interface Product {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  price: number; // 0 for free
  image: string;
  creator: string;
  downloads: number;
  comingSoon: boolean;
}

export const productCategories: ProductCategory[] = ["all", "ebooks", "tools", "bots", "templates", "materials"];

export const productCategoryLabels: Record<ProductCategory, string> = {
  all: "All Products",
  ebooks: "Ebooks",
  tools: "AI Tools",
  bots: "Telegram Bots",
  templates: "Templates",
  materials: "Materials",
};

export const products: Product[] = [
  {
    id: "1",
    title: "Crypto YouTube Automation Guide",
    description: "Complete guide to automating your crypto YouTube channel with AI tools and workflows.",
    category: "ebooks",
    price: 29,
    image: "/placeholder.svg",
    creator: "Web3 Academy",
    downloads: 245,
    comingSoon: true,
  },
  {
    id: "2",
    title: "Telegram Trading Bot Access",
    description: "Get access to our premium trading signals bot with real-time alerts and analytics.",
    category: "bots",
    price: 49,
    image: "/placeholder.svg",
    creator: "DeFi Signals",
    downloads: 512,
    comingSoon: true,
  },
  {
    id: "3",
    title: "NFT Launch Checklist",
    description: "Free comprehensive checklist for launching your NFT collection successfully.",
    category: "materials",
    price: 0,
    image: "/placeholder.svg",
    creator: "NFT Pro",
    downloads: 1203,
    comingSoon: true,
  },
  {
    id: "4",
    title: "AI Content Writer Tool",
    description: "AI-powered tool for generating Web3 content, threads, and marketing copy.",
    category: "tools",
    price: 19,
    image: "/placeholder.svg",
    creator: "ContentAI",
    downloads: 389,
    comingSoon: true,
  },
  {
    id: "5",
    title: "Smart Contract Templates",
    description: "Ready-to-deploy smart contract templates for common use cases.",
    category: "templates",
    price: 0,
    image: "/placeholder.svg",
    creator: "DevDAO",
    downloads: 876,
    comingSoon: true,
  },
  {
    id: "6",
    title: "DeFi Trading Strategies Ebook",
    description: "Advanced trading strategies for DeFi protocols and yield farming.",
    category: "ebooks",
    price: 39,
    image: "/placeholder.svg",
    creator: "Yield Master",
    downloads: 654,
    comingSoon: true,
  },
  {
    id: "7",
    title: "Community Management Bot",
    description: "Automate your Discord and Telegram community management.",
    category: "bots",
    price: 29,
    image: "/placeholder.svg",
    creator: "ModBot Labs",
    downloads: 423,
    comingSoon: true,
  },
  {
    id: "8",
    title: "Tokenomics Calculator",
    description: "Free tool to design and visualize your token economics.",
    category: "tools",
    price: 0,
    image: "/placeholder.svg",
    creator: "Token Studio",
    downloads: 1567,
    comingSoon: true,
  },
];

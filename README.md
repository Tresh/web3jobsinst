# Web3 Jobs Institute

> **Learn. Build. Earn. In Public.**

A premium global education SaaS, learning marketplace, and talent hiring hub for the Web3 ecosystem. Built for those who want to prove their skills, land real opportunities, and grow in public.

---

## 🌐 Live Platform

**[web3jobsinst.lovable.app](https://web3jobsinst.lovable.app)**

---

## 📖 About

Web3 Jobs Institute is a structured digital institute that connects learners, builders, and companies across the Web3 space. The platform operates on a **Proof-of-Work** model — users earn XP by completing real tasks and modules, building a verifiable track record that employers and partners can trust.

### Core Pillars

| Pillar | Description |
|---|---|
| 🎓 **Learn** | Structured courses and learning paths across Web3 verticals |
| 🔨 **Build** | Bootcamps, tasks, and proof-of-work submissions |
| 💼 **Earn** | Internships, talent marketplace, and real job opportunities |
| 📢 **In Public** | Leaderboards, e-cards, referrals, and social sharing |

---

## ✨ Key Features

- **Scholarship Program** — Structured cohort with modules, daily check-ins, XP tracking, and internship placement
- **Bootcamps** — Community-run bootcamps with tasks, voice rooms, leaderboards, and AI coaching
- **Talent Market** — Verified talent profiles showcasing Proof-of-Work history
- **Internship Market** — Browse and connect with skilled interns from the scholarship program
- **LearnFi Programs** — Web3-native learn-to-earn programs with on-chain reward distribution
- **Digital Products** — Marketplace for ebooks, tools, bots, and templates
- **Campaigns** — Promotional and partner campaign management
- **Courses** — Video-based learning with Vimeo integration and progress tracking
- **Notifications & Messaging** — In-platform DMs and real-time notification system
- **Admin Dashboard** — Full platform management: scholarships, bootcamps, users, analytics, bug reports, and more

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Supabase (Auth, Database, Edge Functions, Storage) |
| Payments | Paystack (via Edge Functions) |
| CMS | Strapi (courses content) |
| PWA | vite-plugin-pwa |
| Web3 | Wagmi, Viem, Solana Wallet Adapter |

---

## 🚀 Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate into the project
cd web3-jobs-institute

# Install dependencies
npm install

# Start the development server
npm run dev
```

> Requires Node.js 18+. Use [nvm](https://github.com/nvm-sh/nvm) to manage versions.

---

## 🗂 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── admin/        # Admin panel components
│   ├── bootcamp/     # Bootcamp feature components
│   ├── scholarship/  # Scholarship portal components
│   └── ui/           # shadcn/ui base components
├── pages/            # Route-level pages
│   ├── admin/        # Admin pages
│   └── dashboard/    # User dashboard pages
├── hooks/            # Custom React hooks
├── contexts/         # Auth and global state
├── data/             # Static data and types
├── lib/              # Utility functions
└── integrations/     # Supabase client and types
supabase/
└── functions/        # Edge Functions (payments, emails, AI)
```

---

## 🔐 Environment Variables

Secrets are managed via Supabase and the Lovable Cloud secrets manager. No private keys are stored in code.

---

## 📄 License

All rights reserved. Web3 Jobs Institute © 2025.

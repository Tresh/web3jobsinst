# Strapi CMS Setup Guide for Web3 Jobs Institute

This guide walks you through setting up Strapi as the headless CMS for courses, modules, and lessons.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Strapi Deployment Options](#strapi-deployment-options)
3. [Content Type Definitions](#content-type-definitions)
4. [API Permissions Setup](#api-permissions-setup)
5. [Vimeo Integration](#vimeo-integration)
6. [Environment Variables](#environment-variables)
7. [Testing the Integration](#testing-the-integration)

---

## 🔧 Prerequisites

- Node.js v18+ (for local Strapi development)
- A Vimeo account (Pro or higher recommended for domain restrictions)
- A hosting platform for Strapi (Strapi Cloud, Railway, Render, DigitalOcean, etc.)

---

## 🚀 Strapi Deployment Options

### Option 1: Strapi Cloud (Recommended for beginners)
1. Go to [cloud.strapi.io](https://cloud.strapi.io)
2. Sign up and create a new project
3. Choose your plan (Free tier available)
4. Your Strapi instance will be ready in minutes

### Option 2: Railway
1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy a Template → Search "Strapi"
3. Configure environment variables
4. Deploy and get your URL

### Option 3: Render
1. Go to [render.com](https://render.com)
2. Create Web Service → Connect your Strapi repo
3. Add PostgreSQL database
4. Deploy

### Option 4: Self-hosted (VPS)
```bash
npx create-strapi-app@latest web3jobs-cms
cd web3jobs-cms
npm run develop
```

---

## 📦 Content Type Definitions

Create these content types in Strapi Admin Panel → Content-Type Builder:

### 1️⃣ Course (Collection Type)

**Purpose:** Represents a complete learning program users can enroll in.

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `title` | Text (Short) | ✅ | Course title (max 100 chars) |
| `slug` | UID | ✅ | Auto-generated from title, used for URLs |
| `shortDescription` | Text (Long) | ✅ | Brief summary (max 200 chars) |
| `fullDescription` | Rich Text | ❌ | Detailed course description with formatting |
| `coverImage` | Media (Single) | ✅ | Course thumbnail/hero image |
| `level` | Enumeration | ✅ | Options: `Beginner`, `Intermediate`, `Advanced` |
| `category` | Text (Short) | ✅ | e.g., "Foundations", "Trading & Alpha" |
| `isFree` | Boolean | ✅ | Default: false |
| `price` | Number (Decimal) | ❌ | Price in USD (null if free) |
| `status` | Enumeration | ✅ | Options: `draft`, `published` |
| `estimatedDuration` | Text (Short) | ❌ | e.g., "4 hours", "2 weeks" |
| `skills` | Component (Repeatable) | ❌ | List of skills learned |
| `instructorName` | Text (Short) | ❌ | Name of course creator |
| `modules` | Relation (1:N) | ✅ | One Course → Many Modules |

**Skills Component Structure:**
```
- skill (Text, Short)
```

---

### 2️⃣ Module (Collection Type)

**Purpose:** Groups lessons within a course, defines learning sequence.

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `title` | Text (Short) | ✅ | Module title |
| `description` | Text (Long) | ❌ | What this module covers |
| `order` | Number (Integer) | ✅ | Display order within course (1, 2, 3...) |
| `unlockRule` | Enumeration | ❌ | Options: `instant`, `sequential` (default: instant) |
| `isOptional` | Boolean | ❌ | Default: false |
| `course` | Relation (N:1) | ✅ | Many Modules → One Course |
| `lessons` | Relation (1:N) | ✅ | One Module → Many Lessons |

**How Ordering Works:**
- Use the `order` field to control display sequence
- Frontend queries modules sorted by `order` ascending
- Sequential unlock means previous module must be completed first

---

### 3️⃣ Lesson (Collection Type)

**Purpose:** Single learning unit, connects to Vimeo video.

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `title` | Text (Short) | ✅ | Lesson title |
| `description` | Text (Long) | ❌ | Brief lesson description |
| `order` | Number (Integer) | ✅ | Display order within module |
| `vimeoVideoId` | Text (Short) | ✅ | **Only the video ID** (e.g., "123456789") |
| `duration` | Text (Short) | ✅ | e.g., "12:30" or "750" (seconds) |
| `accessLevel` | Enumeration | ✅ | Options: `free`, `paid`, `cohort-only` |
| `isPreview` | Boolean | ✅ | Can be viewed without enrollment (default: false) |
| `resources` | Component (Repeatable) | ❌ | Downloadable materials |
| `hasQuiz` | Boolean | ❌ | Default: false (future feature) |
| `module` | Relation (N:1) | ✅ | Many Lessons → One Module |

**Resources Component Structure:**
```
- resourceTitle (Text, Short)
- resourceUrl (Text, Long) - link to file or external resource
- resourceType (Enumeration: pdf, link, download)
```

**⚠️ IMPORTANT: Vimeo ID Only**
- Store ONLY the numeric video ID: `123456789`
- NOT the full URL: `https://vimeo.com/123456789`
- The frontend constructs the embed URL

---

## 🔐 API Permissions Setup

In Strapi Admin → Settings → Roles → Public:

### Enable for Public Role:
| Content Type | find | findOne |
|--------------|------|---------|
| Course | ✅ | ✅ |
| Module | ✅ | ✅ |
| Lesson | ✅ | ✅ |

**Note:** All content is readable via API. Access control (paid vs free) is enforced by the frontend based on user enrollment status.

### API Token (for frontend):
1. Go to Settings → API Tokens
2. Create new token with name: `frontend-readonly`
3. Token type: `Read-only`
4. Copy and store securely

---

## 🎬 Vimeo Integration

### Vimeo Account Setup:

1. **Upload Videos to Vimeo**
   - Use Vimeo Pro, Business, or Premium for domain restrictions
   - Upload each lesson video

2. **Configure Privacy Settings Per Video:**
   - Privacy → "Hide from Vimeo" (optional)
   - Where can this be embedded? → **Only on sites I choose**
   - Add your domains:
     - `localhost:5173` (development)
     - `localhost:8788` (Lovable preview)
     - `*.lovable.app` (Lovable staging)
     - `yourdomain.com` (production)

3. **Get Video ID:**
   - Video URL: `https://vimeo.com/123456789`
   - Video ID: `123456789` ← This goes in Strapi

### Why This Separation Matters:
- **Security:** Videos can only be embedded on approved domains
- **Scalability:** Vimeo handles video delivery/CDN
- **Simplicity:** Strapi only stores metadata
- **Control:** Update video settings in Vimeo without touching Strapi

---

## 🔑 Environment Variables

Add to your Lovable project (Cloud secrets):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `STRAPI_API_URL` | Your Strapi instance URL | `https://your-strapi.railway.app` |
| `STRAPI_API_TOKEN` | Read-only API token | `abc123...` |

**In Strapi (.env):**
```env
DATABASE_URL=postgresql://...
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=random-salt
JWT_SECRET=jwt-secret
```

---

## 🧪 Testing the Integration

### 1. Create Test Content in Strapi:

**Course:**
```json
{
  "title": "Web3 Fundamentals",
  "slug": "web3-fundamentals",
  "shortDescription": "Learn the basics of Web3",
  "level": "Beginner",
  "category": "Foundations",
  "isFree": true,
  "status": "published"
}
```

**Module:**
```json
{
  "title": "Introduction to Blockchain",
  "description": "Understanding the core technology",
  "order": 1,
  "unlockRule": "instant"
}
```

**Lesson:**
```json
{
  "title": "What is a Blockchain?",
  "description": "The fundamental concept explained",
  "order": 1,
  "vimeoVideoId": "123456789",
  "duration": "10:30",
  "accessLevel": "free",
  "isPreview": true
}
```

### 2. Test API Endpoints:

```bash
# Get all courses
curl https://your-strapi.com/api/courses?populate=*

# Get single course with modules
curl https://your-strapi.com/api/courses/web3-fundamentals?populate[modules][populate]=lessons

# Get modules for a course
curl https://your-strapi.com/api/modules?filters[course][id][$eq]=1&populate=lessons
```

---

## ✅ What's Connected After This Setup

- ✅ Strapi content types defined
- ✅ Course → Module → Lesson hierarchy
- ✅ API accessible from frontend
- ✅ Vimeo integration conceptually complete
- ✅ Frontend hooks and components ready

## ❌ What's NOT Connected Yet

- ❌ User enrollment tracking (needs Supabase integration)
- ❌ Progress tracking (lesson completion)
- ❌ Payment/access gating (needs Stripe/payment integration)
- ❌ Certificates generation
- ❌ Quiz/assessment system

## 📝 Next Steps After Strapi Is Live

1. **Add Strapi secrets** to Lovable Cloud
2. **Create test content** in Strapi admin
3. **Test API calls** from frontend
4. **Integrate enrollments** with Supabase (future)
5. **Add progress tracking** (future)

---

## 📚 Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi Cloud](https://cloud.strapi.io)
- [Vimeo Developer Docs](https://developer.vimeo.com)
- [Vimeo Player SDK](https://github.com/vimeo/player.js)

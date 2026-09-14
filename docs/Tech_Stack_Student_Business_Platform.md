# Tech Stack Document

## Project: StudentConnect (Student & Small Business Platform)
**Version:** 1.0 (Draft)
**Date:** August 21, 2026

---

## 1. Guiding Principles for Stack Choice
- **Free/low-cost to run** — the platform itself is payment-free, so hosting/infra costs should stay minimal in v1.
- **Fast to build (MVP-first)** — favor tools that get you to a working product quickly over "perfect" architecture.
- **Easy to maintain solo or with a small team** — avoid over-engineering; pick boring, well-documented tech.
- **Scalable later** — choices shouldn't box you in if the platform grows.

---

## 2. Frontend

| Layer | Choice | Why |
|---|---|---|
| Framework | **React** (with Next.js) | Huge ecosystem, easy to find help/tutorials, Next.js gives you routing + server rendering out of the box |
| Styling | **Tailwind CSS** | Fast to style, consistent design, no fighting custom CSS |
| State management | React built-in state / Context (v1) | No need for Redux at this scale yet |

---

## 3. Backend

| Layer | Choice | Why |
|---|---|---|
| Backend approach | **Supabase** or **Firebase** (Backend-as-a-Service) | Gives you auth, database, and file storage out of the box — drastically cuts v1 build time |
| Alternative (if you want more control) | **Node.js + Express** with a hosted Postgres DB (e.g., Supabase's DB, Railway, or Render) | More flexibility if BaaS limits become a problem later |

*Recommendation: start with Supabase — it includes Postgres, auth, storage, and row-level security, and has a generous free tier.*

---

## 4. Database
- **PostgreSQL** (via Supabase) — relational DB fits this data well: users, profiles, projects, applications, messages, feedback are all naturally relational tables.

Core tables (high-level):
- `students` (profile info, skills, availability)
- `businesses` (profile info, industry, needs)
- `projects` (postings created by businesses)
- `applications` (student applies to project)
- `messages` (student ↔ business communication)
- `feedback` (ratings/reviews after project completion)
- `admins` (approval/moderation accounts)

---

## 5. Authentication
- **Supabase Auth** (or Firebase Auth) — handles email/password signup, email verification, and session management without building it from scratch.
- Role-based access: student / business / admin, enforced via database rules + backend checks.

---

## 6. File Storage
- **Supabase Storage** (or Firebase Storage / AWS S3) — for deliverables, portfolio files, and profile documents.

---

## 7. Messaging
- **v1 (simple):** Store messages as rows in a `messages` table, poll or use Supabase's real-time subscriptions for live updates.
- **Later:** Could upgrade to a dedicated service (e.g., Stream, Sendbird) if messaging volume grows significantly.

---

## 8. Admin Dashboard
- Build as a protected section of the same Next.js app (role-gated route), rather than a separate app — keeps v1 simple.

---

## 9. Hosting & Deployment

| Component | Choice | Why |
|---|---|---|
| Frontend + backend (Next.js) | **Vercel** | Free tier, zero-config deploys, built for Next.js |
| Database/Auth/Storage | **Supabase** | Free tier covers early-stage usage |
| Domain | Any registrar (Namecheap, Google Domains, etc.) | Low-cost, easy setup |

---

## 10. Dev Tools
- **GitHub** — version control + collaboration
- **GitHub Actions** (optional, later) — CI/CD for automated deploys
- **Figma** — for wireframing/UI design before building screens
- **Linear or Trello** — lightweight task/project tracking for your own team

---

## 11. Analytics (Phase 2+)
- **Plausible** or **PostHog** — privacy-friendly, simple analytics to track signups, project completions, engagement.

---

## 12. Estimated Monthly Cost (v1, low usage)
| Service | Free tier covers |
|---|---|
| Vercel | Yes, generous free tier for small projects |
| Supabase | Yes, free tier includes DB, auth, storage up to reasonable limits |
| Domain | ~$10–15/year (only real fixed cost) |

**Bottom line: v1 can realistically run at near-$0/month cost until usage grows significantly.**

---

## 13. Summary Stack at a Glance
- **Frontend:** React + Next.js + Tailwind CSS
- **Backend/DB/Auth/Storage:** Supabase (Postgres + Auth + Storage + Realtime)
- **Hosting:** Vercel (app) + Supabase (backend)
- **Messaging:** Supabase real-time tables (v1)
- **Admin panel:** Built into the same Next.js app, role-gated
- **Dev tools:** GitHub, Figma, Trello/Linear

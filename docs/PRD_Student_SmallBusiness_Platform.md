# Product Requirements Document (PRD)

## Project: StudentConnect (working title)
*A free platform connecting students with small businesses for real-world project work*

**Version:** 1.0 (Draft)
**Date:** August 20, 2026
**Owner:** [Your Name]

---

## 1. Overview

### 1.1 Problem Statement
- **Students** need real-world, hands-on experience to build skills and portfolios, but access to genuine projects is limited, often gatekept by paid internships or personal connections.
- **Small businesses** need help with marketing, operations, tech, design, and growth tasks, but can't afford consultants or agencies.

### 1.2 Solution
A free web platform where students take on real projects for small businesses — not simulations, not one-off gigs, but structured work (short-term projects or ongoing mentoring engagements) that create measurable value for the business and real experience for the student.

### 1.3 Core Principle
**Zero payment, in either direction.** Businesses never pay for the help; students are not paid by businesses. Value exchange is: business gets free help → student gets real experience, references, and portfolio material.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Get students real project experience | # of students matched to a project within 30 days of signup |
| Deliver real value to small businesses | # of businesses reporting a completed deliverable / measurable outcome |
| Build a sustainable pipeline | Repeat business signups; student retention across multiple projects |
| Prove trust & quality | Average rating from businesses and students post-project |

### Non-Goals (v1)
- Not a paid freelance marketplace.
- Not a job-placement guarantee.
- Not targeting large enterprises — small businesses only.

---

## 3. Target Users

### 3.1 Students
- College/university students (or advanced high schoolers, TBD) looking for real-world experience in marketing, business, design, tech, or operations.
- Motivated by: portfolio building, references, resume material, practical skill-building.

### 3.2 Small Business Owners
- Local or early-stage business owners who need help but can't afford paid consultants.
- Motivated by: free expertise, fresh perspective, extra hands.

### 3.3 Admin/Moderator (You / your team)
- Reviews signups, approves projects, monitors quality, resolves disputes.

---

## 4. User Roles & Permissions

| Role | Capabilities |
|---|---|
| Student | Create profile, browse/apply to projects, message business, submit work, receive feedback/rating |
| Business | Create profile, post a project/need, review student applicants, select student(s), message, rate work |
| Admin | Approve/reject signups, approve/reject project postings, moderate messages, resolve disputes, view platform analytics |

---

## 5. Core Features (v1 Scope)

### 5.1 Onboarding & Profiles
- **Student signup:** name, school, skills/interests, availability (hours/week), portfolio links (optional), short bio.
- **Business signup:** business name, industry, what they need help with, business size, location, short description.
- Email verification required for both.
- Admin approval step before profiles go live (fraud/quality control for v1 — can be automated later).

### 5.2 Project Posting (Business side)
- Business creates a "project" or "need" listing:
  - Title, category (marketing, social media, bookkeeping, web/tech, design, research, etc.)
  - Description of the work
  - Estimated time commitment / duration (e.g., "3 hrs/week for 6 weeks")
  - Skills needed
- Listings go into an admin approval queue before publishing.

### 5.3 Discovery & Matching (Student side)
- Students browse open project listings (filterable by category, time commitment, skill).
- Students apply to projects with a short note (why they're a fit).
- **v1 approach:** manual/light-touch matching — business reviews applicants and selects; no automated algorithmic matching yet (reduces build complexity, improves match quality early on).

### 5.4 Messaging
- In-platform messaging between matched student(s) and business — no need to exchange personal contact info immediately.
- Admin can view flagged conversations (report/abuse feature).

### 5.5 Project Workspace (lightweight)
- Simple shared space per matched project:
  - Task/milestone checklist
  - File sharing (deliverables)
  - Status field (Not Started / In Progress / Completed)

### 5.6 Completion & Feedback
- At project end, both sides fill a short feedback form:
  - Business rates student's work + writes optional reference/testimonial
  - Student rates the experience
- Completed projects appear on student's public profile (portfolio-building).

### 5.7 Admin Dashboard
- Approve/reject: student signups, business signups, project postings
- View flagged content/reports
- Basic analytics: # active students, # active businesses, # completed projects

---

## 6. Out of Scope for v1 (Future Phases)
- Payments/payment processing (explicitly never planned — stays free)
- Automated AI-based matching algorithm
- Mobile app (native)
- Video calls built into platform (use external tools like Zoom/Meet initially)
- Certifications/badges system
- Multi-language support

---

## 7. User Flows (High-Level)

**Student flow:**
Sign up → Verify email → Await admin approval → Build profile → Browse projects → Apply → Get matched → Work in shared workspace → Submit deliverable → Receive feedback → Profile updated with completed project

**Business flow:**
Sign up → Verify email → Await admin approval → Post a project → Review applicants → Select student(s) → Collaborate via workspace/messaging → Mark complete → Leave feedback

---

## 8. Trust & Safety Considerations
- Admin approval gate on all signups and project postings (v1 quality control).
- Reporting/flagging mechanism for inappropriate messages or behavior.
- Clear terms of service: this is unpaid, real-world experiential work — not employment. Businesses shouldn't treat students as free full-time labor; scope and time commitment must be disclosed upfront.
- Guidance/limits on project scope to prevent exploitation (e.g., max hours/week suggested caps).

---

## 9. Technical Considerations (High-Level, Non-Binding)
- Standard web app: frontend + backend + database + auth.
- Needs: user auth (email verification), file storage (for deliverables), messaging system, admin panel.
- Suggested lean stack for v1 (subject to your/your team's preference): a frontend framework, a backend framework or BaaS (e.g., Supabase/Firebase for speed), and standard file storage (e.g., S3-compatible).
- Should be built to scale in stages — don't over-engineer v1.

---

## 10. Open Questions (To resolve before/during build)
1. Age range for students — university only, or high school too? (Affects legal/consent considerations.)
2. Do businesses need any verification (e.g., proof of business registration) to prevent fake/spam postings?
3. What's the expected project duration range — one-off short tasks, or multi-week engagements, or both?
4. Who moderates/admins the platform day-to-day — just you, or a small team?
5. Any liability/legal disclaimer needed given work is unpaid and informal (recommend consulting a template ToS/liability waiver)?
6. Geographic scope — local to your city/region first, or open nationally/globally from day one?

---

## 11. Milestones (Suggested Phasing)

| Phase | Scope |
|---|---|
| **Phase 0** | Finalize PRD, resolve open questions, define target geography/user base |
| **Phase 1 (MVP)** | Signup/profiles, admin approval, project posting, browsing, applying, messaging — no workspace yet |
| **Phase 2** | Project workspace, feedback/rating system, student public portfolio |
| **Phase 3** | Analytics dashboard, refined matching, community features (forums, resources) |

---

## 12. Appendix: Key Decisions Already Made
- Free for small businesses — no payment required, ever.
- Open access: any student can join and work on projects; any small business can sign up as a client.
- Focus is *real* project work, not simulated exercises — and can include ongoing consulting/mentoring, not just one-off gigs.

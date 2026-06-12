# AnganSakti 360 — Hackathon Jury Presentation Guide

**Women Development & Child Welfare Department · Government of Andhra Pradesh**  
**Pilot: Tirupati District · Anganwadi Digital Governance Platform**

---

## Document purpose

This guide helps you **present AnganSakti 360 to hackathon jury members** in a clear, page-by-page manner. It starts with **the problem the platform solves** and the **pages that directly address citizen complaints and accountability**, then covers service visibility, supervisor workflows, and a recommended live demo script.

**Suggested presentation time:** 12–18 minutes (problem + demo) + 5 minutes Q&A.

---

# Part 1 — Introduction (What to say in the first 2 minutes)

## 1.1 One-line pitch

**AnganSakti 360** is an AI-enabled, evidence-first digital operating system for Andhra Pradesh Anganwadi centers that connects **citizens, field workers, supervisors, and district/state administration** on one platform—with a dedicated **Public Portal** where citizens can share service experiences *or* report issues that require formal resolution and supervisor accountability.

## 1.2 Who built this for?

| Stakeholder | Role in the system |
|-------------|-------------------|
| **Public User (Citizen)** | Parents, pregnant/lactating women, guardians, community members—one login for all |
| **Anganwadi Worker** | Daily operations, attendance, service proof, preschool sessions—not grievance handlers for public complaints |
| **Supervisor** | Primary investigator for **public grievances** with full evidence packages and AI summaries |
| **District / State Admin** | Escalations, compliance, analytics, statewide transparency |

## 1.3 What makes this different from a generic feedback app?

1. **Evidence-first grievances** — Citizens upload photos, video, voice, OCR, WhatsApp imports, QR context, and documents *before* investigation starts, so supervisors do not depend on incomplete verbal reports.
2. **Supervisor-first routing** — Public complaints go to **Supervisor Review**, not to Anganwadi workers, avoiding conflict of interest and incomplete field clarification loops.
3. **Two clear citizen paths** — **Share Experience** (service improvement, no ticket) vs **Report Issue** (tracked grievance with timeline and closure proof).
4. **Full transparency** — Citizens see AI analysis, officer actions, resolution evidence, and can confirm, reopen, or escalate.
5. **Integrated service visibility** — Same portal shows meals, preschool, nutrition, and center activity when the account is linked to a center.

## 1.4 Demo access (pilot)

| Role | How to log in | Typical home URL |
|------|---------------|------------------|
| **Public User** | Login → select **Public User** → Enter Portal | `/beneficiary` |
| **Supervisor** | Login → **Supervisor** | `/supervisor` |
| **Anganwadi Worker** | Login → **Worker** | `/worker/dashboard` |

**Public User demo credentials (pilot screen):** Phone `9876543210` · Password `demo1234`  
**Demo citizen:** Sunita Rao · Center: Alipiri (`AWC-TPT-01`) · Tirupati

---

# Part 2 — The Problem (What to explain before opening the app)

## 2.1 Real-world problems in Anganwadi service delivery

Explain these pain points to the jury—the pages in Part 3 exist because of them:

| # | Problem | Why it matters |
|---|---------|----------------|
| **P1** | **Complaints get lost or delayed** | Parents and community members report meal gaps, safety concerns, or worker conduct issues through informal channels (phone, verbal visits) with no tracking ID or SLA. |
| **P2** | **No proof at submission time** | Officers investigate weeks later without photos, timestamps, or location context—leading to “he said / she said” disputes. |
| **P3** | **Wrong routing** | Grievances often land on the same Anganwadi worker who may be the subject of the complaint—citizens fear retaliation and supervisors lack independent evidence. |
| **P4** | **No visibility after submit** | Citizens do not know if anyone read their complaint, what action was taken, or when it closed. Trust in government services erodes. |
| **P5** | **Feedback mixed with grievances** | Praise, suggestions, and life-safety issues are treated the same—creating unnecessary tickets for appreciation and under-prioritizing urgent issues. |
| **P6** | **Language and access barriers** | Rural citizens prefer Telugu voice notes, WhatsApp, or handwritten notes—not only English forms in an office. |
| **P7** | **Supervisors lack decision support** | Large queues with no AI severity hint, no structured evidence bundle, and no standard escalation path to district. |

## 2.2 How AnganSakti 360 answers the problem

| Problem | Platform answer |
|---------|-----------------|
| P1, P4 | **Report Issue** → grievance ID, notifications, **My Requests**, full timeline |
| P2 | **PublicEvidenceUpload** on both citizen paths; evidence stored on complaint record |
| P3 | **Supervisor-first** workflow; worker dashboard does not own public grievance queue |
| P5 | **Share Experience** vs **Report Issue** — separate data models and outcomes |
| P6 | EN/TE/HI, voice, OCR, WhatsApp/QR demo imports, omnichannel-ready architecture |
| P7 | **Public Grievance Center** with New / In Review / Need Evidence / Resolved + AI summary |

## 2.3 Design principle for jury

> **Same portal can accept evidence for both appreciation and complaints—but only “Report Issue” creates accountability and supervisor investigation.**

---

# Part 3 — Problem-Related Pages (Explain these FIRST)

These pages are the **core of your hackathon story**. Walk the jury through them in this order.

---

## 3.1 Login — `/` (Index)

**What it is:** Government-branded entry with role selection.

**What to say:**
- One application serves all roles; citizens choose **Public User**.
- Session persists locally for demo; production would use AP state identity / mobile OTP.

**Jury takeaway:** Single front door for WDCW digital services.

---

## 3.2 Public Control Room (Dashboard) — `/beneficiary`

**What it is:** Citizen home after login—personalized by “Who Are You Today?” (parent, pregnant woman, guardian, etc.).

**Key widgets for the problem story:**

| Widget | Purpose for jury |
|--------|------------------|
| **My Experiences** | Counts: Submitted, Appreciated, Included in Improvements — *non-grievance* feedback |
| **My Requests** | Counts: Submitted, Under Review, Resolved — *formal grievances only* |
| **Center Trust Score** | Aggregates satisfaction from experiences + service data |
| **Quick actions** | **Share Experience** and **Report Issue** side by side |

**What to say:**
- The dashboard makes the **two paths obvious** before citizens scroll the whole menu.
- Recent request rows link to full detail for transparency.

**Demo tip:** Select “Parent / Caregiver” in **Who Are You Today** to show personalized links.

---

## 3.3 Share Experience — `/beneficiary/feedback`

**Question this page answers:** *“How was your experience with the service?”*

**What it is:** Lightweight **service experience collection**—opinions, appreciation, suggestions, satisfaction. **Does not create a grievance or assign a supervisor.**

**Fields shown to citizen:**

| Field | Examples |
|-------|----------|
| Submitted As | Parent, pregnant woman, guardian, community member, etc. |
| Category | Meals, Preschool Activities, Learning Experience, Nutrition Services, Infrastructure Experience, Worker Support, Communication, Suggestions |
| Experience Type | Appreciation, Suggestion, Concern (non-actionable), Satisfaction, General |
| Rating | 1–5 stars |
| Comment | Free text |
| Optional Evidence | Photo, video, voice, OCR, WhatsApp, QR, document — **context only** |

**After submit (AI pipeline):**
- Sentiment: Positive / Neutral / Concern  
- Satisfaction score  
- Experience summary and suggested improvements  
- Status: **Recorded → Acknowledged → Included in Service Improvement** (when positive)  
- Feeds: Center Trust Score, Public Insights, Service Analytics  

**Notifications examples:**
- “Thank you for sharing your experience.”  
- “Your suggestion improved center services.”  

**Where history lives:** `/public/my-experiences`

**What to say to jury:**
- A parent can upload a classroom photo with praise without opening a legalistic complaint form.
- Evidence is allowed but **does not trigger punishment workflow**—it enriches analytics.

**Do NOT say:** This page escalates to workers or creates CMP tickets.

---

## 3.4 Report Issue — `/beneficiary/omnichannel-feedback`

**Question this page answers:** *“Did something happen that needs action?”*

**What it is:** **Official grievance and accountability portal.** Creates a tracked resolution process with grievance ID and supervisor queue.

**Fields shown to citizen:**

| Field | Examples |
|-------|----------|
| Submitted As | Same six public types |
| Issue Category | Meals Not Delivered, Worker Conduct, Nutrition Missing, Water Issue, Toilet Issue, Safety Concern, Infrastructure Problem, Delay in Service, Other Public Issues |
| Severity | Low / Medium / High / Critical |
| Resolution Preference | Supervisor investigation, urgent same-day, district escalation if needed |
| Description | Required narrative |
| Evidence | Encouraged — same upload component as Share Experience |
| Consent | DPDP-style consent for processing |
| Anonymous | Optional — hides name from field staff; tracking ID retained for supervisors |

**After submit (AI pipeline):**
- Issue classification, severity prediction, urgency, evidence validation hint  
- Confidence score and recommended resolution path  
- **Grievance ID** created (`CMP-*`)  
- Status flow: AI Review → **Supervisor Investigation** (not worker)  

**Workflow string for jury:**
```
Public Submission → AI Review → Supervisor Investigation → Resolution → Public Confirmation → Closure
```

**Notifications examples:**
- “Your issue is under supervisor review.”  
- “Resolution uploaded.” (when supervisor attaches proof)  

**Where history lives:** `/public/my-requests` and `/beneficiary/request/:id`

**What to say to jury:**
- This is the Andhra Pradesh **accountability** path—every submission is investigatable with proof.
- Anganwadi workers are **not** assigned as grievance owners for these cases.

---

## 3.5 Shared evidence upload (component, both pages)

**Component:** `PublicEvidenceUpload` — one implementation, two workflows after submit.

| Method | Use case |
|--------|----------|
| Photo / Video | Meal not served, infrastructure damage |
| Voice | Telugu audio note transcribed for AI |
| OCR | Handwritten register or wall notice |
| WhatsApp (demo import) | Chat thread as evidence |
| QR (demo) | Center verification context |
| Document | PDF / office letter |

**What to say:** We did not duplicate upload logic—citizens learn one pattern; the system branches only after submit.

---

## 3.6 My Experiences — `/public/my-experiences`

**What it is:** History of all **Share Experience** submissions only.

**Buckets:**

| Bucket | Meaning |
|--------|---------|
| Submitted | All experiences logged |
| Appreciated | Positive sentiment / appreciation type |
| Included in Improvements | Fed into service improvement planning |

**Row opens:** `/public/experience/:id` — original text, evidence, AI summary, improvement message, **no grievance timeline**.

**Jury takeaway:** Proves the platform separates **voice of citizen** from **formal complaints**.

---

## 3.7 My Requests — `/public/my-requests`

**What it is:** History of **Report Issue / grievance** submissions only (plus linked omnichannel grievances).

**Buckets (transparency engine):**

| Bucket | Meaning |
|--------|---------|
| Submitted | Received by system |
| Under Review | Supervisor or AI processing |
| Action Taken | Officer logged action |
| Resolved / Closed | Resolution or citizen confirmed |

**Table shows:** Reference ID, submitted as, channel, date, status, link to **View**.

**Banner text:** Grievances investigated by **supervisors** using uploaded evidence.

**Jury takeaway:** This is the citizen’s **case tracker**—like tracking a government service request.

---

## 3.8 Experience detail — `/public/experience/:id`

**What citizen sees:**
- Original submission and optional evidence  
- AI experience summary (sentiment, satisfaction score, suggested improvements)  
- Status: Recorded / Acknowledged / Included in Service Improvement  
- Note that data feeds trust score and analytics—**no supervisor ticket**  

**Link at bottom:** “Need formal action? Report Issue →”

---

## 3.9 Request / grievance detail — `/beneficiary/request/:id`

**What it is:** The **most important transparency page** for accountability.

**Sections to show jury:**

| Section | What to point at |
|---------|------------------|
| Metadata | Submitted as, category, severity, center, channel, date |
| Original submission | Full citizen text |
| Uploaded evidence | Gallery: photos, voice transcript, documents |
| AI explainability | Classification, confidence, urgency, reasons |
| GPS / evidence validation | Demo trust indicators on media |
| SLA visibility | Target hours, due date, breach hint |
| Resolution timeline | Submitted → AI Reviewed → Supervisor Reviewing → Action Taken → Resolution Uploaded → Citizen Confirmation → Closed |
| Supervisor actions | Notes, timestamps, resolution attachments |
| Resolution proof | Before/after images, documents |
| Citizen actions | **Satisfied**, **Reopen**, **Escalate to district** |

**What to say:** This is what “digital government transparency” looks like—citizens are not blind after they complain.

---

## 3.10 Grievances list — `/beneficiary/complaints`

**What it is:** Card list of formal complaints for the logged-in citizen.

- Progress chips per complaint  
- Tap → same detail as `/beneficiary/request/:id`  
- **Raise new issue** → Report Issue page  

---

## 3.11 Track Resolution — `/beneficiary/status`

**What it is:** Simplified tracking focused on **open grievances** and citizen confirmation.

**Actions:**
- **Confirm resolution** → closes case, may trigger satisfaction survey  
- **Reopen** → returns to supervisor review (not worker)  
- Link to full request detail on each card  

**Jury takeaway:** Closure requires **citizen confirmation**, not only officer marking “done.”

---

## 3.12 Communication Center — `/beneficiary/notifications`

**What it is:** In-app alerts driving citizens back to detail pages.

| Notification | When |
|--------------|------|
| Thank you for sharing your experience | After Share Experience |
| Your suggestion improved center services | Positive experience included in improvements |
| Your issue is under supervisor review | After Report Issue |
| Resolution uploaded | Supervisor attaches proof |
| Escalation recorded | Citizen escalates to district |

Each notification includes **actionUrl** to the right page.

---

## 3.13 Help & Support — `/beneficiary/help`

**What it is:** Plain-language FAQ distinguishing **Share Experience** vs **Report Issue**.

Use this page if jury asks “What should citizens use when?”

---

## 3.14 Supervisor: Public Grievance Center — `/supervisor/public-grievance-center`

**Show this AFTER citizen flow** to complete the accountability story.

**What it is:** Primary queue for **public grievances** routed to supervisors.

| Queue tab | Meaning |
|-----------|---------|
| **New** | AI-classified, awaiting supervisor assign |
| **In Review** | Supervisor actively investigating |
| **Need Evidence** | Supervisor requested more proof from citizen |
| **Resolved** | Pending citizen confirmation or closed |

**Actions on each card:** Open Details, Assign, Request Evidence, Escalate, Resolve.

**What to say:**
- Citizen evidence and AI summary arrive here as a **complete package**.
- Workers do not appear as owners for these public cases.

**Pair with:** `/supervisor/grievance/:id` for deep investigation UI.

---

## 3.15 District: Escalated grievances — `/district-admin/escalated-grievances`

**What it is:** Cases escalated from supervisor or citizen when policy/SLA requires district intervention.

**Jury takeaway:** Multi-level government escalation is designed in, not an afterthought.

---

## 3.16 State transparency portal (optional) — `/public/transparency`

**What it is:** Public statewide metrics and commitments (can demo without login).

**Use if:** Jury asks about openness beyond individual case tracking.

---

# Part 4 — Supporting Pages (Service visibility — after problem story)

Explain briefly that AnganSakti is not “only complaints”—citizens also **see services delivered**.

| Page | Route | One-line purpose |
|------|-------|------------------|
| My Services | `/beneficiary/my-child` | Child/service summary + evidence table |
| Today's Services | `/beneficiary/daily-journey` | Attendance, meal, preschool timeline |
| Center Services | `/beneficiary/activities` | Activity feed from worker logs |
| Nutrition | `/beneficiary/nutrition` | Nutrition program view |
| Center Timeline | `/beneficiary/center-timeline` | Public center activity timeline |
| Center Health | `/beneficiary/center-health` | Center journey / health indicators |
| Surveys | `/beneficiary/surveys` | Post-closure satisfaction |
| Public Profile | `/beneficiary/profile` | Language, logout, submission history types |
| Center Command | `/center-command/:id` | Shared center journey (multi-role) |

**What to say:** Service visibility builds trust; grievance handling protects rights when services fail.

---

# Part 5 — Worker & Admin (One slide each)

## Worker (`/worker/*`)

- Attendance with GPS, activity logging, session recording, service proof uploads.  
- **Complaints page is informational only** — directs to supervisor grievance center.  

## Supervisor (`/supervisor/*`)

- Center monitoring, classroom intelligence, coaching, **Public Grievance Center**.  

## District / State

- Analytics, compliance, escalated grievances, executive KPIs.  

---

# Part 6 — Recommended live demo script (8–10 minutes)

| Step | Role | Action | What jury should notice |
|------|------|--------|-------------------------|
| 1 | Public User | Login → Dashboard | Two widgets: Experiences vs Requests |
| 2 | Public User | **Share Experience** → rate 5 stars → optional photo → submit | Thank-you message; appears in My Experiences |
| 3 | Public User | **Report Issue** → Meals Not Delivered → attach photo → AI preview → submit | Grievance ID; notification |
| 4 | Public User | **My Requests** → View detail | Timeline, evidence, AI block |
| 5 | Supervisor | Login → **Public Grievance Center** | New queue shows citizen case |
| 6 | Supervisor | Assign → add action → upload resolution note | — |
| 7 | Public User | Refresh request detail | Supervisor action + resolution visible |
| 8 | Public User | **Satisfied** or Track Resolution confirm | Case closure loop complete |

---

# Part 7 — Technical highlights (if jury asks “How?”)

| Layer | Implementation |
|-------|----------------|
| Frontend | React, TypeScript, Vite, Tailwind, government UI shell |
| State | AppContext + IndexedDB persistence (feedback, complaints, experiences, notifications) |
| AI (demo) | Client-side grievance engine + experience sentiment analysis |
| Data models | `CitizenExperienceRecord` vs `ComplaintRecord.grievance` bundle |
| Routing | `/beneficiary/*` (legacy path), `/public/my-experiences`, `/public/my-requests` |
| i18n | English, Telugu, Hindi |

**Production path (verbal):** AP state auth, cloud STT/vision, SMS/WhatsApp gateways, supervisor mobile app sync.

---

# Part 8 — Closing statement for jury

> **AnganSakti 360 turns Anganwadi citizen feedback from informal complaints into evidence-backed, supervisor-accountable, transparent public service—with a separate channel for everyday experience so government can both listen and act.**

---

# Appendix A — Quick route reference (Public User)

| Route | Page name |
|-------|-----------|
| `/` | Login |
| `/beneficiary` | Public Control Room |
| `/beneficiary/feedback` | Share Experience |
| `/beneficiary/omnichannel-feedback` | Report Issue |
| `/public/my-experiences` | My Experiences |
| `/public/my-experiences` | My Experiences list |
| `/public/experience/:id` | Experience detail |
| `/public/my-requests` | My Requests |
| `/beneficiary/request/:id` | Grievance / request detail |
| `/beneficiary/complaints` | Grievances list |
| `/beneficiary/status` | Track Resolution |
| `/beneficiary/notifications` | Communication Center |

---

# Appendix B — Glossary for jury

| Term | Meaning |
|------|---------|
| **Public User** | UI label for citizen login (code role: `beneficiary`) |
| **Share Experience** | Non-grievance feedback for analytics and trust |
| **Report Issue** | Formal grievance with supervisor workflow |
| **WDCW** | Women Development & Child Welfare Department, AP |
| **AWC** | Anganwadi Center |
| **DPDP** | Digital personal data protection consent on grievance form |

---

*Document prepared for hackathon jury presentation · AnganSakti 360 · May 2026*

# AnganSakti 360 — Parent / Caregiver Portal (Full Overview)

This document describes **only the parent (caregiver) experience** in the hackathon build. In the codebase the role is stored as `beneficiary`; on the login screen it appears as **“Parent / Caregiver”** (Telugu: తల్లిదండ్రి / సంరక్షకుడు). There is **no separate `parent` role** — parent and beneficiary are the same portal.

---

## 1. How to log in (parent only)

| Step | Action |
|------|--------|
| 1 | Open the app (dev: `http://localhost:5173/` or your deployed URL). |
| 2 | On the sign-in card, open **Access category** and select **Parent / Caregiver**. |
| 3 | Enter **phone** and **password** (demo accepts any values after a short delay; defaults on the form are worker credentials — change role, not necessarily phone). |
| 4 | Click **Continue**. You are redirected to `/beneficiary` (Citizen Services Portal / Control Room). |

### Demo parent profile (loaded automatically)

| Field | Value |
|-------|--------|
| Display name | **Sunita Rao** |
| User ID | `B-1001` |
| Phone (profile) | `9876501234` |
| Anganwadi center | **Alipiri Center** (`AWC-TPT-01`) |
| District | Tirupati |
| Enrolled children | **Aarav Rao** (4), **Priya Rao** (3) |

**Authentication note:** `src/services/auth/session.ts` does not validate phone/password against a server. It waits ~800ms and builds the user from `demoUsers.beneficiary` in `src/data/mockData.ts`. Session is stored in `localStorage` under `angansakti.user`.

### Logout

**Profile** (`/beneficiary/profile`) → **Logout** → returns to `/` (login).

---

## 2. Portal purpose (what parents can do)

Parents use AnganSakti 360 to:

- See **today’s center services** (nutrition, attendance, activities logged by the worker).
- Submit **feedback** (text, voice, photo, star rating) with **AI translation and classification**.
- File or track **grievances** with a visible **lifecycle** and **confirm resolution**.
- Send feedback through **multiple channels** (IVR, WhatsApp, QR, SMS, OCR, photo) in one unified flow.
- Complete **satisfaction surveys** that feed center **Service Quality Index (SQI)**.
- Read **notifications** (in-app; demo also models SMS/WhatsApp/push).
- View **center service journey** (transparency timeline shared with officials).
- Switch **language** (English, Telugu, Hindi).

---

## 3. Navigation and layout

After login, the parent shell (`AppShell`) provides:

- **Top bar:** Government branding, page title, language toggle.
- **Sidebar (desktop):** Full menu from `src/lib/govNav.ts` → `GOV_NAV.beneficiary`.
- **Bottom bar (mobile):** First five items from the **Operations** section for quick access.

### Sidebar menu (all parent routes)

| Section | Menu label (i18n key) | Route |
|---------|------------------------|--------|
| **Operations** | Control Room | `/beneficiary` |
| | Activities | `/beneficiary/activities` |
| | Status | `/beneficiary/status` |
| **Citizen feedback** | Feedback (any channel) | `/beneficiary/omnichannel-feedback` |
| | Feedback | `/beneficiary/feedback` |
| | Complaints | `/beneficiary/complaints` |
| | Surveys | `/beneficiary/surveys` |
| **Communication** | Communication center | `/beneficiary/notifications` |
| | Profile | `/beneficiary/profile` |

**Home after login:** `/beneficiary` (`ROLE_HOME.beneficiary` in `src/lib/rolePaths.ts`).

---

## 4. Page-by-page functionality

### 4.1 Control Room — `/beneficiary`

**File:** `src/pages/beneficiary/BeneficiaryDashboard.tsx`

**Purpose:** Parent home dashboard (“Citizen Services Portal”).

**What it shows:**

- Scheme notice / help banner (government messaging).
- Greeting with parent name, center name, number of enrolled children.
- **Quick actions:** Omnichannel feedback, Complaints.
- **Child cards:** Name, age, child ID for each enrolled child.
- **Today’s snapshot (4 tiles):**
  - Nutrition Today — “Served” / “Pending” (from worker activity logs at the center).
  - Attendance — “Present” if an attendance-type activity exists today.
  - Activities — count of activities logged today at the center.
  - Grievances — count of **open** complaints for this parent.
- **Classroom photo** — latest worker activity with an image at the center.
- **Prominent links:**
  - Submit Feedback (voice · text · photo · rating).
  - File Complaint.
  - Center service journey → `/center-journey/AWC-TPT-01`.
  - Satisfaction surveys → `/beneficiary/surveys`.
- **Announcements** — static demo items from `mockAnnouncements`.

**Data sources:** `AppContext` → `user`, `activities`, `complaints`, filtered by `user.centerId` and `user.id`.

---

### 4.2 Center Services (Activities) — `/beneficiary/activities`

**File:** `src/pages/beneficiary/Activities.tsx`

**Purpose:** Transparency into what the Anganwadi worker logged at the parent’s center.

**What it shows:**

- List (up to 20) of **center activities**: type, timestamp, children present, description, verification status badge.
- Optional **service confidence %** when `serviceMetrics` exist on the activity.

**Parent value:** Confirms services (nutrition, preschool, etc.) were recorded and AI-verified in the field.

---

### 4.3 Grievance Status — `/beneficiary/status`

**File:** `src/pages/beneficiary/Status.tsx`

**Purpose:** Track every grievance filed by this parent and close the loop when resolved.

**What it shows (per complaint):**

- Complaint ID, title, current **status** (human-readable).
- **ComplaintTimeline** — visual lifecycle (intake → classification → worker → supervisor → resolution → closed).
- **Resolution note** from worker/supervisor when available.
- **SLA due** date/time.
- **Confirm Resolution** button when status is `resolution` or `beneficiary_confirmation` → sets complaint to `closed` with `beneficiaryConfirmed: true` and may trigger a **post-closure survey** via platform logic.

**Empty state:** “No active grievance tracking.”

---

### 4.4 Feedback (in-app) — `/beneficiary/feedback`

**File:** `src/pages/beneficiary/Feedback.tsx`

**Purpose:** Primary in-app feedback form with AI processing.

**Features:**

- **Star rating** (1–5).
- **Text** (placeholders in English / Telugu / Hindi based on app language).
- **Voice input** — `speechToText` demo; transcript fills the text area.
- **Photo upload** — preview before submit.
- **Submit** → `submitFeedback()` in `AppContext`.

**Backend flow (client-side demo):**

1. `processFeedbackWithAI` — sentiment, translation, classification.
2. `classifyGrievance` — category, urgency, severity.
3. If low rating / high urgency / AI flags complaint → **auto-creates grievance** (`createComplaintFromText`) and registers it.
4. Parent gets toast: either “AI escalated to grievance workflow” or “Thank you for your feedback.”
5. In-app notification: “Grievance Acknowledged” with link to `/beneficiary/status`.

**Also reachable from:** Complaints page → **New** (links here).

---

### 4.5 My Grievances — `/beneficiary/complaints`

**File:** `src/pages/beneficiary/Complaints.tsx`

**Purpose:** List all complaints where `beneficiaryId === user.id`.

**Features:**

- Count and short subtitle.
- **New** → `/beneficiary/feedback` (feedback can become a complaint).
- **ComplaintCard** for each item; tap-through uses `detailPath="/beneficiary/status"`.

**Note:** Complaints can originate from feedback, omnichannel intake, or pre-seeded demo data.

---

### 4.6 Omnichannel Feedback — `/beneficiary/omnichannel-feedback`

**File:** `src/pages/beneficiary/OmnichannelFeedback.tsx`

**Purpose:** Simulate unified intake from channels parents use in real life.

**Channels (select one):**

| Channel | Demo behavior |
|---------|----------------|
| IVR Call | Default sample text if empty |
| WhatsApp | Text / voice / images (modeled) |
| QR Scan | Center-specific form |
| SMS | Short code style |
| Handwritten note | OCR + classify |
| Photo evidence | Food, hygiene, infrastructure |

**Submit** → `submitOmnichannel()`:

- `processChannelIntake` normalizes text and category.
- Stores row in `omnichannelInputs` (IndexedDB).
- Creates `FeedbackEntry` with `sourceChannel` = selected channel.
- Rating ≤ 3 or certain categories → **complaint** with status `channel_intake`, worker assignment demo, beneficiary notification.

---

### 4.7 Parent Satisfaction Surveys — `/beneficiary/surveys`

**File:** `src/pages/beneficiary/Surveys.tsx`

**Purpose:** Post-service or post-complaint satisfaction capture.

**Dimensions rated (1–5 stars each):**

- Food quality  
- Center cleanliness  
- Teacher support  
- Learning quality  
- Communication  
- Overall satisfaction  

**Flow:**

- **Pending** surveys for `user.beneficiaryId` or fallback `B-1001`.
- Active form for first pending survey → **Submit survey** → `submitSurvey()` updates platform SQI.
- **Completed** list shows trigger (e.g. `complaint_closed`) and overall score.

**When surveys are scheduled (demo):** e.g. when a complaint moves to `closed` / `beneficiary_confirmation`, `scheduleSurvey(beneficiaryId, centerId, "complaint_closed")` runs in `AppContext.advanceComplaint`.

---

### 4.8 Notifications — `/beneficiary/notifications`

**File:** `src/pages/beneficiary/Notifications.tsx`

**Purpose:** In-app communication center.

**Shows:** Notifications where `userId === user.id` OR `role === "beneficiary"`.

**Each item:** Channel (in_app, push, sms, etc.), title, body, relative time; tap marks read.

**Typical parent notifications:**

- Grievance acknowledged  
- (Demo) updates from complaint workflow  

Profile shows notification channel preferences (push, SMS, WhatsApp, in-app) as read-only demo state.

---

### 4.9 Profile — `/beneficiary/profile`

**File:** `src/pages/beneficiary/Profile.tsx`

**Purpose:** Identity and settings.

**Shows:**

- Name, phone, center name, complaints filed count.
- **Language:** EN / TE / HI → `setLang` (persists to localStorage).
- **Notification preferences** summary.
- **Logout.**

---

## 5. Shared pages parents can open (while logged in as parent)

| Route | Page | Access |
|-------|------|--------|
| `/center-journey/:id` | Center Command / journey | Parent + worker + supervisor + admins |
| `/center-command/:id` | Same component | Same |

**File:** `src/pages/shared/CenterCommand.tsx`

**What parents see:**

- Center name, mandal, district, assigned worker name.
- **AEI** (Anganwadi Excellence Index) badge.
- Tabs: journey phases, timeline replay links, operational flow, complaints at center, notifications sample.
- **Print summary** / export (demo toast).

**Typical link from dashboard:** `/center-journey/AWC-TPT-01` (Alipiri Center).

Parents **cannot** open (without another role): `/center-score`, `/center-health`, `/voice-of-citizen`, supervisor/worker/admin routes.

---

## 6. Public pages (no parent login required)

Accessible from login footer or direct URL:

| Route | Purpose |
|-------|---------|
| `/public/transparency` | Transparency portal — scheme info, satisfaction highlights |
| `/impact` | Public impact dashboard |
| `/experience/demo` | Demo journey picker (includes “Parent Journey” → logs in as beneficiary) |
| `/experience/hackathon` | Hackathon walkthrough |
| `/experience/scenarios` | Scenario generator |

---

## 7. End-to-end journeys (how pieces connect)

### Journey A — Positive feedback

```
Parent → /beneficiary/feedback → high rating + text
  → AI processes → stored in feedback
  → No complaint → thank-you toast
```

### Journey B — Poor meal / service → grievance

```
Parent → feedback OR omnichannel → low rating / AI complaint flag
  → Complaint created → status classified → worker assigned (demo: Lakshmi Devi)
  → Parent notified → /beneficiary/status
  → Worker/supervisor advances status (other roles)
  → resolution + resolutionNote
  → Parent confirms → closed → survey scheduled
  → Parent → /beneficiary/surveys
```

### Journey C — See what happened at center today

```
Worker logs activities (worker role)
  → Parent → /beneficiary or /beneficiary/activities
  → Sees nutrition / attendance / activity count / photos
```

### Journey D — Transparency

```
Parent → dashboard → Center service journey
  → /center-journey/AWC-TPT-01
  → Phases: sessions, feedback, complaints, coaching, interventions (aggregated demo data)
```

---

## 8. Grievance lifecycle (parent-visible statuses)

Defined in `src/types/platform.ts` → `ComplaintStatus`.

| Status | Parent meaning |
|--------|----------------|
| `channel_intake` | Received via WhatsApp/IVR/etc. |
| `ai_processing` / `classified` | AI routed the issue |
| `worker_review` | Anganwadi worker responding |
| `supervisor_review` | Supervisor oversight |
| `district_escalation` / `state_escalation` | Escalated up the chain |
| `resolution` | Fix proposed — **parent can confirm** |
| `beneficiary_confirmation` | Awaiting parent confirmation |
| `closed` | Closed (often after parent confirms) |

Timeline UI: `src/components/complaints/ComplaintTimeline.tsx`.

---

## 9. Technical architecture (parent scope)

| Layer | Technology / location |
|-------|------------------------|
| UI | React 18, TypeScript, Tailwind, shadcn/ui |
| Routing | React Router v6 — routes in `src/App.tsx` |
| Auth guard | `Protected role="beneficiary"` |
| Global state | `AppContext` (`src/context/AppContext.tsx`) |
| AI (demo) | `processFeedbackWithAI`, `classifyGrievance`, `processChannelIntake`, `speechToText` |
| Persistence | IndexedDB (`AnganSakti360_DB` v6): complaints, feedback, notifications, activities, omnichannel, surveys |
| Session | `localStorage` user profile |
| i18n | `src/lib/i18n.ts` — keys `beneficiary`, `citizen_portal`, etc. |

**No separate parent API** — all logic runs in the browser with demo/mock data and deterministic AI stubs.

---

## 10. Key source files (parent portal)

| Area | Path |
|------|------|
| Login | `src/pages/Login.tsx`, `src/pages/Index.tsx` |
| Routes | `src/App.tsx` (lines 111–120) |
| Navigation | `src/lib/govNav.ts` |
| Demo user | `src/data/mockData.ts` → `demoUsers.beneficiary` |
| Auth | `src/services/auth/session.ts` |
| Shell layout | `src/components/app/AppShell.tsx` |
| Dashboard | `src/pages/beneficiary/BeneficiaryDashboard.tsx` |
| Activities | `src/pages/beneficiary/Activities.tsx` |
| Status | `src/pages/beneficiary/Status.tsx` |
| Feedback | `src/pages/beneficiary/Feedback.tsx` |
| Complaints list | `src/pages/beneficiary/Complaints.tsx` |
| Omnichannel | `src/pages/beneficiary/OmnichannelFeedback.tsx` |
| Surveys | `src/pages/beneficiary/Surveys.tsx` |
| Notifications | `src/pages/beneficiary/Notifications.tsx` |
| Profile | `src/pages/beneficiary/Profile.tsx` |
| Center journey | `src/pages/shared/CenterCommand.tsx` |
| Complaint UI | `src/components/complaints/ComplaintCard.tsx`, `ComplaintTimeline.tsx` |
| Feedback → complaint | `src/context/AppContext.tsx` → `submitFeedback`, `submitOmnichannel`, `registerComplaint`, `advanceComplaint` |

---

## 11. Hackathon demo script (parent only)

1. Login → **Parent / Caregiver** → Continue.  
2. **Control Room** — note children, today’s nutrition/activities, open grievance count.  
3. **Feedback (any channel)** — choose WhatsApp, low rating, submit → complaint path.  
4. **Status** — watch timeline; after demo worker/supervisor steps (other login), **Confirm Resolution**.  
5. **Surveys** — complete pending satisfaction survey.  
6. **Center journey** — show transparency timeline for Alipiri Center.  
7. **Profile** — switch to Telugu; logout.

**Experience shortcut:** `/experience/demo` → “Parent Journey” pre-selects beneficiary login narrative.

---

## 12. What is explicitly *not* in the parent portal

- Anganwadi worker attendance, session recording, or training courses.  
- Supervisor command center, district/state admin consoles.  
- Classroom AI observation reports (worker/supervisor only).  
- Assigning or resolving complaints on behalf of officials (parent only confirms closure).  
- Real SMS/WhatsApp/IVR integrations (UI and flows are simulated).

---

## 13. Summary

| Item | Detail |
|------|--------|
| **Role in code** | `beneficiary` |
| **Login label** | Parent / Caregiver |
| **Home URL** | `/beneficiary` |
| **Dedicated pages** | 9 routes under `/beneficiary/*` |
| **Shared with parent** | `/center-journey/:id`, `/center-command/:id` |
| **Demo parent** | Sunita Rao, Alipiri Center, 2 children |
| **Core value** | Feedback, grievances, surveys, service visibility, government transparency |

This portal is designed so a parent can **see center activity**, **voice concerns through any channel**, **track grievances to closure**, and **rate satisfaction** — all tied to the same AnganSakti 360 data model used by workers and supervisors.

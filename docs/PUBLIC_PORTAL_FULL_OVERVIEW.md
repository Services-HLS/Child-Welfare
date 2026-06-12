# AnganSakti 360 — Public Portal Full Overview

This document describes the **entire Public User experience** in AnganSakti 360: login, every page, routes, features, data flows, and how grievances are handled. It is written for product reviewers, testers, and developers.

**Technical note:** The app role in code is still `beneficiary`. The UI labels this login as **Public User**. Routes remain under `/beneficiary/*` for backward compatibility; newer citizen-facing routes also use `/public/*` where noted.

---

## 1. Purpose and design principles

The Public Portal is a **single government citizen interface** for Andhra Pradesh Women Development & Child Welfare (WDCW) Anganwadi services. It is not a “parent-only” or “child-only” app.

| Principle | What it means in the product |
|-----------|------------------------------|
| **One login** | All citizen types (parent, pregnant woman, lactating mother, guardian, community member) use the same Public User login. |
| **Context at submission** | “Who are you submitting as?” is chosen **inside** feedback/grievance forms, not as a permanent account type. |
| **Evidence-first grievances** | Citizens upload photos, voice, OCR notes, video, and documents up front because **supervisors** investigate directly—**Anganwadi workers are not grievance handlers**. |
| **Transparency** | Citizens can see submitted evidence, AI summaries, supervisor actions, resolution proof, and timelines. |
| **Service visibility** | Enrolled children and center activities still appear when linked to the account; the portal supports all beneficiary types. |

---

## 2. Login and session

### 2.1 Entry point

| Item | Detail |
|------|--------|
| **URL** | `/` (Index → Login) |
| **UI label** | **Public User** (i18n key `beneficiary`) |
| **Home after login** | `/beneficiary` (Public Dashboard) |
| **Implementation** | `src/pages/Login.tsx`, `src/lib/rolePaths.ts` |

### 2.2 Demo credentials (pilot)

| Field | Typical demo value |
|-------|-------------------|
| Role | Public User |
| Phone | `9876543210` (or as pre-filled on login screen) |
| Password | `demo1234` |

Demo profile (from `src/data/mockData.ts`):

- **Name:** Sunita Rao  
- **ID:** `B-1001`  
- **Center:** Alipiri Center (`AWC-TPT-01`)  
- **Children (optional):** Aarav Rao (4), Priya Rao (3) — used for service history when enrolled  

### 2.3 Session behavior

- User is stored in **localStorage** via `AppContext` (`persistUser`).
- Language defaults to **English** on login; user can switch **EN / TE / HI** from profile.
- Protected routes require `role="beneficiary"` (`Protected` wrapper in `App.tsx`).
- Logout clears session from profile page.

---

## 3. Navigation (sidebar)

Defined in `src/lib/govNav.ts` under role `beneficiary`. Labels use i18n keys (display names below).

### Operations

| Nav label | Route | Purpose |
|-----------|-------|---------|
| Control Room | `/beneficiary` | Public Dashboard |
| My Services | `/beneficiary/my-child` | Service summary + evidence/requests table |
| Today's Services | `/beneficiary/daily-journey` | Day timeline for linked child/center |
| Center Services | `/beneficiary/activities` | Activities logged at center |
| Nutrition | `/beneficiary/nutrition` | Nutrition service view |

### Citizen feedback

| Nav label | Route | Purpose |
|-----------|-------|---------|
| Give Feedback | `/beneficiary/feedback` | In-app feedback / grievance with AI |
| Citizen Feedback | `/beneficiary/omnichannel-feedback` | WhatsApp, QR, SMS, IVR, OCR, photo channels |
| My Requests | `/public/my-requests` | Unified request & evidence tracker |
| Grievances | `/beneficiary/complaints` | List of formal grievances |
| Track Resolution | `/beneficiary/status` | Resolution tracking & citizen confirmation |
| Surveys | `/beneficiary/surveys` | Post-closure satisfaction surveys |

### Communication

| Nav label | Route | Purpose |
|-----------|-------|---------|
| Communication Center | `/beneficiary/notifications` | In-app notifications |
| Center Health | `/beneficiary/center-health` | Center journey / health view |
| Profile | `/beneficiary/profile` | Public profile, language, logout |
| Help & Support | `/beneficiary/help` | Help content |

---

## 4. Complete route map (public user)

| Route | Page component | Primary function |
|-------|----------------|----------------|
| `/beneficiary` | `BeneficiaryDashboard.tsx` | Public Dashboard, widgets, quick actions |
| `/beneficiary/my-child` | `MyChild.tsx` | My Services + Submitted Evidence & Requests |
| `/beneficiary/daily-journey` | `DailyJourney.tsx` | Today's Services timeline |
| `/beneficiary/activities` | `Activities.tsx` | Center activity feed |
| `/beneficiary/nutrition` | `Nutrition.tsx` | Nutrition services |
| `/beneficiary/feedback` | `Feedback.tsx` | Public Feedback / grievance submission |
| `/beneficiary/omnichannel-feedback` | `OmnichannelFeedback.tsx` | Multi-channel citizen intake |
| `/public/my-requests` | `MyRequests.tsx` | Citizen request hub (same data as My Services evidence section) |
| `/beneficiary/complaints` | `Complaints.tsx` | Grievance list |
| `/beneficiary/status` | `Status.tsx` | Track resolution, confirm/reopen |
| `/beneficiary/request/:id` | `PublicRequestDetail.tsx` | **Full request viewer** (evidence, AI, actions, resolution) |
| `/beneficiary/surveys` | `Surveys.tsx` | Beneficiary surveys |
| `/beneficiary/notifications` | `Notifications.tsx` | Notification inbox |
| `/beneficiary/center-health` | `CenterHealth.tsx` | Center health / journey |
| `/beneficiary/profile` | `Profile.tsx` | Public Profile |
| `/beneficiary/help` | `Help.tsx` | Help & support |
| `/center-command/:id` | `CenterCommand.tsx` | Shared center journey (multi-role; public can open) |
| `/center-journey/:id` | `CenterCommand.tsx` | Alias for center journey |
| `/public/transparency` | `TransparencyPortal.tsx` | **Unauthenticated** statewide transparency (optional browse) |

---

## 5. Page-by-page functionality

### 5.1 Public Dashboard — `/beneficiary`

**File:** `src/pages/beneficiary/BeneficiaryDashboard.tsx`

**What the citizen sees:**

1. **Scheme notice** — WDCW banner text (i18n).
2. **Public Dashboard header** — Greeting, center name, “Public citizen services”.
3. **My Recent Requests** — Counts: Submitted / Processing / Resolved; last 3 references with links to `/beneficiary/request/:id`.
4. **Latest Resolution Updates** — Recent officer action summaries from request history.
5. **Submit feedback as** — Quick chips (parent, pregnant, citizen, etc.) → stores preference in `localStorage` key `angansakti.public.lastFeedbackType` and links to feedback form.
6. **Today's Services** (if child journey data exists) — Attendance, preschool, meal, activities for linked child.
7. **Center summary chips** — Meals, sessions, open issues, service status.
8. **Quick actions** — My Services, Today's Services, Give Feedback, My Requests, Track Resolution, View Center Journey.
9. **My Services cards** — Per enrolled child → `/beneficiary/my-child?child=...`
10. **Stat tiles** — Nutrition, attendance, activities, open grievances.
11. **Government announcements** — Mock announcements + link to notifications.

**Data sources:** `usePublicPortal()`, `buildTodayChildJourney`, `buildCenterGovSummary`, `buildPublicRequests`.

---

### 5.2 My Services — `/beneficiary/my-child`

**File:** `src/pages/beneficiary/MyChild.tsx`

**Purpose:** Public Service Summary (not child-only).

**Sections:**

| Section | Functionality |
|---------|---------------|
| **Header** | Service title (child name if enrolled, else citizen name); center subtitle |
| **Summary chips** | Service Usage, Services Received, Participation, Service Status |
| **Submitted Evidence & Requests** | Core transparency module (see §6) |
| **Service tabs** (if child linked) | Service History, Service Delivery, Service Experience, Service Outcome |
| **Range filter** | Daily / weekly / monthly + download report (demo toast) |
| **Center photos** | Images from worker activity uploads at center |
| **No-child message** | Explains public citizen mode; points to evidence table |

**Query param:** `?child=CH-01` selects which enrolled child to show.

---

### 5.3 My Requests — `/public/my-requests`

**File:** `src/pages/public/MyRequests.tsx`

**Purpose:** Dedicated page for the same unified request list as on My Services.

- Explains **supervisor-owned** grievances (no worker routing).
- **Submitted Evidence & Requests** component: summary cards + full table.
- Link to submit new feedback.

**Component:** `src/components/beneficiary/SubmittedEvidenceSection.tsx`

---

### 5.4 Give Feedback / Public Feedback — `/beneficiary/feedback`

**File:** `src/pages/beneficiary/Feedback.tsx`  
**Form component:** `src/components/beneficiary/CitizenGrievanceForm.tsx`

**Modes:**

- **Grievance / complaint** — Full mandatory flow (default).
- **General feedback** — Short note (praise uses grievance form or omnichannel).

**Grievance submission flow (3 steps):**

```
1. Form
   ├── Who are you submitting as? (6 types)
   ├── Issue category (WDCW categories)
   ├── Context category (dynamic per submitter type)
   ├── Priority (low / medium / high / critical)
   ├── Description (required — full context for supervisor)
   ├── Evidence (photo, video, voice, OCR note, document)
   └── Consent checkbox (required)

2. AI analysis (client-side grievance engine)
   ├── Issue classification
   ├── Severity
   ├── Extracted context
   ├── Language
   ├── Suggested resolution path (Supervisor-first)
   └── Confidence %

3. Citizen submission summary
   ├── Submitted as, issue, evidence count, priority
   └── Confirm & submit → AppContext.submitFeedback + grievanceBundle
```

**After submit:**

- Feedback stored in AppContext / IndexedDB (`feedback` store).
- If grievance: complaint created → **supervisor_review** (no worker assignment).
- Notifications: citizen (“under supervisor review”), supervisor (“new public grievance”).
- Citizen can track via My Requests or `/beneficiary/request/:id`.

**Feedback history:** Last 10 entries with links to grievance detail when `complaintId` exists.

---

### 5.5 Citizen Feedback (Omnichannel) — `/beneficiary/omnichannel-feedback`

**File:** `src/pages/beneficiary/OmnichannelFeedback.tsx`

**Channels:**

| Channel | Workspace |
|---------|-----------|
| WhatsApp | `WhatsAppWorkspace` |
| QR code | `QrWorkspace` |
| SMS | `SmsWorkspace` |
| IVR / voice | `IvrWorkspace` |
| Handwritten OCR | `OcrWorkspace` |
| Photo evidence | `PhotoWorkspace` |

**Features:**

- **Submitter type** selector (same 6 public types as feedback form).
- Per-channel draft saved to **IndexedDB** (`omnichannel_drafts`) per user.
- Preview card before submit.
- `submitOmnichannel` → AI intake → optional grievance creation with evidence.
- Completion messages per channel.

**Implementation:** `src/components/beneficiary/omnichannel/*`, `src/services/feedback/intake.ts`

---

### 5.6 Grievances — `/beneficiary/complaints`

**File:** `src/pages/beneficiary/Complaints.tsx`

- Lists all complaints where `beneficiaryId` = current user.
- Each card: ID, title, status, **PublicComplaintSteps** progress chips.
- **Tap card** → `/beneficiary/request/:id` (full detail).
- **Raise new issue** → `/beneficiary/feedback`.

---

### 5.7 Track Resolution — `/beneficiary/status`

**File:** `src/pages/beneficiary/Status.tsx`

- Per-grievance: description, step indicator, resolution notes, resolution image.
- **Confirm resolution** → closes complaint, may trigger survey scheduling.
- **Reopen** → returns to `supervisor_review` (not worker).
- **Satisfaction survey** link when in confirmation state.
- Link to **full request details** on each card.

---

### 5.8 Full request viewer — `/beneficiary/request/:id`

**File:** `src/pages/beneficiary/PublicRequestDetail.tsx`

**This is the complete citizen transparency page.** Resolves ID against feedback ID, complaint ID, or omnichannel ID via `getPublicRequestById`.

| Section | Content |
|---------|---------|
| **Metadata** | Submitted by, submitted as, category, priority, center, channel, date |
| **Original submission** | Full text, rating if applicable |
| **Uploaded evidence** | Photo, voice, transcript, documents (gallery) |
| **Extracted content** | OCR / transcript / text evidence |
| **AI summary** | Classification, severity, confidence, language, extracted context |
| **Resolution timeline** | Submitted → AI Reviewed → Supervisor Reviewing → Action Taken → Resolved → Citizen Confirmation |
| **Supervisor actions** | Supervisor + district actions (worker hidden for supervisor-owned cases) |
| **Resolution evidence** | Before / after photos, documents, resolution note |
| **Escalation path** | If escalated |
| **Actions** | **Satisfied** (close), **Reopen**, **Escalate** (district/state path), **Download** (demo) |

**Escalate citizen flow:** `escalatePublicGrievance` in AppContext → district, then state if already at district.

---

### 5.9 Today's Services — `/beneficiary/daily-journey`

**File:** `src/pages/beneficiary/DailyJourney.tsx`

- Timeline of today’s steps (attendance, preschool, meal, activities).
- Learning card from session data when available.
- Uses linked child name or “Public beneficiary” if no child.

---

### 5.10 Center Services — `/beneficiary/activities`

**File:** `src/pages/beneficiary/Activities.tsx`

- Read-only feed of activities at the user’s center (worker-logged services).

---

### 5.11 Nutrition — `/beneficiary/nutrition`

**File:** `src/pages/beneficiary/Nutrition.tsx`

- Nutrition program / meal service information for the citizen’s center context.

---

### 5.12 Center Health — `/beneficiary/center-health`

**File:** `src/pages/beneficiary/CenterHealth.tsx`

- Center journey / health indicators for transparency (links to shared center views where applicable).

---

### 5.13 Surveys — `/beneficiary/surveys`

**File:** `src/pages/beneficiary/Surveys.tsx`

- Surveys scheduled after complaint closure or activities (`submitSurvey` via platform intelligence).
- Citizen completes satisfaction / service surveys.

---

### 5.14 Communication Center — `/beneficiary/notifications`

**File:** `src/pages/beneficiary/Notifications.tsx`

**Example notification types:**

| Title | When |
|-------|------|
| Grievance under supervisor review | After submit |
| Additional evidence requested | Supervisor sets `need_evidence` |
| Update on your request | Any `addGrievanceAction` |
| Issue resolved | Resolution / approval |
| Escalation recorded | Citizen escalates |

Notifications include `actionUrl` → `/beneficiary/request/:complaintId`.

---

### 5.15 Public Profile — `/beneficiary/profile`

**File:** `src/pages/beneficiary/Profile.tsx`

- Name, mobile, center (read-only demo fields).
- **Recent feedback types** from history (not a fixed role).
- Language toggle (EN / TE / HI).
- Logout.

---

### 5.16 Help & Support — `/beneficiary/help`

**File:** `src/pages/beneficiary/Help.tsx`

- Static help / contact guidance for citizens.

---

### 5.17 Transparency portal (optional, no login) — `/public/transparency`

**File:** `src/pages/public/TransparencyPortal.tsx`

- Statewide anonymized metrics, services, FAQ, commitments.
- Does not require Public User login.

---

## 6. Submitted Evidence & Requests (shared module)

**Component:** `SubmittedEvidenceSection.tsx`  
**Service:** `src/services/public/publicRequestService.ts`

### 6.1 What gets aggregated

All citizen submissions for the logged-in user:

| Source | ID pattern | Type |
|--------|------------|------|
| In-app feedback | `FB-*` | feedback / grievance |
| Formal complaints | `CMP-*` | grievance |
| Omnichannel intake | `OM-*` / channel ids | omnichannel |

### 6.2 Summary cards (filterable)

| Card | Filter |
|------|--------|
| Feedback Submitted | feedback + omnichannel |
| Evidence Uploaded | items with evidence count |
| Open Requests | open grievances / processing |
| Resolved Requests | closed or citizen-confirmed |

### 6.3 Table columns

Reference ID · Submitted As · Type · Channel · Date · Status · Actions

### 6.4 Row actions

| Action | Behavior |
|--------|----------|
| **View** | `/beneficiary/request/:id` |
| **Track** | `/beneficiary/status` |
| **Download** | Demo export toast |
| **Reopen** | Opens request detail |

---

## 7. Grievance architecture (public user impact)

### 7.1 End-to-end flow

```
Public User
    ↓
Submit Feedback / Grievance (+ evidence + consent)
    ↓
AI Processing (classify, severity, path, confidence)
    ↓
Supervisor Review  ← first human owner (NOT Anganwadi worker)
    ↓
Supervisor Action (visit, call, evidence request, resolution upload)
    ↓
Resolution + proof (before/after, documents)
    ↓
Public Confirmation (Satisfied / Reopen / Escalate)
```

### 7.2 Data model (complaint)

On `ComplaintRecord` (`src/types/platform.ts`):

```ts
grievance?: {
  ownerRole: "supervisor" | "district_admin" | "state_admin";
  ownerId?, ownerName?;
  evidence: PublicEvidenceItem[];
  aiAnalysis?: GrievanceAIAnalysis;
  actions: GrievanceAction[];
  resolution?: GrievanceResolutionReport;
  consentGiven?, citizenPriority?;
}
```

Legacy `assignedWorkerId` is **deprecated** for public grievances; new cases do not assign workers.

### 7.3 AI engine

**File:** `src/services/ai/grievance-engine.ts`

- `classifyGrievance` — category, severity, SLA, **supervisor-first routing path**
- `analyzePublicGrievance` — full analysis for citizen preview and storage
- `shouldEscalate` — repeat complaints, infrastructure, policy, SLA, safety

### 7.4 Escalation rules (citizen-visible)

| Situation | Path |
|-----------|------|
| Repeated complaints (same center) | Supervisor → District |
| Infrastructure (building, water, cleanliness) | Supervisor → District |
| Policy / scheme concerns | District → State |
| Citizen presses Escalate | District → State (if already at district) |
| Critical safety | Fast-track district alert |

### 7.5 What supervisors do (off-portal, for context)

Citizens do not see these screens but outcomes appear in **My Requests**:

| Supervisor route | Function |
|------------------|----------|
| `/supervisor/public-grievance-center` | Primary queue: New, In Review, Need Evidence, Resolved |
| `/supervisor/grievance/:id` | Investigation: AI findings, evidence, resolve, escalate |

District: `/district-admin/escalated-grievances` (alias `/district/escalated-grievances`).

---

## 8. Submitter types and dynamic categories

**Types** (`src/types/public-context.ts`):

| ID | Label |
|----|-------|
| `parent_caregiver` | Parent / Caregiver |
| `pregnant_woman` | Pregnant Woman |
| `lactating_mother` | Lactating Mother |
| `guardian` | Guardian |
| `citizen_community` | Citizen / Community Member |
| `other_beneficiary` | Other Beneficiary |

**Context categories** change per type (e.g. Meals, Teacher, Safety for parents; Nutrition, Health Support for pregnant women). Stored on `FeedbackEntry.feedbackContext` and complaint `submittedAs` / `priority`.

---

## 9. State, storage, and hooks

### 9.1 AppContext (`src/context/AppContext.tsx`)

Public user relies on:

| API | Use |
|-----|-----|
| `submitFeedback` | In-app feedback + `grievanceBundle` |
| `submitOmnichannel` | Channel intake |
| `complaints` / `updateComplaint` | Grievance state |
| `addGrievanceAction` | Officer action log → citizen notifications |
| `escalatePublicGrievance` | Citizen escalation |
| `advanceComplaint` | Status transitions, survey on close |
| `notifications` | In-app alerts |

### 9.2 IndexedDB (via `src/lib/storage/*`)

| Store | Content |
|-------|---------|
| `feedback` | Feedback entries |
| `complaints` | Grievance records |
| `notifications` | Platform notifications |
| `omnichannel_drafts` | Per-channel draft payloads |
| Activities, sessions, etc. | Service visibility |

### 9.3 Hook

**`usePublicPortal()`** (`src/hooks/usePublicPortal.ts`) — aggregates:

- `publicRequests`, `requestBuckets`
- `myComplaints`, `myFeedback`
- `centerActs`, `childProgress`, etc.

---

## 10. UI terminology (public-facing)

| Old term | Current UI term |
|----------|-----------------|
| Parent Dashboard | **Public Dashboard** |
| My Child | **My Services** |
| Parent Profile | **Public Profile** |
| Parent Feedback | **Public Feedback** |
| Parent Journey | **Public Services** / Today's Services |

Headers use `PublicPageHeader` (`src/components/beneficiary/ParentPageHeader.tsx` — file name legacy, exports public components).

---

## 11. Testing the full public journey (recommended)

1. Login as **Public User** (demo credentials).
2. **Public Dashboard** — confirm My Recent Requests widgets.
3. **Give Feedback** → Grievance mode → attach photo → AI → summary → submit.
4. **My Requests** — verify row in table → **View** → full request page with AI + timeline.
5. **Notifications** — open action link from grievance alert.
6. **Citizen Feedback** — submit via WhatsApp or OCR channel → confirm appears in My Requests.
7. **Track Resolution** — confirm/reopen on demo complaint `CMP-002` (if present for `B-1001`).
8. **My Services** — tabs if children enrolled; evidence section always visible.
9. (Optional) Login as **Supervisor** → Public Grievance Center → resolve case → recheck citizen request page for new actions.

Automated checks: `npm run verify:app` (route health includes beneficiary and public routes).

---

## 12. Key source files (developer index)

| Area | Path |
|------|------|
| Routes | `src/App.tsx` |
| Navigation | `src/lib/govNav.ts` |
| i18n labels | `src/lib/i18n.ts` |
| Public hook | `src/hooks/usePublicPortal.ts` |
| Request aggregation | `src/services/public/publicRequestService.ts` |
| Grievance AI | `src/services/ai/grievance-engine.ts` |
| Grievance helpers | `src/services/grievance/publicGrievanceService.ts` |
| Types | `src/types/public-request.ts`, `src/types/grievance.ts`, `src/types/public-context.ts` |
| Citizen form | `src/components/beneficiary/CitizenGrievanceForm.tsx` |
| Evidence table | `src/components/beneficiary/SubmittedEvidenceSection.tsx` |
| Timeline UI | `src/components/public/PublicGrievanceTimeline.tsx` |
| Evidence gallery | `src/components/public/PublicEvidenceGallery.tsx` |
| Pages | `src/pages/beneficiary/*`, `src/pages/public/MyRequests.tsx` |

---

## 13. Summary

The Public Portal is a **unified Andhra Pradesh WDCW citizen interface**: one login, context-aware submission, mandatory evidence for grievances, AI-assisted classification, **supervisor-led resolution**, and full transparency through **My Requests** and **request detail** pages. Service delivery data (attendance, meals, activities) remains visible where the account is linked to a center and children, while grievance handling is intentionally separated from Anganwadi worker workflows.

*Document version: aligned with supervisor-first grievance architecture and public evidence visibility implementation.*

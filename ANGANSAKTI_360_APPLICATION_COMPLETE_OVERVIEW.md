# AnganSakti 360 — Complete Application Overview

**Document version:** May 2026 (current codebase)  
**Department:** Women Development and Child Welfare (WDCW), Government of Andhra Pradesh  
**Pilot geography:** Tirupati District · Alipiri Anganwadi Center (`AWC-TPT-01`)

This document is the **authoritative reference** for every route, role, page purpose, and major system capability in the application. Use it for hackathon judging, onboarding, and scope verification.

---

## 1. What the application is

**AnganSakti 360** is an offline-first, AI-assisted government platform for Anganwadi service delivery. It connects five stakeholder roles in one system:

| Role | Portal path (home after login) | Primary purpose |
|------|--------------------------------|-----------------|
| **Parent / Caregiver** (`beneficiary`) | `/beneficiary` | See child services, submit feedback & grievances, surveys |
| **Anganwadi Worker** (`worker`) | `/worker` | Daily operations, attendance, sessions, evidence upload |
| **Supervisor** (`supervisor`) | `/supervisor` | Multi-center monitoring, coaching, grievances, field oversight |
| **District Admin** (`district_admin`) | `/district-admin/mission-control` | District command, compliance, interventions, outcomes |
| **State Admin** (`state_admin`) | `/state-admin/mission-control` | Statewide mission control, impact, policy narrative |

**Design principles (non-negotiable in this build):**

- **Five roles only** — no additional roles introduced
- **Coaching & improvement, not punishment** — disclaimers and UX frame AI as supportive
- **Offline-first** — IndexedDB + localStorage persistence; sync queue for demo
- **Explainable AI** — dedicated explanation routes for sessions, grievances, risk, SQI, AEI
- **Government UX** — WDCW AP branding, formal shell (`AppShell`), Mission Control landing for admins

---

## 2. Technology stack

| Layer | Technology |
|-------|------------|
| UI | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Routing | React Router v6 (`BrowserRouter`) |
| State | `AppContext` + `usePlatformIntelligence` hook |
| Server state | TanStack Query (where used) |
| Persistence | `localStorage` + IndexedDB (`AnganSakti360_DB`) via `@/lib/storage` |
| Mobile | Capacitor (Android scaffold present) |
| i18n | English, Telugu (te), Hindi (hi) — `@/lib/i18n` |
| Icons | Lucide React |

**Key source folders:**

```
src/
  pages/          # Route-level screens by role + shared + public + experience
  components/     # app/, gov/, unified/, timeline/, ui/
  context/        # AppContext, usePlatformIntelligence
  services/       # AI, AEI, interventions, mission-control, demo, auth, …
  data/           # mockData, mockGrievances, mockSessions
  lib/            # govNav, rolePaths, govBranding, storage, i18n
  types/          # platform, session, intelligence, feedback-channels
```

---

## 3. Authentication & login

| Item | Detail |
|------|--------|
| Login URL | `/` (`Index` → `Login.tsx`) |
| Layout | Split screen: **left** = program branding & mission copy; **right** = sign-in form |
| Viewport | Single screen, no page scroll (`100dvh`, body overflow locked on login) |
| Access category | Dropdown: all 5 roles |
| Demo credentials | Pre-filled: phone `9876543210`, password `demo1234` (any role accepts demo auth) |
| Session storage | `localStorage` key `angansakti.user` |
| Post-login redirect | `roleHomePath()` in `@/lib/rolePaths.ts` |

**Demo personas (`src/data/mockData.ts`):**

| Role | Name | ID | Phone | Center / scope |
|------|------|-----|-------|----------------|
| Beneficiary | Sunita Rao | B-1001 | 9876501234 | AWC-TPT-01 Alipiri |
| Worker | Lakshmi Devi | W-1042 | 9876543210 | AWC-TPT-01 |
| Supervisor | Ravi Kumar | S-204 | 9123456780 | Tirupati District |
| District Admin | Dr. Meena Reddy | DA-01 | 9000000001 | Tirupati District |
| State Admin | Sri Venkatesh Rao | SA-01 | 9000000099 | Andhra Pradesh |

**Route guards:**

- `Protected` — single role required
- `MultiRoleProtected` — shared intelligence pages
- `AuthRequired` — any logged-in user
- `AdminLegacyRedirect` — `/admin` → district admin paths

**UX utilities:** `ScrollToTop` on route change; government header/sidebar in `AppShell` for authenticated pages.

---

## 4. Application shell (authenticated UI)

After login, most role pages use **`AppShell`** (`src/components/app/AppShell.tsx`):

- **GovernmentHeader** — navy bar, breadcrumbs, transparency drawer, environment badge
- **Sidebar** — grouped navigation from `GOV_NAV` (`src/lib/govNav.ts`), role-specific sections
- **Main content** — `id="app-main-content"`, government page frame on many screens
- **Mobile** — drawer sidebar + bottom navigation

Public / login / some experience routes render **without** `AppShell`.

---

## 5. Complete route catalog

Routes are defined in `src/App.tsx`. **Total: 78 route declarations** (including redirects and aliases).

### 5.1 Public & entry

| Route | Page | Access | Functionality |
|-------|------|--------|---------------|
| `/` | `Login` | Public | Split login; role selection; demo auth |
| `*` | `NotFound` | Public | 404 fallback |

### 5.2 Beneficiary (Parent / Caregiver) — 9 routes

| Route | Page | Functionality |
|-------|------|---------------|
| `/beneficiary` | `BeneficiaryDashboard` | Citizen control room: child status, recent activity, quick actions |
| `/beneficiary/activities` | `BeneficiaryActivities` | View center activities/services visible to parent |
| `/beneficiary/status` | `BeneficiaryStatus` | Enrollment & service status for children |
| `/beneficiary/feedback` | `BeneficiaryFeedback` | Star rating + text feedback with AI sentiment |
| `/beneficiary/omnichannel-feedback` | `OmnichannelFeedback` | Voice/text/WhatsApp-style multi-channel intake |
| `/beneficiary/complaints` | `BeneficiaryComplaints` | Track grievances; status & SLA visibility |
| `/beneficiary/surveys` | `BeneficiarySurveys` | Parent satisfaction surveys (post-service triggers) |
| `/beneficiary/notifications` | `BeneficiaryNotifications` | In-app communication center |
| `/beneficiary/profile` | `BeneficiaryProfile` | Profile, language preference, children linked |

### 5.3 Anganwadi Worker — 18 routes

| Route | Page | Functionality |
|-------|------|---------------|
| `/worker` | `WorkerDashboard` | Daily operations hub: tasks, alerts, quick capture |
| `/worker/attendance` | `Attendance` | Mark attendance with GPS-style evidence (demo) |
| `/worker/attendance-history` | `AttendanceHistory` | Historical attendance log |
| `/worker/activities` | `Activities` | Log hot meals, preschool, health check, etc. |
| `/worker/activity/:id` | `VerificationDetail` | Single activity proof & AI verification detail |
| `/worker/session-monitor` | `SessionMonitor` | Record / monitor preschool session |
| `/worker/session-history` | `SessionHistory` | Past sessions & scorecards |
| `/worker/session-feedback` | `SessionFeedback` | Beneficiary/session-linked feedback capture |
| `/worker/performance` | `WorkerPerformance` | Teaching insights from session AI |
| `/worker/training` | `WorkerTraining` | Assigned training modules |
| `/worker/growth` | `WorkerGrowth` | Workforce development & growth profile (non-punitive) |
| `/worker/child-progress` | `ChildProgress` | Per-child outcome tracking at center |
| `/worker/complaints` | `WorkerComplaints` | Grievances assigned to worker; responses |
| `/worker/history` | `History` | Service proof queue / activity history |
| `/worker/uploads` | `Uploads` | Media uploads for verification |
| `/worker/alerts` | `WorkerAlerts` | Notifications & attention items |
| `/worker/profile` | `Profile` | Worker profile & center linkage |

### 5.4 Supervisor — 16 routes

| Route | Page | Functionality |
|-------|------|---------------|
| `/supervisor` | `SupervisorDashboard` | Monitoring command: KPIs, centers at risk, sentiment |
| `/supervisor/centers` | `Centers` | List all centers in district |
| `/supervisor/centers/:id` | `CenterDetail` | Single center drill-down |
| `/supervisor/map` | `MapView` | Geographic map of centers (demo) |
| `/supervisor/verifications` | `Verifications` | Activity verification queue |
| `/supervisor/audit/:id` | `SupervisorAuditDetail` | Field audit record detail |
| `/supervisor/session-review` | `SupervisorSessionReview` | Observe session recordings & AI scorecards |
| `/supervisor/coaching` | `SupervisorCoaching` | Assign supportive coaching to workers |
| `/supervisor/development` | `SupervisorDevelopment` | Workforce development pipeline |
| `/supervisor/child-outcomes` | `ChildOutcomes` | Child wellness / outcomes across centers |
| `/supervisor/outcomes` | `ChildOutcomes` | **Alias** of child-outcomes |
| `/supervisor/interventions` | `Interventions` | Intervention OS — launch & track |
| `/supervisor/complaints` | `SupervisorComplaints` | Grievance monitoring & escalation |
| `/supervisor/reports` | `SupervisorReports` | Operational reports |
| `/supervisor/alerts` | `Alerts` | Communication center |

### 5.5 District Admin — 11 routes (+ legacy redirect)

| Route | Page | Functionality |
|-------|------|---------------|
| `/admin`, `/admin/*` | — | **Redirect** → district admin |
| `/district-admin` | `AdminDashboard` | District command summary (legacy entry) |
| `/district-admin/mission-control` | `MissionControl` | **Primary home** — district Mission Control |
| `/district-admin/compliance` | `AdminCompliance` | Compliance module & district KPIs |
| `/district-admin/centers` | `AdminCenters` | Center registry & status |
| `/district-admin/workers` | `AdminWorkers` | Worker roster |
| `/district-admin/complaints` | `DistrictAdminComplaints` | District grievance dashboard |
| `/district-admin/alerts` | — | **Redirect** → complaints |
| `/district-admin/integrations` | `Integrations` | External system integrations (district scope) |
| `/district-admin/reports` | `AdminReports` | Reports & document cache |
| `/district-admin/outcomes` | `DistrictOutcomes` | District child outcome analytics |
| `/district-admin/interventions` | `DistrictInterventions` | District intervention pipeline |

### 5.6 State Admin — 10 routes

| Route | Page | Functionality |
|-------|------|---------------|
| `/state-admin` | `StateAdminDashboard` | State command summary |
| `/state-admin/mission-control` | `MissionControl` | **Primary home** — statewide Mission Control |
| `/state-admin/compliance` | `AdminCompliance` | Statewide compliance view |
| `/state-admin/complaints` | `StateAdminComplaints` | State grievance oversight |
| `/state-admin/integrations` | `Integrations` | Integrations (state scope) |
| `/state-admin/reports` | `AdminReports` | State reports |
| `/state-admin/notifications` | `StateAdminNotifications` | State communication center |
| `/state-admin/impact` | `StateImpact` | State impact narrative & metrics |
| `/state-admin/outcomes` | `StateOutcomes` | Statewide child outcomes |
| `/state-admin/story` | `GovernmentStory` | AI-generated government story / policy brief |

### 5.7 Unified intelligence & shared (multi-role) — 15 routes

| Route | Page | Roles | Functionality |
|-------|------|-------|---------------|
| `/center-command/:id` | `CenterCommand` | worker, supervisor, district_admin, state_admin, beneficiary | **Unified Center Command** — 8 tabs: Overview, Operations, Citizen Voice, Health, Coaching, Intervention, Timeline, Impact |
| `/center-journey/:id` | `CenterCommand` | same | **Alias** of center-command |
| `/center-score/:id` | `CenterScore` | worker, supervisor, district_admin, state_admin | AEI component breakdown & band |
| `/center-health/:id` | `CenterHealth` | supervisor, district_admin, state_admin | Center health engine — risk factors & trends |
| `/voice-of-citizen` | `VoiceOfCitizen` | supervisor, district_admin, state_admin | Aggregated beneficiary voice & sentiment command |
| `/center-digital-view/:id` | `CenterDigitalTwin` | supervisor, district_admin, state_admin | Digital twin snapshot of center operations |
| `/center-timeline/:id` | `CenterTimeline` | supervisor, district_admin, state_admin | Timeline replay engine with filters |
| `/analytics/aei` | `AEIAnalytics` | supervisor, district_admin, state_admin | State/district AEI analytics dashboard |
| `/session-explanation/:id` | `SessionExplanation` | any authenticated | Explainable AI for preschool session scorecard |
| `/grievance-explanation/:id` | `GrievanceExplanation` | any authenticated | Explainable grievance classification & SLA |
| `/risk-explanation/:id` | `RiskExplanation` | any authenticated | Explainable center risk model |
| `/sqi-explanation/:id` | `SQIExplanation` | any authenticated | Service Quality Index explanation |
| `/aei-explanation/:id` | `AEIExplanation` | any authenticated | Full explainable AEI report per center |
| `/settings/sync` | `OfflineSyncCenter` | any authenticated | IndexedDB sync queue management |
| `/impact` | `ImpactDashboard` | **Public** | Public impact metrics (also linked from login) |

### 5.8 Public transparency & experience — 5 routes

| Route | Page | Access | Functionality |
|-------|------|--------|---------------|
| `/public/transparency` | `TransparencyPortal` | Public | Anonymized transparency metrics & official login link |
| `/experience/demo` | `DemoExperience` | Public | Role-based demo journey launcher |
| `/experience/hackathon` | `HackathonExperience` | Public | Guided hackathon walkthrough by role |
| `/experience/scenarios` | `ScenarioGenerator` | Public | Load demo scenarios into live data |
| `/demo/scenarios` | — | Public | **Redirect** → `/experience/scenarios` |

---

## 6. Center Command tabs (deep dive)

**URL:** `/center-command/:id` or `/center-journey/:id`  
**Demo center ID:** `AWC-TPT-01` (Alipiri Center, Tirupati)

| Tab | Content |
|-----|---------|
| **Overview** | Enrolled children, today's services, open grievances, AEI score; operational lifecycle timeline |
| **Operations** | Today's activity evidence; preschool sessions with links to session explanations |
| **Citizen Voice** | Feedback & grievances; link to Voice of Beneficiary |
| **Health** | Attention indicators; links to Center Health & Risk Explanation |
| **Coaching** | Active coaching assignments for center workers |
| **Intervention** | Intervention history & government intervention OS |
| **Timeline** | Embedded timeline replay |
| **Impact** | Outcomes, SQI, child wellness links |

**Actions:** Print summary, export situation report (demo toast), AEI badge link.

---

## 7. Anganwadi Excellence Index (AEI)

**Service:** `src/services/excellence/aei.ts`  
**Analytics page:** `/analytics/aei`  
**Per-center score:** `/center-score/:id`  
**Explainability:** `/aei-explanation/:id`

### 7.1 Component weights (sum = 100%)

| Component | Weight |
|-----------|--------|
| Worker performance (session OPI) | 22% |
| Child engagement | 16% |
| Beneficiary satisfaction | 16% |
| Complaint closure rate | 12% |
| Attendance compliance | 12% |
| Service verification confidence | 11% |
| Intervention success | 11% |

### 7.2 Bands

| Band | Score range | Meaning |
|------|-------------|---------|
| Green | ≥ 75 | Strengthening — maintain improvement loop |
| Orange | 55–74 | Improvement opportunity — targeted support |
| Red | < 55 | Attention required — supportive intervention (not punitive) |

AEI outputs **guidance** and **recommendations** arrays used across dashboards and Center Command.

---

## 8. Mission Control

**URLs:**

- District: `/district-admin/mission-control` (`scope="district"`)
- State: `/state-admin/mission-control` (`scope="state"`)

**Data:** `missionControl` snapshot from `usePlatformIntelligence` / `aggregate.ts`

**Typical panels:**

- Live preschool sessions & grievance queue
- Service quality & child wellness indexes
- Intervention launch actions (demo toasts)
- Links to Center Command, Voice of Citizen, AEI analytics, Impact
- District vs state scope changes KPI breadth

---

## 9. AI & intelligence services

| Service path | Purpose |
|--------------|---------|
| `services/ai/index.ts` | Feedback processing pipeline |
| `services/ai/grievance-engine.ts` | Classify grievances, urgency, routing |
| `services/ai/session-analysis/` | Preschool session scorecard (OPI, band, recommendations) |
| `services/ai/sentiment.ts` | Sentiment on feedback text |
| `services/ai/classification.ts` | Category classification |
| `services/ai/translation.ts` | Telugu/Hindi translation (demo) |
| `services/ai/explainability.ts` | Narratives for explanation pages |
| `services/ai/verification.ts` | Activity verification confidence |
| `services/health/centerHealth.ts` | Center health & risk scoring |
| `services/voice/voiceOfCitizen.ts` | Aggregated citizen voice insights |
| `services/interventions/engine.ts` | Intervention recommendations |
| `services/improvement/serviceImprovementEngine.ts` | Center journey phases |
| `services/timeline/buildTimeline.ts` | Timeline events for replay |
| `services/mission-control/aggregate.ts` | Mission Control snapshot |
| `services/outcomes/childWellness.ts` | Child wellness index (CWI) |
| `services/quality/service-quality-index.ts` | Service Quality Index (SQI) |
| `services/impact/metrics.ts` | Public impact metrics |
| `services/worker/growthProfile.ts` | Worker growth (coaching-oriented) |
| `services/story/governmentStory.ts` | State government narrative |
| `services/escalation/workflow.ts` | Grievance escalation rules |
| `services/feedback/intake.ts` | Omnichannel intake normalization |

All AI in this build is **client-side demo logic** with realistic delays and structured outputs — designed for explainability and hackathon demonstration, not production ML inference.

---

## 10. Grievance & feedback lifecycle

```
Beneficiary feedback (any channel)
    → AI sentiment + classification
    → Optional auto-grievance if urgency/rules match
    → Worker / Supervisor assignment
    → Escalation workflow (SLA timers demo)
    → Resolution + beneficiary confirmation
    → Survey trigger → AEI satisfaction component update
```

**Explanation route:** `/grievance-explanation/:id` walks through AI reasoning.

**Role complaint pages:** worker, supervisor, district-admin, state-admin, beneficiary — each uses shared patterns from `RoleComplaints` / dedicated wrappers.

---

## 11. Session recording lifecycle

```
Worker Session Monitor → upload/complete session
    → processSessionUpload() in AppContext
    → analyzePreschoolSession() → scorecard (OPI, band, dimensions)
    → Supervisor Session Review
    → Session Explanation page for judges
    → Feeds AEI worker performance component
```

---

## 12. Demo scenarios & hackathon flows

### 12.1 Scenario generator (`/experience/scenarios`)

Loads scripted data into IndexedDB via `runScenario(id)`:

| Scenario ID | Title (summary) |
|-------------|-----------------|
| `poor_meal_quality` | Meal complaint → grievance → resolution → survey |
| `weak_engagement` | Low session engagement → coaching |
| `infrastructure_escalation` | Infrastructure grievance escalation |
| `repeat_complaints` | Repeat complaint pattern |
| `low_child_engagement` | Child engagement intervention |
| `sqi_decline` | Service quality decline |
| `worker_improvement_journey` | Worker improves over time |
| `complaint_escalation` | Multi-level escalation |
| `recovery_after_intervention` | Post-intervention recovery |
| `training_improves_performance` | Training → better OPI |

### 12.2 Hackathon experience (`/experience/hackathon`)

Guided steps aligned to `hackathonFlow.ts`:

1. Worker Session → 2. AI Evaluation → 3. Parent visibility → 4. Parent Feedback → 5. Complaint generated → 6. Supervisor Intervention → 7. Worker Coaching → 8. Child Outcome → 9. Center Recovery → 10. Dashboard Update

### 12.3 Demo experience (`/experience/demo`)

Quick-login journeys: parent, worker, supervisor, district, state — each runs a scenario and navigates to the relevant home.

---

## 13. Data persistence

| Store | Contents |
|-------|----------|
| `localStorage` `angansakti.user` | Current session user |
| `localStorage` / `storageKeys` | Language, integrations, misc prefs |
| IndexedDB `AnganSakti360_DB` | Activities, sessions, complaints, feedback, notifications, coaching, surveys, child progress, sync queue |

**Offline sync page:** `/settings/sync` — view/retry queue items (worker sidebar link).

**Online toggle:** `AppContext.online` simulates connectivity for demo.

---

## 14. Internationalization & accessibility

- **Languages:** English, Telugu, Hindi — `LangToggle` on login (light variant) and in app header
- **Translations:** `src/lib/i18n.ts` — nav labels, login strings, role names
- **Accessibility:** `AccessibilityControls` — larger text (`gov-text-lg`), high contrast (`gov-high-contrast`) on `document.documentElement`
- **Government branding:** `GOV_BRAND` in `src/lib/govBranding.ts`

---

## 15. Sidebar navigation map (by role)

Navigation is defined in `src/lib/govNav.ts` (`GOV_NAV`). Highlights:

**Supervisor intelligence links:** Center Journey (`/center-command/AWC-TPT-01`), AEI (`/analytics/aei`), Voice of Beneficiary.

**District admin:** Mission Control, compliance, interventions, outcomes, integrations, reports, public impact (`/impact`).

**State admin:** Mission Control, statewide complaints, impact, government story, integrations, reports.

---

## 16. Recommended judge / demo path (15 minutes)

1. **Login** `/` — Worker → Continue (demo credentials)
2. **Worker dashboard** `/worker` — log activity or open session monitor
3. **Session explanation** — complete a session → `/session-explanation/:id`
4. **Logout** → Login as **Parent / Caregiver** → submit feedback
5. **Scenario** `/experience/scenarios` — run `poor_meal_quality`
6. **Supervisor** — `/supervisor/complaints`, `/supervisor/coaching`
7. **Center Command** `/center-command/AWC-TPT-01` — all tabs
8. **AEI** `/analytics/aei` → `/aei-explanation/AWC-TPT-01`
9. **District Mission Control** `/district-admin/mission-control`
10. **Public** `/public/transparency` and `/impact`
11. **Hackathon tour** `/experience/hackathon`

---

## 17. Page file index (81 page modules)

| Folder | Files |
|--------|-------|
| `pages/` root | `Index.tsx`, `Login.tsx`, `NotFound.tsx` |
| `beneficiary/` | 9 pages |
| `worker/` | 17 pages |
| `supervisor/` | 15 pages |
| `admin/` | 6 pages (shared by district admin routes) |
| `district-admin/` | 2 pages |
| `state-admin/` | 7 pages |
| `shared/` | 16 pages |
| `public/` | 1 page |
| `experience/` | 3 pages |
| `demo/` | 1 page (legacy scenario duplicate) |

---

## 18. Related documentation in repo

| File | Notes |
|------|-------|
| `ANGANSAKTI_360_FULL_OVERVIEW.md` | Earlier long-form overview |
| `APPLICATION_OVERVIEW.md` | Shorter legacy overview |
| **This file** | **Current complete route + functionality reference** |

---

## 19. Quick reference — all URLs alphabetically

```
/                                    Login
/admin/*                             → district-admin redirect
/aei-explanation/:id
/analytics/aei
/beneficiary
/beneficiary/activities
/beneficiary/complaints
/beneficiary/feedback
/beneficiary/notifications
/beneficiary/omnichannel-feedback
/beneficiary/profile
/beneficiary/status
/beneficiary/surveys
/center-command/:id
/center-digital-view/:id
/center-health/:id
/center-journey/:id          (alias center-command)
/center-score/:id
/center-timeline/:id
/demo/scenarios              → /experience/scenarios
/district-admin
/district-admin/alerts       → complaints
/district-admin/centers
/district-admin/complaints
/district-admin/compliance
/district-admin/integrations
/district-admin/interventions
/district-admin/mission-control
/district-admin/outcomes
/district-admin/reports
/district-admin/workers
/experience/demo
/experience/hackathon
/experience/scenarios
/grievance-explanation/:id
/impact
/public/transparency
/risk-explanation/:id
/session-explanation/:id
/settings/sync
/sqi-explanation/:id
/state-admin
/state-admin/complaints
/state-admin/compliance
/state-admin/impact
/state-admin/integrations
/state-admin/mission-control
/state-admin/notifications
/state-admin/outcomes
/state-admin/reports
/state-admin/story
/supervisor
/supervisor/alerts
/supervisor/audit/:id
/supervisor/centers
/supervisor/centers/:id
/supervisor/child-outcomes
/supervisor/coaching
/supervisor/complaints
/supervisor/development
/supervisor/interventions
/supervisor/map
/supervisor/outcomes          (alias child-outcomes)
/supervisor/reports
/supervisor/session-review
/supervisor/verifications
/voice-of-citizen
/worker
/worker/activity/:id
/worker/alerts
/worker/attendance
/worker/attendance-history
/worker/activities
/worker/child-progress
/worker/complaints
/worker/growth
/worker/history
/worker/performance
/worker/profile
/worker/session-feedback
/worker/session-history
/worker/session-monitor
/worker/training
/worker/uploads
```

---

*End of document — AnganSakti 360 Application Complete Overview*

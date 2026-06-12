# AnganSakti 360 — Complete Application Overview

**Women Development and Child Welfare Department (WDCW), Government of Andhra Pradesh**

This document is the authoritative reference for the **current** AnganSakti 360 platform: all routes, roles, pages, intelligence features, data flows, and demo paths. It reflects the **Government Command, Transparency, and Continuous Improvement System** with WDCW AP government UI and production-style operational modules.

**Latest production phase (highlights):**
- **Mission Control** primary landing: `/district-admin/mission-control`, `/state-admin/mission-control`
- **Unified Center Command**: `/center-command/:id` (alias `/center-journey/:id`)
- **Statewide AEI**: `/analytics/aei`, `/center-score/:id`, `/aei-explanation/:id` (7 weighted components including verification confidence & intervention success)
- **Supervisor outcomes alias**: `/supervisor/outcomes`

---

## 1. Executive summary

AnganSakti 360 is a single connected operational platform for Anganwadi service delivery—not a collection of separate hackathon modules. It links:

- **Worker** field operations (attendance, activities, preschool sessions, service proof)
- **AI** session observation, sentiment, grievance classification, and explainable recommendations
- **Beneficiary** feedback across multiple channels
- **Grievance** workflows with SLA and escalation
- **Supervisor / district / state** monitoring, interventions, and command views
- **Outcome indices** (AEI, SQI, CWI) that drive improvement loops rather than punitive scoring

**Design principle:** Red/orange status always includes **supportive coaching and recommended actions**, not failure labels.

**Pilot focus:** Tirupati district demo data; primary demo center **AWC-TPT-01 (Alipiri Center)**.

---

## 2. Official identity and user experience

| Element | Description |
|--------|-------------|
| **Product name** | AnganSakti 360 |
| **Department** | Women Development and Child Welfare Department |
| **Government** | Government of Andhra Pradesh |
| **Environment** | Pilot Environment (label in header; demo data when scenarios run) |
| **Languages** | English, తెలుగు (Telugu), हिन्दी (Hindi) |
| **Accessibility** | Larger text (A+), high contrast (header controls) |

### Government shell (authenticated users)

- **Government header:** AP emblem area, department name, pilot label, district context, sync status, language switcher, accessibility, transparency drawer, registered participant name and role
- **Sidebar:** Grouped navigation (Operations, Service Delivery, Citizen Feedback, Monitoring, Intelligence, Administration, Reports, Communication)
- **Page frame:** Breadcrumbs, page title and description, last updated metadata, export/print, transparency button
- **Transparency drawer:** Data source, last sync, AI usage in plain language, non-punitive service commitment

### Public (no login)

- **`/public/transparency`** — Public Information & Transparency Portal (about department, services, dashboard, channels, FAQ, data transparency, contact, commitments)

---

## 3. Technology stack

| Layer | Technology |
|-------|------------|
| UI | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui components |
| Routing | React Router v6 |
| State | React Context (`AppContext` + `usePlatformIntelligence`) |
| Persistence | IndexedDB (`AnganSakti360_DB` v4) + localStorage for session/auth |
| Charts | Recharts |
| Dates | date-fns |
| Mobile-ready | Capacitor (optional native shell) |
| Offline | Offline-first patterns; sync queue and connectivity toggle |

**Entry:** `src/main.tsx` → `App.tsx` → `AppProvider` → routes.

**Layout:** `Protected` / `MultiRoleProtected` / `AuthRequired` wrap pages in `AppShell` (except login, public, and some experience routes).

---

## 4. Roles and home routes

Five roles only (no additional roles):

| Role | Home route | Landing experience |
|------|------------|-------------------|
| **Beneficiary** (parent/caregiver) | `/beneficiary` | Citizen Services Portal |
| **Worker** (Anganwadi worker) | `/worker` | Daily Operations Console |
| **Supervisor** | `/supervisor` | Monitoring & Development Command |
| **District Admin** | `/district-admin/mission-control` | **District Mission Control** |
| **State Admin** | `/state-admin/mission-control` | **State Mission Control** |

Legacy `/admin` and `/admin/*` redirect to `/district-admin`.

### Demo login

- **URL:** `/` (formal government onboarding)
- **Default credentials:** Phone `9876543210`, Password `demo1234` (pre-filled for worker; change access category before sign-in)

| Access category | Demo user | Phone (typical) |
|-----------------|-----------|-----------------|
| Beneficiary | Sunita Rao | 9876501234 |
| Worker | Lakshmi Devi | 9876543210 |
| Supervisor | Ravi Kumar | 9123456780 |
| District Admin | Dr. Meena Reddy | 9000000001 |
| State Admin | Sri Venkatesh Rao | 9000000099 |

---

## 5. Platform indices (KPIs)

### Anganwadi Excellence Index (AEI)

Final **center health** indicator. Routes: `/center-score/:id`, embedded on Center Journey and dashboards.

| Component | Weight |
|-----------|--------|
| Worker performance | 22% |
| Child engagement | 16% |
| Beneficiary satisfaction | 16% |
| Complaint closure | 12% |
| Attendance/compliance | 12% |
| Service verification confidence | 11% |
| Intervention success | 11% |

| Band | Score | Meaning |
|------|-------|---------|
| **Green** | ≥ 75 | Healthy service delivery |
| **Orange** | 55–74 | Improvement opportunity + coaching path |
| **Red** | &lt; 55 | Attention required + supportive interventions (not punitive) |

### Service Quality Index (SQI)

Center-level service quality composite; explainable at `/sqi-explanation/:id`.

### Child Wellness Index (CWI)

Derived from child progress records (attendance, nutrition, preschool participation, development notes). Complements SQI on outcome pages.

### Service improvement loop

Triggers (via `applyServiceImprovement`): complaint closed, positive survey, coaching completed, green session, center recovery → AEI/satisfaction components update; notifications to state role.

---

## 6. End-to-end intelligence loop

### Center lifecycle (Center Command `/center-command/:id` — alias `/center-journey/:id`)

Sequential narrative:

1. **Service Delivered** — attendance, nutrition, preschool logs with GPS/photo evidence  
2. **AI Verified** — session OPI, band, engagement (link to `/session-explanation/:id`)  
3. **Beneficiary Responded** — feedback and sentiment  
4. **Complaint Generated** — if thresholds met (link to `/grievance-explanation/:id`)  
5. **Resolution Completed** — closure and trust update  
6. **Training Assigned** — coaching and interventions  
7. **Outcome Improved** — CWI/child progress and AEI recovery  

### Intervention Operating System

Routes: `/supervisor/interventions`, `/district-admin/interventions`

| Type | Examples |
|------|----------|
| Training | Accelerated training pathway |
| Worker coaching | Supportive modules |
| Infrastructure support | Facility upgrades |
| Supervisor attention | Field oversight |
| Resource allocation | Nutrition/outreach |
| Community outreach | Parent trust recovery |
| Monitoring visit | Structured verification visit |

**Statuses:** Proposed → Approved → Active → Completed → Impact Measured (plus owner, timeline, expected impact).

### Explainable AI routes

| Route | Purpose |
|-------|---------|
| `/session-explanation/:id` | Teaching insights, engagement, syllabus coverage |
| `/grievance-explanation/:id` | Why routed/escalated, SLA, confidence |
| `/risk-explanation/:id` | Child/center risk factors |
| `/sqi-explanation/:id` | SQI calculation transparency |

---

## 7. Complete route catalog

**Total authenticated + public + experience routes: ~75** (including dynamic `:id` routes).

### 7.1 Public and authentication

| Route | Access | Page / function |
|-------|--------|-----------------|
| `/` | Public | Government onboarding login (access categories, pilot disclaimer, department panels) |
| `/public/transparency` | Public | Transparency portal (8 sections, anonymized metrics) |
| `/impact` | Public | Public Impact — six outcome questions, district AEI benchmarking, before/after |
| `/experience/hackathon` | Public | Judge walkthrough — auto demo full operating loop |
| `/experience/scenarios` | Public | Scenario generator — populates AppContext/IndexedDB |
| `/experience/demo` | Public | Role-based demo journey links |
| `/demo/scenarios` | Redirect | → `/experience/scenarios` |

### 7.2 Beneficiary (parent/caregiver) — 8 routes

| Route | Function |
|-------|----------|
| `/beneficiary` | **Control Room** — children enrolled, today’s nutrition/attendance/activities, grievance count, scheme notices, large actions for feedback |
| `/beneficiary/omnichannel-feedback` | **Submit feedback through any channel** — mobile, IVR, WhatsApp, SMS, QR, handwritten/OCR, photo |
| `/beneficiary/feedback` | Star rating + text feedback; AI sentiment; may create grievance |
| `/beneficiary/complaints` | Track grievances; status and history |
| `/beneficiary/status` | Service status at center |
| `/beneficiary/activities` | View worker-logged activities (photos, descriptions) |
| `/beneficiary/surveys` | Post-closure / scheduled satisfaction surveys |
| `/beneficiary/notifications` | **Communication center** — citizen messages |
| `/beneficiary/profile` | Profile, language preference |

### 7.3 Worker — 18 routes

| Route | Function |
|-------|----------|
| `/worker` | **Daily Operations Console** — today’s duties, attendance state, quick actions, center AEI strip |
| `/worker/attendance` | GPS check-in/out, children count |
| `/worker/attendance-history` | Past attendance records |
| `/worker/activities` | Log nutrition, health, preschool, etc. |
| `/worker/session-monitor` | Record preschool session (metadata, upload, AI processing) |
| `/worker/session-history` | Past sessions and **support summaries** (bands) |
| `/worker/performance` | **Teaching insights** — OPI trends, recommendations |
| `/worker/training` | Assigned training modules |
| `/worker/growth` | **Workforce development journey** — before/after OPI, trajectory, AI recommendations |
| `/worker/child-progress` | Log child observations → feeds CWI |
| `/worker/complaints` | **Pending responses** — grievances assigned to worker |
| `/worker/session-feedback` | Session-related feedback view |
| `/worker/history` | **Service submission queue** / verification history |
| `/worker/uploads` | Media uploads |
| `/worker/activity/:id` | Single activity verification detail |
| `/worker/alerts` | **Communication center** |
| `/worker/profile` | Worker profile |
| `/settings/sync` | Offline sync center (queue, retry) |

### 7.4 Supervisor — 15 routes

| Route | Function |
|-------|----------|
| `/supervisor` | **Monitoring command** — district centers, complaints, feedback, AEI strip, links to interventions |
| `/supervisor/centers` | Center list and health |
| `/supervisor/centers/:id` | Center detail; link to Center Journey |
| `/supervisor/verifications` | Activity verification queue |
| `/supervisor/session-review` | **Session observation** — AI scorecards, coaching triggers |
| `/supervisor/coaching` | Assign/track coaching |
| `/supervisor/development` | **Workforce development** across workers |
| `/supervisor/child-outcomes` | Center child outcomes / CWI trends |
| `/supervisor/interventions` | **Intervention OS** — launch/approve interventions |
| `/supervisor/complaints` | **Grievance monitoring** — SLA, escalation, advance status |
| `/supervisor/audit/:id` | Audit detail for activity |
| `/supervisor/alerts` | **Communication center** |
| `/supervisor/map` | Geographic center map |
| `/supervisor/reports` | District reports export |

### 7.5 District admin — 10 routes (+ legacy redirect)

| Route | Function |
|-------|----------|
| `/district-admin` | **District Mission Control** (command layout: metrics, live complaints, interventions, district rankings) |
| `/district-admin/compliance` | Compliance monitoring |
| `/district-admin/centers` | Centers covered — registry |
| `/district-admin/workers` | Workforce registry |
| `/district-admin/complaints` | District grievance monitoring |
| `/district-admin/interventions` | District intervention board (approve, activate, measure impact) |
| `/district-admin/outcomes` | District child outcome trends |
| `/district-admin/integrations` | External integrations (district scope) |
| `/district-admin/reports` | **Government reporting mode** — official header, period, approval placeholder, PDF/print |
| `/district-admin/alerts` | Redirect → complaints |

### 7.6 State admin — 10 routes

| Route | Function |
|-------|----------|
| `/state-admin` | **State Mission Control** (same component as district, statewide scope) |
| `/state-admin/mission-control` | Alternate state command URL (same Mission Control UI) |
| `/state-admin/complaints` | Statewide grievance monitoring |
| `/state-admin/compliance` | State compliance view |
| `/state-admin/outcomes` | Statewide child outcomes |
| `/state-admin/impact` | State impact narrative |
| `/state-admin/story` | Government story / policy insights |
| `/state-admin/integrations` | State integrations |
| `/state-admin/reports` | Official reports |
| `/state-admin/notifications` | **Communication center** (statewide) |

### 7.7 Unified intelligence (multi-role)

| Route | Roles | Function |
|-------|-------|----------|
| `/center-command/:id` | beneficiary, worker, supervisor, district_admin, state_admin | **Unified Center Command** — tabs: Overview, Operations, Citizen Voice, Health, Coaching, Intervention, Timeline, Impact |
| `/center-journey/:id` | same as center-command | Alias route (same UI) |
| `/analytics/aei` | supervisor, district_admin, state_admin | Statewide AEI table, filters, district benchmarking |
| `/center-score/:id` | worker, supervisor, district_admin, state_admin | Official AEI breakdown and trend |
| `/aei-explanation/:id` | authenticated | Explainable Government AI for AEI |
| `/center-health/:id` | supervisor, district_admin, state_admin | Risk engine — score, confidence, trend, factors, actions |
| `/voice-of-citizen` | supervisor, district_admin, state_admin | Beneficiary intelligence — channels, sentiment, clusters, AI summary |
| `/center-digital-view/:id` | supervisor, district_admin, state_admin | Center digital twin summary |
| `/center-timeline/:id` | supervisor, district_admin, state_admin | Timeline replay of center events |
| `/session-explanation/:id` | any authenticated | Explainable session AI |
| `/grievance-explanation/:id` | any authenticated | Explainable grievance routing |
| `/risk-explanation/:id` | any authenticated | Explainable risk |
| `/sqi-explanation/:id` | any authenticated | Explainable SQI |

---

## 8. Core functional modules

### 8.1 Service delivery and evidence

- Workers log **activities** (type, description, children present, GPS, photo, AI confidence).
- **Session monitor** captures preschool sessions → upload → `processSessionUpload` → AI scorecard (OPI, green/orange/red band, training module IDs).
- **Submit service proof** via photos and verification pipeline.

### 8.2 Beneficiary feedback (omnichannel)

Channels supported in platform logic:

- Mobile app / web  
- IVR  
- WhatsApp  
- SMS  
- QR form intake  
- Handwritten / OCR  
- Photo upload  

Flow: intake → AI sentiment/category → optional **grievance** creation → worker/supervisor/district resolution → optional **survey** on closure → **service improvement** bump.

### 8.3 Grievance workflow

Typical statuses: `submitted` → `worker_review` → `supervisor_review` → `district_escalation` → `closed`

- AI classification (category, urgency, sentiment)  
- SLA due dates  
- Repeat complaint tracking  
- `advanceComplaint` applies escalation rules  
- Closure triggers satisfaction survey scheduling and AEI improvement  

Shared complaint UI components used across worker, supervisor, district, and state pages.

### 8.4 Coaching and training

- AI suggests training modules from session scorecard  
- Supervisors assign **coaching** with notes and due dates  
- Worker **training** page lists modules  
- **Worker growth** page shows longitudinal bands and recommendations  

### 8.5 Notifications (Communication Center)

In-app notifications by role; categories include operational alerts, coaching updates, escalations, and system notices. Stored in IndexedDB and AppContext.

### 8.6 Integrations

`/district-admin/integrations` and `/state-admin/integrations` — demo integration status (external systems placeholder).

### 8.7 Offline and sync

- Connectivity toggle in header  
- `/settings/sync` — sync queue, pending uploads  
- IndexedDB + localStorage persistence  
- Activities/sessions/feedback survive refresh  

---

## 9. Demo scenarios and judge path

### Scenario generator (`/experience/scenarios`)

| Scenario ID | Title |
|-------------|--------|
| `poor_meal_quality` | Poor Meal Quality |
| `weak_engagement` | Low engagement → coaching |
| `infrastructure_escalation` | Infrastructure Complaint |
| `repeat_complaints` | Repeat complaints → district intervention |
| `low_child_engagement` | Low Child Engagement |
| `sqi_decline` | Repeated complaints → lower SQI |
| `training_improves_performance` | Worker Improvement Journey |
| `worker_improvement_journey` | Alias → training uplift |
| `complaint_escalation` | Complaint Escalation |
| `recovery_after_intervention` | Recovery After Intervention |

Running a scenario merges payload into live AppContext state and IndexedDB (feedback, complaints, sessions, child progress, coaching, etc.).

### Recommended judge walkthrough (~10 minutes)

1. `/experience/hackathon` — **Start judge walkthrough** (full loop)  
2. `/center-journey/AWC-TPT-01` — unified center story  
3. `/center-score/AWC-TPT-01` — AEI transparency  
4. Login as **State Admin** → `/state-admin` (Mission Control)  
5. `/voice-of-citizen` — beneficiary intelligence  
6. `/impact` — public impact dashboard  
7. `/public/transparency` — citizen portal  

---

## 10. AppContext API (summary)

Key capabilities exposed to all pages:

| Area | Methods / state |
|------|-----------------|
| Auth | `user`, `login`, `logout`, `lang`, `setLang`, `t` |
| Connectivity | `online`, `toggleOnline`, `lastSync` |
| Operations | `activities`, `addActivity`, `updateActivity`, `sessions`, `processSessionUpload`, … |
| Feedback | `feedback`, `submitFeedback`, `submitOmnichannel`, `omnichannelInputs` |
| Grievances | `complaints`, `updateComplaint`, `advanceComplaint` |
| Coaching | `coachingAssignments`, `assignCoaching`, `trainingRecommendations` |
| Outcomes | `childProgress`, `addChildProgress`, `surveys`, `submitSurvey`, `scheduleSurvey` |
| Intelligence | `getAEI`, `getCenterHealth`, `getOperationalFlow`, `getWorkerGrowth`, `voiceOfCitizen`, `missionControl`, `getTimeline`, `excellenceIndexes`, `serviceQualityScores`, `childWellnessIndexes` |
| Interventions | `interventions`, `refreshInterventions`, `updateIntervention`, `launchIntervention` |
| Improvement | `applyServiceImprovement`, `runHackathonFlow`, `runScenarioById`, `listScenarios` |
| Transparency | `publicTransparency`, `impactMetrics`, `governmentStory` |
| Demo | `demoModeActive`, `setDemoModeActive`, `runJourney` |

Implementation split: `AppContext.tsx` (core data + grievance/session flows) + `usePlatformIntelligence.ts` (AEI, CWI, interventions, mission control, scenarios).

---

## 11. IndexedDB schema (`AnganSakti360_DB` v4)

| Store | Contents |
|-------|----------|
| `activities` | Worker activity logs |
| `feedback` | Beneficiary feedback entries |
| `complaints` | Grievance records |
| `notifications` | Platform notifications |
| `session_recordings` | Session metadata and status |
| `session_scores` | Scorecards |
| `coaching_assignments` | Coaching records |
| `training_recommendations` | AI training suggestions |
| `omnichannel_inputs` | Channel intake ledger |
| `service_quality_scores` | SQI snapshots |
| `child_progress` | Child outcome observations |
| `surveys` | Beneficiary surveys |
| `interventions` | Intervention recommendations |
| `audit_logs`, `escalations`, `worker_progress`, `session_offline_queue` | Supporting audit/queue data |

---

## 12. AI services (client-side demo)

| Service | Location | Role |
|---------|----------|------|
| Session analysis | `services/ai/session-analysis` | OPI, bands, engagement, syllabus, training IDs |
| Grievance engine | `services/ai/grievance-engine` | Category, urgency, SLA |
| Sentiment / feedback | `services/ai` | Feedback processing |
| Explainability | `services/ai/explainability` | Session, grievance, risk, SQI panels |
| AEI | `services/excellence/aei` | Weighted excellence index |
| Child wellness | `services/outcomes/childWellness` | CWI |
| Voice of citizen | `services/voice/voiceOfCitizen` | Aggregated beneficiary intelligence |
| Center health | `services/health/centerHealth` | Risk factors and actions |
| Interventions | `services/interventions/engine` | Generate intervention recommendations |
| Mission control | `services/mission-control/aggregate` | Statewide snapshot |
| Scenarios | `services/demo/scenarioGenerator`, `hackathonFlow` | Demo data injection |

---

## 13. Key source directories

```
src/
├── App.tsx                 # All routes
├── context/
│   ├── AppContext.tsx      # Global state & workflows
│   └── usePlatformIntelligence.ts
├── components/
│   ├── app/                # AppShell, Protected, StatCard, LangToggle, SyncIndicator
│   ├── gov/                # Government header, page frame, transparency, GovCard
│   ├── unified/            # AEI badge, operational flow, outcome strips
│   ├── interventions/      # InterventionBoard
│   ├── explainability/     # AI explain panels
│   └── timeline/           # TimelineReplay
├── pages/
│   ├── beneficiary/        # Citizen portal pages
│   ├── worker/             # Daily operations
│   ├── supervisor/         # Monitoring command
│   ├── district-admin/     # District pages
│   ├── state-admin/        # State + MissionControl
│   ├── admin/              # Shared admin (compliance, centers, reports)
│   ├── shared/             # Center journey, impact, explain routes
│   ├── public/             # Transparency portal
│   └── experience/         # Hackathon, scenarios, demo
├── services/               # AI, excellence, health, voice, demo, improvement
├── types/                  # platform, session, intelligence, feedback-channels
├── data/                   # mockData, mockSessions, mockGrievances
└── lib/                    # i18n, govNav, govBranding, storage, rolePaths
```

---

## 14. Government terminology mapping

| Former / technical | Official UI term |
|--------------------|------------------|
| Dashboard | Control Room / Mission Control |
| Alerts | Notifications / Communication Center |
| AI Score | Service Insight |
| Risk | Attention Required |
| Session Review | Session Observation |
| Complaint Analytics | Grievance Monitoring |
| Worker Performance | Workforce Development |
| Upload Evidence | Submit Service Proof |
| User | Registered Participant |
| Demo | Pilot Environment |
| Omnichannel Intake | Submit Feedback Through Any Channel |

---

## 15. What was intentionally not changed

To preserve hackathon stability and architecture:

- **No new roles**  
- **Same route paths** (only landing *content* for district/state is Mission Control)  
- **Same AppContext contracts** and grievance/session pipelines  
- **Same IndexedDB stores**  
- **No separate hackathon app** — `/experience/hackathon` is a walkthrough inside this app  

---

## 16. Related documentation

| File | Notes |
|------|--------|
| `ANGANSAKTI_360_FULL_OVERVIEW.md` | Earlier long overview (may predate some intelligence features) |
| `APPLICATION_OVERVIEW.md` | Shorter legacy overview |

**This file (`ANGANSAKTI_360_COMPLETE_APPLICATION_OVERVIEW.md`) should be used as the primary up-to-date reference** for pages, routes, and functionality as of the government redesign and intelligence layer integration.

---

## 17. Quick reference — demo center

| Field | Value |
|-------|--------|
| Center ID | `AWC-TPT-01` |
| Name | Alipiri Center |
| District | Tirupati |
| Demo worker | Lakshmi Devi (`W-1042`) |
| Demo beneficiary | Sunita Rao (`B-1001`) |

**Deep links for demos:**

- Center Journey: `/center-journey/AWC-TPT-01`  
- AEI: `/center-score/AWC-TPT-01`  
- Health: `/center-health/AWC-TPT-01`  
- SQI explain: `/sqi-explanation/AWC-TPT-01`  

---

*Document generated for the Child Welfare Hackathon — AnganSakti 360 platform.*

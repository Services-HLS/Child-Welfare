# Anganwadi Worker Login — Complete Guide  
**AnganSakti 360 · Government of Andhra Pradesh · WDCW**

This document covers **only** the Anganwadi worker path: how to log in, what opens after login, every worker screen, and the daily work flow. It does not describe beneficiary, supervisor, or admin logins.

---

## 1. Worker login (entry point)

| Step | What happens |
|------|----------------|
| 1 | Open the app → **Login** page (`/`) |
| 2 | Select role **Worker** |
| 3 | Enter phone **`9876543210`** and password **`demo1234`** (demo) |
| 4 | Tap **Sign in** |
| 5 | App sets language to **English** and opens **`/worker/dashboard`** |

**Demo worker after login**

| Field | Value |
|-------|--------|
| Name | Lakshmi Devi |
| Worker ID | W-1042 |
| Center | Alipiri Center |
| Center ID | AWC-TPT-01 |
| District | Tirupati |

**Language**

- Always **English** when you log in or log out.  
- Change to Telugu/Hindi only with the **language toggle in the top header** while you are signed in.

**Source:** `src/pages/Login.tsx`, `src/context/AppContext.tsx` (`login` / `logout`), `src/lib/rolePaths.ts` (worker home = `/worker/dashboard`).

---

## 2. What you see after login

### Top bar

- AP WDCW branding, **Online / Offline**, district name  
- Language (EN / TE / HI), text size, contrast  
- Your name (e.g. Lakshmi Devi)

### Side menu (5 sections)

| Section | Menu items |
|---------|------------|
| **Operations** | Daily Operations, My day, Attendance, Session recording |
| **Service Delivery** | Service delivery tracker, Child outcomes, Service submission queue, Training & coaching, Assigned issues |
| **Monitoring** | My growth journey |
| **Communication** | Communication center |
| **Profile** | Identity & settings, Help & support, Sync settings |

On mobile, the first five **Operations** links appear in the **bottom bar**.

### Worker layout on each page

- Dark **status strip**: your name, center, today’s date, network, sync time, children count  
- Page title in simple language (not admin jargon)  
- **Blue help button** (bottom-right) → Help & support  
- Content uses **full width** of the main area (sidebar open or collapsed)

**Source:** `src/components/app/AppShell.tsx`, `src/components/worker/WorkerFieldLayout.tsx`, `src/lib/govNav.ts`.

---

## 3. Daily work flow (recommended order)

```
Login
  → Daily Operations Console (home)
  → Attendance (Check-in)
  → Preschool Session Recording
  → Session Support Summary (AI coaching)
  → Service Delivery Tracker (meals, health, visits, etc.)
  → Service Submission Queue (upload proof)
  → Assigned Issues (grievances from beneficiaries)
  → Training & Coaching
  → My Growth Journey
  → Attendance (Check-out) / End day
```

**Anytime:** My day (planner), Communication center, Child outcomes, Help & support, Sync offline data.

---

## 4. Every worker page (route → function)

### Operations

#### `/worker/dashboard` — Daily Operations Console  
**Home page after login.**

- Today’s status: attendance state, sessions, pending work, issues, training, service completion %  
- **Quick actions:** Check in, Start preschool, Submit activity, Open issues, Training, Sync  
- **Full-day timeline:** Attendance → Preschool → Nutrition/activities → Uploads → Issues → End day  
- Offline queue message when there is no network  

---

#### `/worker/my-day` — My day (planner)

- List of **today’s steps** (check-in, session, nutrition, services, issues, sync) with done / in progress / pending  
- Count of **completed** vs **pending** tasks  
- **Reminders** from messages  
- Link back to Daily Operations Console  

---

#### `/worker/attendance` — Attendance

- **Check-in** and **Check-out** with GPS and time  
- Geo-fence message (at center / will verify when at center)  
- Note: unusual timing is for supervisor review, **not a penalty**  
- Today’s shift times; **Queued** badge if saved offline  
- Recent attendance list → **Attendance history** (`/worker/attendance-history`)  

**Data:** `localStorage` key `awai.attendance`.

---

#### `/worker/session-monitor` — Preschool Session Recording  
**Classroom work only** (not the same as “activities” for meals/health).

**Before recording**

- Activity: Storytelling, Rhymes, Drawing, Alphabet, Group play, Nutrition awareness, Custom  
- Age group, duration, syllabus topic  
- Number of children  
- Video or **audio only**  
- Optional notes  

**During / after**

- Record, pause, stop (minimum ~1 minute)  
- Upload; works **offline** (queues until sync)  
- AI runs when online → opens **Session Support Summary**  

**Past sessions:** `/worker/session-history`

---

#### `/worker/session-feedback/:id` — Session Support Summary  
**Opens automatically after session upload** (not in side menu).

Coaching-style AI feedback:

- Support level (green / orange / red = guidance, not punishment)  
- Session quality, engagement, communication, activity completion, classroom readiness, participation  
- **What went well** → **What to improve** → **Suggested activity** → **Supervisor guidance**  
- Chart of **last 3 sessions**  
- Optional note to supervisor  

---

### Service delivery

#### `/worker/activities` — Service Delivery Tracker  
**All government services except classroom video session.**

Log with photo, GPS, child count, voice note:

- Preschool activities (non-recording tasks)  
- Nutrition distribution  
- Health activities  
- Home visits  
- Community outreach  
- Infrastructure updates  

AI checks evidence when uploaded.

---

#### `/worker/child-progress` — Child Outcomes & Observations

- Per child: attendance, nutrition, preschool participation, notes  
- Quick templates; wellness **alerts** for absence or concern  
- History for your center  

---

#### `/worker/uploads` — Service Submission Queue

- Activities waiting for **photo proof**  
- Upload → AI verification (confidence)  
- Shows **offline queue** count  
- Old link `/worker/history` redirects here  
- Detail per item: `/worker/activity/:id`  

---

#### `/worker/training` — Training & Coaching Center

- Supervisor coaching tasks  
- **Assigned** modules (from your session AI)  
- **Recommended** modules with expected improvement  
- **Completed** modules  
- Offline guides (demo)  

---

#### `/worker/complaints` — Assigned Issues & Responses

- Only grievances **assigned to you**  
- Source: voice, WhatsApp, QR, survey, supervisor  
- Category, urgency, due date, stage  
- Add actions, evidence, move toward closure  
- Linked to **beneficiary feedback** in the wider system (you only see your assignments)  

---

### Monitoring

#### `/worker/growth` — My Growth Journey

- Your support level over time  
- Before/after coaching  
- Weekly trend charts  
- Training and session counts  
- Recommendations and projected improvement  
- Link to training  

**Not shown:** district/state admin dashboards.

---

### Communication & profile

#### `/worker/alerts` — Communication Center

Tabs:

1. Notifications  
2. Supervisor messages  
3. Issue / complaint updates  
4. Training messages  
5. Department announcements  

Priority labels; readable offline.

---

#### `/worker/profile` — Worker Identity & Settings

- Your details and center  
- **Language** change  
- **Sync** status and queue size  
- Sign out  

---

#### `/worker/help-support` — Help & Support

- **Voice help** (listen to answers)  
- FAQs: check-in, session vs activity, support levels  
- Offline and sync troubleshooting  
- Helpline link (demo)  

---

#### `/settings/sync` — Sync settings

- Retry uploads and manage offline queue (from quick action on dashboard)

---

### Extra routes (no sidebar link)

| Route | Use |
|-------|-----|
| `/worker/performance` | Teaching Guidance Center (tips from AI; `/worker/teaching-insights` redirects here) |
| `/worker/session-history` | List of recorded sessions |
| `/worker/attendance-history` | Full attendance calendar |
| `/worker` | Redirects to dashboard |

---

## 5. What the worker portal is for

| You do this | System does this |
|-------------|------------------|
| Check in at center | Stores GPS, time, offline if needed |
| Record preschool session | AI coaching summary for you; insights for supervisors (you don’t manage those screens) |
| Log meals, health, visits | Service evidence and verification |
| Log child observations | Child wellness tracking |
| Respond to assigned issues | Closes loop on beneficiary complaints |
| Complete training | Links to weak areas from your sessions |
| Check growth page | Shows your improvement journey |

**Design for village use:** large buttons, plain words, voice help, works without internet then syncs later.

---

## 6. Offline, sync, and voice

| Feature | Where |
|---------|--------|
| Offline badge | Header + attendance / session pages |
| Save locally | Attendance, sessions, activities |
| Sync queue | Profile, dashboard, uploads; `/settings/sync` |
| Voice | Help page; notes on activities and sessions |

---

## 7. Quick reference — all worker URLs

```
/                          → Login (choose Worker)
/worker/dashboard          → Daily Operations Console ★ HOME
/worker/my-day             → My day planner
/worker/attendance         → Check-in / Check-out
/worker/attendance-history → Attendance calendar
/worker/session-monitor     → Preschool recording
/worker/session-history    → Past sessions
/worker/session-feedback/:id → AI coaching summary
/worker/activities         → Service delivery tracker
/worker/child-progress     → Child outcomes
/worker/uploads            → Submission queue
/worker/activity/:id       → One activity detail
/worker/training           → Training & coaching
/worker/complaints         → Assigned issues
/worker/growth             → My growth journey
/worker/performance        → Teaching guidance
/worker/alerts             → Communication center
/worker/profile            → Identity & settings
/worker/help-support       → Help & voice
/settings/sync             → Sync controls
```

---

## 8. Main code locations (worker only)

| Item | File |
|------|------|
| Login | `src/pages/Login.tsx` |
| Routes | `src/App.tsx` (paths under `/worker/*`) |
| Worker menu | `src/lib/govNav.ts` → `worker:` |
| Home URL | `src/lib/rolePaths.ts` |
| State & AI | `src/context/AppContext.tsx` |
| Worker UI shell | `src/components/worker/WorkerFieldLayout.tsx` |
| Pages | `src/pages/worker/*.tsx` |

---

*Anganwadi worker login and portal only — AnganSakti 360 hackathon build.*

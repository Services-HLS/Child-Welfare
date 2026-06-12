# AnganSakti 360 — End-to-End Flow Checklist

> **Companion to:** [../docs/APPLICATION_FUNCTIONAL_VERIFICATION_REPORT.md](../docs/APPLICATION_FUNCTIONAL_VERIFICATION_REPORT.md)  
> **Last run summary:** [LAST_RUN_SUMMARY.md](./LAST_RUN_SUMMARY.md) · **Bugs:** [../docs/BUG_TRACKER.md](../docs/BUG_TRACKER.md)

## Executable verification (automated)

| Command | What it does |
|---------|----------------|
| `npm run verify:app` | Evidence-based report + route health + state probes + runtime HTTP + bug tracker + last run summary |
| `VERIFY_SKIP_BUILD=1 npm run verify:app` | Fast run (skip production build) |
| `VERIFY_E2E=1 npm run verify:app` | Above + Playwright browser flows (requires `npm run dev` + `@playwright/test`) |

Evidence captured under: `TESTING/evidence/{YYYY-MM-DD}/{role}/`

Each automated test records: **Expected → Actual → Evidence path → Console status → Timestamp → Duration**

**Demo login:** Phone `9876543210` · Password `demo1234`

---

## Completion tracker

| Area | Completed | Remaining | % |
|------|-------------|-----------|---|
| Parent (Beneficiary) | 0 | 14 flows | 0% |
| Worker | 0 | 12 flows | 0% |
| Supervisor | 0 | 8 flows | 0% |
| District Officer | 0 | 7 flows | 0% |
| State Officer | 0 | 6 flows | 0% |
| Omnichannel (deep) | 0 | 9 checks | 0% |
| Complaint engine | 0 | 5 steps | 0% |
| Upload / AI / Persistence | 0 | 12 checks | 0% |
| **Total** | **0** | **73** | **0%** |

*Update counts as you mark **Pass** below.*

---

## Final gate (readiness levels)

Readiness is **computed automatically** in the verification report (see `LAST_RUN_SUMMARY.md`). Stages:

`Development` → `Internal QA` → `Demo Ready` → `Hackathon Ready` → `Government Demo Ready` → `Production Candidate`

| Gate | Requirement | Status |
|------|-------------|--------|
| G1 | **Critical Failures = 0** | ☐ |
| G2 | `npm run build` passes | ☐ |
| G3 | `npx tsc --noEmit` passes | ☐ |
| G4 | Coverage ≥ 85% on automated flows | ☐ |
| G5 | Omnichannel: 6 workspaces + draft (automated + manual) | ☐ |
| G6 | Worker session pipeline (manual or VERIFY_E2E=1) | ☐ |
| G7 | Cross-role complaint visible on Track Resolution | ☐ |
| G8 | IndexedDB v7 stores present | ☐ |

**Hackathon Ready** requires G1–G3 + automated pass ≥ 85%. **Government Demo Ready** requires ≥ 95% + E2E pass ≥ 80%.

**Sign-off:** _______________ **Date:** _______________

---

## How to use this checklist

For each step:

1. **Navigate** — open the route while logged in as the correct role  
2. **Action** — perform the user action  
3. **Expected Result** — compare UI/state  
4. **Pass** — mark `[x]` or `Pass` / leave blank if failed  

After a session, run `npm run verify:app` and copy any new issues into the master report.

---

## 1. Parent (Beneficiary) login

**Login as:** Parent / Caregiver (beneficiary) → home `/beneficiary`

| # | Navigate | Action | Expected Result | Pass |
|---|----------|--------|-----------------|------|
| P1 | `/` | Select Parent, submit login | Redirect to Control Room | ☐ |
| P2 | `/beneficiary` | Review dashboard cards | Citizen Control Room loads, child/center info | ☐ |
| P3 | `/beneficiary/my-child` | Open page | Child profile, attendance hints | ☐ |
| P4 | `/beneficiary/daily-journey` | Open timeline | Today's journey steps visible | ☐ |
| P5 | `/beneficiary/activities` | Browse activities | Center services list loads | ☐ |
| P6 | `/beneficiary/nutrition` | View nutrition | Meal/supplement info shown | ☐ |
| P7 | `/beneficiary/feedback` | Submit rating + text | Success toast; feedback in state | ☐ |
| P8 | `/beneficiary/omnichannel-feedback` | See channel selector | Six channel cards, no single shared textarea | ☐ |
| P9 | `/beneficiary/complaints` | View / file grievance | Complaint list or form works | ☐ |
| P10 | `/beneficiary/status` | Open track resolution | Status timeline for complaints | ☐ |
| P11 | `/beneficiary/surveys` | Complete survey | Survey saves; thank you state | ☐ |
| P12 | `/beneficiary/notifications` | Open list | Notifications render | ☐ |
| P13 | `/beneficiary/profile` | Edit preference | Save persists (local/session) | ☐ |
| P14 | `/beneficiary/center-health` | View center health | Center metrics/cards load | ☐ |

---

## 2. Omnichannel feedback (Parent) — deep validation

Route: `/beneficiary/omnichannel-feedback`

| # | Navigate | Action | Expected Result | Pass |
|---|----------|--------|-----------------|------|
| O1 | Omnichannel | Click **IVR** | IVR form: language, mic, call states, transcript area | ☐ |
| O2 | Omnichannel | Click **WhatsApp** | Chat-style UI, bubbles, attachments | ☐ |
| O3 | Omnichannel | Click **QR** | QR scan box, center verification | ☐ |
| O4 | Omnichannel | Click **SMS** | Compact SMS UI, 160 char count | ☐ |
| O5 | Omnichannel | Click **Handwritten** | OCR upload, image + extracted text | ☐ |
| O6 | Omnichannel | Click **Photo** | Multi-image upload, category, notes | ☐ |
| O7 | Omnichannel | Type in WhatsApp, switch to SMS, return WhatsApp | **Draft preserved** (thread text remains) | ☐ |
| O8 | Omnichannel | Submit IVR (after transcript) | Toast: "Voice feedback received" | ☐ |
| O9 | Omnichannel | Submit WhatsApp message | Toast: "Message delivered" | ☐ |

**Verify no shared form:** Only one channel workspace visible at a time; no generic textarea for all channels.

---

## 3. Worker login

**Login as:** Anganwadi Worker → home `/worker/dashboard`

| # | Navigate | Action | Expected Result | Pass |
|---|----------|--------|-----------------|------|
| W1 | `/worker/dashboard` | Open dashboard | Daily operations console | ☐ |
| W2 | `/worker/attendance` | Mark attendance | Check-in saved | ☐ |
| W3 | `/worker/session-monitor` | Start session flow | Recording UI loads | ☐ |
| W4 | Session monitor | Upload video (or demo file) | Upload progresses / completes | ☐ |
| W5 | Session monitor | Wait for pipeline | Transcript section appears | ☐ |
| W6 | Session monitor | Check GPS card | **Location Matched** (~25–35 m demo) | ☐ |
| W7 | Session monitor | Complete AI step | AI summary / scorecard visible | ☐ |
| W8 | `/worker/activities` | Log activity | Activity saved to queue/IDB | ☐ |
| W9 | `/worker/uploads` | View submission queue | Uploads list updates | ☐ |
| W10 | `/worker/training` | Open module | Course page `/worker/training/:moduleId` | ☐ |
| W11 | Training course | Complete Learn + Quiz | Progress bar updates | ☐ |
| W12 | `/worker/growth` | View growth | Growth metrics / journey | ☐ |

---

## 4. Supervisor login

**Login as:** Supervisor → home `/supervisor`

| # | Navigate | Action | Expected Result | Pass |
|---|----------|--------|-----------------|------|
| S1 | `/supervisor` | Dashboard | Monitoring command loads | ☐ |
| S2 | `/supervisor/session-review` | Open observation | Session list / review UI | ☐ |
| S3 | `/supervisor/complaints` | Review complaint | Detail + actions available | ☐ |
| S4 | `/supervisor/complaints` | Escalate or advance status | Status changes; notification | ☐ |
| S5 | `/supervisor/centers` | Open center | Center detail navigates | ☐ |
| S6 | `/supervisor/coaching` | View coaching | Assignments list | ☐ |
| S7 | `/supervisor/classroom-intelligence` | Analytics | Charts/tables render | ☐ |
| S8 | `/voice-of-citizen` | Citizen voice dashboard | Aggregated feedback view | ☐ |

---

## 5. District Officer login

**Login as:** District Admin → home `/district-admin/mission-control`

| # | Navigate | Action | Expected Result | Pass |
|---|----------|--------|-----------------|------|
| D1 | `/district-admin/mission-control` | Mission control | District KPIs load | ☐ |
| D2 | `/district-admin/centers` | Center monitoring | Center list | ☐ |
| D3 | `/district-admin/complaints` | Grievance queue | Complaints with filters | ☐ |
| D4 | `/district-admin/complaints` | Escalation action | Status / assignment updates | ☐ |
| D5 | `/district-admin/reports` | Reports | Report page renders | ☐ |
| D6 | `/district-admin/interventions` | Interventions | Intervention list | ☐ |
| D7 | `/district-admin/classroom-intelligence` | Session analytics | Intelligence view loads | ☐ |

**Admin legacy:** `/admin` redirects to district admin — verify once.

---

## 6. State Officer login

**Login as:** State Admin → home `/state-admin/mission-control`

| # | Navigate | Action | Expected Result | Pass |
|---|----------|--------|-----------------|------|
| ST1 | `/state-admin/mission-control` | State command | Aggregated metrics | ☐ |
| ST2 | `/state-admin/impact` | Public impact | Impact dashboard | ☐ |
| ST3 | `/state-admin/outcomes` | Child outcomes | Outcomes data | ☐ |
| ST4 | `/state-admin/complaints` | State grievance view | List loads | ☐ |
| ST5 | `/state-admin/story` | Government story | Narrative page | ☐ |
| ST6 | `/state-admin/classroom-intelligence` | Heatmaps / governance | Charts render (no -1 size errors) | ☐ |

---

## 7. Complaint engine (cross-role)

| # | Role | Navigate | Action | Expected Result | Pass |
|---|------|----------|--------|-----------------|------|
| C1 | Parent | Feedback or Omnichannel | Submit low rating / grievance text | Feedback record created | ☐ |
| C2 | System | — | Auto complaint if rules match | `isComplaint` / complaint ID | ☐ |
| C3 | Worker/Supervisor | Complaints page | Assignment visible | Complaint in queue | ☐ |
| C4 | Parent | `/beneficiary/status` | Track | Timeline updated | ☐ |
| C5 | Parent | Notifications | Check alert | Notification sent for complaint | ☐ |
| C6 | Parent | Surveys | Post-resolution survey | Survey scheduled/completed | ☐ |

---

## 8. Upload system

| # | Type | Navigate | Action | Expected Result | Pass |
|---|------|----------|--------|-----------------|------|
| U1 | Photo | Worker activities or Parent photo channel | Upload image | Preview + save | ☐ |
| U2 | Video | `/worker/session-monitor` | Upload video | Pipeline starts | ☐ |
| U3 | Voice | Omnichannel IVR | Record / upload audio | Transcript populated | ☐ |
| U4 | OCR | Omnichannel handwritten | Upload note image | Extracted text editable | ☐ |
| U5 | Offline | `/settings/sync` | View sync queue | Pending items listed | ☐ |

---

## 9. AI services (demo)

| # | Feature | Trigger | Expected Result | Pass |
|---|---------|---------|-----------------|------|
| A1 | Speech extraction | IVR call simulation | Transcript text appears | ☐ |
| A2 | Translation | Parent feedback EN→TE | Translated text in entry | ☐ |
| A3 | Transcript | Session complete | Transcript section filled | ☐ |
| A4 | Classroom summary | Session scorecard | AI summary bullets | ☐ |
| A5 | Grievance classification | Submit feedback | Category/urgency assigned | ☐ |
| A6 | Photo classification | Photo evidence + description | Classification hint shown | ☐ |

---

## 10. Persistence

| # | Check | Action | Expected Result | Pass |
|---|-------|--------|-----------------|------|
| R1 | IndexedDB | DevTools → Application → IDB | `AnganSakti360_DB` v7, stores present | ☐ |
| R2 | Session | Login, refresh page | User still logged in | ☐ |
| R3 | Worker training | Complete quiz section, reload | Progress restored | ☐ |
| R4 | Omnichannel draft | Type in SMS, switch channel, return | Draft restored from IDB | ☐ |
| R5 | Complaints | Submit complaint, reload | Data persists in IDB/state | ☐ |

---

## 11. Performance & quality

| # | Check | Action | Expected Result | Pass |
|---|-------|--------|-----------------|------|
| Q1 | Load time | Cold load `/` | < 5s on local dev | ☐ |
| Q2 | Console | Browse 5 pages | No uncaught errors | ☐ |
| Q3 | Mobile width | 375px parent portal | Layout usable | ☐ |
| Q4 | Offline | Disable network, sync page | Graceful offline messaging | ☐ |

---

## Cursor Agent: batch update protocol

```
1. npm run dev                    # terminal 1
2. npm run verify:app             # regenerates report + LAST_RUN_SUMMARY + bugs
3. VERIFY_E2E=1 npm run verify:app  # optional Playwright
4. Execute remaining manual steps in this checklist
5. Re-run verify:app to refresh dashboard & readiness
6. Do not hand-edit report tables — use verify:app
```

Evidence: `TESTING/evidence/{date}/` · Bugs: `docs/BUG_TRACKER.md`

---

*Last template update: 2026-05-23 · AnganSakti 360*

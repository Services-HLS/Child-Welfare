# AnganSakti 360 — Documentation

| Document | Purpose |
|----------|---------|
| [APPLICATION_FUNCTIONAL_VERIFICATION_REPORT.md](./APPLICATION_FUNCTIONAL_VERIFICATION_REPORT.md) | Evidence-based living verification report |
| [BUG_TRACKER.md](./BUG_TRACKER.md) | Master issue registry (auto-append on FAIL) |
| [../TESTING/LAST_RUN_SUMMARY.md](../TESTING/LAST_RUN_SUMMARY.md) | Latest run dashboard |
| [../TESTING/END_TO_END_FLOW_CHECKLIST.md](../TESTING/END_TO_END_FLOW_CHECKLIST.md) | Manual E2E supplement |

## Run verification

```bash
npm run dev                    # required for runtime route probes
npm run verify:app             # full: build + TSC + evidence + reports
$env:VERIFY_SKIP_BUILD="1"; npm run verify:app   # fast
$env:VERIFY_E2E="1"; npm run verify:app           # + Playwright (install @playwright/test first)
```

Evidence: `TESTING/evidence/{date}/`  
Readiness: Development → Internal QA → Demo Ready → Hackathon Ready → Government Demo Ready → Production Candidate

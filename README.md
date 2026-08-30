# FixKarachi — Civic Issue Reporting & Verification Platform

A web platform where citizens of Karachi report civic problems — potholes,
garbage, sewerage leaks, broken streetlights, water supply issues, public
safety hazards, traffic faults, and emergencies — with a photo, a severity
rating, and an exact location. Reports pass through a transparent, multi-signal
**credibility engine**, not a single "spam filter" vote, before authorities
act on them from an admin dashboard that also tracks its own performance in
the open.

Originally built for the **EFEST Hackathon 2026 — "Fix Karachi"** theme, then
substantially rebuilt and hardened afterward: a severity/escalation system,
a public accountability dashboard, an honest workload view for admins, offline
support, an accessibility pass, and an automated test suite.

---

## The core problem this solves

Any citizen-reporting app faces the same question: **when someone files a
complaint, how do you know it's actually real — and how urgent is it?** A
single "me too" vote counter can be gamed by a handful of accounts, and gives
admins no signal about which of hundreds of reports to act on first.

FixKarachi answers this with two deliberately separate signals, so neither
gets diluted into an opaque priority number:

### 1. Credibility — "is this real?" (`src/services/credibility.js`)

Every report is scored 0–100 from several independent signals, so no single
actor can swing a verdict:

| Signal | How it works |
|---|---|
| **Community verification** | Each unique "I have this issue too" vote adds weight, with diminishing returns so one group can't inflate a score. Reporters can't vote on their own report. |
| **Geo-corroboration** | Independent reports of the same category within ~200m and 3 weeks (Haversine great-circle distance) count as corroborating evidence. |
| **Photo evidence** | Harder to fabricate than text — reports with a photo score higher. |
| **Reporter track record** | Citizens carry a persistent trust score (0–100) that rises when admins verify their reports and falls when one is rejected as spam/false. |
| **Admin engagement** | A report already moved to "In Progress" has already survived human triage. |
| **Community flags** | Anyone can flag a suspicious report as false/spam. Enough flags (2+) automatically surface it in the admin's **Needs Review** queue. |
| **Admin verdict** | The human-in-the-loop final word — an admin can officially **Verify** or **Reject**, which overrides the computed score entirely. Rejected reports are hidden from the public feed/map/dashboard but stay visible to their author for transparency. |

Every report shows its score, a badge (*Community Verified*, *Needs More
Verification*, *Flagged — Under Review*, *Officially Verified*), and an
expandable "how was this calculated?" breakdown — the scoring is never a
black box.

### 2. Severity — "how urgent is this?"

Reporters rate each issue Low / Medium / High / Critical. This isn't
decorative: a **Critical** report notifies admins immediately and always
appears in the Needs Review queue, regardless of vote count or credibility
score — urgency doesn't wait on accumulated trust. The public dashboard then
holds the city to that promise by reporting real average resolution time
*per severity level*, so anyone can check whether "Critical" issues actually
get resolved faster.

Before submitting a new report, the same distance math checks for **likely
duplicates** nearby and lets the citizen verify the existing report instead
of splitting attention across copies.

---

## Key Features

| Component | Description |
|-----------|-------------|
| Citizen reporting | Guided report form — category → severity + details → location, with live duplicate detection |
| Geo-tagging | Browser GPS + tap-to-pin on a live map |
| Credibility engine | Multi-signal 0–100 trust score with a transparent, expandable breakdown |
| Severity & auto-escalation | Low/Medium/High/Critical rating; Critical reports notify admins immediately and skip straight to the review queue |
| Community verification & flagging | "I have this issue too" votes + "flag as false/spam", both one-per-user and self-action guarded |
| Reporter trust score | Persistent per-citizen reputation that rises/falls with admin verdicts, shown on their profile and a public leaderboard |
| Admin moderation queue | "Needs Review" tab auto-surfaces flagged, low-credibility, or Critical-severity reports for a Verify/Reject decision, with a confirmation step before any rejection |
| Admin workload view | Real backlog per category (open report counts, oldest waiting item, critical-count callout) — grounded in actual data, not a fabricated team/roster model |
| Status tracking | Pending → In Progress → Resolved timeline, decoupled from the validity verdict |
| Discussion thread | Citizens and admins can comment on a report with corroborating detail or updates |
| In-app notifications | Status changes, verdicts, flag alerts, and comments notify the relevant user via a notification bell |
| Toast feedback | Every action (vote, flag, verdict, submit) gets immediate, non-blocking, screen-reader-announced feedback |
| Public transparency dashboard | Category/status breakdowns, average resolution time by severity and by category, and a top-contributors leaderboard |
| Offline support (PWA) | Installable; app shell works offline after first visit; a report started offline is saved and submitted automatically once you're back online |
| Analytics & heatmap | Map heatmap + dashboard breakdowns |
| Accessibility | Keyboard-navigable modals with a proper focus trap, skip-to-content link, `aria-live` toast announcements, reduced-motion support |

---

## Tech Stack

- **React (Vite)** — fast, modern frontend
- **React Router** — client-side navigation
- **Context API** — global state management (auth, reports, users, notifications, toasts, connectivity)
- **Leaflet + react-leaflet** — free maps and heatmap (no API key needed)
- **Tailwind CSS** — styling, with full light/dark theme support and a custom civic (teal + marigold) design system
- **lucide-react** — clean, professional icon set
- **Vitest** — unit tests for the credibility/scoring engine
- **Service Worker + Web Manifest** — installable, offline-capable app shell
- **Data layer** — localStorage in demo mode; Firebase-ready (see `FIREBASE_SETUP.md`)

---

## Getting Started

Requires **Node.js** (LTS) — check with `node -v`.

```bash
cd fix-karachi
npm install      # install dependencies (first time only)
npm run dev      # start the dev server
```

The app opens at `http://localhost:5173`.

### Demo accounts
- **Citizen (mid trust)** — `ali@test.com` / `123456`
- **Citizen (high trust)** — `sara@test.com` / `123456`
- **Citizen (low trust, one rejected report)** — `bilal@test.com` / `123456`
- **Admin** — `admin@fixkarachi.pk` / `admin123`

Try it live: file a new pothole report near Shahrah-e-Faisal to see the
duplicate-detection warning, or log in as admin and open **Needs Review** to
see a Critical safety report queued ahead of everything else, then verify or
reject a report (with confirmation) and watch the reporter's trust score
change. Turn off your network mid-report to see the offline queue in action.

> Data is stored in your browser. To reset, clear localStorage
> (DevTools → Application → Local Storage) — keys are versioned (`fk_*_v2`).

### Running tests

```bash
npm test          # run the test suite once
npm run test:watch
```

Covers the credibility/scoring engine end to end: distance math, duplicate
and corroboration detection, every scoring signal and its caps, label
thresholds, and trust-tier boundaries.

---

## Project Structure

```
fix-karachi/
├── index.html                  Entry HTML (fonts, theme script, manifest, Leaflet CSS)
├── tailwind.config.js          Theme config (dark mode, fonts)
├── postcss.config.js
├── vite.config.js
├── vercel.json                 SPA rewrite so client-side routes don't 404 on Vercel
├── public/
│   ├── favicon.svg
│   ├── manifest.json           Web app manifest (installable PWA)
│   └── sw.js                   Service worker (offline app shell)
└── src/
    ├── main.jsx                App bootstrap (Router + Provider + SW registration)
    ├── App.jsx                 Route definitions + skip-to-content link
    ├── index.css               Design system (light/dark tokens, components, reduced-motion support)
    ├── context/
    │   └── AppContext.jsx      Global state: user, reports, users, notifications, toasts, theme, connectivity
    ├── services/
    │   ├── store.js            Data layer (localStorage = demo backend) + offline draft queue
    │   ├── credibility.js      Verification engine: scoring, duplicate detection, trust tiers
    │   ├── credibility.test.js Vitest suite for the engine above
    │   ├── seed.js             Demo data covering every verification, severity, and category state
    │   ├── constants.js        Categories, severities, statuses, helpers
    │   └── firebase.js         Firebase stub (for the live version)
    ├── components/
    │   ├── Navbar.jsx          Top navigation + notifications + theme toggle + offline indicator
    │   ├── ProtectedRoute.jsx  Auth/admin route guard
    │   ├── ReportCard.jsx      Single complaint card
    │   ├── StatusBadge.jsx     Pipeline status pill
    │   ├── SeverityBadge.jsx   Urgency pill — a signal kept distinct from credibility
    │   ├── Credibility.jsx     CredibilityBadge (compact) + CredibilityPanel (full breakdown)
    │   ├── RadialGauge.jsx     0–100 circular score gauge (SVG, no chart lib)
    │   ├── FlagButton.jsx      Flag-as-false/spam with confirmation
    │   ├── ConfirmModal.jsx    Accessible confirmation dialog (focus trap, Escape-to-close)
    │   ├── DuplicateWarning.jsx  Nearby-report warning shown while filing a report
    │   ├── CommentThread.jsx   Discussion thread on a report
    │   ├── NotificationBell.jsx  In-app notification center
    │   ├── ToastContainer.jsx  Toast feedback for every action (aria-live)
    │   └── MapView.jsx         Leaflet map + heatmap
    └── pages/
        ├── Home.jsx             Landing page + "how we verify" explainer
        ├── Login.jsx
        ├── Signup.jsx
        ├── ReportIssue.jsx      Report form with severity picker + live duplicate detection + offline queueing
        ├── Feed.jsx             All reports + filters + sort (newest/credible/verified)
        ├── ReportDetail.jsx     Full report, credibility panel, flagging, comments
        ├── MyReports.jsx        User's own reports, including queued offline drafts
        ├── MapPage.jsx          Map + heatmap toggle
        ├── Dashboard.jsx        Public transparency dashboard, performance ledger, leaderboard
        ├── Profile.jsx          Trust score, reputation tier, personal stats
        └── admin/
            └── AdminPanel.jsx   Needs Review queue + full report/status table + workload view
```

---

## Deployment

This is a static single-page app — no server component is required in demo
mode. Any static host works.

**Vercel (recommended)**
```bash
npm install -g vercel
vercel            # first deploy, follow the prompts
vercel --prod     # subsequent production deploys
```
Or connect the GitHub repo directly at [vercel.com/new](https://vercel.com/new) —
it auto-detects Vite (`npm run build`, output directory `dist`) and redeploys
on every push to `main`. Client-side routes (e.g. a direct link to `/login`
or `/report/:id`, or a mobile browser reloading a backgrounded tab) need an
explicit rewrite so Vercel serves `index.html` instead of 404ing — that's
what the committed `vercel.json` does.

**Netlify**
1. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an
   existing project** → pick this repo.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Deploy — Netlify redeploys automatically on every push.

**GitHub Pages**
```bash
npm install -D gh-pages
```
Add to `package.json`:
```json
"scripts": { "deploy": "vite build && gh-pages -d dist" }
```
Set `base: '/fix-karachi/'` in `vite.config.js`, then run `npm run deploy`.

> Whichever host you pick, since this app uses client-side routing
> (React Router), configure a SPA rewrite so every path serves `index.html`
> (Vercel and Netlify do this automatically; GitHub Pages needs a
> `404.html` fallback copy of `index.html`).

---

## Roadmap / Future Scalability

- **Firebase** integration for real-time, multi-user, cloud storage (`FIREBASE_SETUP.md`) — the offline draft queue is already built at the exact seam this migration needs
- **Push notifications** on status changes (currently in-app only)
- **Multi-language** support to reach more of the city
- **ML-assisted photo verification** (e.g. flagging stock/reused images) as a further credibility signal

---

*A civic-tech project focused on real-world impact, practical deployment, and clean engineering.*

// =============================================================
//  credibility.js — the "is this complaint real?" verification engine.
//
//  The single "me too" vote counter in the original version could be
//  gamed by a handful of accounts and gave admins no way to tell a
//  genuine cluster of reports from noise. This engine blends several
//  independent signals so no single actor can swing a verdict:
//
//    1. Community verification votes   ("I have this issue too")
//    2. Photo evidence                 (harder to fabricate than text)
//    3. Independent nearby reports     (geo-corroboration, Haversine)
//    4. Reporter's historical trust    (past reports admins verified/rejected)
//    5. Admin engagement               (a report already being worked on
//                                        has already survived human triage)
//    6. Community flags                ("this looks false/spam") pull it down
//
//  An explicit admin verdict (verified/rejected) is the human-in-the-loop
//  final word and overrides the computed score entirely.
// =============================================================

const EARTH_RADIUS_M = 6371000
const NEARBY_RADIUS_M = 200
const NEARBY_WINDOW_MS = 21 * 24 * 60 * 60 * 1000 // 21 days
export const DUPLICATE_RADIUS_M = 250

const toRad = (deg) => (deg * Math.PI) / 180

// Great-circle distance between two coordinates, in meters.
export function haversineMeters(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a))
}

// Existing reports that plausibly describe the same real-world issue as
// `draft` (same category, close by, still open, not already dismissed).
// Used both for submit-time duplicate warnings and for corroboration scoring.
export function findNearbyReports(draft, allReports, { radius = NEARBY_RADIUS_M, excludeId = null } = {}) {
  const now = Date.now()
  return allReports
    .filter((r) => r.id !== excludeId && r.category === draft.category && r.status !== 'resolved' && r.adminVerdict !== 'rejected')
    .map((r) => ({ report: r, distance: haversineMeters(draft.lat, draft.lng, r.lat, r.lng) }))
    .filter(({ report, distance }) => distance <= radius && now - report.createdAt <= NEARBY_WINDOW_MS)
    .sort((a, b) => a.distance - b.distance)
}

function countCorroborating(report, allReports) {
  return findNearbyReports(report, allReports, { excludeId: report.id }).filter(
    ({ report: r }) => r.userId !== report.userId,
  ).length
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// Raw 0-100 score plus a breakdown so the UI can show citizens *why*
// a report has the trust level it does — transparency is the point.
export function computeCredibility(report, allReports, users = []) {
  if (report.adminVerdict === 'verified') return { score: 100, locked: 'verified', breakdown: null }
  if (report.adminVerdict === 'rejected') return { score: 0, locked: 'rejected', breakdown: null }

  const reporter = users.find((u) => u.id === report.userId)
  const reporterTrust = reporter?.trustScore ?? 50

  const baseline = 14 // benefit of the doubt every fresh report starts with
  const voteScore = clamp(report.votes.length * 9, 0, 38)
  const photoScore = report.photo ? 14 : 0
  const corroboration = clamp(countCorroborating(report, allReports) * 8, 0, 20)
  const trustAdjust = clamp(((reporterTrust - 50) / 50) * 14, -14, 14)
  const adminEngagement = ['in_progress', 'resolved'].includes(report.status) ? 12 : 0
  const flagPenalty = clamp(report.flags.length * 16, 0, 60)

  const raw = baseline + voteScore + photoScore + corroboration + trustAdjust + adminEngagement - flagPenalty
  return {
    score: clamp(Math.round(raw), 0, 100),
    locked: null,
    breakdown: [
      { label: 'Base trust', value: baseline },
      { label: `Verifications (${report.votes.length})`, value: voteScore },
      { label: 'Photo evidence', value: photoScore },
      { label: 'Nearby corroborating reports', value: corroboration },
      { label: 'Reporter track record', value: Math.round(trustAdjust) },
      { label: 'Admin already engaged', value: adminEngagement },
      { label: `Community flags (${report.flags.length})`, value: -flagPenalty },
    ],
  }
}

// Human-facing verdict: score + label + color + whether it's admin-locked.
export function credibilityInfo(report, allReports, users = []) {
  const { score, locked, breakdown } = computeCredibility(report, allReports, users)

  if (locked === 'verified') return { score, key: 'official', label: 'Officially Verified', color: '#0d7a6f', locked, breakdown }
  if (locked === 'rejected') return { score, key: 'rejected', label: 'Rejected — Not Valid', color: '#d9455f', locked, breakdown }

  const flagged = report.flags.length > 0
  if (score >= 85) return { score, key: 'high', label: 'Highly Credible', color: '#0d7a6f', locked: null, breakdown }
  if (score >= 60) return { score, key: 'trusted', label: 'Community Verified', color: '#2f9e73', locked: null, breakdown }
  if (flagged) return { score, key: 'review', label: 'Flagged — Under Review', color: '#d9455f', locked: null, breakdown }
  if (score >= 35) return { score, key: 'pending', label: 'Needs More Verification', color: '#e8912b', locked: null, breakdown }
  return { score, key: 'new', label: 'New — Awaiting Verification', color: '#8a97a3', locked: null, breakdown }
}

// Reporter reputation tier (used on profile / leaderboard / name badges).
export function trustTier(trustScore) {
  if (trustScore >= 80) return { label: 'Trusted Reporter', color: '#0d7a6f' }
  if (trustScore >= 55) return { label: 'Active Citizen', color: '#2f9e73' }
  if (trustScore >= 35) return { label: 'New Reporter', color: '#8a97a3' }
  return { label: 'Under Watch', color: '#d9455f' }
}

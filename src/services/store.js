// =============================================================
//  store.js  —  DATA LAYER (the "backend" in demo mode)
// =============================================================
//  In demo mode all data lives in the browser's localStorage, so the
//  app runs instantly with no server or Firebase setup required.
//
//  TO GO LIVE WITH FIREBASE: replace the localStorage lines inside these
//  functions with Firestore calls — the rest of the app stays the same.
//  Full guide is in FIREBASE_SETUP.md.
// =============================================================

import { seedUsers, seedReports } from './seed.js'

// Versioned keys: bumping the suffix forces a clean reseed for anyone
// with an older shape of data already in their browser. Bumped to v3 here
// because the deployed URL has served several different builds already,
// and a browser that visited an earlier one keeps its stale seed forever
// otherwise (initStore only seeds when the key is absent).
const USERS_KEY = 'fk_users_v3'
const REPORTS_KEY = 'fk_reports_v3'
const NOTIFICATIONS_KEY = 'fk_notifications_v3'
const SESSION_KEY = 'fk_session'

const read = (key, fallback) => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback }
  catch { return fallback }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// Seed demo data on first run
export function initStore() {
  if (!localStorage.getItem(USERS_KEY)) write(USERS_KEY, seedUsers)
  if (!localStorage.getItem(REPORTS_KEY)) write(REPORTS_KEY, seedReports)
  if (!localStorage.getItem(NOTIFICATIONS_KEY)) write(NOTIFICATIONS_KEY, [])
}

// ---------------- AUTH ----------------
export function signup({ name, email, password }) {
  const users = read(USERS_KEY, [])
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.')
  }
  const user = { id: uid(), name, email, password, role: 'citizen', trustScore: 50 }
  users.push(user); write(USERS_KEY, users)
  return startSession(user)
}

export function login({ email, password }) {
  const users = read(USERS_KEY, [])
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
  if (!user) throw new Error('Incorrect email or password.')
  return startSession(user)
}

function startSession(user) {
  const safe = { id: user.id, name: user.name, email: user.email, role: user.role }
  write(SESSION_KEY, safe)
  return safe
}

export const logout = () => localStorage.removeItem(SESSION_KEY)
export const getSession = () => read(SESSION_KEY, null)

// ---------------- USERS ----------------
// Public-safe user list (no passwords) — used for reporter trust lookups,
// leaderboard, and profile pages.
export const getUsersPublic = () =>
  read(USERS_KEY, []).map(({ id, name, role, trustScore }) => ({ id, name, role, trustScore }))

function adjustTrust(userId, delta) {
  const users = read(USERS_KEY, [])
  const u = users.find((x) => x.id === userId)
  if (!u) return
  u.trustScore = clamp((u.trustScore ?? 50) + delta, 0, 100)
  write(USERS_KEY, users)
}

// Top citizens by trust + resolution track record — for the leaderboard.
export function getLeaderboard(limit = 5) {
  const users = getUsersPublic().filter((u) => u.role === 'citizen')
  const reports = read(REPORTS_KEY, [])
  return users
    .map((u) => {
      const mine = reports.filter((r) => r.userId === u.id)
      return {
        ...u,
        reportsCount: mine.length,
        resolvedCount: mine.filter((r) => r.status === 'resolved').length,
      }
    })
    .sort((a, b) => b.trustScore - a.trustScore || b.resolvedCount - a.resolvedCount)
    .slice(0, limit)
}

// ---------------- REPORTS ----------------
export const getReports = () => read(REPORTS_KEY, []).sort((a, b) => b.createdAt - a.createdAt)
// Public-facing views (feed/map/dashboard/home) hide reports an admin has
// confirmed are invalid — keeps open civic data clean without deleting history.
export const getPublicReports = () => getReports().filter((r) => r.adminVerdict !== 'rejected')
export const getReport = (id) => read(REPORTS_KEY, []).find((r) => r.id === id) || null

export function addReport(data, user) {
  const reports = read(REPORTS_KEY, [])
  const now = Date.now()
  const report = {
    id: uid(),
    title: data.title, category: data.category, description: data.description,
    severity: data.severity || 'medium', // low | medium | high | critical — urgency, separate from credibility
    photo: data.photo || null, lat: data.lat, lng: data.lng, address: data.address || '',
    status: 'pending',
    votes: [], // user ids who confirmed "I have this issue too"
    flags: [], // user ids who flagged this as false/spam
    adminVerdict: null, // null | 'verified' | 'rejected' — the human final word
    comments: [],
    userId: user.id, userName: user.name,
    createdAt: now, updatedAt: now,
    statusHistory: [{ status: 'pending', at: now }],
  }
  reports.push(report); write(REPORTS_KEY, reports)
  // Critical reports get admins' attention immediately rather than waiting
  // to accumulate votes/flags — urgency shouldn't have to wait on trust.
  if (report.severity === 'critical') {
    const admins = read(USERS_KEY, []).filter((u) => u.role === 'admin')
    admins.forEach((a) => addNotification(a.id, {
      type: 'critical_report', reportId: report.id,
      message: `Critical severity report submitted: "${report.title}" — needs prompt review.`,
    }))
  }
  return report
}

// Crowdsourced verification (one vote per user; can't vouch for your own report)
export function toggleVote(reportId, userId) {
  const reports = read(REPORTS_KEY, [])
  const r = reports.find((x) => x.id === reportId)
  if (!r || r.userId === userId) return null
  r.votes = r.votes.includes(userId) ? r.votes.filter((id) => id !== userId) : [...r.votes, userId]
  write(REPORTS_KEY, reports)
  return r
}

// Community flag ("this looks false / spam"). Enough flags surface the
// report in the admin's Needs Review queue automatically.
const FLAG_ALERT_THRESHOLD = 2
export function toggleFlag(reportId, userId) {
  const reports = read(REPORTS_KEY, [])
  const r = reports.find((x) => x.id === reportId)
  if (!r || r.userId === userId) return null
  const wasFlagged = r.flags.includes(userId)
  r.flags = wasFlagged ? r.flags.filter((id) => id !== userId) : [...r.flags, userId]
  write(REPORTS_KEY, reports)
  if (!wasFlagged && r.flags.length === FLAG_ALERT_THRESHOLD) {
    const admins = read(USERS_KEY, []).filter((u) => u.role === 'admin')
    admins.forEach((a) => addNotification(a.id, {
      type: 'flag_alert', reportId: r.id,
      message: `"${r.title}" has been flagged ${r.flags.length} times — needs review.`,
    }))
  }
  return r
}

// Admin: move status through pending -> in_progress -> resolved
export function updateStatus(reportId, status) {
  const reports = read(REPORTS_KEY, [])
  const r = reports.find((x) => x.id === reportId)
  if (!r) return null
  r.status = status
  r.updatedAt = Date.now()
  r.statusHistory.push({ status, at: Date.now() })
  write(REPORTS_KEY, reports)
  addNotification(r.userId, {
    type: 'status_change', reportId: r.id,
    message: `Your report "${r.title}" is now ${status.replace('_', ' ')}.`,
  })
  return r
}

// Admin: the human-in-the-loop final verdict on validity. Verifying a
// report rewards the reporter's trust score; rejecting it as spam/false
// penalises it — this is what makes reporter trust mean something over time.
export function setAdminVerdict(reportId, verdict, adminId) {
  const reports = read(REPORTS_KEY, [])
  const r = reports.find((x) => x.id === reportId)
  if (!r) return null
  r.adminVerdict = verdict
  r.adminVerdictAt = Date.now()
  r.adminVerdictBy = adminId
  write(REPORTS_KEY, reports)
  adjustTrust(r.userId, verdict === 'verified' ? 10 : -15)
  addNotification(r.userId, {
    type: 'verdict', reportId: r.id,
    message: verdict === 'verified'
      ? `Your report "${r.title}" was officially verified by the city.`
      : `Your report "${r.title}" was reviewed and marked as not valid.`,
  })
  return r
}

// ---------------- OFFLINE QUEUE ----------------
// The data layer is localStorage today, so a submission never actually
// fails offline — but this queue sits at the exact seam where a real
// network write would go once Firebase is wired in (FIREBASE_SETUP.md),
// so the resilience is built in now rather than retrofitted later.
const OFFLINE_QUEUE_KEY = 'fk_offline_queue_v1'

export function queueOfflineReport(data, user) {
  const queue = read(OFFLINE_QUEUE_KEY, [])
  const item = { id: uid(), data, user, queuedAt: Date.now() }
  queue.push(item); write(OFFLINE_QUEUE_KEY, queue)
  return item
}

export const getOfflineQueue = (userId) => read(OFFLINE_QUEUE_KEY, []).filter((q) => q.user.id === userId)

// Called once connectivity returns: actually submits every queued report
// and empties the queue. Returns how many were submitted.
export function drainOfflineQueue() {
  const queue = read(OFFLINE_QUEUE_KEY, [])
  if (queue.length === 0) return 0
  queue.forEach((item) => addReport(item.data, item.user))
  write(OFFLINE_QUEUE_KEY, [])
  return queue.length
}

export function addComment(reportId, { userId, userName, role, text }) {
  const reports = read(REPORTS_KEY, [])
  const r = reports.find((x) => x.id === reportId)
  if (!r) return null
  const comment = { id: uid(), userId, userName, role, text, at: Date.now() }
  r.comments = [...(r.comments || []), comment]
  write(REPORTS_KEY, reports)
  if (r.userId !== userId) {
    addNotification(r.userId, {
      type: 'comment', reportId: r.id,
      message: `${userName} commented on your report "${r.title}".`,
    })
  }
  return r
}

// ---------------- NOTIFICATIONS ----------------
export function addNotification(userId, { type, message, reportId }) {
  const list = read(NOTIFICATIONS_KEY, [])
  list.unshift({ id: uid(), userId, type, message, reportId, at: Date.now(), read: false })
  write(NOTIFICATIONS_KEY, list.slice(0, 200)) // keep it bounded
}

export const getNotifications = (userId) =>
  read(NOTIFICATIONS_KEY, []).filter((n) => n.userId === userId).sort((a, b) => b.at - a.at)

export function markNotificationsRead(userId) {
  const list = read(NOTIFICATIONS_KEY, [])
  list.forEach((n) => { if (n.userId === userId) n.read = true })
  write(NOTIFICATIONS_KEY, list)
}

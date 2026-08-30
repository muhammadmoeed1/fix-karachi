import { describe, it, expect } from 'vitest'
import { haversineMeters, findNearbyReports, computeCredibility, credibilityInfo, trustTier, DUPLICATE_RADIUS_M } from './credibility.js'

const now = Date.now()
const daysAgo = (n) => now - n * 24 * 60 * 60 * 1000

function makeReport(overrides = {}) {
  return {
    id: 'r1', title: 'Test issue', category: 'pothole', description: 'A test report.',
    photo: null, lat: 24.8607, lng: 67.0011, address: '',
    status: 'pending', votes: [], flags: [], adminVerdict: null,
    userId: 'u1', userName: 'Reporter',
    createdAt: now, updatedAt: now,
    statusHistory: [{ status: 'pending', at: now }],
    ...overrides,
  }
}

describe('haversineMeters', () => {
  it('returns 0 for the same point', () => {
    expect(haversineMeters(24.86, 67.00, 24.86, 67.00)).toBe(0)
  })

  it('is symmetric', () => {
    const a = haversineMeters(24.86, 67.00, 24.90, 67.05)
    const b = haversineMeters(24.90, 67.05, 24.86, 67.00)
    expect(a).toBeCloseTo(b, 6)
  })

  it('matches a known real-world distance (~1.1km at this latitude for 0.01deg lat)', () => {
    const d = haversineMeters(24.8607, 67.0011, 24.8697, 67.0011)
    expect(d).toBeGreaterThan(950)
    expect(d).toBeLessThan(1100)
  })
})

describe('findNearbyReports', () => {
  const draft = { category: 'pothole', lat: 24.8607, lng: 67.0011 }

  it('includes a same-category report within radius and time window', () => {
    const nearby = makeReport({ id: 'near', lat: 24.8608, lng: 67.0012, createdAt: daysAgo(1) })
    const results = findNearbyReports(draft, [nearby])
    expect(results.map((r) => r.report.id)).toContain('near')
  })

  it('excludes a different category', () => {
    const other = makeReport({ id: 'other-cat', category: 'garbage', lat: 24.8608, lng: 67.0012 })
    const results = findNearbyReports(draft, [other])
    expect(results).toHaveLength(0)
  })

  it('excludes reports outside the radius', () => {
    // ~0.05 degrees latitude is roughly 5.5km — well outside DUPLICATE_RADIUS_M
    const far = makeReport({ id: 'far', lat: 24.9107, lng: 67.0011 })
    const results = findNearbyReports(draft, [far], { radius: DUPLICATE_RADIUS_M })
    expect(results).toHaveLength(0)
  })

  it('excludes reports older than the 21-day corroboration window', () => {
    const old = makeReport({ id: 'old', lat: 24.8608, lng: 67.0012, createdAt: daysAgo(30) })
    const results = findNearbyReports(draft, [old])
    expect(results).toHaveLength(0)
  })

  it('excludes resolved and admin-rejected reports', () => {
    const resolved = makeReport({ id: 'resolved', lat: 24.8608, lng: 67.0012, status: 'resolved' })
    const rejected = makeReport({ id: 'rejected', lat: 24.8608, lng: 67.0012, adminVerdict: 'rejected' })
    const results = findNearbyReports(draft, [resolved, rejected])
    expect(results).toHaveLength(0)
  })

  it('excludes the report matching excludeId', () => {
    const self = makeReport({ id: 'self', lat: 24.8607, lng: 67.0011 })
    const results = findNearbyReports(draft, [self], { excludeId: 'self' })
    expect(results).toHaveLength(0)
  })

  it('sorts multiple matches by distance ascending', () => {
    const farther = makeReport({ id: 'farther', lat: 24.8617, lng: 67.0011 })
    const closer = makeReport({ id: 'closer', lat: 24.8609, lng: 67.0011 })
    const results = findNearbyReports(draft, [farther, closer])
    expect(results.map((r) => r.report.id)).toEqual(['closer', 'farther'])
  })
})

describe('computeCredibility', () => {
  it('locks a verified report at 100 with no breakdown', () => {
    const report = makeReport({ adminVerdict: 'verified' })
    const result = computeCredibility(report, [], [])
    expect(result).toEqual({ score: 100, locked: 'verified', breakdown: null })
  })

  it('locks a rejected report at 0 with no breakdown', () => {
    const report = makeReport({ adminVerdict: 'rejected' })
    const result = computeCredibility(report, [], [])
    expect(result).toEqual({ score: 0, locked: 'rejected', breakdown: null })
  })

  it('starts a fresh report at just the baseline trust with no other signals', () => {
    const report = makeReport()
    const { score, locked } = computeCredibility(report, [report], [])
    expect(score).toBe(14) // baseline only; no reporter record => trustAdjust 0
    expect(locked).toBeNull()
  })

  it('caps vote score contribution instead of scaling unbounded', () => {
    const fewVotes = makeReport({ votes: ['a', 'b'] }) // 2 * 9 = 18, under the 38 cap
    const manyVotes = makeReport({ votes: Array.from({ length: 20 }, (_, i) => `u${i}`) }) // way over the cap
    const few = computeCredibility(fewVotes, [fewVotes], [])
    const many = computeCredibility(manyVotes, [manyVotes], [])
    expect(few.score).toBe(14 + 18)
    expect(many.score).toBe(14 + 38) // clamped, not 14 + 180
  })

  it('rewards photo evidence', () => {
    const withPhoto = makeReport({ photo: 'data:image/png;base64,x' })
    const { score } = computeCredibility(withPhoto, [withPhoto], [])
    expect(score).toBe(14 + 14)
  })

  it('counts corroboration only from other users, not the reporter\'s own nearby reports', () => {
    const target = makeReport({ id: 'target', userId: 'u1' })
    const ownDuplicate = makeReport({ id: 'own-dup', userId: 'u1', lat: 24.8608, lng: 67.0012 })
    const independentReport = makeReport({ id: 'indep', userId: 'u2', lat: 24.8608, lng: 67.0012 })

    const onlyOwn = computeCredibility(target, [target, ownDuplicate], [])
    const withIndependent = computeCredibility(target, [target, ownDuplicate, independentReport], [])

    expect(onlyOwn.score).toBe(14) // no boost from a duplicate the same person filed
    expect(withIndependent.score).toBe(14 + 8) // one independent corroborator
  })

  it('adjusts for reporter trust history in both directions, clamped to +/-14', () => {
    const report = makeReport()
    const trusted = computeCredibility(report, [report], [{ id: 'u1', trustScore: 100 }])
    const untrusted = computeCredibility(report, [report], [{ id: 'u1', trustScore: 0 }])
    expect(trusted.score).toBe(14 + 14)
    expect(untrusted.score).toBe(14 - 14)
  })

  it('rewards a report already being worked on by an admin', () => {
    const inProgress = makeReport({ status: 'in_progress' })
    const { score } = computeCredibility(inProgress, [inProgress], [])
    expect(score).toBe(14 + 12)
  })

  it('penalizes community flags, capped at -60', () => {
    // Stack enough positive signals (78 total) that the flag penalty's own
    // cap is what's being tested, not the final [0,100] clamp on the total.
    const base = { votes: Array.from({ length: 6 }, (_, i) => `v${i}`), photo: 'x', status: 'in_progress' }
    const fewFlags = makeReport({ ...base, flags: ['a', 'b'] }) // 2 * 16 = 32
    const manyFlags = makeReport({ ...base, flags: Array.from({ length: 10 }, (_, i) => `u${i}`) }) // would be 160, capped to 60
    const few = computeCredibility(fewFlags, [fewFlags], [])
    const many = computeCredibility(manyFlags, [manyFlags], [])
    expect(few.score).toBe(78 - 32)
    expect(many.score).toBe(78 - 60) // capped at -60, not -160
  })

  it('clamps the final score to [0, 100] even with an extreme combination of signals', () => {
    const stacked = makeReport({
      votes: Array.from({ length: 10 }, (_, i) => `v${i}`),
      photo: 'x', status: 'resolved',
    })
    const independentReport = makeReport({ id: 'indep', userId: 'u2', lat: 24.8608, lng: 67.0012 })
    const { score } = computeCredibility(stacked, [stacked, independentReport], [{ id: 'u1', trustScore: 100 }])
    expect(score).toBeLessThanOrEqual(100)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('includes a labeled breakdown for an unlocked report', () => {
    const report = makeReport({ votes: ['a'], photo: 'x' })
    const { breakdown } = computeCredibility(report, [report], [])
    expect(breakdown).toContainEqual({ label: 'Photo evidence', value: 14 })
    expect(breakdown.some((b) => b.label.startsWith('Verifications'))).toBe(true)
  })
})

describe('credibilityInfo', () => {
  it('labels an admin-verified report as Officially Verified', () => {
    const report = makeReport({ adminVerdict: 'verified' })
    expect(credibilityInfo(report, [], []).label).toBe('Officially Verified')
  })

  it('labels an admin-rejected report as Rejected — Not Valid', () => {
    const report = makeReport({ adminVerdict: 'rejected' })
    expect(credibilityInfo(report, [], []).label).toBe('Rejected — Not Valid')
  })

  it('labels a high-scoring report as Highly Credible', () => {
    // baseline 14 + votes(38 capped) + photo 14 + admin engagement 12 = 78... push higher with trust
    const report = makeReport({ votes: Array.from({ length: 6 }, (_, i) => `v${i}`), photo: 'x', status: 'in_progress' })
    const info = credibilityInfo(report, [report], [{ id: 'u1', trustScore: 100 }])
    expect(info.score).toBeGreaterThanOrEqual(85)
    expect(info.label).toBe('Highly Credible')
  })

  it('labels a flagged report as Flagged — Under Review even if the raw score would otherwise pass', () => {
    // Score alone would land in "Needs More Verification" territory, but a flag overrides that framing.
    const report = makeReport({ votes: ['a', 'b'], flags: ['c'] })
    const info = credibilityInfo(report, [report], [])
    expect(info.score).toBeLessThan(60)
    expect(info.label).toBe('Flagged — Under Review')
  })

  it('labels a brand-new report as New — Awaiting Verification', () => {
    const report = makeReport()
    expect(credibilityInfo(report, [report], []).label).toBe('New — Awaiting Verification')
  })
})

describe('trustTier', () => {
  it('tiers reporters by trust score at the documented boundaries', () => {
    expect(trustTier(80).label).toBe('Trusted Reporter')
    expect(trustTier(79).label).toBe('Active Citizen') // just below the 80 cutoff
    expect(trustTier(55).label).toBe('Active Citizen')
    expect(trustTier(54).label).toBe('New Reporter') // just below the 55 cutoff
    expect(trustTier(35).label).toBe('New Reporter')
    expect(trustTier(34).label).toBe('Under Watch') // just below the 35 cutoff
    expect(trustTier(0).label).toBe('Under Watch')
  })
})

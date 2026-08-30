// Demo data — fills the app on first launch so it never looks empty,
// a live demo is easy to show, and every verification state (new,
// pending, community-verified, flagged, officially verified, rejected)
// has at least one example out of the box.

export const seedUsers = [
  { id: 'admin1', name: 'City Admin', email: 'admin@fixkarachi.pk', password: 'admin123', role: 'admin', trustScore: 100 },
  { id: 'user1', name: 'Ali Raza', email: 'ali@test.com', password: '123456', role: 'citizen', trustScore: 58 },
  { id: 'user2', name: 'Sara Khan', email: 'sara@test.com', password: '123456', role: 'citizen', trustScore: 82 },
  { id: 'user3', name: 'Bilal Ahmed', email: 'bilal@test.com', password: '123456', role: 'citizen', trustScore: 30 },
]

const now = Date.now()
const hrs = (n) => now - n * 60 * 60 * 1000

export const seedReports = [
  {
    id: 'r1', title: 'Large pothole on Shahrah-e-Faisal', category: 'pothole', severity: 'high',
    description: 'Deep pothole near the signal. Bikes are slipping at night and it is unlit.',
    photo: null, lat: 24.8607, lng: 67.0411, address: 'Shahrah-e-Faisal',
    status: 'pending', votes: ['user2', 'user3'], flags: [], adminVerdict: null,
    userId: 'user1', userName: 'Ali Raza',
    createdAt: hrs(3), updatedAt: hrs(3), statusHistory: [{ status: 'pending', at: hrs(3) }],
    comments: [{ id: 'c1', userId: 'user2', userName: 'Sara Khan', role: 'citizen', text: 'Same here, almost hit it on my bike last night.', at: hrs(2) }],
  },
  {
    id: 'r2', title: 'Garbage overflow — Gulshan Block 6', category: 'garbage', severity: 'medium',
    description: 'Container is full and has not been cleared for a week. Strong smell in the area.',
    photo: null, lat: 24.9215, lng: 67.0907, address: 'Gulshan-e-Iqbal, Block 6',
    status: 'in_progress', votes: ['user2'], flags: [], adminVerdict: null,
    userId: 'user1', userName: 'Ali Raza',
    createdAt: hrs(20), updatedAt: hrs(5),
    statusHistory: [{ status: 'pending', at: hrs(20) }, { status: 'in_progress', at: hrs(5) }],
    comments: [],
  },
  {
    id: 'r3', title: 'Streetlights out on Tariq Road', category: 'streetlight', severity: 'medium',
    description: 'Three streetlights have been off for several days. The stretch is very dark at night.',
    photo: null, lat: 24.8722, lng: 67.0626, address: 'Tariq Road',
    status: 'resolved', votes: ['user1'], flags: [], adminVerdict: 'verified', adminVerdictAt: hrs(2), adminVerdictBy: 'admin1',
    userId: 'user2', userName: 'Sara Khan',
    createdAt: hrs(50), updatedAt: hrs(2),
    statusHistory: [
      { status: 'pending', at: hrs(50) },
      { status: 'in_progress', at: hrs(30) },
      { status: 'resolved', at: hrs(2) },
    ],
    comments: [{ id: 'c2', userId: 'admin1', userName: 'City Admin', role: 'admin', text: 'KE crew replaced the fuses. Confirmed fixed on inspection.', at: hrs(2) }],
  },
  {
    id: 'r4', title: 'Sewerage leakage in Nazimabad', category: 'sewerage', severity: 'medium',
    description: 'Open gutter is overflowing onto the road. Water has collected across the street.',
    photo: null, lat: 24.9131, lng: 67.0349, address: 'Nazimabad No. 4',
    status: 'pending', votes: [], flags: ['user1', 'user2'], adminVerdict: null,
    userId: 'user3', userName: 'Bilal Ahmed',
    createdAt: hrs(8), updatedAt: hrs(8), statusHistory: [{ status: 'pending', at: hrs(8) }],
    comments: [{ id: 'c3', userId: 'user1', userName: 'Ali Raza', role: 'citizen', text: "I live here, this gutter has been dry for weeks — doesn't match the photo-less description.", at: hrs(6) }],
  },
  {
    id: 'r5', title: 'Pothole cluster — North Nazimabad', category: 'pothole', severity: 'medium',
    description: 'Several potholes on the service road are slowing down traffic during rush hour.',
    photo: null, lat: 24.9425, lng: 67.0382, address: 'North Nazimabad',
    status: 'pending', votes: ['user3'], flags: [], adminVerdict: null,
    userId: 'user1', userName: 'Ali Raza',
    createdAt: hrs(12), updatedAt: hrs(12), statusHistory: [{ status: 'pending', at: hrs(12) }],
    comments: [],
  },
  {
    id: 'r6', title: 'Garbage complaint — Block 9', category: 'garbage', severity: 'low',
    description: 'Reported so the app "looks active", no real overflow at this address.',
    photo: null, lat: 24.9280, lng: 67.0800, address: 'Gulshan-e-Iqbal, Block 9',
    status: 'pending', votes: [], flags: ['user1'], adminVerdict: 'rejected', adminVerdictAt: hrs(4), adminVerdictBy: 'admin1',
    userId: 'user3', userName: 'Bilal Ahmed',
    createdAt: hrs(30), updatedAt: hrs(4), statusHistory: [{ status: 'pending', at: hrs(30) }],
    comments: [{ id: 'c4', userId: 'admin1', userName: 'City Admin', role: 'admin', text: 'Field team found no garbage issue at this address. Marked as invalid.', at: hrs(4) }],
  },
  {
    id: 'r7', title: 'Sewerage overflow near Clifton Block 2', category: 'sewerage', severity: 'high',
    description: 'Manhole cover is broken and sewerage is overflowing onto the footpath.',
    photo: null, lat: 24.8138, lng: 67.0300, address: 'Clifton Block 2',
    status: 'pending', votes: ['user1', 'user3'], flags: [], adminVerdict: null,
    userId: 'user2', userName: 'Sara Khan',
    createdAt: hrs(6), updatedAt: hrs(6), statusHistory: [{ status: 'pending', at: hrs(6) }],
    comments: [],
  },
  {
    id: 'r8', title: 'Second pothole on same service road', category: 'pothole', severity: 'low',
    description: 'A few meters further down from the other reported pothole, same stretch of road.',
    photo: null, lat: 24.8609, lng: 67.0415, address: 'Shahrah-e-Faisal, service road',
    status: 'pending', votes: ['user1'], flags: [], adminVerdict: null,
    userId: 'user2', userName: 'Sara Khan',
    createdAt: hrs(1), updatedAt: hrs(1), statusHistory: [{ status: 'pending', at: hrs(1) }],
    comments: [],
  },
  {
    // Demonstrates severity-driven auto-escalation: no flags and too new for
    // many votes, but Critical severity alone puts it in the admin's Needs
    // Review queue immediately — urgency doesn't wait on accumulated trust.
    id: 'r9', title: 'Live wire hanging near school entrance', category: 'safety', severity: 'critical',
    description: 'A snapped electricity cable is hanging low right outside the main gate of a primary school, at child height.',
    photo: null, lat: 24.8996, lng: 67.0836, address: 'Gulshan-e-Iqbal, Block 13',
    status: 'pending', votes: ['user2'], flags: [], adminVerdict: null,
    userId: 'user1', userName: 'Ali Raza',
    createdAt: hrs(0.5), updatedAt: hrs(0.5), statusHistory: [{ status: 'pending', at: hrs(0.5) }],
    comments: [],
  },
  {
    id: 'r10', title: 'No water supply for 4 days — PECHS', category: 'water_supply', severity: 'high',
    description: 'The whole block has had no water supply since Monday. Tankers are the only option and are expensive.',
    photo: null, lat: 24.8628, lng: 67.0644, address: 'PECHS Block 2',
    status: 'in_progress', votes: ['user1', 'user2', 'user3'], flags: [], adminVerdict: null,
    userId: 'user3', userName: 'Bilal Ahmed',
    createdAt: hrs(15), updatedAt: hrs(4), statusHistory: [{ status: 'pending', at: hrs(15) }, { status: 'in_progress', at: hrs(4) }],
    comments: [],
  },
  {
    id: 'r11', title: 'Malfunctioning traffic signal at Nursery', category: 'traffic', severity: 'high',
    description: 'The signal is stuck on red in all directions, causing a standstill during rush hour.',
    photo: null, lat: 24.8672, lng: 67.0530, address: 'Nursery, Sharah-e-Faisal',
    status: 'pending', votes: [], flags: [], adminVerdict: null,
    userId: 'user2', userName: 'Sara Khan',
    createdAt: hrs(2), updatedAt: hrs(2), statusHistory: [{ status: 'pending', at: hrs(2) }],
    comments: [],
  },
  // The next three are resolved so the public dashboard's per-category /
  // per-severity performance ledger has real numbers to show, not just
  // dashes, on a fresh install — including a critical case resolved fast,
  // which is the exact accountability signal that panel exists to surface.
  {
    id: 'r12', title: 'Pothole repaired outside Regal Chowk', category: 'pothole', severity: 'medium',
    description: 'Pothole that had been damaging car tyres for weeks was filled in and resurfaced.',
    photo: null, lat: 24.8560, lng: 67.0210, address: 'Regal Chowk, Saddar',
    status: 'resolved', votes: ['user2'], flags: [], adminVerdict: 'verified', adminVerdictAt: hrs(30), adminVerdictBy: 'admin1',
    userId: 'user1', userName: 'Ali Raza',
    createdAt: hrs(80), updatedAt: hrs(30),
    statusHistory: [{ status: 'pending', at: hrs(80) }, { status: 'in_progress', at: hrs(58) }, { status: 'resolved', at: hrs(30) }],
    comments: [],
  },
  {
    id: 'r13', title: 'Garbage cleared from Korangi Industrial Area', category: 'garbage', severity: 'high',
    description: 'A large illegal dump site near the industrial area was cleared after repeated complaints.',
    photo: null, lat: 24.8318, lng: 67.1281, address: 'Korangi Industrial Area',
    status: 'resolved', votes: ['user1', 'user3'], flags: [], adminVerdict: 'verified', adminVerdictAt: hrs(20), adminVerdictBy: 'admin1',
    userId: 'user2', userName: 'Sara Khan',
    createdAt: hrs(140), updatedAt: hrs(20),
    statusHistory: [{ status: 'pending', at: hrs(140) }, { status: 'in_progress', at: hrs(70) }, { status: 'resolved', at: hrs(20) }],
    comments: [],
  },
  {
    id: 'r14', title: 'Exposed live wire near bus stop fixed', category: 'safety', severity: 'critical',
    description: 'A downed cable near a busy bus stop was reported and made safe by KE the same day.',
    photo: null, lat: 24.8951, lng: 67.0512, address: 'Liaquatabad No. 10',
    status: 'resolved', votes: ['user1', 'user2', 'user3'], flags: [], adminVerdict: 'verified', adminVerdictAt: hrs(42), adminVerdictBy: 'admin1',
    userId: 'user3', userName: 'Bilal Ahmed',
    createdAt: hrs(48), updatedAt: hrs(42),
    statusHistory: [{ status: 'pending', at: hrs(48) }, { status: 'in_progress', at: hrs(46) }, { status: 'resolved', at: hrs(42) }],
    comments: [{ id: 'c5', userId: 'admin1', userName: 'City Admin', role: 'admin', text: 'KE crew dispatched within the hour and made the line safe. Critical reports are prioritised.', at: hrs(42) }],
  },
]

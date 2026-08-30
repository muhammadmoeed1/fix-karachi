import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, ShieldCheck, BarChart3, Zap, ThumbsUp, Radar, ShieldAlert, Trophy } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES } from '../services/constants.js'

// Landing page.
export default function Home() {
  const { user, publicReports } = useApp()
  const resolved = publicReports.filter((r) => r.status === 'resolved').length

  return (
    <div className="fade-up space-y-14">
      {/* Hero */}
      <section className="card relative overflow-hidden px-6 py-16 text-center sm:px-12 sm:py-20">
        <div className="civic-lattice pointer-events-none absolute inset-0 opacity-[0.05]" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--accent)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--primary)' }}
        />
        <div className="relative">
          <span className="soft-pill mb-5"><Zap size={13} /> One platform. One mission.</span>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.1] sm:text-6xl">
            Report city issues.<br />
            <span style={{ color: 'var(--primary)' }}>Know they're really being fixed.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base muted">
            A civic platform for Karachi where citizens report problems with a photo and exact
            location, a credibility engine verifies each report is genuine, and authorities
            resolve them in the open.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={user ? '/report' : '/login'} className="btn btn-primary !px-6 !py-3">
              Report an issue <ArrowRight size={16} />
            </Link>
            <Link to="/map" className="btn btn-outline !px-6 !py-3"><MapPin size={16} /> View live map</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat value={publicReports.length} label="Total reports" />
        <Stat value={resolved} label="Resolved" />
        <Stat value={`${Math.round((resolved / (publicReports.length || 1)) * 100)}%`} label="Resolution rate" />
        <Stat value={Object.keys(CATEGORIES).length} label="Categories" />
      </section>

      {/* Categories */}
      <section>
        <h2 className="mb-1 text-2xl font-bold">What you can report</h2>
        <p className="mb-5 muted">Pick a category and add details — it takes under a minute.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(CATEGORIES).map(([key, c]) => {
            const Icon = c.Icon
            return (
              <Link key={key} to={user ? '/report' : '/login'} className="card group p-5 transition hover:-translate-y-1">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl" style={{ background: c.color + '18' }}>
                  <Icon size={20} style={{ color: c.color }} />
                </div>
                <h3 className="font-bold">{c.label}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                  Report <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Trust & verification — the core "how do you know it's real" answer */}
      <section className="card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: 'var(--primary)' }}><ShieldCheck size={18} /></span>
          <div>
            <h2 className="text-2xl font-bold">How we verify a complaint is real</h2>
            <p className="text-sm muted">No single vote or click decides anything — every report earns a transparent credibility score.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Trust Icon={ThumbsUp} title="Community verification" desc="Neighbours confirm 'I have this issue too' — each unique voice adds weight, with diminishing returns so one group can't inflate a score." />
          <Trust Icon={Radar} title="Geo-corroboration" desc="Independent reports of the same category within ~200m and 3 weeks count as corroborating evidence, calculated with real distance math." />
          <Trust Icon={Trophy} title="Reporter track record" desc="Citizens build a trust score over time from admin-confirmed reports — reliable reporters carry more weight, repeat offenders carry less." />
          <Trust Icon={ShieldAlert} title="Community flagging" desc="Anyone can flag a suspicious report as false or spam. Enough flags automatically surface it in the admin review queue." />
          <Trust Icon={BarChart3} title="Photo evidence" desc="Reports with a photo score higher — harder to fabricate than text alone." />
          <Trust Icon={ShieldCheck} title="Human final word" desc="Admins can officially verify or reject any report. That verdict overrides the algorithm — the model assists, it never replaces judgement." />
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="mb-5 text-2xl font-bold">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Feature Icon={MapPin} title="Report with location" desc="Capture the issue with a photo and pin the exact spot on the map. We flag likely duplicates nearby before you submit." />
          <Feature Icon={ShieldCheck} title="Credibility is computed" desc="Votes, evidence, corroboration, and reporter history combine into one transparent score, visible to everyone." />
          <Feature Icon={BarChart3} title="Authorities act" desc="Admins prioritise the review queue by credibility and flags, then update status until resolved." />
        </div>
      </section>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="card p-5 text-center">
      <div className="font-display text-3xl font-extrabold" style={{ color: 'var(--primary)' }}>{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide muted">{label}</div>
    </div>
  )
}

function Feature({ Icon, title, desc }) {
  return (
    <div className="card p-6">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl" style={{ background: 'var(--primary-soft)', color: 'var(--primary-soft-text)' }}>
        <Icon size={20} />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm muted">{desc}</p>
    </div>
  )
}

function Trust({ Icon, title, desc }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--surface-2)' }}>
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg" style={{ background: 'var(--accent-soft)', color: 'var(--accent-soft-text)' }}>
        <Icon size={17} />
      </div>
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed muted">{desc}</p>
    </div>
  )
}

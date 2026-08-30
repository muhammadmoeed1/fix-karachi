import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Wrench, Plus, Sun, Moon, LogOut, LayoutGrid, Map, BarChart3, FileText, ShieldCheck, UserCircle2, WifiOff } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import NotificationBell from './NotificationBell.jsx'

// Top navigation bar — shown on every page.
export default function Navbar() {
  const { user, logout, theme, toggleTheme, isOnline } = useApp()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/') }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
      isActive ? 'text-[var(--text)] bg-[var(--surface-2)]' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
    }`

  return (
    <header className="sticky top-0 z-[1000] border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--surface) 80%, transparent)' }}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: 'var(--primary)' }}>
            <Wrench size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-extrabold">
            Fix<span style={{ color: 'var(--primary)' }}>Karachi</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/feed" className={linkClass}><LayoutGrid size={16} /> Feed</NavLink>
          <NavLink to="/map" className={linkClass}><Map size={16} /> Map</NavLink>
          <NavLink to="/dashboard" className={linkClass}><BarChart3 size={16} /> Dashboard</NavLink>
          {user && <NavLink to="/my-reports" className={linkClass}><FileText size={16} /> My Reports</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={linkClass}><ShieldCheck size={16} /> Admin</NavLink>}
        </div>

        <div className="flex items-center gap-1.5">
          {!isOnline && (
            <span className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex" style={{ background: 'var(--accent-soft)', color: 'var(--accent-soft-text)' }}>
              <WifiOff size={13} /> Offline
            </span>
          )}
          <button onClick={toggleTheme} className="btn btn-ghost !px-2.5" title="Toggle theme" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <>
              <NotificationBell />
              <Link to="/profile" className="btn btn-ghost !px-2.5" title="My profile" aria-label="My profile"><UserCircle2 size={18} /></Link>
              <Link to="/report" className="btn btn-primary"><Plus size={16} /> Report</Link>
              <button onClick={handleLogout} className="btn btn-ghost !px-2.5" title="Log out" aria-label="Log out"><LogOut size={18} /></button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Sign in</Link>
          )}
        </div>
      </nav>
    </header>
  )
}

// =============================================================
//  AppContext.jsx  —  Global state for the whole app:
//  the logged-in user, all reports, public user directory,
//  notifications, toast messages, and the light/dark theme.
// =============================================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as store from '../services/store.js'

const AppContext = createContext(null)
let toastSeq = 0

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [toasts, setToasts] = useState([])
  const [ready, setReady] = useState(false)
  const [offlineQueue, setOfflineQueue] = useState([])
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [theme, setTheme] = useState(
    () => (typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
  )

  const notify = useCallback((message, type = 'info') => {
    const id = ++toastSeq
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  const refresh = useCallback((activeUser) => {
    setReports(store.getReports())
    setUsers(store.getUsersPublic())
    const u = activeUser !== undefined ? activeUser : store.getSession()
    if (u) {
      setNotifications(store.getNotifications(u.id))
      setOfflineQueue(store.getOfflineQueue(u.id))
    } else {
      setOfflineQueue([])
    }
  }, [])

  // Drain any queued offline reports the moment connectivity returns — and
  // once on mount, in case the queue was left over from a previous session
  // that ended offline but this one starts back online.
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      const drained = store.drainOfflineQueue()
      if (drained > 0) {
        refresh()
        notify(`Back online — ${drained} queued report${drained !== 1 ? 's' : ''} submitted.`, 'success')
      }
    }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    if (navigator.onLine) handleOnline()
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refresh, notify])

  // On load: seed demo data, restore session + reports
  useEffect(() => {
    store.initStore()
    const session = store.getSession()
    setUser(session)
    refresh(session)
    setReady(true)
  }, [refresh])

  // Keep the <html> class + saved preference in sync with theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('fk_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  // auth
  const signup = (data) => { const u = store.signup(data); setUser(u); refresh(u); return u }
  const login = (data) => { const u = store.login(data); setUser(u); refresh(u); return u }
  const logout = () => { store.logout(); setUser(null); setNotifications([]) }

  // reports
  const addReport = (data) => { const r = store.addReport(data, user); refresh(user); return r }
  const queueReport = (data) => { const item = store.queueOfflineReport(data, user); setOfflineQueue((q) => [...q, item]); return item }

  const toggleVote = (id) => {
    const r = reports.find((x) => x.id === id)
    if (r && r.userId === user?.id) return notify("You can't verify your own report.", 'warn')
    store.toggleVote(id, user.id); refresh(user)
  }

  const toggleFlag = (id) => {
    const r = reports.find((x) => x.id === id)
    if (r && r.userId === user?.id) return notify("You can't flag your own report.", 'warn')
    const wasFlagged = r?.flags.includes(user.id)
    store.toggleFlag(id, user.id); refresh(user)
    notify(wasFlagged ? 'Flag removed.' : 'Report flagged for admin review. Thanks for helping keep data clean.', wasFlagged ? 'info' : 'warn')
  }

  const updateStatus = (id, status) => { store.updateStatus(id, status); refresh(user); notify('Status updated.', 'success') }

  const setAdminVerdict = (id, verdict) => {
    store.setAdminVerdict(id, verdict, user.id); refresh(user)
    notify(verdict === 'verified' ? 'Report marked as officially verified.' : 'Report rejected as not valid.', verdict === 'verified' ? 'success' : 'warn')
  }

  const addComment = (id, text) => {
    store.addComment(id, { userId: user.id, userName: user.name, role: user.role, text }); refresh(user)
  }

  const markNotificationsRead = () => { if (user) { store.markNotificationsRead(user.id); setNotifications(store.getNotifications(user.id)) } }

  // Reports an admin has confirmed invalid are hidden from public-facing
  // views (feed/map/dashboard/home) but stay visible to their owner and admins.
  const publicReports = reports.filter((r) => r.adminVerdict !== 'rejected')

  const value = {
    user, reports, publicReports, users, notifications, toasts, ready, theme,
    offlineQueue, isOnline,
    toggleTheme, notify, dismissToast,
    signup, login, logout,
    addReport, queueReport, toggleVote, toggleFlag, updateStatus, setAdminVerdict, addComment,
    markNotificationsRead, refresh,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)

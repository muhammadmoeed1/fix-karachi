import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

// Yeh wrapper un pages ko bachata hai jo login (ya admin) ke baghair nahi khulne chahiye.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, ready } = useApp()

  if (!ready) return null // data load hone ka intezaar
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />

  return children
}

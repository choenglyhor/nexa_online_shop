import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Spinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <svg className="h-8 w-8 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  )
}

// Requires any logged-in user
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user)   return <Navigate to="/login" replace />
  return children
}

// Requires admin role — redirects customers to home
export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading)  return <Spinner />
  if (!user)    return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

// Alias — keeps any existing <SellerRoute> in App.jsx working without changes
export const SellerRoute = AdminRoute
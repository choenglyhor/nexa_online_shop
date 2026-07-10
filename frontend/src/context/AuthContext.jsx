import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext()
function buildProfileFormData(payload) {
  const fd = new FormData()
  const textFields = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'country', 'bio']
  textFields.forEach((f) => { if (payload[f] !== undefined) fd.append(f, payload[f]) })

  if (payload.avatar instanceof File) {
    // File object → real upload
    fd.append('avatar', payload.avatar)
  } else if (payload.avatar === '') {
    // Empty string → signal Django to clear the avatar
    fd.append('avatar', '')
  }
  // If payload.avatar is a URL string (already saved) we skip it — no change needed
  return fd
}

// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // On app boot: grab a CSRF cookie then restore session if one exists
  useEffect(() => {
    const init = async () => {
      try {
        await api.get('/auth/csrf/')         // sets csrftoken cookie
        const res = await api.get('/auth/me/')
        setUser(res.data)
      } catch {
        setUser(null)                        // 401 = not logged in, that's fine
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // ─── Auth ─────────────────────────────────────────────────────────────────

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password })
    setUser(res.data)
    return res.data
  }

  const register = async (payload) => {
    const res = await api.post('/auth/register/', payload)
    setUser(res.data)
    return res.data
  }

  const logout = async () => {
    await api.post('/auth/logout/')
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await api.get('/auth/me/')
    setUser(res.data)
  }

  // ─── Profile ──────────────────────────────────────────────────────────────
  // payload may contain: first_name, last_name, email, phone, address, city,
  // country, bio, avatar (File object to upload | '' to clear | undefined to skip)

  const updateProfile = async (payload) => {
    const fd  = buildProfileFormData(payload)
    const res = await api.put('/auth/profile/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setUser(res.data)
    return res.data
  }

  // ─── Change password ──────────────────────────────────────────────────────

  const changePassword = async (currentPassword, newPassword) => {
    await api.post('/auth/change-password/', {
      current_password: currentPassword,
      new_password:     newPassword,
    })
  }

  // ─── Admin: user management ───────────────────────────────────────────────

  const getAllUsers = async () => {
    const res = await api.get('/auth/users/')
    return res.data
  }

  const updateUserRole = async (userId, role) => {
    const res = await api.put(`/auth/users/${userId}/role/`, { role })
    return res.data
  }

  const deleteUser = async (userId) => {
    await api.delete(`/auth/users/${userId}/delete/`)
  }

  // ─── Categories (proxy to Django, used by Dashboard) ─────────────────────

  const getCategories = async () => {
    const res = await api.get('/categories/')
    return res.data   // [{ id, name, slug }]
  }

  const addCategory = async (payload) => {
    const res = await api.post('/categories/', payload)
    return res.data
  }

  const updateCategory = async (id, payload) => {
    const res = await api.put(`/categories/${id}/`, payload)
    return res.data
  }

  const deleteCategory = async (id) => {
    await api.delete(`/categories/${id}/`)
  }

  // ─── Orders ───────────────────────────────────────────────────────────────

  const getMyOrders = async () => {
    // Regular users get only their own orders from this endpoint
    const res = await api.get('/orders/')
    return res.data
  }

  const getAllOrders = async () => {
    // Admin gets all orders from the same endpoint (Django scopes by role)
    const res = await api.get('/orders/')
    return res.data
  }

  const updateOrderStatus = async (orderId, status) => {
    const res = await api.put(`/dashboard/orders/${orderId}/`, { status })
    return res.data
  }

  const deleteOrder = async (orderId) => {
    await api.delete(`/orders/${orderId}/`)
  }

  const clearMyOrders = async () => {
    await api.delete('/orders/clear/')
  }

  const clearAllOrders = async () => {
    await api.delete('/orders/clear/')
  }

  // ─── Dashboard stats ──────────────────────────────────────────────────────

  const getStats = async () => {
    const res = await api.get('/dashboard/stats/')
    return res.data
  }

  // ─── Derived ──────────────────────────────────────────────────────────────

  const isAdmin       = !!(user && (user.is_staff || user.role === 'admin' || user.profile?.is_seller_admin))
  const isSellerAdmin = isAdmin

  return (
    <AuthContext.Provider value={{
      user, loading, isAdmin, isSellerAdmin,
      login, register, logout, refreshUser, updateProfile, changePassword,
      getAllUsers, updateUserRole, deleteUser,
      getCategories, addCategory, updateCategory, deleteCategory,
      getMyOrders, getAllOrders, updateOrderStatus,
      deleteOrder, clearMyOrders, clearAllOrders,
      getStats,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

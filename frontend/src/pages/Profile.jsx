import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STATUS_OPTS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500'

function Toast({ message }) {
  if (!message) return null
  return <div className="fixed top-5 right-5 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-white dark:text-gray-900">{message}</div>
}

function StatusBadge({ status }) {
  const color = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${color}`}>{status}</span>
}

function resolveMediaUrl(src) {
  if (!src || /^(https?:|blob:|data:)/i.test(src)) return src || ''
  return `http://localhost:8000${src.startsWith('/') ? '' : '/'}${src}`
}

function ImageWithFallback({ src, alt, className, fallback }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  if (!src || failed) return fallback
  return <img src={resolveMediaUrl(src)} alt={alt} className={className} onError={() => setFailed(true)} />
}

function Avatar({ src, name, size = 'h-16 w-16' }) {
  const letter = (name?.[0] || '?').toUpperCase()
  return (
    <div className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-lg font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300`}>
      <ImageWithFallback src={src} alt="Profile" className="h-full w-full object-cover" fallback={letter} />
    </div>
  )
}

const money = (value) => Number(value || 0).toFixed(2)
const itemText = (item) => `${item.name || item.product_name || 'Product'} x ${item.qty ?? item.quantity ?? 1} - $${money(item.price)}`

function PasswordForm({ changePassword, showToast }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.next !== form.confirm) {
      setError('New passwords do not match.')
      return
    }
    setSaving(true)
    try {
      await changePassword(form.current, form.next)
      setForm({ current: '', next: '', confirm: '' })
      showToast('Password changed.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not change password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="font-semibold text-gray-900 dark:text-white">Security</h2>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
      <input type="password" placeholder="Current password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} className={inputCls} required />
      <input type="password" placeholder="New password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} className={inputCls} required minLength={6} />
      <input type="password" placeholder="Confirm new password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className={inputCls} required minLength={6} />
      <button disabled={saving} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {saving ? 'Saving...' : 'Change Password'}
      </button>
    </form>
  )
}

function ProfileForm({ user, updateProfile, refreshUser, showToast }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    bio: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [clearAvatar, setClearAvatar] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.profile?.phone || '',
      address: user.profile?.address || '',
      city: user.profile?.city || '',
      country: user.profile?.country || '',
      bio: user.profile?.bio || '',
    })
    setAvatarPreview(user.profile?.avatar || '')
    setAvatarFile(null)
    setClearAvatar(false)
  }, [user])

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = { ...form }
    if (avatarFile) payload.avatar = avatarFile
    if (clearAvatar) payload.avatar = ''
    await updateProfile(payload)
    await refreshUser()
    setSaving(false)
    showToast('Profile saved.')
  }

  const chooseAvatar = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setClearAvatar(false)
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview('')
    setClearAvatar(true)
  }

  return (
    <form onSubmit={save} className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <Avatar src={avatarPreview} name={user.first_name || user.username} />
        <div className="space-y-2">
          <input type="file" accept="image/*" onChange={chooseAvatar} className="block text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />
          {avatarPreview && <button type="button" onClick={removeAvatar} className="text-xs font-medium text-red-500 hover:underline">Remove photo</button>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={inputCls} />
        <input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={inputCls} />
      </div>
      <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
      <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
      <input placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
        <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputCls} />
      </div>
      <textarea rows={4} placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={inputCls} />
      <button disabled={saving} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  )
}

function OrdersList({ orders, isAdmin, onStatusChange }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet.</p>
        {!isAdmin && <Link to="/shop" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">Start shopping</Link>}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
                {isAdmin && <span className="text-xs text-gray-400">@{order.username}</span>}
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
              {order.shipping_address && <p className="mt-1 text-xs text-gray-400">{order.shipping_address}</p>}
              <ul className="mt-3 space-y-2">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-100 font-semibold text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name || item.product_name || 'Product'}
                        className="h-full w-full object-cover"
                        fallback={(item.name || item.product_name || '?')[0].toUpperCase()}
                      />
                    </div>
                    <span>{itemText(item)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">Total: ${money(order.total)}</p>
            </div>
            {isAdmin && (
              <select value={order.status} onChange={(e) => onStatusChange(order.id, e.target.value)} className="rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                {STATUS_OPTS.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProfileConnected() {
  const {
    user,
    isAdmin,
    updateProfile,
    refreshUser,
    changePassword,
    getMyOrders,
    getAllOrders,
    getAllUsers,
    updateUserRole,
    deleteUser,
    updateOrderStatus,
    getStats,
  } = useAuth()

  const [tab, setTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 2500)
  }

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      if (isAdmin) {
        const [allOrders, allUsers, dashboardStats] = await Promise.all([getAllOrders(), getAllUsers(), getStats()])
        setOrders(allOrders)
        setUsers(allUsers)
        setStats(dashboardStats)
      } else {
        const myOrders = await getMyOrders()
        setOrders(myOrders)
        setUsers([])
        setStats(null)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load profile data.')
    } finally {
      setLoading(false)
    }
  }, [getAllOrders, getAllUsers, getMyOrders, getStats, isAdmin, user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const changeRole = async (userId, role) => {
    if (userId === user.id) {
      showToast("You cannot change your own role.")
      return
    }
    await updateUserRole(userId, role)
    showToast('User role updated.')
    await loadData()
  }

  const removeUser = async (userId) => {
    if (userId === user.id) {
      showToast("You cannot delete your own account.")
      return
    }
    if (!window.confirm('Delete this user account?')) return
    await deleteUser(userId)
    showToast('User deleted.')
    await loadData()
  }

  const changeStatus = async (orderId, status) => {
    await updateOrderStatus(orderId, status)
    showToast('Order status updated.')
    await loadData()
  }

  if (!user) return null

  const tabs = isAdmin ? ['profile', 'orders', 'users', 'security'] : ['profile', 'orders', 'security']

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Toast message={toast} />

      <div className="mb-8 flex items-center gap-4">
        <Avatar src={user.profile?.avatar} name={user.first_name || user.username} size="h-20 w-20" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.username}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          {isAdmin && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Admin</p>}
        </div>
      </div>

      {error && <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">{error}</p>}

      {isAdmin && stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500">Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_orders}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500">Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${money(stats.total_revenue)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500">Products</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_products}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500">Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users}</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
        {tabs.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium capitalize ${
            tab === item
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}>
            {item}
            {item === 'orders' && <span className="ml-2 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">{orders.length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-500">Loading profile...</p>
      ) : (
        <>
          {tab === 'profile' && <ProfileForm user={user} updateProfile={updateProfile} refreshUser={refreshUser} showToast={showToast} />}

          {tab === 'orders' && <OrdersList orders={orders} isAdmin={isAdmin} onStatusChange={changeStatus} />}

          {tab === 'users' && isAdmin && (
            <div className="space-y-3">
              {users.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5 dark:border-gray-800 dark:bg-gray-900">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {item.first_name || item.last_name ? `${item.first_name} ${item.last_name}`.trim() : item.username}
                      {item.id === user.id && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                    </p>
                    <p className="truncate text-xs text-gray-400">@{item.username} | {item.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <select value={item.role || 'user'} disabled={item.id === user.id} onChange={(e) => changeRole(item.id, e.target.value)} className="rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-900 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button disabled={item.id === user.id} onClick={() => removeUser(item.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 disabled:opacity-40 dark:bg-red-900/20 dark:text-red-400">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'security' && <PasswordForm changePassword={changePassword} showToast={showToast} />}
        </>
      )}
    </div>
  )
}

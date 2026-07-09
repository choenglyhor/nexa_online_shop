import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const EMPTY_PRODUCT = {
  name: '',
  category: '',
  description: '',
  price: '',
  discount_price: '',
  stock: '',
  is_active: true,
}

const EMPTY_CATEGORY = { name: '', description: '' }
const STATUS_OPTS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500'

function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed top-5 right-5 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-white dark:text-gray-900">
      {message}
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  )
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

const money = (value) => Number(value || 0).toFixed(2)

function orderItemLabel(item) {
  const name = item.name || item.product_name || 'Product'
  const qty = item.qty ?? item.quantity ?? 1
  return `${name} x ${qty} - $${money(item.price)}`
}

export default function DashboardConnected() {
  const {
    user,
    isAdmin,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllOrders,
    updateOrderStatus,
    getStats,
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [tab, setTab] = useState('overview')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [editingProductId, setEditingProductId] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageCleared, setImageCleared] = useState(false)

  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY)
  const [editingCategoryId, setEditingCategoryId] = useState(null)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 2500)
  }

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [productRes, categoryData, orderData, userData, statsData] = await Promise.all([
        api.get('/products/', { params: { all: 1 } }),
        getCategories(),
        getAllOrders(),
        getAllUsers(),
        getStats(),
      ])
      setProducts(productRes.data)
      setCategories(categoryData)
      setOrders(orderData)
      setUsers(userData)
      setStats(statsData)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [getAllOrders, getAllUsers, getCategories, getStats])

  useEffect(() => {
    if (!isAdmin) navigate('/')
  }, [isAdmin, navigate])

  useEffect(() => {
    if (isAdmin) reload()
  }, [isAdmin, reload])

  const resetProductForm = () => {
    setProductForm(EMPTY_PRODUCT)
    setEditingProductId(null)
    setSelectedImage(null)
    setImagePreview('')
    setImageCleared(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const buildProductData = () => {
    const data = new FormData()
    data.append('name', productForm.name.trim())
    data.append('description', productForm.description || '')
    data.append('price', productForm.price || '0')
    data.append('stock', productForm.stock || '0')
    data.append('is_active', productForm.is_active ? 'true' : 'false')
    data.append('discount_price', productForm.discount_price || '')
    if (productForm.category) data.append('category', productForm.category)
    if (selectedImage) data.append('image', selectedImage)
    if (imageCleared) data.append('image', '')
    return data
  }

  const handleProductSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const payload = buildProductData()
      if (editingProductId) {
        await api.put(`/products/${editingProductId}/`, payload)
        showToast('Product updated.')
      } else {
        await api.post('/products/', payload)
        showToast('Product added.')
      }
      resetProductForm()
      await reload()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save product. Check required fields.')
    }
  }

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
    setImageCleared(false)
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview('')
    setImageCleared(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const startEditProduct = (product) => {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price || '',
      discount_price: product.discount_price || '',
      stock: product.stock ?? '',
      is_active: product.is_active !== false,
    })
    setSelectedImage(null)
    setImagePreview(product.image || '')
    setImageCleared(false)
    setTab('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeProduct = async (productId) => {
    if (!window.confirm('Delete this product from SQLite?')) return
    await api.delete(`/products/${productId}/`)
    showToast('Product deleted.')
    await reload()
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, categoryForm)
        showToast('Category updated.')
      } else {
        await addCategory(categoryForm)
        showToast('Category added.')
      }
      setCategoryForm(EMPTY_CATEGORY)
      setEditingCategoryId(null)
      await reload()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save category.')
    }
  }

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id)
    setCategoryForm({ name: category.name || '', description: category.description || '' })
  }

  const removeCategory = async (categoryId) => {
    if (!window.confirm('Delete this category? Products will become uncategorized.')) return
    await deleteCategory(categoryId)
    showToast('Category deleted.')
    await reload()
  }

  const handleOrderStatus = async (orderId, status) => {
    await updateOrderStatus(orderId, status)
    showToast('Order status updated.')
    await reload()
  }

  const handleRoleChange = async (userId, role) => {
    if (userId === user.id) {
      showToast("You cannot change your own role.")
      return
    }
    await updateUserRole(userId, role)
    showToast('User role updated.')
    await reload()
  }

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      showToast("You cannot delete your own account.")
      return
    }
    if (!window.confirm('Delete this user account?')) return
    await deleteUser(userId)
    showToast('User deleted.')
    await reload()
  }

  const query = search.toLowerCase()
  const filteredProducts = useMemo(
    () => products.filter((p) =>
      p.name.toLowerCase().includes(query)
      || (p.category_name || '').toLowerCase().includes(query)
      || (p.description || '').toLowerCase().includes(query)
    ),
    [products, query],
  )
  const filteredCategories = categories.filter((c) => c.name.toLowerCase().includes(query))
  const filteredOrders = orders.filter((o) =>
    String(o.id).includes(query) || (o.username || '').toLowerCase().includes(query)
  )
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query)
  )

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'products', label: 'Products', count: products.length },
    { key: 'categories', label: 'Categories', count: categories.length },
    { key: 'orders', label: 'Orders', count: orders.length },
    { key: 'users', label: 'Users', count: users.length },
  ]

  if (!isAdmin) return null

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Toast message={toast} />

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Connected to Django and SQLite.</p>
        </div>
        <button onClick={reload} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-8 flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => { setTab(item.key); setSearch('') }}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === item.key
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {item.label}
            {item.count !== undefined && <span className="ml-2 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">{item.count}</span>}
          </button>
        ))}
      </div>

      {loading && <p className="py-10 text-center text-sm text-gray-500">Loading dashboard data...</p>}

      {!loading && tab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Products" value={stats.total_products} sub={`${stats.low_stock} low stock`} />
            <StatCard label="Orders" value={stats.total_orders} sub={`${stats.pending} pending`} />
            <StatCard label="Revenue" value={`$${money(stats.total_revenue)}`} sub="All time" />
            <StatCard label="Users" value={stats.total_users} sub={`${stats.total_categories} categories`} />
          </div>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <div className="space-y-3">
              {stats.recent_orders.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">No orders yet.</p>}
              {stats.recent_orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id} <span className="text-gray-400">@{order.username}</span></p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">${money(order.total)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {!loading && tab === 'products' && (
        <div className="grid gap-8 md:grid-cols-3">
          <form onSubmit={handleProductSubmit} className="h-fit space-y-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 dark:text-white">{editingProductId ? 'Edit Product' : 'New Product'}</h2>

            <div>
              <div className="mb-2 aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                {imagePreview
                  ? <img src={imagePreview} alt="Product preview" className="h-full w-full object-contain p-2" />
                  : <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                  Choose image
                </button>
                {imagePreview && (
                  <button type="button" onClick={clearImage} className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
                    Remove
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>

            <input required placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className={inputCls} />
            <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className={inputCls}>
              <option value="">Uncategorized</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <textarea rows={3} placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" min="0" step="0.01" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className={inputCls} />
              <input type="number" min="0" step="0.01" placeholder="Discount" value={productForm.discount_price} onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })} className={inputCls} />
            </div>
            <input required type="number" min="0" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className={inputCls} />
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" checked={productForm.is_active} onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })} />
              Active in shop
            </label>
            <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              {editingProductId ? 'Update Product' : 'Add Product'}
            </button>
            {editingProductId && (
              <button type="button" onClick={resetProductForm} className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Cancel
              </button>
            )}
          </form>

          <div className="space-y-4 md:col-span-2">
            <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className={inputCls} />
            {filteredProducts.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No products found.</p>}
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-contain p-1" /> : <span className="text-xs text-gray-400">No image</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{product.category_name || 'Uncategorized'} | Stock: {product.stock} | {product.is_active ? 'Active' : 'Inactive'}</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    ${money(product.price)}
                    {product.discount_price && <span className="ml-2 text-green-600 dark:text-green-400">${money(product.discount_price)}</span>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => startEditProduct(product)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Edit</button>
                  <button onClick={() => removeProduct(product.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && tab === 'categories' && (
        <div className="grid gap-8 md:grid-cols-3">
          <form onSubmit={handleCategorySubmit} className="h-fit space-y-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 dark:text-white">{editingCategoryId ? 'Edit Category' : 'New Category'}</h2>
            <input required placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className={inputCls} />
            <textarea rows={3} placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className={inputCls} />
            <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              {editingCategoryId ? 'Update Category' : 'Add Category'}
            </button>
            {editingCategoryId && (
              <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryForm(EMPTY_CATEGORY) }} className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Cancel
              </button>
            )}
          </form>

          <div className="space-y-3 md:col-span-2">
            <input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className={inputCls} />
            {filteredCategories.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No categories found.</p>}
            {filteredCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</p>
                  {category.description && <p className="mt-1 text-xs text-gray-400">{category.description}</p>}
                  <p className="mt-1 text-xs text-gray-400">slug: {category.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditCategory(category)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Edit</button>
                  <button onClick={() => removeCategory(category.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && tab === 'orders' && (
        <div className="space-y-3">
          <input placeholder="Search order ID or username..." value={search} onChange={(e) => setSearch(e.target.value)} className={inputCls} />
          {filteredOrders.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No orders found.</p>}
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">@{order.username} | {new Date(order.created_at).toLocaleString()}</p>
                  {order.shipping_address && <p className="mt-1 text-xs text-gray-400">{order.shipping_address}</p>}
                  <ul className="mt-2 space-y-0.5">
                    {order.items?.map((item) => <li key={item.id} className="text-xs text-gray-500">{orderItemLabel(item)}</li>)}
                  </ul>
                  <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">Total: ${money(order.total)}</p>
                </div>
                <select value={order.status} onChange={(e) => handleOrderStatus(order.id, e.target.value)} className="rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  {STATUS_OPTS.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'users' && (
        <div className="space-y-3">
          <input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className={inputCls} />
          {filteredUsers.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No users found.</p>}
          {filteredUsers.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5 dark:border-gray-800 dark:bg-gray-900">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {item.first_name || item.last_name ? `${item.first_name} ${item.last_name}`.trim() : item.username}
                  {item.id === user.id && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                </p>
                <p className="truncate text-xs text-gray-400">@{item.username} | {item.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select value={item.role || 'user'} disabled={item.id === user.id} onChange={(e) => handleRoleChange(item.id, e.target.value)} className="rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-900 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button disabled={item.id === user.id} onClick={() => handleDeleteUser(item.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 disabled:opacity-40 dark:bg-red-900/20 dark:text-red-400">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

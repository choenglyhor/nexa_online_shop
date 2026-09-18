import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { getCategoryImage, DEFAULT_CATEGORY_FALLBACK, resolveMediaUrl } from '../utils/categoryImages'

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
  const categoryFileInputRef = useRef(null)

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
  const [selectedCategoryImage, setSelectedCategoryImage] = useState(null)
  const [categoryImagePreview, setCategoryImagePreview] = useState('')
  const [categoryImageCleared, setCategoryImageCleared] = useState(false)
  const [categoryModalError, setCategoryModalError] = useState('')

  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const openAddProductModal = () => {
    resetProductForm()
    setIsProductModalOpen(true)
  }

  const closeProductModal = () => {
    resetProductForm()
    setIsProductModalOpen(false)
  }

  const openAddCategoryModal = () => {
    resetCategoryForm()
    setCategoryModalError('')
    setIsCategoryModalOpen(true)
  }

  const closeCategoryModal = () => {
    resetCategoryForm()
    setCategoryModalError('')
    setIsCategoryModalOpen(false)
  }

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
      setIsProductModalOpen(false)
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
    setIsProductModalOpen(true)
  }

  const removeProduct = async (productId) => {
    if (!window.confirm('Delete this product from SQLite?')) return
    await api.delete(`/products/${productId}/`)
    showToast('Product deleted.')
    await reload()
  }

  const resetCategoryForm = () => {
    setCategoryForm(EMPTY_CATEGORY)
    setEditingCategoryId(null)
    setSelectedCategoryImage(null)
    setCategoryImagePreview('')
    setCategoryImageCleared(false)
    setCategoryModalError('')
    if (categoryFileInputRef.current) categoryFileInputRef.current.value = ''
  }

  const handleCategoryImageSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const isImg = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg|bmp|jfif)$/i.test(file.name)
    if (!isImg) {
      setCategoryModalError('Please choose a valid image file (JPG, PNG, WebP, GIF, SVG).')
      return
    }
    setCategoryModalError('')
    setSelectedCategoryImage(file)
    setCategoryImagePreview(URL.createObjectURL(file))
    setCategoryImageCleared(false)
  }

  const clearCategoryImage = () => {
    setSelectedCategoryImage(null)
    setCategoryImagePreview('')
    setCategoryImageCleared(true)
    if (categoryFileInputRef.current) categoryFileInputRef.current.value = ''
  }

  const buildCategoryData = () => {
    const data = new FormData()
    if (categoryForm.name.trim()) data.append('name', categoryForm.name.trim())
    data.append('description', categoryForm.description || '')
    if (selectedCategoryImage) {
      data.append('image', selectedCategoryImage)
    } else if (categoryImageCleared) {
      data.append('image', '')
    }
    return data
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()
    setError('')
    setCategoryModalError('')
    try {
      const payload = buildCategoryData()
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, payload)
        showToast('Category updated.')
      } else {
        await addCategory(payload)
        showToast('Category added.')
      }
      resetCategoryForm()
      setIsCategoryModalOpen(false)
      await reload()
    } catch (err) {
      const resData = err.response?.data
      const errMsg =
        resData?.detail ||
        (Array.isArray(resData?.image) ? `Image error: ${resData.image[0]}` : null) ||
        (Array.isArray(resData?.name) ? `Name error: ${resData.name[0]}` : null) ||
        (typeof resData === 'string' ? resData : null) ||
        'Could not save category.'
      setCategoryModalError(errMsg)
      setError(errMsg)
    }
  }

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id)
    setCategoryForm({ name: category.name || '', description: category.description || '' })
    setSelectedCategoryImage(null)
    setCategoryModalError('')
    const currentImg = category.image ? resolveMediaUrl(category.image) : getCategoryImage(category)
    setCategoryImagePreview(currentImg || '')
    setCategoryImageCleared(false)
    if (categoryFileInputRef.current) categoryFileInputRef.current.value = ''
    setTab('categories')
    setIsCategoryModalOpen(true)
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
      <Toast message={toast} />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Welcome back {user.username}!</h1>
        </div>
        <button onClick={reload} className="self-start sm:self-auto rounded-lg border border-gray-300 px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
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
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${tab === item.key
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
        <div className="space-y-4">
          {/* Top action bar: Search on left, "Add Product" button on right */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputCls}
              />
            </div>
            <button
              type="button"
              onClick={openAddProductModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.98] shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Product</span>
            </button>
          </div>

          {/* Products List */}
          {filteredProducts.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No products found.</p>}
          <div className="space-y-3">
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
        <div className="space-y-4">
          {/* Top action bar: Search on left, "Add Category" button on right */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputCls}
              />
            </div>
            <button
              type="button"
              onClick={openAddCategoryModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.98] shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Category</span>
            </button>
          </div>

          {/* Categories Grid (Block-by-Block) */}
          {filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-400 dark:border-gray-800">
              No categories found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-400/40"
                >
                  {/* Category Image Banner */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={getCategoryImage(category)}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_CATEGORY_FALLBACK
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Badges */}
                    {/*
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-gray-900/95 px-2.5 py-0.5 text-[11px] font-semibold text-gray-800 dark:text-gray-100 shadow-sm backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                        {category.products_count ?? 0} {category.products_count === 1 ? 'product' : 'products'}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] font-medium text-white/90 backdrop-blur-sm shadow-sm">
                        /{category.slug}
                      </span>
                    </div>
                    */}
                    {/* Title overlay on bottom of banner */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h3 className="text-base sm:text-lg font-bold text-white drop-shadow truncate">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      {category.description ? (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2rem] leading-relaxed">
                          {category.description}
                        </p>
                      ) : (
                        <p className="text-xs italic text-gray-400 dark:text-gray-500 min-h-[2rem]">
                          No description provided.
                        </p>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => startEditCategory(category)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeCategory(category.id)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:border-red-300 active:scale-[0.98] dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                        title="Delete Category"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Delete</span>
                      </button>

                      <Link
                        to={`/shop?category=${category.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-brand-400"
                        title="View Category in Shop"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeProductModal() }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingProductId ? 'Edit Product' : 'New Product'}
              </h2>
              <button
                type="button"
                onClick={closeProductModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">Product Image</label>
                <div className="mb-2 h-44 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Product preview" className="h-full w-full object-contain p-2" />
                  ) : (
                    <div className="text-sm text-gray-400">No image selected</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 transition"
                  >
                    Choose image
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Product Name *</label>
                <input
                  required
                  placeholder="e.g. Fresh Organic Apples"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your product..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Price ($) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Discount Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                    value={productForm.discount_price}
                    onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Stock Quantity *</label>
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  className={inputCls}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={productForm.is_active}
                  onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Active in shop
              </label>

              <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 shadow-sm transition"
                >
                  {editingProductId ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeCategoryModal() }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingCategoryId ? 'Edit Category' : 'New Category'}
              </h2>
              <button
                type="button"
                onClick={closeCategoryModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {categoryModalError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                {categoryModalError}
              </div>
            )}

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Category Name *</label>
                <input
                  required
                  placeholder="e.g. Fruits & Vegetables"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional description..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">Category Image</label>
                <input
                  ref={categoryFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImageSelect}
                  className="hidden"
                />
                {categoryImagePreview ? (
                  <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
                    <img
                      src={categoryImagePreview}
                      alt="Category preview"
                      className="h-36 w-full rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_CATEGORY_FALLBACK
                      }}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (categoryFileInputRef.current) categoryFileInputRef.current.value = ''
                          categoryFileInputRef.current?.click()
                        }}
                        className="flex-1 rounded-md border border-gray-300 bg-white py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={clearCategoryImage}
                        className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (categoryFileInputRef.current) categoryFileInputRef.current.value = ''
                      categoryFileInputRef.current?.click()
                    }}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-5 text-center transition hover:border-brand-500 hover:bg-brand-50/20 dark:border-gray-700 dark:hover:border-brand-400"
                  >
                    <span className="text-3xl">🖼️</span>
                    <p className="mt-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">Upload category image</p>
                    <p className="text-[11px] text-gray-400">Click to choose image file</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 shadow-sm transition"
                >
                  {editingCategoryId ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
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

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'

const inputCls = 'px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition'

export default function ShopConnected() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || ''

  useEffect(() => {
    api.get('/categories/')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      setError('')
      try {
        const params = {}
        if (search) params.search = search
        if (category) params.category = category
        const res = await api.get('/products/', { params })
        setProducts(res.data)
      } catch {
        setProducts([])
        setError('Could not load products.')
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [search, category])

  const visibleProducts = useMemo(() => {
    const data = [...products]
    if (sort === 'price_asc') data.sort((a, b) => Number(a.discount_price || a.price) - Number(b.discount_price || b.price))
    if (sort === 'price_desc') data.sort((a, b) => Number(b.discount_price || b.price) - Number(a.discount_price || a.price))
    if (sort === 'newest') data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return data
  }, [products, sort])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams({})
  const hasFilters = search || category || sort

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shop</h1>
          {!loading && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {visibleProducts.length} product{visibleProducts.length !== 1 ? 's' : ''}
              {category && <span> in <span className="font-medium capitalize">{categories.find((c) => c.slug === category)?.name || category}</span></span>}
            </p>
          )}
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            Clear filters
          </button>
        )}
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(event) => updateParam('search', event.target.value)}
          placeholder="Search products..."
          className={`flex-1 ${inputCls}`}
        />
        <select value={category} onChange={(event) => updateParam('category', event.target.value)} className={inputCls}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
        </select>
        <select value={sort} onChange={(event) => updateParam('sort', event.target.value)} className={inputCls}>
          <option value="">Sort: Default</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-20 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-lg text-gray-500 dark:text-gray-400">No products found.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  )
}
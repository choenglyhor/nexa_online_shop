import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'

import heroImg1 from '../assets/products/b1.jpg'
import heroImg2 from '../assets/products/b2.jpg'
import heroImg3 from '../assets/products/b3.jpg'
import heroImg4 from '../assets/products/b4.jpg'
import dealImg from '../assets/products/b5.jpg'
import meatImg from '../assets/products/b6.jpg'
import bakeryImg from '../assets/products/b7.jpg'

import electronicsImg from '../assets/products/Electronics.jpg'
import fashionImg from '../assets/products/Fashion.jpg'
import homeImg from '../assets/products/Home.jpg'
import beautyImg from '../assets/products/Beauty.jpg'
import sportImg from '../assets/products/Sport.jpg'

const categoryImages = {
  electronics: electronicsImg,
  fashion: fashionImg,
  'home-living': homeImg,
  home: homeImg,
  beauty: beautyImg,
  sports: sportImg,
  sport: sportImg,
}

function getCategoryImage(category) {
  return categoryImages[category.slug] || categoryImages[(category.name || '').toLowerCase()] || homeImg
}

export default function HomeConnected() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          api.get('/products/'),
          api.get('/categories/'),
        ])
        setProducts(productRes.data)
        setCategories(categoryRes.data)
      } catch {
        setProducts([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const bestSellers = products.slice(0, 7)
  const newArrivals = products.slice(7, 11)
  const hotDeals = products.slice(11, 15)

  return (
    <div className="bg-gray-50 dark:bg-gray-950 ">
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-5">
          <div className="relative flex min-h-[380px] gap-6 overflow-hidden rounded-3xl bg-[#6EE7C7] p-8 dark:bg-emerald-800 sm:p-10 md:col-span-3">
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
              <span className="mb-5 w-fit rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-gray-800">Spring Sale for This Week</span>
              <h1 className="max-w-xs text-3xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-4xl">Fresh finds, fair prices</h1>
              <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">Find everyday essentials, fresh deals, and new favorites.</p>
              <Link to="/shop" className="mt-7 w-fit rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100">
                Shop Now
              </Link>
            </div>
            <div className="hidden shrink-0 grid-cols-2 gap-3 self-center sm:grid ">
              {[heroImg1, heroImg2, heroImg3, heroImg4].map((image) => (
                <div key={image} className="h-28 w-28 overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md">
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[380px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-500 to-blue-500 dark:from-indigo-700 dark:to-blue-800 md:col-span-2">
            <div className="flex flex-col gap-3 p-8">
              <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">Daily Deal</span>
              <h2 className="text-3xl font-extrabold leading-snug text-white">Curated essentials</h2>
              <p className="text-sm text-white/80">Discover thoughtful picks for work, home, and weekends.</p>
              <Link to="/shop" className="mt-3 rounded-xl bg-white py-3 text-center text-sm font-semibold text-purple-600 transition hover:bg-purple-50 transition hover:-translate-y-0.5 hover:shadow-md">
                Browse Products
              </Link>
            </div>
            <div className="flex-1 overflow-hidden">
              <img src={dealImg} alt="Daily deal" className="h-full w-full object-cover border-2 transition hover:-translate-y-0.5 hover:shadow-md" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="relative flex min-h-[180px] items-center overflow-hidden rounded-2xl bg-orange-400 dark:bg-orange-700">
            <div className="z-10 flex flex-1 flex-col gap-2 p-7">
              <span className="w-fit rounded-full bg-white/30 px-3 py-1 text-xs font-semibold text-white">Special Picks</span>
              <h3 className="text-xl font-extrabold text-white">Premium quality goods</h3>
              <p className="text-sm text-white/80">Smart choices at prices that make sense.</p>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden">
              <img src={meatImg} alt="" className="mask-auto object-cover" />
            </div>
          </div>

          <div className="relative flex min-h-[180px] items-center overflow-hidden rounded-2xl bg-pink-500 dark:bg-pink-800">
            <div className="z-10 flex flex-1 flex-col gap-2 p-7">
              <span className="w-fit rounded-full bg-white/30 px-3 py-1 text-xs font-semibold text-white">New Arrivals</span>
              <h3 className="text-2xl font-extrabold text-white">Fresh arrivals</h3>
              <p className="text-sm text-white/80">New finds for your next order.</p>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden">
              <img src={bakeryImg} alt="" className="h-full w-full object-cover rounded-l-lg" />
            </div>
          </div>
        </div>
      </section>
    {/* Categories and products */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Categories</h2>
            <p className="mt-1 text-xl text-gray-400">Browse by what you need most</p>
          </div>
          <Link to="/shop" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">View All</Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible md:grid-cols-5">
          {categories.map((category) => (
            <Link key={category.id} to={`/shop?category=${category.slug}`} className="group flex w-32 shrink-0 flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 sm:w-auto">
              <div className="flex h-24 w-full items-center justify-center overflow-hidden">
                <img src={getCategoryImage(category)} alt={category.name} className="h-48 w-96 object-scale-down" />
              </div>
              <p className="w-full truncate text-center text-sm font-bold text-gray-800 transition group-hover:text-brand-600 dark:text-gray-100 dark:group-hover:text-brand-400">
                {category.name}
              </p>
            </Link>
          ))}
          {!loading && categories.length === 0 && <p className="text-sm text-gray-400">No categories yet.</p>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Best Selling Products</h2>
          <Link to="/shop" className="text-sm font-medium text-brand-600 dark:text-brand-400">View all</Link>
        </div>
        {loading ? (
          <p className="py-12 text-center text-sm text-gray-500">Loading products...</p>
        ) : bestSellers.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">No products yet. Add products from the dashboard.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Arrivals</h2>
            <Link to="/shop" className="text-sm font-medium text-brand-600 dark:text-brand-400">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      {hotDeals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hot Deals</h2>
            <Link to="/shop" className="text-sm font-medium text-brand-600 dark:text-brand-400">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {hotDeals.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}
    </div>
  )
}

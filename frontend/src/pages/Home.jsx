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

import { getCategoryImage, DEFAULT_CATEGORY_FALLBACK } from '../utils/categoryImages'

export default function HomeConnected() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          api.get("/products/"),
          api.get("/categories/"),
        ]);
        setProducts(productRes.data);
        setCategories(categoryRes.data);
      } catch (err) {
        console.error(err);
        console.error(err.response?.data);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load()
  }, [])

  const bestSellers = products.slice(0, 7)
  const newArrivals = products.slice(7, 11)
  const hotDeals = products.slice(11, 15)

  return (
    <div className="bg-gray-50 dark:bg-gray-950 ">
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-5">
          <div className="relative flex min-h-[300px] sm:min-h-[380px] gap-6 overflow-hidden rounded-3xl bg-[#6EE7C7] p-5 sm:p-8 lg:p-10 dark:bg-emerald-800 md:col-span-3">
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 sm:gap-3">
              <span className="mb-2 sm:mb-5 w-fit rounded-full bg-white/60 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-gray-800">Spring Sale for This Week</span>
              <h1 className="max-w-xs text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-gray-900 dark:text-white">Fresh finds, fair prices</h1>
              <p className="mt-1 sm:mt-3 text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300">Find everyday essentials, fresh deals, and new favorites.</p>
              <Link to="/shop" className="mt-4 sm:mt-7 w-fit rounded-full bg-white px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-900 transition hover:bg-gray-100">
                Shop Now
              </Link>
            </div>
            <div className="hidden shrink-0 grid-cols-2 gap-3 self-center sm:grid ">
              {[heroImg1, heroImg2, heroImg3, heroImg4].map((image) => (
                <div key={image} className="h-24 w-24 lg:h-28 lg:w-28 overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md">
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[300px] sm:min-h-[380px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-500 to-blue-500 dark:from-indigo-700 dark:to-blue-800 md:col-span-2">
            <div className="flex flex-col gap-2.5 sm:gap-3 p-5 sm:p-8">
              <span className="w-fit rounded-full bg-white/20 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-white">Daily Deal</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug text-white">Curated essentials</h2>
              <p className="text-xs sm:text-sm text-white/80">Discover thoughtful picks for work, home, and weekends.</p>
              <Link to="/shop" className="mt-2 sm:mt-3 rounded-xl bg-white py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-purple-600 transition hover:bg-purple-50 hover:-translate-y-0.5 hover:shadow-md">
                Browse Products
              </Link>
            </div>
            <div className="flex-1 overflow-hidden">
              <img src={dealImg} alt="Daily deal" className="h-full w-full object-cover border-2 transition hover:-translate-y-0.5 hover:shadow-md" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-4 sm:pt-5 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
          {/* Card 1: Special Picks */}
          <div className="relative flex min-h-[160px] sm:min-h-[180px] items-center overflow-hidden rounded-2xl bg-orange-400 dark:bg-orange-700 shadow-sm">
            <div className="z-10 flex w-7/12 sm:w-3/5 flex-col justify-center gap-1.5 sm:gap-2 p-4 sm:p-6 lg:p-7 pr-1 sm:pr-2">
              <span className="w-fit rounded-full bg-white/30 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white">
                Special Picks
              </span>
              <h3 className="text-base sm:text-xl lg:text-2xl font-extrabold leading-snug sm:leading-tight text-white">
                Premium quality goods
              </h3>
              <p className="text-xs sm:text-sm text-white/90 leading-tight sm:leading-normal line-clamp-2">
                Smart choices at prices that make sense.
              </p>
            </div>
            <div className="absolute right-0 top-0 h-full w-5/12 sm:w-2/5 overflow-hidden flex items-center justify-center">
              <img src={meatImg} alt="Special picks" className="h-100% w-100% object-cover object-center transition hover:-translate-y-0.5 hover:shadow-md" />
              <div className="absolute inset-y-0 left-0 w-6 sm:w-10 bg-gradient-to-r from-orange-400 dark:from-orange-700 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Card 2: New Arrivals */}
          <div className="relative flex min-h-[160px] sm:min-h-[180px] items-center overflow-hidden rounded-2xl bg-pink-500 dark:bg-pink-800 shadow-sm">
            <div className="z-10 flex w-7/12 sm:w-3/5 flex-col justify-center gap-1.5 sm:gap-2 p-4 sm:p-6 lg:p-7 pr-1 sm:pr-2">
              <span className="w-fit rounded-full bg-white/30 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white">
                New Arrivals
              </span>
              <h3 className="text-base sm:text-xl lg:text-2xl font-extrabold leading-snug sm:leading-tight text-white">
                Fresh arrivals
              </h3>
              <p className="text-xs sm:text-sm text-white/90 leading-tight sm:leading-normal line-clamp-2">
                New finds for your next order.
              </p>
            </div>
            <div className="absolute right-0 top-0 h-full w-5/12 sm:w-2/5 overflow-hidden flex items-center justify-center">
              <img src={bakeryImg} alt="New arrivals" className="h-full w-full object-cover object-center rounded-l-lg transition hover:-translate-y-0.5 hover:shadow-md" />
              <div className="absolute inset-y-0 left-0 w-6 sm:w-10 bg-gradient-to-r from-pink-500 dark:from-pink-800 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories and products */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 flex flex-wrap items-end justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-600 dark:bg-brand-400"></span>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Explore Collections
              </span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Top Categories
            </h2>
            <p className="mt-1 text-xs sm:text-sm lg:text-base text-gray-500 dark:text-gray-400">
              Browse by what you need most & find your favorites
            </p>
          </div>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            <span>View All</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-2.5 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-400/50"
            >
              {/* Category Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                <img
                  src={getCategoryImage(category)}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_CATEGORY_FALLBACK
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {category.products_count !== undefined && (
                  <span className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-gray-800 shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 dark:bg-gray-900/90 dark:text-gray-200">
                    {category.products_count} {category.products_count === 1 ? 'product' : 'products'}
                  </span>
                )}
              </div>

              {/* Text Info */}
              <div className="mt-2 sm:mt-3 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="truncate text-xs sm:text-sm lg:text-base font-bold text-gray-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                      {category.name}
                    </h3>
                    <span className="text-gray-400 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 text-xs sm:text-sm">
                      →
                    </span>
                  </div>
                  {category.description ? (
                    <p className="mt-0.5 sm:mt-1 line-clamp-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {category.description}
                    </p>
                  ) : (
                    <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
                      Explore collection
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {!loading && categories.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-gray-400">
              No categories yet.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:pb-12 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Best Selling Products</h2>
          <Link to="/shop" className="text-xs sm:text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">View all</Link>
        </div>
        {loading ? (
          <p className="py-12 text-center text-sm text-gray-500">Loading products...</p>
        ) : bestSellers.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">No products yet. Add products from the dashboard.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-8 sm:pb-12 sm:px-6 lg:px-8">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">New Arrivals</h2>
            <Link to="/shop" className="text-xs sm:text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      {hotDeals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:pb-16 sm:px-6 lg:px-8">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Hot Deals</h2>
            <Link to="/shop" className="text-xs sm:text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {hotDeals.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}
    </div>
  )
}

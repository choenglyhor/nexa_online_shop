import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const { wishlist } = useCart()

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">🤍</p>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Your wishlist is empty</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Save products you love for later.</p>
        <Link to="/shop" className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium inline-block transition">
          Browse Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Wishlist</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/shop" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
          Continue shopping →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((w) => (
          <ProductCard key={w.id} product={w.product} />
        ))}
      </div>
    </div>
  )
}
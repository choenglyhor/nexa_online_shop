import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

import img1       from '../assets/products/img1.jpg'
import img2       from '../assets/products/img2.jpg'
import img3       from '../assets/products/img3.jpg'
import img4       from '../assets/products/img4.jpg'
import img5       from '../assets/products/img5.jpg'
import img6       from '../assets/products/img6.jpg'
import img7       from '../assets/products/img7.jpg'
import img8       from '../assets/products/img8.jpg'
import defaultImg from '../assets/products/defaultImg.png'

const LOCAL_IMAGES = {
  'Skincare Set':     img1,
  'Scented Candle':   img2,
  'Running Shoes':    img3,
  'Laptop Stand':     img4,
  'Coffee Mug':       img5,
  'Wireless Earbuds': img6,
  'Yoga Mat':         img7,
  'Desk Lamp':        img8,
}

export default function ProductCard({ product }) {
  const { user }                              = useAuth()
  const { addToCart, toggleWishlist, isWishlisted } = useCart()

  // Normalise FakeStore (title) and Django (name)
  const name          = product.title        || product.name         || 'Product'
  const price         = product.price        ?? 0
  const discountPrice = product.discount_price ?? null
  const categoryName  = product.category_name || product.category || ''
  const image         = product.image        || LOCAL_IMAGES[name]   || defaultImg
  const wishlisted    = isWishlisted(product.id)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!user) { window.location.href = '/login'; return }
    await addToCart(product, 1)
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!user) { window.location.href = '/login'; return }
    await toggleWishlist(product)
  }

  return (
    <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">

      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {wishlisted ? '❤️' : '🤍'}
      </button>

      {/* Image */}
      <Link to={`/shop?product=${product.id}`} className="block aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden p-4">
        <img
          src={image}
          alt={name}
          onError={(e) => { e.currentTarget.src = defaultImg }}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Info */}
      <div className="p-4">
        {categoryName && (
          <p className="text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 font-semibold truncate">
            {categoryName}
          </p>
        )}

        <h3 className="mt-1 font-semibold text-gray-900 dark:text-gray-100 truncate text-sm" title={name}>
          {name}
        </h3>

        {product.rating && (
          <p className="text-xs text-gray-400 mt-1">
            ⭐ {product.rating.rate}
            <span className="ml-1 text-gray-300 dark:text-gray-600">({product.rating.count})</span>
          </p>
        )}

        <div className="mt-2 flex items-center gap-2">
          {discountPrice ? (
            <>
              <span className="font-bold text-gray-900 dark:text-white">${Number(discountPrice).toFixed(2)}</span>
              <span className="text-sm text-gray-400 line-through">${Number(price).toFixed(2)}</span>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium ml-auto">
                -{Math.round((1 - discountPrice / price) * 100)}%
              </span>
            </>
          ) : (
            <span className="font-bold text-gray-900 dark:text-white">${Number(price).toFixed(2)}</span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={product.in_stock === false}
          className="mt-3 w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:bg-gray-200 disabled:dark:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {product.in_stock === false ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

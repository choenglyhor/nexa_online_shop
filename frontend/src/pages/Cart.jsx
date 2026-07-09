import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cart, updateCartItem, removeCartItem, checkout } = useCart()
  const [address, setAddress] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error,   setError]   = useState('')
  const navigate = useNavigate()

  const items = cart.items || []
  const total = parseFloat(cart.total || 0)

  const handleCheckout = async () => {
    if (!address.trim()) { setError('Please enter a shipping address.'); return }
    setError('')
    setPlacing(true)
    try {
      await checkout(address)
      navigate('/profile')
    } catch {
      setError('Checkout failed. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Your cart is empty</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Browse the shop and add something you love.</p>
        <Link to="/shop" className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium inline-block transition">
          Go to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Your Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">

        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => {
            const name         = item.product.name || 'Product'
            const image        = item.product.image || ''
            const displayPrice = item.product.discount_price
              ? Number(item.product.discount_price).toFixed(2)
              : Number(item.product.price).toFixed(2)

            return (
              <div key={item.id} className="flex items-center gap-4 border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  {image
                    ? <img src={image} alt={name} className="w-full h-full object-contain p-1" />
                    : <span className="text-2xl">🛍️</span>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">${displayPrice} each</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => updateCartItem(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-bold flex items-center justify-center">
                    −
                  </button>
                  <span className="w-7 text-center text-sm font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                  <button onClick={() => updateCartItem(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-bold flex items-center justify-center">
                    +
                  </button>
                </div>

                <p className="w-16 text-right text-sm font-bold text-gray-900 dark:text-white shrink-0">
                  ${Number(item.subtotal).toFixed(2)}
                </p>

                <button onClick={() => removeCartItem(item.id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition text-lg ml-1"
                  aria-label="Remove">✕</button>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 h-fit space-y-4 bg-white dark:bg-gray-900">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <span className={total >= 50 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                {total >= 50 ? 'Free 🎉' : `$${(4.99).toFixed(2)}`}
              </span>
            </div>
            {total < 50 && (
              <p className="text-xs text-gray-400">Add ${(50 - total).toFixed(2)} more for free shipping</p>
            )}
          </div>

          <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-800 pt-3">
            <span>Total</span>
            <span>${(total >= 50 ? total : total + 4.99).toFixed(2)}</span>
          </div>

          <textarea
            placeholder="Shipping address (required)…"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition"
          />

          {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

          <button onClick={handleCheckout} disabled={placing}
            className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors">
            {placing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Placing order…
              </span>
            ) : 'Checkout'}
          </button>

          <Link to="/shop" className="block text-center text-sm text-brand-600 dark:text-brand-400 hover:underline">
            ← Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

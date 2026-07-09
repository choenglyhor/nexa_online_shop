import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import api from '../api/axios'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart,     setCart]     = useState({ items: [], total: '0.00' })
  const [wishlist, setWishlist] = useState([])
  const [loading,  setLoading]  = useState(false)

  // ─── Load cart + wishlist whenever user changes ────────────────────────────
  useEffect(() => {
    if (user) {
      refreshCart()
      refreshWishlist()
    } else {
      setCart({ items: [], total: '0.00' })
      setWishlist([])
    }
  }, [user?.id])

  // ─── Cart ─────────────────────────────────────────────────────────────────

  const refreshCart = async () => {
    try {
      const res = await api.get('/cart/')
      setCart(res.data)
    } catch {
      setCart({ items: [], total: '0.00' })
    }
  }

  // addToCart(product, quantity)
  // product must have an `id` field (Django product id, not FakeStore id)
  const addToCart = async (product, quantity = 1) => {
    if (!user) { window.location.href = '/login'; return }
    try {
      const res = await api.post('/cart/add/', { product_id: product.id, quantity })
      setCart(res.data)
    } catch (err) {
      console.error('Add to cart failed:', err)
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    if (!user) return
    try {
      if (quantity <= 0) {
        const res = await api.delete(`/cart/items/${itemId}/`)
        setCart(res.data)
      } else {
        const res = await api.put(`/cart/items/${itemId}/`, { quantity })
        setCart(res.data)
      }
    } catch (err) {
      console.error('Update cart item failed:', err)
    }
  }

  const removeCartItem = async (itemId) => {
    if (!user) return
    try {
      const res = await api.delete(`/cart/items/${itemId}/`)
      setCart(res.data)
    } catch (err) {
      console.error('Remove cart item failed:', err)
    }
  }

  const clearCart = async () => {
    // Clear by removing all items individually
    for (const item of cart.items) {
      await api.delete(`/cart/items/${item.id}/`)
    }
    setCart({ items: [], total: '0.00' })
  }

  // checkout(shippingAddress) → creates an Order from the current cart
  const checkout = async (shippingAddress = '') => {
    if (!user) return null
    const res = await api.post('/orders/', { shipping_address: shippingAddress })
    await refreshCart()   // cart is cleared server-side after checkout
    return res.data
  }

  // ─── Wishlist ─────────────────────────────────────────────────────────────

  const refreshWishlist = async () => {
    try {
      const res = await api.get('/wishlist/')
      setWishlist(res.data)
    } catch {
      setWishlist([])
    }
  }

  const isWishlisted = (productId) => wishlist.some((w) => w.product?.id === productId)

  // toggleWishlist(product) — product must have a Django `id`
  const toggleWishlist = async (product) => {
    if (!user) { window.location.href = '/login'; return }
    try {
      if (isWishlisted(product.id)) {
        const res = await api.delete(`/wishlist/${product.id}/`)
        setWishlist(res.data)
      } else {
        const res = await api.post('/wishlist/', { product_id: product.id })
        setWishlist(res.data)
      }
    } catch (err) {
      console.error('Wishlist toggle failed:', err)
    }
  }

  // ─── Derived ──────────────────────────────────────────────────────────────

  const cartCount     = (cart.items || []).reduce((s, i) => s + i.quantity, 0)
  const wishlistCount = wishlist.length

  return (
    <CartContext.Provider value={{
      cart, cartCount, loading,
      wishlist, wishlistCount,
      addToCart, updateCartItem, removeCartItem, clearCart, refreshCart,
      toggleWishlist, isWishlisted,
      checkout,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
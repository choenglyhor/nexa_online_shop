import electronicsImg from '../assets/products/Electronics.jpg'
import fashionImg from '../assets/products/Fashion.jpg'
import homeImg from '../assets/products/Home.jpg'
import beautyImg from '../assets/products/Beauty.jpg'
import sportImg from '../assets/products/Sport.jpg'
import jewelryImg from '../assets/jewelry.jpg'
import dealImg from '../assets/products/b5.jpg'
import meatImg from '../assets/products/b6.jpg'
import bakeryImg from '../assets/products/b7.jpg'

export const categoryImages = {
  electronics: electronicsImg,
  electronic: electronicsImg,
  tech: electronicsImg,
  fashion: fashionImg,
  clothing: fashionImg,
  clothes: fashionImg,
  'home-living': homeImg,
  home: homeImg,
  'home & living': homeImg,
  living: homeImg,
  furniture: homeImg,
  beauty: beautyImg,
  skincare: beautyImg,
  cosmetics: beautyImg,
  sports: sportImg,
  sport: sportImg,
  fitness: sportImg,
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
  bread: bakeryImg,
  bakery: bakeryImg,
  books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  book: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  jewelry: jewelryImg,
  jewellery: jewelryImg,
  meat: meatImg,
  grocery: dealImg,
  groceries: dealImg,
}

export const DEFAULT_CATEGORY_FALLBACK = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80'

export function resolveMediaUrl(src) {
  if (!src || /^(https?:|blob:|data:)/i.test(src)) return src || ''
  const apiBase = import.meta.env.VITE_API_URL || ''
  if (/^https?:\/\//i.test(apiBase)) {
    const base = apiBase.replace(/\/api\/?$/, '')
    return `${base}${src.startsWith('/') ? '' : '/'}${src}`
  }
  return src.startsWith('/') ? src : `/${src}`
}

export function getCategoryImage(category) {
  if (category?.image) {
    return resolveMediaUrl(category.image)
  }
  const slugKey = (category?.slug || '').toLowerCase().trim()
  const nameKey = (category?.name || '').toLowerCase().trim()
  return categoryImages[slugKey] || categoryImages[nameKey] || DEFAULT_CATEGORY_FALLBACK
}

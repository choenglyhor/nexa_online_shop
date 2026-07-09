import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { FaRegSun, FaRegMoon, FaRegHeart, FaSearch } from 'react-icons/fa'
import { FaRegUser } from 'react-icons/fa6'
import { BsCart3 } from 'react-icons/bs'
import { MdDashboard } from 'react-icons/md'
import logo from '../assets/LOGO-NexaShop.png'

const NAV_LINKS = [
  { to: '/',        label: 'Home'    },
  { to: '/shop',    label: 'Shop'    },
  { to: '/about',   label: 'About'   },
  { to: '/contact', label: 'Contact' },
]

// Small avatar shown in the navbar user button
function NavAvatar({ user }) {
  const avatar = user?.profile?.avatar
  const letter = (user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()
  return (
    <div className="w-7 h-7 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-bold shrink-0 border border-white dark:border-gray-800">
      {avatar
        ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
        : letter
      }
    </div>
  )
}

export default function Navbar() {
  const { theme, toggleTheme }       = useTheme()
  const { user, logout, isAdmin }    = useAuth()
  const { cartCount, wishlistCount } = useCart()
  const [menuOpen, setMenuOpen]      = useState(false)
  const [search,   setSearch]        = useState('')
  const [userOpen, setUserOpen]      = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const handleSearch = (e) => {
    e.preventDefault()
    if (!search.trim()) return
    navigate(`/shop?search=${encodeURIComponent(search.trim())}`)
    setSearch(''); setMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout(); setUserOpen(false); setMenuOpen(false); navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 shrink-0">
            <img src={logo} alt="NexaShop" className="h-16 w-auto" />
            <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400 hidden sm:block">NexaShop</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive(link.to)
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                    : 'text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                    : 'text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                <MdDashboard className="text-base" /> Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full px-3.5 py-2 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
            <button type="submit" className="px-3.5 rounded-r-lg bg-brand-600 hover:bg-brand-700 text-white transition" aria-label="Search">
              <FaSearch className="text-sm" />
            </button>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1">

            {/* Theme */}
            <button onClick={toggleTheme} aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-base">
              {theme === 'dark' ? <FaRegSun /> : <FaRegMoon />}
            </button>

            {/* Wishlist */}
            <Link to="/wishlist"
              className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-base"
              aria-label="Wishlist">
              <FaRegHeart />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart"
              className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-base"
              aria-label="Cart">
              <BsCart3 />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu (desktop) */}
            {user ? (
              <div className="relative hidden sm:block">
                <button onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <NavAvatar user={user} />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 max-w-[80px] truncate">
                    {user.first_name || user.username}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded font-semibold">
                      Admin
                    </span>
                  )}
                </button>

                {userOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                    <div className="absolute right-0 mt-1 w-52 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1 overflow-hidden">

                      {/* User header */}
                      <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
                        <NavAvatar user={user} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      <Link to="/profile" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        <FaRegUser className="text-xs shrink-0" /> My Profile
                      </Link>
                      <Link to="/wishlist" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        <FaRegHeart className="text-xs shrink-0" /> Wishlist
                        {wishlistCount > 0 && <span className="ml-auto text-xs text-pink-500 font-medium">{wishlistCount}</span>}
                      </Link>
                      <Link to="/cart" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        <BsCart3 className="text-xs shrink-0" /> Cart
                        {cartCount > 0 && <span className="ml-auto text-xs text-brand-600 dark:text-brand-400 font-medium">{cartCount}</span>}
                      </Link>
                      {isAdmin && (
                        <Link to="/dashboard" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                          <MdDashboard className="text-xs shrink-0" /> Dashboard
                        </Link>
                      )}
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition">
                Login
              </Link>
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full px-3.5 py-2 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <button type="submit" className="px-3 rounded-r-lg bg-brand-600 text-white text-sm"><FaSearch /></button>
          </form>

          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(link.to) ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                <MdDashboard /> Dashboard
              </Link>
            )}
            <Link to="/wishlist" onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-2"><FaRegHeart /> Wishlist</span>
              {wishlistCount > 0 && <span className="text-xs text-pink-500 font-semibold">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-2"><BsCart3 /> Cart</span>
              {cartCount > 0 && <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{cartCount}</span>}
            </Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                  <NavAvatar user={user} />
                  {user.first_name || user.username}
                  {isAdmin && <span className="text-[10px] px-1.5 py-0.5 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded font-semibold ml-auto">Admin</span>}
                </Link>
                <button onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white text-center transition">
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

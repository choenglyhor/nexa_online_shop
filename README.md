# Shoply — Django + React E-commerce

Full-stack e-commerce starter:
- **Backend**: Django + Django REST Framework, SQLite database, **session-based auth** (login/register/logout via cookies, no JWT)
- **Frontend**: React (Vite) + Tailwind CSS, dark/light mode, fully responsive

## Features included
- Login / Register (Django sessions)
- Homepage with hero, categories, featured products
- Shop page with search + category filter
- Contact Us page
- Add to cart, update quantity, remove, checkout
- Add to wishlist / remove from wishlist
- Product search (navbar + shop page)
- Profile page (edit personal info, view order history)
- Seller/Admin Dashboard (stats, manage products, manage order status)
- Dark mode / light mode toggle in navbar, persisted in localStorage
- Responsive navbar with mobile menu

---

## 1. Backend setup (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate

# create an admin/superuser (full access to /admin and the seller dashboard)
python manage.py createsuperuser

# optional: seed sample categories & products
python manage.py seed_data

# optional: grant an existing regular user access to the seller dashboard
python manage.py make_seller <username>

python manage.py runserver
```

The API runs at `http://localhost:8000`. Django admin is at `http://localhost:8000/admin/`.

### Notes on auth
This uses **plain Django session authentication** (the simple option you picked), not JWT:
- The frontend first calls `GET /api/auth/csrf/` to receive a `csrftoken` cookie.
- `POST /api/auth/register/` and `POST /api/auth/login/` create a Django session (`sessionid` cookie).
- All subsequent requests rely on the `sessionid` cookie + `X-CSRFToken` header for unsafe methods (handled automatically by `src/api/axios.js`).
- Because of this, **backend and frontend must be on the same top-level domain in production** (or you'll need to adjust `CORS`/`CSRF` settings, and possibly use `SESSION_COOKIE_DOMAIN`). In local dev, `localhost:5173` ↔ `localhost:8000` works fine with the included CORS settings.

### Who can access `/dashboard`?
Any user where `user.is_staff == True` (superusers/staff) **or** `profile.is_seller_admin == True`. Use `python manage.py make_seller <username>` to flip that flag for a normal account, or check the box in `/admin/`.

---

## 2. Frontend setup (React + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`. Vite is configured to proxy `/api` to `http://localhost:8000`, so you mostly won't hit CORS issues even though CORS headers are also set up on the backend.

---

## 3. Project structure

```
ecommerce/
├── backend/
│   ├── ecommerce/        # settings, root urls
│   ├── accounts/         # User profile, register/login/logout/profile API
│   └── store/            # Category, Product, Cart, Wishlist, Order, dashboard API
└── frontend/
    └── src/
        ├── api/axios.js          # axios instance w/ CSRF + cookies
        ├── context/              # AuthContext, CartContext, ThemeContext
        ├── components/           # Navbar, Footer, ProductCard, route guards
        └── pages/                 # Home, Shop, Contact, Login, Register,
                                    # Cart, Wishlist, Profile, Dashboard
```

## 4. Things you'll likely want to customize next
- Replace the emoji placeholders (🛍️ 🌙 ☀️) with real icons (e.g. `lucide-react`) and product photos.
- Add a payment step before order creation (Stripe/PayPal).
- Add product detail page (currently the catalog links to `/shop?product=ID`; wire up a dedicated route if you want a full PDP).
- Add pagination to `/api/products/` for larger catalogs.
- Harden `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, and cookie settings (`SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`) before deploying.

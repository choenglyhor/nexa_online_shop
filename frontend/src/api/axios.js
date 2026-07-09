// import axios from 'axios'

// const api = axios.create({
//   baseURL: '/api',
//   withCredentials: true,
// })

// function getCookie(name) {
//   const value = `; ${document.cookie}`
//   const parts = value.split(`; ${name}=`)
//   if (parts.length === 2) return parts.pop().split(';').shift()
//   return null
// }

// api.interceptors.request.use((config) => {
//   const csrfToken = getCookie('csrftoken')
//   if (csrfToken && ['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase())) {
//     config.headers['X-CSRFToken'] = csrfToken
//   }
//   return config
// })

// export default api

//import axios from 'axios'

//const api = axios.create({
//  baseURL: 'https://fakestoreapi.com',
//})

//export default api



// import axios from 'axios'

// // ─── Product API — FakeStore (used for all product/category data) ─────────────
// const api = axios.create({
//   baseURL: 'https://fakestoreapi.com',
// })

// export default api

// // ─── Auth / Django API ────────────────────────────────────────────────────────
// // TODO: When Django backend is ready, set baseURL to your server e.g.:
// //   baseURL: 'http://localhost:8000/api'
// // and remove withCredentials if you switch to token auth.
// export const authApi = axios.create({
//   baseURL: 'http://localhost:8000/api',
//   withCredentials: true,
// })

import axios from 'axios'

// ─── Single API instance pointing to Django ───────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,   // send session cookie + CSRF cookie on every request
})

// ─── CSRF interceptor ─────────────────────────────────────────────────────────
// Django's CsrfViewMiddleware checks the X-CSRFToken header on unsafe methods.
// The csrftoken cookie is set by /api/auth/csrf/ (called once on app boot in
// AuthContext). This interceptor reads it from the cookie and attaches it
// automatically so you never have to think about it again.
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'))
  return match ? match[2] : null
}

api.interceptors.request.use((config) => {
  const unsafe = ['post', 'put', 'patch', 'delete']
  if (unsafe.includes(config.method?.toLowerCase())) {
    const token = getCookie('csrftoken')
    if (token) config.headers['X-CSRFToken'] = token
  }
  return config
})

export default api

// Named export kept for backward compatibility with any file that imports authApi
export const authApi = api
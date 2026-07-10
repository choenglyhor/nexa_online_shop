
import axios from 'axios'

// ─── Single API instance pointing to Django ───────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,   // send session cookie + CSRF cookie on every request
})

const CSRF_STORAGE_KEY = 'nexa.csrfToken'
let csrfToken = null

function readStoredCsrfToken() {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage.getItem(CSRF_STORAGE_KEY)
  } catch {
    return null
  }
}

function saveCsrfToken(token) {
  csrfToken = token || null
  if (typeof window === 'undefined') return
  try {
    if (token) window.sessionStorage.setItem(CSRF_STORAGE_KEY, token)
    else window.sessionStorage.removeItem(CSRF_STORAGE_KEY)
  } catch {
    // Storage can be unavailable in private/restricted browser contexts.
  }
}

function getCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'))
  return match ? match[2] : null
}

function getCsrfToken() {
  return csrfToken || readStoredCsrfToken() || getCookie('csrftoken')
}

api.interceptors.request.use((config) => {
  const unsafe = ['post', 'put', 'patch', 'delete']
  if (unsafe.includes(config.method?.toLowerCase())) {
    const token = getCsrfToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers['X-CSRFToken'] = token
    }
  }
  return config
})

api.interceptors.response.use((response) => {
  const token = response?.data?.csrfToken
  if (token) saveCsrfToken(token)
  return response
})

export default api
export const authApi = api
export const setCsrfToken = saveCsrfToken

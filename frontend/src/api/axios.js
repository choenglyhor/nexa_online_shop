
import axios from 'axios'

// ─── Single API instance pointing to Django ───────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,   // send session cookie + CSRF cookie on every request
})
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

import axios from 'axios'

// ─── Single API instance pointing to Django ───────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,   // send session cookie + CSRF cookie on every request
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
export const authApi = api
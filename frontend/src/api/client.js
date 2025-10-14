import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const instance = axios.create({
  baseURL,
})

// Initialize token early from storage to avoid first-render race conditions
let authToken = ''
try {
  const stored = localStorage.getItem('token')
  if (stored) authToken = stored
} catch {}

instance.setToken = (token) => {
  authToken = token || ''
}

// Attach Authorization header
instance.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

// Basic 401 handler
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      try { localStorage.removeItem('token') } catch {}
      try { sessionStorage.removeItem('token') } catch {}
      // Force redirect to login
      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      }
    }
    return Promise.reject(err)
  }
)

export default instance

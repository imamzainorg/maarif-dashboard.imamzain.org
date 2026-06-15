import axios from 'axios'
import router from '@/router'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7091',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT token to requests if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Global Error Handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null

    if (status === 401) {
      // Unauthorized: Clear tokens and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    } else if (status === 403) {
      // Forbidden: Insufficient roles
      alert('عذراً، لا تمتلك الصلاحية الكافية للوصول إلى هذا الجزء.')
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

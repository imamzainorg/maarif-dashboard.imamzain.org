import axios from 'axios'
import router from '@/router'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://maarif-api.imamzain.org',
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

// Response Interceptor: Global Error Handling & Automatic Token Refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

import { useAuthStore } from '@/stores/auth'

function handleLogoutAndRedirect() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')

  try {
    const authStore = useAuthStore()
    authStore.token = null
    authStore.refreshToken = null
    authStore.user = null
  } catch (e) {
    // Pinia not yet initialized or other issue
  }

  if (router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config
    const status = error.response ? error.response.status : null

    // Check if error status is 401, if it's not a retry, and if it's not a login/refresh request
    if (
      status === 401 && 
      !originalRequest._retry && 
      originalRequest.url && 
      !originalRequest.url.includes('/api/Auth/login') && 
      !originalRequest.url.includes('/api/Auth/refresh-token')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const storedRefreshToken = localStorage.getItem('refreshToken')
      if (!storedRefreshToken) {
        handleLogoutAndRedirect()
        return Promise.reject(error)
      }

      return new Promise((resolve, reject) => {
        const baseURL = axiosInstance.defaults.baseURL || 'https://maarif-api.imamzain.org'
        axios
          .post(`${baseURL}/api/Auth/refresh-token`, {
            deviceUuid: 'dashboard-web-session',
            refreshToken: storedRefreshToken
          })
          .then(({ data }) => {
            const authStore = useAuthStore()
            authStore.refreshSession(data)

            processQueue(null, data.token)

            originalRequest.headers.Authorization = `Bearer ${data.token}`
            resolve(axiosInstance(originalRequest))
          })
          .catch((err) => {
            processQueue(err, null)
            handleLogoutAndRedirect()
            reject(err)
          })
          .finally(() => {
            isRefreshing = false
          })
      })
    } else if (status === 401) {
      // If we got 401 on login or refresh itself, clean up and redirect
      handleLogoutAndRedirect()
    } else if (status === 403) {
      // Forbidden: Insufficient roles
      alert('عذراً، لا تمتلك الصلاحية الكافية للوصول إلى هذا الجزء.')
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

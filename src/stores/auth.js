import { defineStore } from 'pinia'
import axiosInstance from '@/api/axiosInstance'

// Helper function to decode JWT payload locally without external libraries
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    refreshToken: null,
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isSuperAdmin: (state) => state.user?.role === 'super_admin',
  },

  actions: {
    init() {
      const storedToken = localStorage.getItem('token')
      const storedRefreshToken = localStorage.getItem('refreshToken')
      const storedUser = localStorage.getItem('user')

      if (storedToken) {
        this.token = storedToken
        this.refreshToken = storedRefreshToken
        this.user = storedUser ? JSON.parse(storedUser) : null
      }
    },

    refreshSession(data) {
      this.token = data.token
      this.refreshToken = data.refreshToken
      
      // Decode token to extract role
      const decoded = parseJwt(data.token)
      const role = decoded ? decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role : 'visitor'
      
      this.user = {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: role?.toLowerCase()
      }

      // Persist to localStorage
      localStorage.setItem('token', this.token)
      localStorage.setItem('refreshToken', this.refreshToken)
      localStorage.setItem('user', JSON.stringify(this.user))
    },
    async login(contact, password) {
      this.loading = true
      this.error = null
      try {
        const response = await axiosInstance.post('/api/Auth/login', {
          contact,
          password,
          deviceUuid: 'dashboard-web-session', // Constant device UUID for web login
          fcmToken: ''
        })

        const data = response.data
        this.token = data.token
        this.refreshToken = data.refreshToken
        
        // Decode token to extract role
        const decoded = parseJwt(data.token)
        const role = decoded ? decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role : 'visitor'
        
        this.user = {
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
          role: role?.toLowerCase()
        }

        // Persist to localStorage
        localStorage.setItem('token', this.token)
        localStorage.setItem('refreshToken', this.refreshToken)
        localStorage.setItem('user', JSON.stringify(this.user))

        return this.user
      } catch (err) {
        this.error = err.response?.data?.message || 'فشلت عملية تسجيل الدخول. يرجى التحقق من المدخلات.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await axiosInstance.post('/api/Auth/logout', {
          deviceUuid: 'dashboard-web-session'
        })
      } catch (err) {
        console.error('Server logout failed:', err)
      } finally {
        this.token = null
        this.refreshToken = null
        this.user = null
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('deviceUuid')
        
        // Navigate to login page
        const router = (await import('@/router')).default
        router.push('/login')
      }
    }
  }
})

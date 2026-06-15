import { defineStore } from 'pinia'
import axiosInstance from '@/api/axiosInstance'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    currentUser: null,
    totalCount: 0, // Estimating pagination total
    loading: false,
    error: null
  }),

  actions: {
    async fetchUsers(limit = 50, offset = 0) {
      this.loading = true
      this.error = null
      try {
        const response = await axiosInstance.get('/api/admin/users', {
          params: { limit, offset }
        })
        this.users = response.data
        // Since backend doesn't return total count in standard header, we guess based on returned size
        if (response.data.length < limit) {
          this.totalCount = offset + response.data.length
        } else {
          this.totalCount = offset + response.data.length + 1 // Allow next page
        }
      } catch (err) {
        this.error = 'حدث خطأ أثناء تحميل سجلات المستخدمين.'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async fetchUserById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await axiosInstance.get(`/api/admin/users/${id}`)
        this.currentUser = response.data
        return response.data
      } catch (err) {
        this.error = 'حدث خطأ أثناء تحميل تفاصيل هذا المستخدم.'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async createUser(userData) {
      try {
        const payload = {
          fullName: userData.fullName,
          birthDate: new Date(userData.birthDate).toISOString(),
          city: userData.city,
          phoneNumber: userData.phoneNumber,
          email: userData.email || null,
          password: userData.password,
          deviceUuid: 'dashboard-created-user-session',
          fcmToken: ''
        }
        const response = await axiosInstance.post('/api/Auth/register', payload)
        
        const newUser = {
          userId: response.data.userId,
          fullName: response.data.fullName,
          email: response.data.email,
          phoneNumber: userData.phoneNumber,
          city: userData.city,
          birthDate: new Date(userData.birthDate).toISOString(),
          createdAt: new Date().toISOString(),
          roleId: 3,
          roleName: 'user',
          totalPoints: 0,
          lastActiveAt: null
        }
        
        this.users.unshift(newUser)
        this.totalCount++
        return newUser
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async updateUser(id, userData) {
      try {
        await axiosInstance.put(`/api/admin/users/${id}`, userData)
        const index = this.users.findIndex(u => u.userId === id)
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...userData }
        }
        if (this.currentUser && this.currentUser.userId === id) {
          this.currentUser = { ...this.currentUser, ...userData }
        }
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async deleteUser(id) {
      try {
        await axiosInstance.delete(`/api/admin/users/${id}`)
        this.users = this.users.filter(u => u.userId !== id)
        if (this.currentUser && this.currentUser.userId === id) {
          this.currentUser = null
        }
      } catch (err) {
        throw err.response?.data || err
      }
    }
  }
})

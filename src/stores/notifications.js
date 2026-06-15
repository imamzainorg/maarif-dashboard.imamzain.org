import { defineStore } from 'pinia'
import axiosInstance from '@/api/axiosInstance'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    loading: false,
    error: null,
    lastSentResult: null
  }),

  actions: {
    async sendNotification(notificationData) {
      this.loading = true
      this.error = null
      try {
        // notificationData: { title, contentText, userId: int || null }
        const response = await axiosInstance.post('/api/admin/notifications/send', notificationData)
        this.lastSentResult = response.data
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'حدث خطأ أثناء محاولة إرسال الإشعار.'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})

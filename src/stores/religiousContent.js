import { defineStore } from 'pinia'
import axiosInstance from '@/api/axiosInstance'

export const useReligiousContentStore = defineStore('religiousContent', {
  state: () => ({
    contents: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchContents() {
      this.loading = true
      this.error = null
      try {
        const response = await axiosInstance.get('/api/ReligiousContent')
        this.contents = response.data
      } catch (err) {
        this.error = 'حدث خطأ أثناء تحميل المحتوى الديني.'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async createContent(contentData) {
      try {
        const response = await axiosInstance.post('/api/admin/religious-content', contentData)
        this.contents.push(response.data)
        return response.data
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async updateContent(id, contentData) {
      try {
        await axiosInstance.put(`/api/admin/religious-content/${id}`, contentData)
        const index = this.contents.findIndex(c => c.contentId === id)
        if (index !== -1) {
          this.contents[index] = { ...this.contents[index], ...contentData }
        }
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async deleteContent(id) {
      try {
        await axiosInstance.delete(`/api/admin/religious-content/${id}`)
        this.contents = this.contents.filter(c => c.contentId !== id)
      } catch (err) {
        throw err.response?.data || err
      }
    }
  }
})

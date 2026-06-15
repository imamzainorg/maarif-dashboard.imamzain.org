import { defineStore } from 'pinia'
import axiosInstance from '@/api/axiosInstance'

export const useAmenitiesStore = defineStore('amenities', {
  state: () => ({
    amenities: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAmenities() {
      this.loading = true
      this.error = null
      try {
        const response = await axiosInstance.get('/api/Amenities')
        this.amenities = response.data
      } catch (err) {
        this.error = 'حدث خطأ أثناء تحميل المعالم والخدمات.'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async createAmenity(amenityData) {
      try {
        const response = await axiosInstance.post('/api/admin/amenities', amenityData)
        this.amenities.push(response.data)
        return response.data
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async updateAmenity(id, amenityData) {
      try {
        await axiosInstance.put(`/api/admin/amenities/${id}`, amenityData)
        const index = this.amenities.findIndex(a => a.amenityId === id)
        if (index !== -1) {
          this.amenities[index] = { ...this.amenities[index], ...amenityData }
        }
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async deleteAmenity(id) {
      try {
        await axiosInstance.delete(`/api/admin/amenities/${id}`)
        this.amenities = this.amenities.filter(a => a.amenityId !== id)
      } catch (err) {
        throw err.response?.data || err
      }
    }
  }
})

import { defineStore } from 'pinia'
import axiosInstance from '@/api/axiosInstance'

export const useStationsStore = defineStore('stations', {
  state: () => ({
    stations: [],
    currentStationDhikrs: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchStations() {
      this.loading = true
      this.error = null
      try {
        const response = await axiosInstance.get('/api/stations')
        this.stations = response.data.sort((a, b) => a.sortOrder - b.sortOrder)
      } catch (err) {
        this.error = 'حدث خطأ أثناء تحميل المحطات.'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async createStation(stationData) {
      try {
        const response = await axiosInstance.post('/api/stations', stationData)
        this.stations.push(response.data)
        this.stations.sort((a, b) => a.sortOrder - b.sortOrder)
        return response.data
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async updateStation(id, stationData) {
      try {
        await axiosInstance.put(`/api/stations/${id}`, stationData)
        const index = this.stations.findIndex(s => s.stationId === id)
        if (index !== -1) {
          this.stations[index] = { ...this.stations[index], ...stationData }
        }
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async deleteStation(id) {
      try {
        await axiosInstance.delete(`/api/stations/${id}`)
        this.stations = this.stations.filter(s => s.stationId !== id)
      } catch (err) {
        throw err.response?.data || err
      }
    },

    // Dhikr (Rights) Operations
    async fetchDhikrs(stationId) {
      this.loading = true
      this.error = null
      try {
        const response = await axiosInstance.get(`/api/stations/${stationId}/rights`)
        this.currentStationDhikrs = response.data.sort((a, b) => a.sortOrder - b.sortOrder)
      } catch (err) {
        this.error = 'حدث خطأ أثناء تحميل أذكار المحطة.'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async addDhikr(stationId, dhikrData) {
      try {
        const response = await axiosInstance.post(`/api/stations/${stationId}/rights`, dhikrData)
        this.currentStationDhikrs.push(response.data)
        this.currentStationDhikrs.sort((a, b) => a.sortOrder - b.sortOrder)
        // Increment rights count locally
        const station = this.stations.find(s => s.stationId === stationId)
        if (station) {
          station.rightsCount++
        }
        return response.data
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async updateDhikr(stationId, rightId, dhikrData) {
      try {
        await axiosInstance.put(`/api/stations/rights/${rightId}`, dhikrData)
        const index = this.currentStationDhikrs.findIndex(d => d.rightId === rightId)
        if (index !== -1) {
          this.currentStationDhikrs[index] = { ...this.currentStationDhikrs[index], ...dhikrData }
        }
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async deleteDhikr(stationId, rightId) {
      try {
        await axiosInstance.delete(`/api/stations/rights/${rightId}`)
        this.currentStationDhikrs = this.currentStationDhikrs.filter(d => d.rightId !== rightId)
        // Decrement rights count locally
        const station = this.stations.find(s => s.stationId === stationId)
        if (station) {
          station.rightsCount--
        }
      } catch (err) {
        throw err.response?.data || err
      }
    }
  }
})

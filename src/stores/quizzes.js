import { defineStore } from 'pinia'
import axiosInstance from '@/api/axiosInstance'

export const useQuizzesStore = defineStore('quizzes', {
  state: () => ({
    questions: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchQuestions(stationId) {
      this.loading = true
      this.error = null
      try {
        const response = await axiosInstance.get(`/api/admin/stations/${stationId}/quiz`)
        this.questions = response.data.sort((a, b) => a.sortOrder - b.sortOrder)
      } catch (err) {
        this.error = 'حدث خطأ أثناء تحميل أسئلة الاختبار.'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async createQuestion(stationId, questionData) {
      try {
        // questionData has questionText, points, sortOrder, options: [{optionText, isCorrect}]
        const response = await axiosInstance.post(`/api/admin/stations/${stationId}/quiz`, questionData)
        // Refresh questions list after creation to get full object from server
        await this.fetchQuestions(stationId)
        return response.data
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async updateQuestion(stationId, questionId, questionData) {
      try {
        // questionData has questionText, points, sortOrder
        await axiosInstance.put(`/api/admin/questions/${questionId}`, questionData)
        const index = this.questions.findIndex(q => q.questionId === questionId)
        if (index !== -1) {
          this.questions[index] = { ...this.questions[index], ...questionData }
        }
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async deleteQuestion(stationId, questionId) {
      try {
        await axiosInstance.delete(`/api/admin/questions/${questionId}`)
        this.questions = this.questions.filter(q => q.questionId !== questionId)
      } catch (err) {
        throw err.response?.data || err
      }
    },

    // Option operations
    async updateOption(stationId, optionId, optionData) {
      try {
        // optionData has optionText, isCorrect
        await axiosInstance.put(`/api/admin/options/${optionId}`, optionData)
        // Locally update option state
        for (const q of this.questions) {
          const opt = q.quizOptions?.find(o => o.optionId === optionId)
          if (opt) {
            opt.optionText = optionData.optionText
            opt.isCorrect = optionData.isCorrect
            break
          }
        }
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async deleteOption(stationId, optionId) {
      try {
        await axiosInstance.delete(`/api/admin/options/${optionId}`)
        // Locally remove option
        for (const q of this.questions) {
          if (q.quizOptions) {
            q.quizOptions = q.quizOptions.filter(o => o.optionId !== optionId)
          }
        }
      } catch (err) {
        throw err.response?.data || err
      }
    }
  }
})

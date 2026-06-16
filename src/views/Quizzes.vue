<template>
  <div class="space-y-8 font-sans">
    <!-- Header Page Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-white">إدارة الاختبارات والأسئلة</h2>
        <p class="text-slate-400 text-sm">حدد محطة لعرض وتعديل الأسئلة والخيارات والتحقق من صحة الإجابات.</p>
      </div>
      
      <!-- Station Selector Dropdown -->
      <div class="w-64">
        <label class="block text-slate-400 text-xs font-bold mb-1.5">اختر المحطة</label>
        <select
          v-model="selectedStationId"
          @change="onStationChange"
          class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"
        >
          <option :value="null" disabled>-- حدد محطة --</option>
          <option
            v-for="station in stationsStore.stations"
            :key="station.stationId"
            :value="station.stationId"
          >
            {{ station.title }}
          </option>
        </select>
      </div>
    </div>

    <!-- Main quiz content screen -->
    <div v-if="selectedStationId" class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle class="w-5 h-5 text-indigo-400" />
          <span>الأسئلة المسجلة للمحطة</span>
        </h3>
        <button
          @click="openQuestionModal"
          class="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 font-bold text-white shadow-md shadow-primary-600/15 text-sm"
        >
          <Plus class="w-4.5 h-4.5" />
          <span>إضافة سؤال وخيارات</span>
        </button>
      </div>

      <!-- Loading / Empty states -->
      <div v-if="quizzesStore.loading" class="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
        <span class="text-slate-500 text-sm">جاري تحميل الأسئلة...</span>
      </div>

      <!-- Questions List -->
      <div v-else class="grid grid-cols-1 gap-6">
        <div
          v-for="question in quizzesStore.questions"
          :key="question.questionId"
          class="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition"
        >
          <!-- Question Header info -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-slate-500">سؤال ترتيب #{{ question.sortOrder }}</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                +{{ question.points }} نقاط
              </span>
            </div>
            
            <div class="flex items-center gap-2">
              <button @click="openEditQuestionModal(question)" class="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition" title="تعديل نص السؤال">
                <Edit3 class="w-4 h-4" />
              </button>
              <button @click="deleteQuestion(question.questionId)" class="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition" title="حذف السؤال">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Question title text -->
          <h4 class="font-extrabold text-white text-md">{{ question.questionText }}</h4>

          <!-- Options Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div
              v-for="option in question.quizOptions"
              :key="option.optionId"
              :class="[
                'flex items-center justify-between p-3.5 rounded-xl border transition',
                option.isCorrect
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              ]"
            >
              <div class="flex items-center gap-3">
                <CheckCircle2 v-if="option.isCorrect" class="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <Circle v-else class="w-5 h-5 text-slate-700 flex-shrink-0" />
                <span class="font-semibold text-sm">{{ option.optionText }}</span>
              </div>

              <!-- Option mini CRUD -->
              <div class="flex items-center gap-1">
                <button @click="openOptionModal(question, option)" class="p-1 text-slate-400 hover:text-white rounded">
                  <Edit3 class="w-3.5 h-3.5" />
                </button>
                <button @click="deleteOption(option.optionId)" class="p-1 text-slate-500 hover:text-rose-400 rounded">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="quizzesStore.questions.length === 0" class="py-12 glass-panel rounded-2xl text-center text-slate-500">
          لا توجد أسئلة مضافة لهذه المحطة بعد.
        </div>
      </div>
    </div>

    <div v-else class="py-16 glass-panel rounded-2xl text-center text-slate-500">
      <HelpCircle class="w-12 h-12 mx-auto text-slate-700 mb-4 animate-bounce" />
      <span>يرجى اختيار محطة من القائمة المنسدلة في الأعلى لعرض اختباراتها.</span>
    </div>

    <!-- Create Question & Options Atomic Modal -->
    <div v-if="questionModal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-white">{{ questionModal.isEdit ? 'تعديل السؤال' : 'إضافة سؤال واختبار جديد' }}</h3>

        <form @submit.prevent="submitQuestion" class="space-y-5">
          <!-- Text and Configs -->
          <div class="space-y-4">
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">نص السؤال</label>
              <input v-model="questionModal.form.questionText" type="text" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-300 text-sm font-semibold mb-2">النقاط (1-100)</label>
                <input v-model.number="questionModal.form.points" type="number" required min="1" max="100" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
              </div>
              <div>
                <label class="block text-slate-300 text-sm font-semibold mb-2">الترتيب</label>
                <input v-model.number="questionModal.form.sortOrder" type="number" required min="1" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
              </div>
            </div>
          </div>

          <!-- Options Builder (Required for creation only) -->
          <div v-if="!questionModal.isEdit" class="space-y-4 border-t border-slate-800 pt-4">
            <div class="flex items-center justify-between">
              <label class="block text-slate-300 text-sm font-semibold">خيارات الإجابة (على الأقل خيارين)</label>
              <button type="button" @click="addOptionField" class="text-xs text-primary-400 hover:text-primary-300 font-bold flex items-center gap-1">
                <Plus class="w-3.5 h-3.5" />
                <span>إضافة خيار إجابة</span>
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="(opt, idx) in questionModal.form.options" :key="idx" class="flex items-center gap-3">
                <input
                  v-model="opt.optionText"
                  type="text"
                  required
                  :placeholder="'الخيار رقم ' + (idx + 1)"
                  class="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"
                />
                
                <label class="flex items-center gap-2 cursor-pointer flex-shrink-0">
                  <input v-model="opt.isCorrect" type="checkbox" class="w-4 h-4 accent-emerald-500 rounded bg-slate-900 border-slate-800" />
                  <span class="text-xs text-slate-400">إجابة صحيحة</span>
                </label>

                <button type="button" @click="removeOptionField(idx)" :disabled="questionModal.form.options.length <= 2" class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg disabled:opacity-30">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" @click="questionModal.show = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">إلغاء</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md shadow-primary-600/15">حفظ</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Option Modal -->
    <div v-if="optionModal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 class="text-lg font-bold text-white">تعديل خيار الإجابة</h3>

        <form @submit.prevent="submitOption" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">نص خيار الإجابة</label>
            <input v-model="optionModal.form.optionText" type="text" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>
          <div class="flex items-center gap-2">
            <input v-model="optionModal.form.isCorrect" type="checkbox" id="editIsCorrect" class="w-4.5 h-4.5 accent-emerald-500 rounded bg-slate-900 border-slate-800" />
            <label for="editIsCorrect" class="text-sm text-slate-300 select-none cursor-pointer">هذا الخيار هو الإجابة الصحيحة للسؤال</label>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" @click="optionModal.show = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">إلغاء</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md shadow-primary-600/15">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useStationsStore } from '@/stores/stations'
import { useQuizzesStore } from '@/stores/quizzes'
import { Plus, Edit3, Trash2, HelpCircle, CheckCircle2, Circle, X, Loader2 } from 'lucide-vue-next'

const stationsStore = useStationsStore()
const quizzesStore = useQuizzesStore()

const selectedStationId = ref(null)

// Question Modal state
const questionModal = reactive({
  show: false,
  isEdit: false,
  questionId: null,
  form: {
    questionText: '',
    points: 5,
    sortOrder: 1,
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false }
    ]
  }
})

// Option Modal State
const optionModal = reactive({
  show: false,
  questionId: null,
  optionId: null,
  form: {
    optionText: '',
    isCorrect: false
  }
})

onMounted(async () => {
  await stationsStore.fetchStations()
  if (stationsStore.stations.length > 0) {
    selectedStationId.value = stationsStore.stations[0].stationId
    onStationChange()
  }
})

const onStationChange = () => {
  if (selectedStationId.value) {
    quizzesStore.fetchQuestions(selectedStationId.value)
  }
}

// Question CRUD
const openQuestionModal = () => {
  questionModal.isEdit = false
  questionModal.questionId = null
  questionModal.form = {
    questionText: '',
    points: 5,
    sortOrder: quizzesStore.questions.length + 1,
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false }
    ]
  }
  questionModal.show = true
}

const openEditQuestionModal = (question) => {
  questionModal.isEdit = true
  questionModal.questionId = question.questionId
  questionModal.form = {
    questionText: question.questionText,
    points: question.points,
    sortOrder: question.sortOrder,
    options: []
  }
  questionModal.show = true
}

const addOptionField = () => {
  questionModal.form.options.push({ optionText: '', isCorrect: false })
}

const removeOptionField = (idx) => {
  questionModal.form.options.splice(idx, 1)
}

const submitQuestion = async () => {
  try {
    if (questionModal.isEdit) {
      await quizzesStore.updateQuestion(selectedStationId.value, questionModal.questionId, {
        questionText: questionModal.form.questionText,
        points: questionModal.form.points,
        sortOrder: questionModal.form.sortOrder
      })
    } else {
      // Validate option completeness
      if (questionModal.form.options.length < 2) {
        alert('يجب إضافة خيارين على الأقل.')
        return
      }
      const hasCorrect = questionModal.form.options.some(o => o.isCorrect)
      if (!hasCorrect) {
        alert('يجب تعيين خيار إجابة صحيحة واحد على الأقل.')
        return
      }
      await quizzesStore.createQuestion(selectedStationId.value, questionModal.form)
    }
    questionModal.show = false
  } catch (err) {
    alert(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء حفظ السؤال.')
  }
}

const deleteQuestion = async (questionId) => {
  if (confirm('هل أنت متأكد من حذف هذا السؤال نهائياً؟')) {
    try {
      await quizzesStore.deleteQuestion(selectedStationId.value, questionId)
    } catch (err) {
      alert('حدث خطأ أثناء محاولة حذف السؤال.')
    }
  }
}

// Option CRUD
const openOptionModal = (question, option) => {
  optionModal.questionId = question.questionId
  optionModal.optionId = option.optionId
  optionModal.form = {
    optionText: option.optionText,
    isCorrect: option.isCorrect
  }
  optionModal.show = true
}

const submitOption = async () => {
  try {
    await quizzesStore.updateOption(selectedStationId.value, optionModal.optionId, optionModal.form)
    optionModal.show = false
    // Refresh to update UI correctness flags cleanly
    await quizzesStore.fetchQuestions(selectedStationId.value)
  } catch (err) {
    alert('حدث خطأ أثناء تحديث الخيار.')
  }
}

const deleteOption = async (optionId) => {
  if (confirm('هل أنت متأكد من حذف هذا الخيار؟')) {
    try {
      await quizzesStore.deleteOption(selectedStationId.value, optionId)
    } catch (err) {
      alert('حدث خطأ أثناء حذف الخيار.')
    }
  }
}
</script>

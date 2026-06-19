<template>
  <div class="space-y-8 font-sans">
    <!-- Header Page Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-white">إدارة المحتوى الديني العام</h2>
        <p class="text-slate-400 text-sm">تحكم في نصوص الزيارات، الأدعية العامة، والمقاطع الصوتية المتوفرة لعامة الزائرين بالتطبيق.</p>
      </div>
      <button
        @click="openModal(null)"
        class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 font-bold text-white shadow-lg shadow-primary-600/15"
      >
        <Plus class="w-5 h-5" />
        <span>إضافة محتوى ديني</span>
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center gap-4">
      <div class="flex-1 relative">
        <input
          v-model="filters.search"
          type="text"
          placeholder="ابحث باسم الدعاء أو الزيارة..."
          class="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-slate-100 text-sm"
        />
        <Search class="absolute right-3 top-3 w-4.5 h-4.5 text-slate-500" />
      </div>

      <div class="w-48">
        <select
          v-model="filters.type"
          class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-slate-300 text-sm"
        >
          <option value="all">كل التصنيفات</option>
          <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
            🔊 {{ cat }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading spinner -->
    <div v-if="contentStore.loading" class="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      <span class="text-slate-500 text-sm">جاري تحميل المحتوى الديني...</span>
    </div>

    <!-- Content Items Grid Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="content in filteredContents"
        :key="content.contentId"
        class="glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition flex flex-col group p-6 space-y-4"
      >
        <!-- Card Header -->
        <div class="flex items-start justify-between">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20">
            🔊 {{ content.contentType }}
          </span>

          <span v-if="content.readerNameAr || content.readerName" class="text-xs text-slate-500 font-semibold">
            القارئ: {{ content.readerNameAr || content.readerName }}
          </span>
        </div>

        <!-- Info details -->
        <div class="flex-1 space-y-2">
          <h3 class="font-bold text-white text-md">{{ content.titleAr || content.title }}</h3>
          <p v-if="content.contentText" class="text-slate-400 text-xs leading-relaxed line-clamp-4 leading-loose">{{ content.contentText }}</p>
        </div>

        <!-- Audio Player test if audio exists -->
        <div v-if="content.audioUrl" class="bg-slate-950/60 p-3 rounded-xl border border-slate-900/60 space-y-2">
          <div class="flex items-center gap-2">
            <Volume2 class="w-4 h-4 text-primary-400 flex-shrink-0" />
            <span class="text-xs text-slate-400 truncate">اختبار مشغل الصوت</span>
          </div>
          <audio :src="content.audioUrl" controls class="w-full h-8 rounded-lg outline-none bg-slate-900"></audio>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/40">
          <button @click="openModal(content)" class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 text-indigo-400 hover:bg-indigo-500/10 text-xs font-semibold">
            <Edit3 class="w-3.5 h-3.5" />
            <span>تعديل</span>
          </button>
          <button @click="confirmDelete(content)" class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold">
            <Trash2 class="w-3.5 h-3.5" />
            <span>حذف نهائي</span>
          </button>
        </div>
      </div>

      <div v-if="filteredContents.length === 0" class="col-span-full py-16 glass-panel rounded-2xl text-center text-slate-500">
        <BookOpen class="w-12 h-12 mx-auto text-slate-700 mb-4" />
        <span>لا يوجد أدعية أو زيارات مطابقة للبحث أو التصفية الحالية.</span>
      </div>
    </div>

    <!-- Content CRUD Modal -->
    <div v-if="modal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-xl glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-white">{{ modal.isEdit ? 'تعديل المحتوى الديني' : 'إضافة محتوى ديني جديد' }}</h3>

        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">العنوان (العربية) *</label>
            <input v-model="modal.form.titleAr" type="text" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>
          <div>
            <label class="block text-slate-350 text-sm font-semibold mb-2">العنوان (الانجليزية)</label>
            <input v-model="modal.form.titleEn" type="text" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>
          <div>
            <label class="block text-slate-350 text-sm font-semibold mb-2">العنوان (الفارسية)</label>
            <input v-model="modal.form.titleFa" type="text" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>

          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">تصنيف المحتوى (النوع)</label>
            <input v-model="modal.form.contentType" type="text" required placeholder="مثال: قصائد، زيارات، أدعية" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">اسم القارئ (العربية)</label>
              <input v-model="modal.form.readerNameAr" type="text" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
            <div>
              <label class="block text-slate-350 text-sm font-semibold mb-2">اسم القارئ (الانجليزية)</label>
              <input v-model="modal.form.readerNameEn" type="text" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
            <div>
              <label class="block text-slate-350 text-sm font-semibold mb-2">اسم القارئ (الفارسية)</label>
              <input v-model="modal.form.readerNameFa" type="text" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">النص الديني (الكلام/الدعاء/الزيارة - اختياري)</label>
            <textarea v-model="modal.form.contentText" rows="5" placeholder="اكتب نص الدعاء أو الزيارة هنا..." class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm leading-relaxed"></textarea>
          </div>

          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">ملف الصوت (Audio File - اختياري)</label>
            <div class="flex items-center gap-3">
              <input
                type="file"
                accept="audio/*"
                @change="handleAudioUpload"
                class="hidden"
                ref="audioInputRef"
              />
              <button
                type="button"
                @click="audioInputRef.click()"
                class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold transition flex items-center gap-2"
                :disabled="uploadingAudio"
              >
                <UploadCloud v-if="!uploadingAudio" class="w-4 h-4 text-primary-400" />
                <Loader2 v-else class="w-4 h-4 animate-spin text-primary-400" />
                <span>{{ uploadingAudio ? 'جاري الرفع...' : 'اختر ملف الصوت' }}</span>
              </button>
              
              <div v-if="modal.form.audioUrl" class="flex-1 flex items-center justify-between gap-2 bg-slate-900/60 border border-slate-850 px-3 py-1.5 rounded-xl text-xs text-slate-400">
                <div class="flex items-center gap-2 truncate">
                  <Volume2 class="w-4 h-4 text-primary-400 flex-shrink-0 animate-pulse" />
                  <span class="truncate text-[10px] text-slate-500">تم الرفع بنجاح</span>
                </div>
                <button type="button" @click="modal.form.audioUrl = ''" class="text-rose-400 hover:text-rose-300 font-bold px-1">حذف</button>
              </div>
            </div>
            <input v-model="modal.form.audioUrl" type="hidden" />
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" @click="modal.show = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">إلغاء</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md shadow-primary-600/15">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useReligiousContentStore } from '@/stores/religiousContent'
import axiosInstance from '@/api/axiosInstance'
import { Plus, Edit3, Trash2, Search, BookOpen, Volume2, Loader2, UploadCloud } from 'lucide-vue-next'

const contentStore = useReligiousContentStore()

const uploadingAudio = ref(false)
const audioInputRef = ref(null)

const handleAudioUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const file = files[0]
  uploadingAudio.value = true

  const formData = new FormData()
  formData.append('File', file)
  formData.append('FolderName', 'audios')

  try {
    const response = await axiosInstance.post('/api/admin/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    modal.form.audioUrl = response.data.url
  } catch (err) {
    alert('فشل رفع الملف الصوتي. تأكد من اتصالك بالإنترنت والامتداد.')
  } finally {
    uploadingAudio.value = false
    if (audioInputRef.value) {
      audioInputRef.value.value = ''
    }
  }
}

const filters = reactive({
  search: '',
  type: 'all'
})

const modal = reactive({
  show: false,
  isEdit: false,
  contentId: null,
  form: {
    titleAr: '',
    titleEn: '',
    titleFa: '',
    contentType: 'قصائد',
    contentText: '',
    audioUrl: '',
    readerNameAr: '',
    readerNameEn: '',
    readerNameFa: ''
  }
})

onMounted(() => {
  contentStore.fetchContents()
})

const uniqueCategories = computed(() => {
  const cats = contentStore.contents.map(item => item.contentType).filter(Boolean)
  return [...new Set(cats)]
})

const filteredContents = computed(() => {
  return contentStore.contents.filter(item => {
    const titleVal = item.titleAr || item.title || ''
    const matchesSearch = titleVal.toLowerCase().includes(filters.search.toLowerCase())
    const matchesType = filters.type === 'all' || item.contentType === filters.type
    return matchesSearch && matchesType
  })
})

const openModal = (content = null) => {
  if (content) {
    modal.isEdit = true
    modal.contentId = content.contentId
    modal.form = {
      titleAr: content.titleAr || content.title,
      titleEn: content.titleEn || '',
      titleFa: content.titleFa || '',
      contentType: content.contentType,
      contentText: content.contentText,
      audioUrl: content.audioUrl,
      readerNameAr: content.readerNameAr || content.readerName || '',
      readerNameEn: content.readerNameEn || '',
      readerNameFa: content.readerNameFa || ''
    }
  } else {
    modal.isEdit = false
    modal.contentId = null
    modal.form = {
      titleAr: '',
      titleEn: '',
      titleFa: '',
      contentType: 'قصائد',
      contentText: '',
      audioUrl: '',
      readerNameAr: '',
      readerNameEn: '',
      readerNameFa: ''
    }
  }
  modal.show = true
}

const submit = async () => {
  try {
    if (modal.isEdit) {
      await contentStore.updateContent(modal.contentId, modal.form)
    } else {
      await contentStore.createContent(modal.form)
    }
    modal.show = false
    await contentStore.fetchContents()
  } catch (err) {
    alert('حدث خطأ أثناء حفظ المحتوى الديني.')
  }
}

const confirmDelete = async (content) => {
  const titleVal = content.titleAr || content.title
  const message = `🚨 تحذير هام! 🚨
هل أنت متأكد من حذف محتوى "${titleVal}"؟ 
هذا الإجراء سيقوم بحذف المحتوى الديني نهائياً (Hard Delete) من قاعدة البيانات ولن تتمكن من استعادته.`
  
  if (confirm(message)) {
    try {
      await contentStore.deleteContent(content.contentId)
    } catch (err) {
      alert('حدث خطأ أثناء محاولة الحذف.')
    }
  }
}
</script>

<template>
  <div class="space-y-8 font-sans" dir="rtl">
    <!-- Header Page -->
    <div class="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
          <Award class="w-6 h-6" />
        </span>
        <div>
          <h2 class="text-xl font-bold text-white">إدارة أدلة المسابقات</h2>
          <p class="text-slate-400 text-sm">إدارة المحتوى والمجموعات الإرشادية الخاصة بمسابقات المنصة الموجهة للزائرين.</p>
        </div>
      </div>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
      >
        <Plus class="w-4 h-4" />
        <span>إضافة دليل جديد</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-10 h-10 animate-spin text-indigo-500" />
    </div>

    <!-- Empty State -->
    <div v-else-if="guides.length === 0" class="glass-panel p-12 text-center rounded-2xl space-y-3">
      <div class="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500 text-xl">
        📖
      </div>
      <h3 class="text-white font-bold text-md">لا توجد أدلة مسابقة مسجلة</h3>
      <p class="text-slate-400 text-xs max-w-sm mx-auto">لم يتم تهيئة أو إضافة أدلة إرشادية للمسابقات بعد. انقر على الزر بالأعلى لإضافة أول دليل.</p>
    </div>

    <!-- Grid List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="guide in guides"
        :key="guide.id"
        class="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 flex flex-col group"
      >
        <!-- Guide Image Preview -->
        <div class="h-44 bg-slate-900 relative overflow-hidden flex items-center justify-center border-b border-slate-800/50">
          <img
            v-if="guide.imageUrl"
            :src="guide.imageUrl"
            alt="صورة الدليل"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-555"
          />
          <div v-else class="text-slate-600 text-4xl">📖</div>

          <!-- Status badge absolute -->
          <span
            :class="[
              'absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-md',
              guide.isActive 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-slate-500/10 text-slate-400 border-slate-800'
            ]"
          >
            {{ guide.isActive ? 'نشط ومتاح' : 'معطل' }}
          </span>

          <!-- Display Order absolute -->
          <span class="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950/80 text-indigo-400 border border-slate-800">
            الترتيب: {{ guide.displayOrder }}
          </span>
        </div>

        <!-- Guide Body -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <h4 class="font-bold text-white text-md line-clamp-1 leading-snug">{{ guide.titleAr || guide.title }}</h4>
            <p class="text-xs text-slate-450 line-clamp-3 leading-relaxed whitespace-pre-line">{{ guide.contentTextAr || guide.contentText }}</p>
          </div>

          <div class="flex items-center justify-between border-t border-slate-800/60 pt-4">
            <span class="text-[10px] text-slate-500">{{ formatDate(guide.createdAt) }}</span>
            <div class="flex items-center gap-1.5">
              <button
                @click="openEditModal(guide)"
                class="p-2 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 transition"
                title="تعديل"
              >
                <Edit3 class="w-4 h-4" />
              </button>
              <button
                @click="deleteGuide(guide.id, guide.titleAr || guide.title)"
                class="p-2 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-rose-450 transition"
                title="حذف"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative space-y-4 text-right max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white text-md">
            {{ isEdit ? 'تعديل دليل المسابقة' : 'إضافة دليل مسابقة جديد' }}
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-white p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveGuide" class="space-y-4 text-slate-350">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">عنوان الدليل (العربية) *</label>
            <input
              v-model="form.titleAr"
              type="text"
              placeholder="مثال: شروط ومعايير المسابقة الكبرى"
              class="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">عنوان الدليل (الانجليزية)</label>
            <input
              v-model="form.titleEn"
              type="text"
              class="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">عنوان الدليل (الفارسية)</label>
            <input
              v-model="form.titleFa"
              type="text"
              class="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">رابط الصورة (Image URL)</label>
            <input
              v-model="form.imageUrl"
              type="text"
              placeholder="أدخل رابط الصورة المرفوعة من مستودع الوسائط..."
              class="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
            <span class="text-[10px] text-slate-500 block">نصيحة: يمكنك رفع صورك أولاً من صفحة "رفع الوسائط" ونسخ الرابط المباشر لاستخدامه هنا.</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-400 block">ترتيب العرض</label>
              <input
                v-model.number="form.displayOrder"
                type="number"
                min="0"
                class="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-400 block mb-1">الحالة</label>
              <label class="relative inline-flex items-center cursor-pointer mt-1">
                <input type="checkbox" v-model="form.isActive" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-slate-450 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                <span class="mr-3 text-xs font-bold text-slate-300">{{ form.isActive ? 'نشط' : 'معطل' }}</span>
              </label>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">محتوى الدليل بالتفصيل (العربية) *</label>
            <textarea
              v-model="form.contentTextAr"
              rows="4"
              placeholder="اكتب تفاصيل الدليل وشروطه ونقاط التقييم هنا..."
              class="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 leading-relaxed"
              required
            ></textarea>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">محتوى الدليل بالتفصيل (الانجليزية)</label>
            <textarea
              v-model="form.contentTextEn"
              rows="4"
              class="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 leading-relaxed"
            ></textarea>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">محتوى الدليل بالتفصيل (الفارسية)</label>
            <textarea
              v-model="form.contentTextFa"
              rows="4"
              class="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 leading-relaxed"
            ></textarea>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
              <span>{{ submitting ? 'جاري الحفظ...' : 'حفظ الدليل' }}</span>
            </button>
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-sm transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInstance from '@/api/axiosInstance'
import { Award, Plus, Loader2, Edit3, Trash2, X } from 'lucide-vue-next'

const loading = ref(false)
const guides = ref([])

// Modal states
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const form = ref({
  titleAr: '',
  titleEn: '',
  titleFa: '',
  contentTextAr: '',
  contentTextEn: '',
  contentTextFa: '',
  imageUrl: '',
  displayOrder: 0,
  isActive: true
})

onMounted(() => {
  fetchGuides()
})

const fetchGuides = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.get('/api/admin/public-content/guides')
    guides.value = response.data
  } catch (err) {
    console.error('Failed to load guides:', err)
    alert('فشل تحميل أدلة المسابقات. يرجى التحقق من الخادم.')
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEdit.value = false
  editingId.value = null
  form.value = {
    titleAr: '',
    titleEn: '',
    titleFa: '',
    contentTextAr: '',
    contentTextEn: '',
    contentTextFa: '',
    imageUrl: '',
    displayOrder: 0,
    isActive: true
  }
  showModal.value = true
}

const openEditModal = (guide) => {
  isEdit.value = true
  editingId.value = guide.id
  form.value = {
    titleAr: guide.titleAr || guide.title,
    titleEn: guide.titleEn || '',
    titleFa: guide.titleFa || '',
    contentTextAr: guide.contentTextAr || guide.contentText,
    contentTextEn: guide.contentTextEn || '',
    contentTextFa: guide.contentTextFa || '',
    imageUrl: guide.imageUrl,
    displayOrder: guide.displayOrder,
    isActive: guide.isActive
  }
  showModal.value = true
}

const saveGuide = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await axiosInstance.put(`/api/admin/public-content/guides/${editingId.value}`, form.value)
      alert('تم تحديث دليل المسابقة بنجاح!')
    } else {
      await axiosInstance.post('/api/admin/public-content/guides', form.value)
      alert('تم إضافة دليل المسابقة الجديد بنجاح!')
    }
    showModal.value = false
    fetchGuides()
  } catch (err) {
    console.error('Failed to save guide:', err)
    alert(err.response?.data?.message || 'حدث خطأ أثناء محاولة حفظ دليل المسابقة.')
  } finally {
    submitting.value = false
  }
}

const deleteGuide = async (id, title) => {
  if (!confirm(`هل أنت متأكد من رغبتك في حذف الدليل "${title}"؟`)) {
    return
  }

  try {
    await axiosInstance.delete(`/api/admin/public-content/guides/${id}`)
    alert('تم حذف دليل المسابقة بنجاح!')
    fetchGuides()
  } catch (err) {
    console.error('Failed to delete guide:', err)
    alert(err.response?.data?.message || 'حدث خطأ أثناء محاولة الحذف.')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return dateStr
  }
}
</script>

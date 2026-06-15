<template>
  <div class="space-y-8 font-sans" dir="rtl">
    <!-- Header Page -->
    <div class="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
          <Image class="w-6 h-6" />
        </span>
        <div>
          <h2 class="text-xl font-bold text-white">إدارة بنرات الصفحة الرئيسية</h2>
          <p class="text-slate-400 text-sm">عرض وتعديل بنرات الصور الترويجية والإعلانية المعروضة في صدر واجهة تطبيق الموبايل.</p>
        </div>
      </div>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
      >
        <Plus class="w-4 h-4" />
        <span>إضافة بنر جديد</span>
      </button>
    </div>

    <!-- Alert / Info Notice -->
    <div class="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div class="space-y-1">
        <h4 class="text-xs font-bold text-amber-300">ملاحظة تنظيمية للواجهة (Strict Limit)</h4>
        <p class="text-[11px] text-slate-400 leading-relaxed">
          يقوم تطبيق الموبايل بعرض **أول 4 بنرات نشطة فقط** في نفس الوقت (مرتبة حسب الترتيب الرقمي التصاعدي). أي بنرات إضافية تكون نشطة ولكن يتجاوز ترتيبها الأربعة الأولى لن تظهر للمستخدمين حتى يتم تعطيل بنر آخر أو تغيير ترتيبه.
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-10 h-10 animate-spin text-indigo-500" />
    </div>

    <!-- Empty State -->
    <div v-else-if="banners.length === 0" class="glass-panel p-12 text-center rounded-2xl space-y-3">
      <div class="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500 text-xl">
        🖼️
      </div>
      <h3 class="text-white font-bold text-md">لا توجد بنرات مسجلة</h3>
      <p class="text-slate-400 text-xs max-w-sm mx-auto">لم يتم تهيئة أو إضافة بنرات إعلانية بعد. انقر على الزر بالأعلى لإضافة أول بنر إعلاني.</p>
    </div>

    <!-- Grid List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="(banner, index) in banners"
        :key="banner.id"
        class="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 flex flex-col group"
      >
        <!-- Banner Image Preview -->
        <div class="aspect-[21/9] bg-slate-900 relative overflow-hidden flex items-center justify-center border-b border-slate-800/50">
          <img
            v-if="banner.imageUrl"
            :src="banner.imageUrl"
            alt="صورة البنر"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-555"
          />
          <div v-else class="text-slate-600 text-4xl">🖼️</div>

          <!-- Status badge absolute -->
          <div class="absolute top-3 right-3 flex items-center gap-2">
            <span
              :class="[
                'px-2 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-md',
                banner.isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-slate-500/10 text-slate-400 border-slate-800'
              ]"
            >
              {{ banner.isActive ? 'نشط' : 'معطل' }}
            </span>
            <!-- Active Display Indicator (First 4 active items) -->
            <span
              v-if="banner.isActive && getActiveIndex(banner.id) < 4"
              class="px-2 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-md bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
            >
              معروض بالموبايل ({{ getActiveIndex(banner.id) + 1 }}/4)
            </span>
          </div>

          <!-- Display Order absolute -->
          <span class="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950/80 text-indigo-400 border border-slate-800">
            الترتيب: {{ banner.displayOrder }}
          </span>
        </div>

        <!-- Banner Details -->
        <div class="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-slate-500">رابط النقر والتوجيه (Click Action URL)</span>
            <strong class="text-xs text-slate-350 block break-all font-mono">
              {{ banner.clickActionUrl || 'لا يوجد رابط توجيه (غير قابل للنقر)' }}
            </strong>
          </div>

          <div class="flex items-center justify-between border-t border-slate-800/60 pt-4">
            <span class="text-[10px] text-slate-500">{{ formatDate(banner.createdAt) }}</span>
            <div class="flex items-center gap-1.5">
              <button
                @click="openEditModal(banner)"
                class="p-2 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 transition"
                title="تعديل"
              >
                <Edit3 class="w-4 h-4" />
              </button>
              <button
                @click="deleteBanner(banner.id)"
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
      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4 text-right">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white text-md">
            {{ isEdit ? 'تعديل بنر الصفحة الرئيسية' : 'إضافة بنر إعلاني جديد' }}
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-white p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveBanner" class="space-y-4 text-slate-350">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">رابط صورة البنر (Image URL)</label>
            <input
              v-model="form.imageUrl"
              type="text"
              placeholder="أدخل رابط الصورة من مستودع الوسائط..."
              class="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
            <span class="text-[10px] text-slate-500 block">نصيحة: ينصح باستخدام صور ذات أبعاد عريضة (أبعاد 21:9 تقريباً).</span>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">رابط النقر والتوجيه (اختياري)</label>
            <input
              v-model="form.clickActionUrl"
              type="text"
              placeholder="مثال: https://sajada.net/news/1"
              class="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <span class="text-[10px] text-slate-500 block">الرابط الإلكتروني الذي سيتم نقل المستخدم إليه عند الضغط على البنر.</span>
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

          <div class="flex items-center gap-3 pt-2">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
              <span>{{ submitting ? 'جاري الحفظ...' : 'حفظ البنر' }}</span>
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
import { Image, Plus, Loader2, Edit3, Trash2, X, AlertTriangle } from 'lucide-vue-next'

const loading = ref(false)
const banners = ref([])

// Modal states
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const form = ref({
  imageUrl: '',
  clickActionUrl: '',
  displayOrder: 0,
  isActive: true
})

onMounted(() => {
  fetchBanners()
})

const fetchBanners = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.get('/api/admin/public-content/banners')
    banners.value = response.data
  } catch (err) {
    console.error('Failed to load banners:', err)
    alert('فشل تحميل البنرات. يرجى التحقق من الخادم.')
  } finally {
    loading.value = false
  }
}

// Calculate the order index among active items to see which will show (top 4)
const getActiveIndex = (bannerId) => {
  const activeBanners = banners.value.filter(b => b.isActive)
  return activeBanners.findIndex(b => b.id === bannerId)
}

const openAddModal = () => {
  isEdit.value = false
  editingId.value = null
  form.value = {
    imageUrl: '',
    clickActionUrl: '',
    displayOrder: 0,
    isActive: true
  }
  showModal.value = true
}

const openEditModal = (banner) => {
  isEdit.value = true
  editingId.value = banner.id
  form.value = {
    imageUrl: banner.imageUrl,
    clickActionUrl: banner.clickActionUrl || '',
    displayOrder: banner.displayOrder,
    isActive: banner.isActive
  }
  showModal.value = true
}

const saveBanner = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await axiosInstance.put(`/api/admin/public-content/banners/${editingId.value}`, form.value)
      alert('تم تحديث البنر بنجاح!')
    } else {
      await axiosInstance.post('/api/admin/public-content/banners', form.value)
      alert('تم إضافة البنر الإعلاني الجديد بنجاح!')
    }
    showModal.value = false
    fetchBanners()
  } catch (err) {
    console.error('Failed to save banner:', err)
    alert(err.response?.data?.message || 'حدث خطأ أثناء محاولة حفظ البنر.')
  } finally {
    submitting.value = false
  }
}

const deleteBanner = async (id) => {
  if (!confirm('هل أنت متأكد من رغبتك في حذف هذا البنر؟')) {
    return
  }

  try {
    await axiosInstance.delete(`/api/admin/public-content/banners/${id}`)
    alert('تم حذف البنر بنجاح!')
    fetchBanners()
  } catch (err) {
    console.error('Failed to delete banner:', err)
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

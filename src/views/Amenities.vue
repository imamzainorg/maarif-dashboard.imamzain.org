<template>
  <div class="space-y-8 font-sans">
    <!-- Header Page Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-white">إدارة الخدمات والمعالم على الخريطة</h2>
        <p class="text-slate-400 text-sm">أضف وتحكم بالعيادات الطبية، دورات المياه، ومراكز الخدمة المتاحة على مسار الطواف والزيارة.</p>
      </div>
      <button
        @click="openModal(null)"
        class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 font-bold text-white shadow-lg shadow-primary-600/15"
      >
        <Plus class="w-5 h-5" />
        <span>إضافة معلم/خدمة</span>
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center gap-4">
      <div class="flex-1 relative">
        <input
          v-model="filters.search"
          type="text"
          placeholder="ابحث باسم الخدمة..."
          class="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-slate-100 text-sm"
        />
        <Search class="absolute right-3 top-3 w-4.5 h-4.5 text-slate-500" />
      </div>

      <div class="w-48">
        <select
          v-model="filters.category"
          class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-slate-300 text-sm"
        >
          <option value="all">كل التصنيفات</option>
          <option value="medical">🏥 خدمات طبية</option>
          <option value="sanitary">💧 خدمات صحية</option>
          <option value="other">📍 أخرى</option>
        </select>
      </div>
    </div>

    <!-- Loading spinner -->
    <div v-if="amenitiesStore.loading" class="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      <span class="text-slate-500 text-sm">جاري تحميل المعالم...</span>
    </div>

    <!-- Amenities Grid Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="amenity in filteredAmenities"
        :key="amenity.amenityId"
        class="glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition flex flex-col group"
      >
        <!-- Amenity Image or Placeholder -->
        <div class="h-44 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
          <img
            v-if="amenity.imageUrl"
            :src="amenity.imageUrl"
            alt="Amenity image"
            class="object-cover w-full h-full group-hover:scale-105 transition duration-300"
          />
          <div v-else class="text-center text-slate-700">
            <span class="text-4xl block mb-2">{{ getCategoryIconEmoji(amenity.category) }}</span>
            <span class="text-xs">لا توجد صورة مرفقة</span>
          </div>

          <!-- Category Badge -->
          <span :class="[
            'absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-bold border',
            getCategoryBadgeClass(amenity.category)
          ]">
            {{ getCategoryName(amenity.category) }}
          </span>
        </div>

        <!-- Info details -->
        <div class="p-5 flex-1 flex flex-col space-y-3">
          <h3 class="font-bold text-white text-md">{{ amenity.titleAr || amenity.title }}</h3>
          <p class="text-slate-400 text-xs leading-relaxed line-clamp-2 flex-1">{{ amenity.descriptionAr || amenity.description || 'لا يوجد وصف مضاف لهذا المعلم.' }}</p>
          
          <div class="flex items-center justify-between text-xs text-slate-500 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
            <span>العمود الأقرب: <strong class="text-indigo-400">#{{ amenity.poleNumber }}</strong></span>
            <span>Lat: {{ amenity.latitude }} / Lng: {{ amenity.longitude }}</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/40">
            <button @click="openModal(amenity)" class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 text-indigo-400 hover:bg-indigo-500/10 text-xs font-semibold">
              <Edit3 class="w-3.5 h-3.5" />
              <span>تعديل</span>
            </button>
            <button @click="deleteAmenity(amenity.amenityId)" class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold">
              <Trash2 class="w-3.5 h-3.5" />
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredAmenities.length === 0" class="col-span-full py-16 glass-panel rounded-2xl text-center text-slate-500">
        <Stethoscope class="w-12 h-12 mx-auto text-slate-700 mb-4" />
        <span>لا يوجد معالم أو خدمات مطابقة للبحث أو التصفية الحالية.</span>
      </div>
    </div>

    <!-- Amenity CRUD Modal -->
    <div v-if="modal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-white">{{ modal.isEdit ? 'تعديل المعلم' : 'إضافة معلم/خدمة جديدة' }}</h3>

        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">اسم المعلم / الخدمة (العربية) *</label>
            <input v-model="modal.form.titleAr" type="text" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>
          <div>
            <label class="block text-slate-350 text-sm font-semibold mb-2">اسم المعلم / الخدمة (الانجليزية)</label>
            <input v-model="modal.form.titleEn" type="text" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>
          <div>
            <label class="block text-slate-350 text-sm font-semibold mb-2">اسم المعلم / الخدمة (الفارسية)</label>
            <input v-model="modal.form.titleFa" type="text" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">التصنيف</label>
              <select v-model="modal.form.category" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm">
                <option value="medical">🏥 خدمات طبية (Medical)</option>
                <option value="sanitary">💧 خدمات صحية (Sanitary)</option>
                <option value="other">📍 أخرى (Other)</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">رقم العمود الأقرب</label>
              <input v-model.number="modal.form.poleNumber" type="number" required min="1" max="10000" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">وصف الخدمة (العربية) *</label>
            <textarea v-model="modal.form.descriptionAr" required rows="3" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"></textarea>
          </div>
          <div>
            <label class="block text-slate-350 text-sm font-semibold mb-2">وصف الخدمة (الانجليزية)</label>
            <textarea v-model="modal.form.descriptionEn" rows="3" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"></textarea>
          </div>
          <div>
            <label class="block text-slate-350 text-sm font-semibold mb-2">وصف الخدمة (الفارسية)</label>
            <textarea v-model="modal.form.descriptionFa" rows="3" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">خط العرض (Latitude)</label>
              <input v-model.number="modal.form.latitude" type="number" step="0.000001" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">خط الطول (Longitude)</label>
              <input v-model.number="modal.form.longitude" type="number" step="0.000001" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">صورة المعلم (Image File)</label>
            <div class="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="hidden"
                ref="imageInputRef"
              />
              <button
                type="button"
                @click="imageInputRef.click()"
                class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold transition flex items-center gap-2"
                :disabled="uploadingImage"
              >
                <UploadCloud v-if="!uploadingImage" class="w-4 h-4 text-primary-400" />
                <Loader2 v-else class="w-4 h-4 animate-spin text-primary-400" />
                <span>{{ uploadingImage ? 'جاري الرفع...' : 'اختر صورة المعلم' }}</span>
              </button>
              
              <div v-if="modal.form.imageUrl" class="flex-1 flex items-center justify-between gap-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400">
                <div class="flex items-center gap-2 truncate">
                  <img :src="modal.form.imageUrl" class="w-6 h-6 object-cover rounded-md border border-slate-700" />
                  <span class="truncate text-[10px] text-slate-500">تم الرفع بنجاح</span>
                </div>
                <button type="button" @click="modal.form.imageUrl = ''" class="text-rose-400 hover:text-rose-300 font-bold px-1">حذف</button>
              </div>
            </div>
            <input v-model="modal.form.imageUrl" type="hidden" />
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
import { useAmenitiesStore } from '@/stores/amenities'
import axiosInstance from '@/api/axiosInstance'
import { Plus, Edit3, Trash2, Search, Stethoscope, Loader2, Navigation, UploadCloud } from 'lucide-vue-next'

const amenitiesStore = useAmenitiesStore()

const uploadingImage = ref(false)
const imageInputRef = ref(null)

const handleImageUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const file = files[0]
  uploadingImage.value = true

  const formData = new FormData()
  formData.append('File', file)
  formData.append('FolderName', 'images')

  try {
    const response = await axiosInstance.post('/api/admin/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    modal.form.imageUrl = response.data.url
  } catch (err) {
    alert('فشل رفع الصورة. تأكد من اتصالك بالإنترنت وصيغة الصورة.')
  } finally {
    uploadingImage.value = false
    if (imageInputRef.value) {
      imageInputRef.value.value = ''
    }
  }
}

const filters = reactive({
  search: '',
  category: 'all'
})

const modal = reactive({
  show: false,
  isEdit: false,
  amenityId: null,
  form: {
    titleAr: '',
    titleEn: '',
    titleFa: '',
    category: 'medical',
    poleNumber: 1,
    descriptionAr: '',
    descriptionEn: '',
    descriptionFa: '',
    latitude: 21.4225,
    longitude: 39.8262,
    imageUrl: ''
  }
})

onMounted(() => {
  amenitiesStore.fetchAmenities()
})

const filteredAmenities = computed(() => {
  return amenitiesStore.amenities.filter(item => {
    const titleVal = item.titleAr || item.title || ''
    const matchesSearch = titleVal.toLowerCase().includes(filters.search.toLowerCase())
    const matchesCategory = filters.category === 'all' || item.category === filters.category
    return matchesSearch && matchesCategory
  })
})

const getCategoryName = (cat) => {
  const mapping = {
    'medical': 'خدمة طبية',
    'sanitary': 'دورة مياه / صحي',
    'other': 'معلم / خدمة'
  }
  return mapping[cat] || cat
}

const getCategoryIconEmoji = (cat) => {
  const mapping = {
    'medical': '🏥',
    'sanitary': '💧',
    'other': '📍'
  }
  return mapping[cat] || '📍'
}

const getCategoryBadgeClass = (cat) => {
  const mapping = {
    'medical': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'sanitary': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'other': 'bg-slate-500/10 text-slate-300 border-slate-500/20'
  }
  return mapping[cat] || 'bg-slate-500/10 text-slate-300'
}

// Modal actions
const openModal = (amenity = null) => {
  if (amenity) {
    modal.isEdit = true
    modal.amenityId = amenity.amenityId
    modal.form = {
      titleAr: amenity.titleAr || amenity.title,
      titleEn: amenity.titleEn || '',
      titleFa: amenity.titleFa || '',
      category: amenity.category,
      poleNumber: amenity.poleNumber,
      descriptionAr: amenity.descriptionAr || amenity.description || '',
      descriptionEn: amenity.descriptionEn || '',
      descriptionFa: amenity.descriptionFa || '',
      latitude: amenity.latitude,
      longitude: amenity.longitude,
      imageUrl: amenity.imageUrl || ''
    }
  } else {
    modal.isEdit = false
    modal.amenityId = null
    modal.form = {
      titleAr: '',
      titleEn: '',
      titleFa: '',
      category: 'medical',
      poleNumber: 1,
      descriptionAr: '',
      descriptionEn: '',
      descriptionFa: '',
      latitude: 21.4225,
      longitude: 39.8262,
      imageUrl: ''
    }
  }
  modal.show = true
}

const submit = async () => {
  try {
    if (modal.isEdit) {
      await amenitiesStore.updateAmenity(modal.amenityId, modal.form)
    } else {
      await amenitiesStore.createAmenity(modal.form)
    }
    modal.show = false
  } catch (err) {
    alert('حدث خطأ أثناء حفظ المعلم. يرجى التحقق من القيم المدخلة.')
  }
}

const deleteAmenity = async (id) => {
  if (confirm('هل أنت متأكد من حذف هذا المعلم؟ سيتم حذف ناعم له من الخريطة.')) {
    try {
      await amenitiesStore.deleteAmenity(id)
    } catch (err) {
      alert('حدث خطأ أثناء محاولة حذف المعلم.')
    }
  }
}
</script>

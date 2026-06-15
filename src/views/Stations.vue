<template>
  <div class="space-y-8 font-sans">
    <!-- Header Page Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-white">إدارة المحطات والأذكار</h2>
        <p class="text-slate-400 text-sm">أضف محطات الطواف والمشاعر، وتحكم في الأذكار والصوتيات التابعة لكل منها.</p>
      </div>
      <button
        @click="openStationModal(null)"
        class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 font-bold text-white shadow-lg shadow-primary-600/15"
      >
        <Plus class="w-5 h-5" />
        <span>إضافة محطة جديدة</span>
      </button>
    </div>

    <!-- Stations Split Layout (Left: Stations list, Right: Select station Dhikr manager) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Stations List (Left / 7 Cols) -->
      <div :class="[selectedStation ? 'lg:col-span-7' : 'lg:col-span-12', 'glass-panel p-6 rounded-2xl space-y-6 transition-all duration-300']">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <MapPin class="w-5 h-5 text-primary-400" />
          <span>المحطات المسجلة</span>
        </h3>

        <!-- Loading spinner -->
        <div v-if="stationsStore.loading && stationsStore.stations.length === 0" class="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
          <span class="text-slate-500 text-sm">جاري تحميل المحطات...</span>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-right border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-xs text-slate-400">
                <th class="pb-3 font-semibold">ترتيب</th>
                <th class="pb-3 font-semibold">المحطة</th>
                <th class="pb-3 font-semibold text-center">أعمدة البداية / النهاية</th>
                <th class="pb-3 font-semibold text-center">الأذكار</th>
                <th class="pb-3 font-semibold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-sm">
              <tr
                v-for="station in stationsStore.stations"
                :key="station.stationId"
                :class="[
                  'text-slate-300 hover:bg-slate-900/40 cursor-pointer transition',
                  selectedStation?.stationId === station.stationId ? 'bg-primary-900/10 border-r-2 border-primary-500' : ''
                ]"
                @click="selectStation(station)"
              >
                <td class="py-4 font-bold text-slate-500">#{{ station.sortOrder }}</td>
                <td class="py-4">
                  <span class="font-bold text-white block">{{ station.title }}</span>
                  <span class="text-xs text-slate-500">Lat: {{ station.latitude }}, Lng: {{ station.longitude }}</span>
                </td>
                <td class="py-4 text-center font-semibold text-indigo-400">من {{ station.startPole }} إلى {{ station.endPole }} (العمود: {{ station.pole }})</td>
                <td class="py-4 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20">
                    {{ station.rightsCount }} ذكر
                  </span>
                </td>
                <td class="py-4 text-left space-x-2 space-x-reverse" @click.stop>
                  <button @click="openStationModal(station)" class="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition" title="تعديل">
                    <Edit3 class="w-4.5 h-4.5" />
                  </button>
                  <button @click="confirmDeleteStation(station)" class="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition" title="حذف">
                    <Trash2 class="w-4.5 h-4.5" />
                  </button>
                </td>
              </tr>
              <tr v-if="stationsStore.stations.length === 0">
                <td colspan="5" class="py-8 text-center text-slate-500">لا يوجد محطات مسجلة بعد.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Panel: Dhikr / Station Rights (5 Cols) -->
      <div v-if="selectedStation" class="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-6 animate-fade-in">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 class="text-lg font-bold text-white">{{ selectedStation.title }}</h3>
            <p class="text-slate-400 text-xs">إدارة الأذكار التابعة للمحطة</p>
          </div>
          <button @click="selectedStation = null" class="p-1 text-slate-500 hover:text-slate-300 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <button
          @click="openDhikrModal(null)"
          class="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-bold text-slate-300 transition text-sm"
        >
          <Plus class="w-4.5 h-4.5" />
          <span>إضافة ذكر/دعاء جديد</span>
        </button>

        <div v-if="stationsStore.loading" class="flex items-center justify-center py-6">
          <Loader2 class="w-6 h-6 animate-spin text-primary-500" />
        </div>

        <!-- Dhikr List -->
        <div v-else class="space-y-4">
          <div
            v-for="dhikr in stationsStore.currentStationDhikrs"
            :key="dhikr.rightId"
            class="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 hover:border-slate-700 transition"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500">ترتيب #{{ dhikr.sortOrder }}</span>
              <div class="flex items-center gap-1">
                <button @click="openDhikrModal(dhikr)" class="p-1 text-indigo-400 hover:bg-indigo-500/10 rounded">
                  <Edit3 class="w-4 h-4" />
                </button>
                <button @click="deleteDhikr(dhikr.rightId)" class="p-1 text-rose-400 hover:bg-rose-500/10 rounded">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            <h4 class="font-bold text-white">{{ dhikr.title }}</h4>
            <p class="text-slate-400 text-xs line-clamp-3 leading-relaxed">{{ dhikr.contentText }}</p>
            <div v-if="dhikr.audioUrl" class="flex items-center gap-2 pt-2 border-t border-slate-800/40">
              <Volume2 class="w-3.5 h-3.5 text-primary-400" />
              <span class="text-xs text-primary-400 truncate max-w-[200px]" :title="dhikr.audioUrl">ملف صوتي مرفق</span>
            </div>
          </div>

          <div v-if="stationsStore.currentStationDhikrs.length === 0" class="py-8 text-center text-slate-600 text-xs">
            لا توجد أذكار مضافة للمحطة بعد.
          </div>
        </div>
      </div>
    </div>

    <!-- Station Form Modal -->
    <div v-if="stationModal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 class="text-lg font-bold text-white">{{ stationModal.isEdit ? 'تعديل محطة' : 'إنشاء محطة جديدة' }}</h3>

        <form @submit.prevent="submitStation" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">اسم المحطة</label>
            <input v-model="stationModal.form.title" type="text" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-slate-300 text-xs font-semibold mb-2">عمود البداية</label>
              <input v-model.number="stationModal.form.startPole" type="number" required min="1" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
            <div>
              <label class="block text-slate-300 text-xs font-semibold mb-2">عمود النهاية</label>
              <input v-model.number="stationModal.form.endPole" type="number" required min="1" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
            <div>
              <label class="block text-slate-300 text-xs font-semibold mb-2">العمود المحدد</label>
              <input v-model.number="stationModal.form.pole" type="number" required min="1" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">خط العرض (Latitude)</label>
              <input v-model.number="stationModal.form.latitude" type="number" step="0.000001" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">خط الطول (Longitude)</label>
              <input v-model.number="stationModal.form.longitude" type="number" step="0.000001" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">ترتيب الظهور (Sort Order)</label>
            <input v-model.number="stationModal.form.sortOrder" type="number" required min="1" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" @click="stationModal.show = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">إلغاء</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md shadow-primary-600/15">حفظ</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Dhikr Form Modal -->
    <div v-if="dhikrModal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 class="text-lg font-bold text-white">{{ dhikrModal.isEdit ? 'تعديل ذكر/دعاء' : 'إضافة ذكر جديد' }}</h3>

        <form @submit.prevent="submitDhikr" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">عنوان الذكر</label>
            <input v-model="dhikrModal.form.title" type="text" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">النص الديني للذكر</label>
            <textarea v-model="dhikrModal.form.contentText" required rows="5" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm leading-relaxed"></textarea>
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
              
              <div v-if="dhikrModal.form.audioUrl" class="flex-1 flex items-center justify-between gap-2 bg-slate-900/60 border border-slate-850 px-3 py-1.5 rounded-xl text-xs text-slate-400">
                <div class="flex items-center gap-2 truncate">
                  <Volume2 class="w-4 h-4 text-primary-400 flex-shrink-0 animate-pulse" />
                  <span class="truncate text-[10px] text-slate-500">تم الرفع بنجاح</span>
                </div>
                <button type="button" @click="dhikrModal.form.audioUrl = ''" class="text-rose-400 hover:text-rose-300 font-bold px-1">حذف</button>
              </div>
            </div>
            <input v-model="dhikrModal.form.audioUrl" type="hidden" />
          </div>
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">ترتيب الظهور</label>
            <input v-model.number="dhikrModal.form.sortOrder" type="number" required min="1" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" @click="dhikrModal.show = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">إلغاء</button>
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
import axiosInstance from '@/api/axiosInstance'
import { Plus, MapPin, Edit3, Trash2, X, Volume2, Loader2, BookOpen, UploadCloud } from 'lucide-vue-next'

const stationsStore = useStationsStore()
const selectedStation = ref(null)

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
    dhikrModal.form.audioUrl = response.data.url
  } catch (err) {
    alert('فشل رفع الملف الصوتي. تأكد من اتصالك بالإنترنت والامتداد.')
  } finally {
    uploadingAudio.value = false
    if (audioInputRef.value) {
      audioInputRef.value.value = ''
    }
  }
}

// Station Modal state
const stationModal = reactive({
  show: false,
  isEdit: false,
  stationId: null,
  form: {
    title: '',
    startPole: 1,
    endPole: 10,
    pole: 1,
    latitude: 21.4225,
    longitude: 39.8262,
    sortOrder: 1
  }
})

// Dhikr Modal state
const dhikrModal = reactive({
  show: false,
  isEdit: false,
  rightId: null,
  form: {
    title: '',
    contentText: '',
    audioUrl: '',
    sortOrder: 1
  }
})

onMounted(() => {
  stationsStore.fetchStations()
})

const selectStation = (station) => {
  selectedStation.value = station
  stationsStore.fetchDhikrs(station.stationId)
}

// Station Handlers
const openStationModal = (station = null) => {
  if (station) {
    stationModal.isEdit = true
    stationModal.stationId = station.stationId
    stationModal.form = { ...station }
  } else {
    stationModal.isEdit = false
    stationModal.stationId = null
    stationModal.form = {
      title: '',
      startPole: 1,
      endPole: 10,
      pole: 1,
      latitude: 21.4225,
      longitude: 39.8262,
      sortOrder: stationsStore.stations.length + 1
    }
  }
  stationModal.show = true
}

const submitStation = async () => {
  try {
    if (stationModal.isEdit) {
      await stationsStore.updateStation(stationModal.stationId, stationModal.form)
    } else {
      await stationsStore.createStation(stationModal.form)
    }
    stationModal.show = false
    await stationsStore.fetchStations()
  } catch (err) {
    alert('فشل حفظ المحطة. يرجى مراجعة قيم المدخلات.')
  }
}

const confirmDeleteStation = async (station) => {
  if (confirm(`هل أنت متأكد من حذف محطة "${station.title}"؟ سيقوم هذا بحذف ناعم للمحطة.`)) {
    try {
      await stationsStore.deleteStation(station.stationId)
      if (selectedStation.value?.stationId === station.stationId) {
        selectedStation.value = null
      }
    } catch (err) {
      alert('حدث خطأ أثناء محاولة الحذف.')
    }
  }
}

// Dhikr Handlers
const openDhikrModal = (dhikr = null) => {
  if (dhikr) {
    dhikrModal.isEdit = true
    dhikrModal.rightId = dhikr.rightId
    dhikrModal.form = { ...dhikr }
  } else {
    dhikrModal.isEdit = false
    dhikrModal.rightId = null
    dhikrModal.form = {
      title: '',
      contentText: '',
      audioUrl: '',
      sortOrder: stationsStore.currentStationDhikrs.length + 1
    }
  }
  dhikrModal.show = true
}

const submitDhikr = async () => {
  const stationId = selectedStation.value.stationId
  try {
    if (dhikrModal.isEdit) {
      await stationsStore.updateDhikr(stationId, dhikrModal.rightId, dhikrModal.form)
    } else {
      await stationsStore.addDhikr(stationId, dhikrModal.form)
    }
    dhikrModal.show = false
    await stationsStore.fetchDhikrs(stationId)
  } catch (err) {
    alert('فشل حفظ الذكر. تأكد من صحة المدخلات ورابط الصوت.')
  }
}

const deleteDhikr = async (rightId) => {
  const stationId = selectedStation.value.stationId
  if (confirm('هل أنت متأكد من حذف هذا الذكر؟')) {
    try {
      await stationsStore.deleteDhikr(stationId, rightId)
    } catch (err) {
      alert('حدث خطأ أثناء محاولة الحذف.')
    }
  }
}
</script>

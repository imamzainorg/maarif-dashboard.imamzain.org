<template>
  <div class="space-y-8 font-sans" dir="rtl">
    <!-- Header Page -->
    <div class="border-b border-slate-800 pb-5">
      <div class="flex items-center gap-3">
        <span class="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
          <Settings class="w-6 h-6" />
        </span>
        <div>
          <h2 class="text-xl font-bold text-white">إعدادات المنصة وقاعدة البيانات</h2>
          <p class="text-slate-400 text-sm">مراجعة مفاتيح التخزين السحابي Supabase ومنافذ الإرسال، وتعديل إعدادات المنصة، ومزامنة الجداول.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Database & Server Diagnostics (5 Cols) -->
      <div class="lg:col-span-5 space-y-6">
        <!-- DB Test Connection Card -->
        <div class="glass-panel p-6 rounded-2xl space-y-4">
          <h3 class="font-bold text-white text-md flex items-center gap-2">
            <Database class="w-5 h-5 text-emerald-400" />
            <span>حالة قاعدة البيانات</span>
          </h3>

          <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">حالة الاتصال الفعلي:</span>
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full text-xs font-bold border',
                  dbStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  dbStatus === 'failed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-800'
                ]"
              >
                {{ dbStatus === 'connected' ? '✓ متصل بنجاح' : dbStatus === 'failed' ? '✗ خطأ بالاتصال' : 'جاري التحقق...' }}
              </span>
            </div>

            <p v-if="dbDetails" class="text-xs font-mono text-slate-500 leading-relaxed truncate">{{ dbDetails }}</p>
          </div>

          <button
            @click="testDbConnection"
            :disabled="testingDb"
            class="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <Loader2 v-if="testingDb" class="w-4 h-4 animate-spin" />
            <span>إعادة فحص الاتصال بقاعدة البيانات</span>
          </button>
        </div>

        <!-- Sync versions checker -->
        <div class="glass-panel p-6 rounded-2xl space-y-4">
          <h3 class="font-bold text-white text-md flex items-center gap-2">
            <RefreshCw class="w-5 h-5 text-indigo-400" />
            <span>سلامة المزامنة وجداول البيانات</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            عند إضافة أو تعديل أي محتوى (أذكار، أسئلة، خدمات) في لوحة التحكم، يقوم النظام برفع إصدار الجدول تلقائياً ليجبر الهواتف الذكية للزائرين على المزامنة في الخلفية.
          </p>

          <div v-if="loadingVersions" class="flex items-center justify-center py-4">
            <Loader2 class="w-6 h-6 animate-spin text-indigo-500" />
          </div>

          <div v-else class="space-y-2 pt-2">
            <div v-for="version in versions" :key="version.dataType" class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-slate-300 block capitalize">{{ version.dataType }}</span>
                <span class="text-[10px] text-slate-500">{{ formatDate(version.lastUpdatedAt) }}</span>
              </div>
              <button
                @click="triggerSync(version.dataType)"
                :disabled="syncingType === version.dataType"
                class="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-all duration-150 disabled:opacity-50"
                title="تحديث النسخة يدويًا"
              >
                <RefreshCw :class="['w-3.5 h-3.5', syncingType === version.dataType ? 'animate-spin' : '']" />
              </button>
            </div>
            
            <div v-if="versions.length === 0" class="py-4 text-center text-slate-500 text-xs">
              لا توجد سجلات للمزامنة حالياً.
            </div>
          </div>
        </div>
      </div>

      <!-- Application configuration details (7 Cols) -->
      <div class="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Layers class="w-5 h-5 text-indigo-400" />
            <span>تفضيلات وبيانات البيئة النشطة (Settings)</span>
          </h3>
          <button
            @click="openAddModal"
            class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <Plus class="w-4 h-4" />
            <span>إضافة إعداد</span>
          </button>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
          <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
        </div>

        <div v-else class="space-y-4">
          <div v-for="setting in settings" :key="setting.settingKey" class="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3 relative group">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">{{ setting.settingKey }}</span>
              <div class="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <button @click="openEditModal(setting)" class="p-1 text-slate-400 hover:text-indigo-400 transition" title="تعديل">
                  <Edit3 class="w-3.5 h-3.5" />
                </button>
                <button @click="deleteSetting(setting.settingKey)" class="p-1 text-slate-400 hover:text-rose-400 transition" title="حذف">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div class="p-3 bg-slate-950/70 border border-slate-900 rounded-lg">
              <strong class="text-xs text-indigo-300 block break-all font-mono leading-relaxed select-all">{{ setting.settingValue }}</strong>
            </div>

            <div class="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>{{ setting.description || 'لا يوجد وصف متاح.' }}</span>
              <span v-if="setting.updatedAt">{{ formatDate(setting.updatedAt) }}</span>
            </div>
          </div>

          <div v-if="settings.length === 0" class="py-8 text-center text-slate-500 text-xs">
            لا توجد متغيرات بيئة مهيأة للتشغيل في الجدول حالياً.
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Setting Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4 text-right">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white text-md">
            {{ isEdit ? 'تعديل إعداد المنصة' : 'إضافة إعداد جديد للمنصة' }}
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-white p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveSetting" class="space-y-4 text-slate-300">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">مفتاح الإعداد (Key)</label>
            <input
              v-model="form.settingKey"
              type="text"
              :disabled="isEdit"
              placeholder="مثال: DEFAULT_STATION_RADIUS"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
              required
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">قيمة الإعداد (Value)</label>
            <textarea
              v-model="form.settingValue"
              rows="3"
              placeholder="أدخل القيمة هنا..."
              class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 font-mono"
              required
            ></textarea>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 block">الوصف (Description)</label>
            <input
              v-model="form.description"
              type="text"
              placeholder="شرح مبسط للمفتاح..."
              class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
              <span>{{ submitting ? 'جاري الحفظ...' : 'حفظ الإعداد' }}</span>
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
import { Settings, Database, Loader2, RefreshCw, Layers, Plus, Edit3, Trash2, X } from 'lucide-vue-next'

const loading = ref(false)
const settings = ref([])
const dbStatus = ref('checking') // checking, connected, failed
const dbDetails = ref('')
const testingDb = ref(false)

// Sync properties
const versions = ref([])
const loadingVersions = ref(false)
const syncingType = ref(null)

// Modal properties
const showModal = ref(false)
const isEdit = ref(false)
const form = ref({ settingKey: '', settingValue: '', description: '' })
const submitting = ref(false)

onMounted(() => {
  fetchSettings()
  testDbConnection()
  fetchVersions()
})

const fetchSettings = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.get('/api/admin/settings')
    settings.value = response.data
  } catch (err) {
    console.error('Failed to fetch settings:', err)
  } finally {
    loading.value = false
  }
}

const fetchVersions = async () => {
  loadingVersions.value = true
  try {
    const response = await axiosInstance.get('/api/admin/settings/versions')
    versions.value = response.data
  } catch (err) {
    console.error('Failed to fetch versions:', err)
  } finally {
    loadingVersions.value = false
  }
}

const triggerSync = async (dataType) => {
  syncingType.value = dataType
  try {
    await axiosInstance.post(`/api/admin/settings/versions/trigger/${dataType}`)
    await fetchVersions()
    alert(`تم تحديث نسخة مزامنة "${dataType}" بنجاح!`)
  } catch (err) {
    console.error('Failed to trigger sync version update:', err)
    alert(err.response?.data?.message || 'فشل تحديث نسخة المزامنة.')
  } finally {
    syncingType.value = null
  }
}

const testDbConnection = async () => {
  testingDb.value = true
  dbStatus.value = 'checking'
  try {
    const response = await axiosInstance.get('/api/users/test-connection')
    if (response.data && response.data.includes('successful')) {
      dbStatus.value = 'connected'
      dbDetails.value = response.data
    } else {
      dbStatus.value = 'connected'
      dbDetails.value = typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
    }
  } catch (err) {
    dbStatus.value = 'failed'
    dbDetails.value = err.message || 'حدث خطأ أثناء محاولة التوصيل.'
  } finally {
    testingDb.value = false
  }
}

const openAddModal = () => {
  isEdit.value = false
  form.value = { settingKey: '', settingValue: '', description: '' }
  showModal.value = true
}

const openEditModal = (setting) => {
  isEdit.value = true
  form.value = {
    settingKey: setting.settingKey,
    settingValue: setting.settingValue,
    description: setting.description
  }
  showModal.value = true
}

const saveSetting = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await axiosInstance.put(`/api/admin/settings/${form.value.settingKey}`, {
        settingValue: form.value.settingValue,
        description: form.value.description
      })
      alert('تم تحديث الإعداد بنجاح!')
    } else {
      await axiosInstance.post('/api/admin/settings', {
        settingKey: form.value.settingKey,
        settingValue: form.value.settingValue,
        description: form.value.description
      })
      alert('تم إضافة الإعداد الجديد بنجاح!')
    }
    showModal.value = false
    await fetchSettings()
    await fetchVersions() // Refresh versions because sync type settings is updated
  } catch (err) {
    console.error('Error saving setting:', err)
    alert(err.response?.data?.message || 'حدث خطأ أثناء محاولة حفظ الإعداد.')
  } finally {
    submitting.value = false
  }
}

const deleteSetting = async (key) => {
  if (!confirm(`هل أنت متأكد من رغبتك في حذف الإعداد "${key}"؟`)) {
    return
  }

  try {
    await axiosInstance.delete(`/api/admin/settings/${key}`)
    alert('تم حذف الإعداد بنجاح!')
    await fetchSettings()
    await fetchVersions()
  } catch (err) {
    console.error('Error deleting setting:', err)
    alert(err.response?.data?.message || 'حدث خطأ أثناء محاولة حذف الإعداد.')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}
</script>

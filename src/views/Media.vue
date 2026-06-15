<template>
  <div class="space-y-8 font-sans">
    <!-- Header Page -->
    <div>
      <h2 class="text-xl font-bold text-white">مركز رفع وإدارة الوسائط والملفات</h2>
      <p class="text-slate-400 text-sm">ارفع الصور وصوتيات الأذكار والزيارات إلى حوض التخزين السحابي لتوليد روابط مباشرة لها لاستخدامها في إدخال البيانات.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Upload Zone (7 Cols) -->
      <div class="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-6">
        <h3 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <UploadCloud class="w-5 h-5 text-primary-400" />
          <span>منشئ التحميل للملفات</span>
        </h3>

        <!-- Folder configuration -->
        <div class="w-64">
          <label class="block text-slate-300 text-sm font-semibold mb-2">مجلد التخزين المستهدف</label>
          <select v-model="folderName" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm">
            <option value="audios">🔊 مجلد الصوتيات (audios)</option>
            <option value="images">🖼️ مجلد الصور (images)</option>
            <option value="general">📁 مجلد عام (general)</option>
          </select>
        </div>

        <!-- Drag & Drop Area -->
        <div
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          :class="[
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-4',
            dragOver ? 'border-primary-500 bg-primary-950/15' : 'border-slate-800 hover:border-slate-700 bg-slate-900/20'
          ]"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept="audio/*,image/*"
            @change="handleFileSelect"
          />

          <div class="p-4 bg-slate-800 rounded-full text-slate-400 group-hover:scale-110 transition duration-300">
            <UploadCloud class="w-10 h-10 text-primary-400" />
          </div>

          <div>
            <p class="text-sm font-bold text-white">اسحب وأسقط الملف هنا أو انقر للتصفح</p>
            <p class="text-xs text-slate-500 mt-1">الملفات المدعومة: الصوتيات (MP3/WAV) والصور (JPG/PNG) حتى 15 ميجابايت</p>
          </div>
        </div>

        <!-- Uploading progress panel -->
        <div v-if="uploading" class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-slate-300">جاري الرفع: {{ uploadingFileName }}</span>
            <span class="text-primary-400">{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div class="bg-primary-500 h-full transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Uploaded files links history (5 Cols) -->
      <div class="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-6">
        <h3 class="font-bold text-white text-md flex items-center gap-2 border-b border-slate-800 pb-3">
          <CopyCheck class="w-5 h-5 text-indigo-400" />
          <span>الملفات المرفوعة مؤخراً</span>
        </h3>

        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          <div
            v-for="(url, idx) in uploadedFiles"
            :key="idx"
            class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 flex flex-col hover:border-slate-700 transition"
          >
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-500">تم الرفع بنجاح</span>
              <span class="text-[10px] font-semibold text-primary-400 uppercase">{{ getFileExtension(url) }}</span>
            </div>
            
            <span class="text-xs text-slate-300 truncate select-all font-mono py-1.5 px-2 bg-slate-950 rounded border border-slate-900" :title="url">
              {{ url }}
            </span>

            <button
              @click="copyToClipboard(url)"
              class="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Copy class="w-3.5 h-3.5" />
              <span>نسخ الرابط المباشر</span>
            </button>
          </div>

          <div v-if="uploadedFiles.length === 0" class="py-12 text-center text-slate-600 text-xs">
            لا توجد ملفات مرفوعة في هذه الجلسة بعد. ارفع ملفاً للبدء في توليد الروابط.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axiosInstance from '@/api/axiosInstance'
import { UploadCloud, CopyCheck, Copy, Loader2 } from 'lucide-vue-next'

const dragOver = ref(false)
const fileInput = ref(null)
const uploading = ref(false)
const uploadingFileName = ref('')
const uploadProgress = ref(0)
const folderName = ref('audios')

const uploadedFiles = ref([])

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadFile(files[0])
  }
}

const handleDrop = (event) => {
  dragOver.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    uploadFile(files[0])
  }
}

const getFileExtension = (url) => {
  try {
    const parts = url.split('.')
    return parts[parts.length - 1].split('?')[0]
  } catch (e) {
    return 'file'
  }
}

const copyToClipboard = (url) => {
  navigator.clipboard.writeText(url)
  alert('تم نسخ الرابط المباشر للملف بنجاح لحافظتك!')
}

const uploadFile = async (file) => {
  uploading.value = true
  uploadingFileName.value = file.name
  uploadProgress.value = 10
  
  const formData = new FormData()
  formData.append('File', file)
  formData.append('FolderName', folderName.value)

  try {
    uploadProgress.value = 40
    const response = await axiosInstance.post('/api/admin/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    uploadProgress.value = 100
    uploadedFiles.value.unshift(response.data.url)
  } catch (err) {
    alert('فشل رفع الملف. تأكد من حجم ونوع الملف ومطابقة شروط السيرفر.')
  } finally {
    setTimeout(() => {
      uploading.value = false
      uploadProgress.value = 0
    }, 800)
  }
}
</script>

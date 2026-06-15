<template>
  <div class="space-y-8 font-sans">
    <!-- Header Page -->
    <div>
      <h2 class="text-xl font-bold text-white">إرسال وبث الإشعارات الفورية</h2>
<<<<<<< HEAD
      <p class="text-slate-400 text-sm">أرسل تنبيهات عاجلة، إرشادات للمشاعر، أو رسائل مخصصة للزائرين عبر خوادم Firebase FCM.</p>
=======
      <p class="text-slate-400 text-sm">أرسل تنبيهات عاجلة، إرشادات للمشاعر، أو رسائل مخصصة للحجاج عبر خوادم Firebase FCM.</p>
>>>>>>> 6973ff87b308c5d8c75fd183b6bbea67c52beb9b
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Send Notification Form (7 Cols) -->
      <div class="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-6">
        <h3 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Bell class="w-5 h-5 text-primary-400" />
          <span>منشئ الإشعار الفوري</span>
        </h3>

        <!-- Response Result alert -->
        <div v-if="result" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm space-y-2">
          <h4 class="font-bold flex items-center gap-1">
            <CheckCircle2 class="w-5 h-5 text-emerald-500" />
            <span>اكتملت عملية الإرسال بنجاح!</span>
          </h4>
          <ul class="list-disc list-inside text-xs text-slate-300 space-y-1">
            <li>عدد المستلمين: {{ result.recipientsCount === -1 ? 'جميع مستخدمي التطبيق (بث عام عبر القناة)' : result.recipientsCount + ' جهاز' }}</li>
            <li>حالة الإرسال عبر Firebase: {{ result.sentToFirebase ? 'ناجح' : 'فشل/تخطي' }}</li>
            <li>توثيق الحدث بقاعدة البيانات: {{ result.loggedSuccessfully ? 'مكتمل' : 'معلق' }}</li>
          </ul>
        </div>

        <form @submit.prevent="handleSend" class="space-y-5">
          <!-- Notification Title -->
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">عنوان التنبيه</label>
            <input
              v-model="form.title"
              type="text"
              required
              maxlength="200"
              placeholder="مثال: تنبيه هام بخصوص طواف الوداع..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"
            />
          </div>

          <!-- Target User Selection -->
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">المستهدف بالإرسال</label>
            <div class="space-y-3">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input v-model="sendToAll" type="radio" :value="true" class="w-4.5 h-4.5 accent-primary-500" />
<<<<<<< HEAD
                <span class="text-sm font-semibold text-slate-200">بث عام (لجميع الزائرين المسجلين)</span>
=======
                <span class="text-sm font-semibold text-slate-200">بث عام (لجميع الحجاج المسجلين)</span>
>>>>>>> 6973ff87b308c5d8c75fd183b6bbea67c52beb9b
              </label>

              <label class="flex items-center gap-2.5 cursor-pointer">
                <input v-model="sendToAll" type="radio" :value="false" class="w-4.5 h-4.5 accent-primary-500" />
                <span class="text-sm font-semibold text-slate-200">مستخدم محدد (إرسال مخصص لشخص واحد)</span>
              </label>
            </div>
          </div>

          <!-- Specific User Target Input -->
          <div v-if="!sendToAll" class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-slide-up">
<<<<<<< HEAD
            <label class="block text-slate-300 text-xs font-semibold">الزائر المستهدف (بالاسم أو الهاتف)</label>
            <div class="flex gap-2">
              <input
                type="text"
                readonly
                :value="selectedUserLabel || 'لم يتم اختيار زائر بعد، اضغط على بحث...'"
                @click="openUserSelectModal"
                class="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-355 text-sm cursor-pointer hover:border-primary-500 transition text-right"
                style="color: rgb(203, 213, 225);"
=======
            <label class="block text-slate-300 text-xs font-semibold">رقم معرّف الحاج (User ID)</label>
            <div class="flex gap-2">
              <input
                v-model.number="form.userId"
                type="number"
                required
                placeholder="أدخل معرّف المستخدم (مثال: 5)"
                class="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm text-left"
                dir="ltr"
>>>>>>> 6973ff87b308c5d8c75fd183b6bbea67c52beb9b
              />
              <button
                type="button"
                @click="openUserSelectModal"
<<<<<<< HEAD
                class="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>بحث واختيار</span>
              </button>
            </div>
            <input v-model="form.userId" type="hidden" required />
=======
                class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                بحث عن حاج
              </button>
            </div>
            <p v-if="selectedUserLabel" class="text-xs text-indigo-400 font-semibold">المستلم المختار: {{ selectedUserLabel }}</p>
>>>>>>> 6973ff87b308c5d8c75fd183b6bbea67c52beb9b
          </div>

          <!-- Content text -->
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">محتوى رسالة التنبيه</label>
            <textarea
              v-model="form.contentText"
              required
              rows="5"
<<<<<<< HEAD
              placeholder="اكتب تفاصيل التنبيه الموجه للزائر هنا..."
=======
              placeholder="اكتب تفاصيل التنبيه الموجه للحاج هنا..."
>>>>>>> 6973ff87b308c5d8c75fd183b6bbea67c52beb9b
              class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm leading-relaxed"
            ></textarea>
          </div>

          <!-- Submit -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="submit"
              :disabled="notificationsStore.loading"
              class="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white font-bold text-sm shadow-md shadow-primary-600/15 flex items-center gap-2 active:scale-95 transition"
            >
              <Loader2 v-if="notificationsStore.loading" class="w-4 h-4 animate-spin" />
              <span>إرسال الآن عبر Firebase</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Tips & Instructions (5 Cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="glass-panel p-6 rounded-2xl space-y-4">
          <h3 class="font-bold text-white text-md flex items-center gap-2">
            <AlertCircle class="w-5 h-5 text-indigo-400" />
            <span>نصائح البث المباشر</span>
          </h3>

          <ul class="space-y-3 text-xs text-slate-400 leading-loose">
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0"></span>
              <span><strong>البث العام</strong> يرسل الإشعار لجميع الأجهزة النشطة في نفس الوقت، يفضل استخدامه للتحديثات العامة أو حالات الطوارئ.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0"></span>
              <span>تأكد من كتابة عناوين واضحة وجذابة لا تتجاوز 200 حرف ليتم قراءتها بسهولة من شاشات القفل للمستخدمين.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0"></span>
<<<<<<< HEAD
              <span>يتم تخزين كل إشعار مرسل تلقائياً في <strong>سجل الإشعارات المستلمة (Inbox)</strong> للزائر لكي يقرأها لاحقاً داخل التطبيق.</span>
=======
              <span>يتم تخزين كل إشعار مرسل تلقائياً في <strong>سجل الإشعارات المستلمة (Inbox)</strong> للحاج لكي يقرأها لاحقاً داخل التطبيق.</span>
>>>>>>> 6973ff87b308c5d8c75fd183b6bbea67c52beb9b
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- User Selector Modal (Mini) -->
    <div v-if="userModal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
<<<<<<< HEAD
          <h3 class="text-lg font-bold text-white">البحث عن زائر</h3>
=======
          <h3 class="text-lg font-bold text-white">البحث عن حاج</h3>
>>>>>>> 6973ff87b308c5d8c75fd183b6bbea67c52beb9b
          <button @click="userModal.show = false" class="p-1 text-slate-500 hover:text-slate-300 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <input
            v-model="userModal.search"
            @input="searchUsers"
            type="text"
<<<<<<< HEAD
            placeholder="ابحث باسم الزائر أو الهاتف..."
=======
            placeholder="ابحث باسم الحاج أو الهاتف..."
>>>>>>> 6973ff87b308c5d8c75fd183b6bbea67c52beb9b
            class="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"
          />

          <div class="max-h-60 overflow-y-auto space-y-2 divide-y divide-slate-800/40">
            <div
              v-for="user in userModal.results"
              :key="user.userId"
              @click="selectUser(user)"
              class="p-3 flex items-center justify-between hover:bg-slate-900 cursor-pointer rounded-xl transition"
            >
              <div>
                <span class="font-bold text-white text-sm block">{{ user.fullName }}</span>
                <span class="text-xs text-slate-500" dir="ltr">{{ user.phoneNumber || 'لا يوجد هاتف' }}</span>
              </div>
              <span class="text-xs font-bold text-slate-500">معرف: #{{ user.userId }}</span>
            </div>
            
            <div v-if="userModal.results.length === 0" class="py-6 text-center text-slate-600 text-xs">
              لا توجد نتائج بحث.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import axiosInstance from '@/api/axiosInstance'
import { Bell, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-vue-next'

const notificationsStore = useNotificationsStore()

const sendToAll = ref(true)
const result = ref(null)
const selectedUserLabel = ref('')

const form = reactive({
  title: '',
  contentText: '',
  userId: null
})

const userModal = reactive({
  show: false,
  search: '',
  results: []
})

watch(sendToAll, (newVal) => {
  if (newVal) {
    form.userId = null
    selectedUserLabel.value = ''
  }
})

const handleSend = async () => {
  try {
    const payload = {
      title: form.title,
      contentText: form.contentText,
      userId: sendToAll.value ? null : form.userId
    }
    const response = await notificationsStore.sendNotification(payload)
    result.value = response
    
    // Clear inputs on success
    form.title = ''
    form.contentText = ''
    form.userId = null
    selectedUserLabel.value = ''
  } catch (err) {
    alert('فشلت عملية الإرسال. تأكد من وجود توكنات FCM للمستخدمين.')
  }
}

// User Selector search
const openUserSelectModal = () => {
  userModal.search = ''
  userModal.results = []
  userModal.show = true
}

const searchUsers = async () => {
  if (userModal.search.length < 2) return
  try {
    const response = await axiosInstance.get('/api/admin/users', {
<<<<<<< HEAD
      params: { limit: 500, offset: 0 }
    })
=======
      params: { limit: 10, offset: 0 }
    })
    // Client-side filter for mock-search
>>>>>>> 6973ff87b308c5d8c75fd183b6bbea67c52beb9b
    userModal.results = response.data.filter(u =>
      u.fullName.toLowerCase().includes(userModal.search.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(userModal.search))
    )
  } catch (err) {
    console.error(err)
  }
}

const selectUser = (user) => {
  form.userId = user.userId
<<<<<<< HEAD
  selectedUserLabel.value = `${user.fullName} (${user.phoneNumber || 'بدون هاتف'})`
=======
  selectedUserLabel.value = `${user.fullName} (معرف: ${user.userId})`
>>>>>>> 6973ff87b308c5d8c75fd183b6bbea67c52beb9b
  userModal.show = false
}
</script>

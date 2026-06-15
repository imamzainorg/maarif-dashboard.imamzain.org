<template>
  <div class="space-y-8 font-sans">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-white">إدارة الزائرين والمستخدمين</h2>
        <p class="text-slate-400 text-sm">استعرض بيانات الزائرين المسجلين، نقاطهم، إنجازاتهم، وتحكم في حساباتهم.</p>
      </div>
      <div>
        <button
          @click="openAddModal"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-600/20 hover:bg-primary-500 transition-all duration-200 hover:-translate-y-0.5"
        >
          <UserPlus class="w-4.5 h-4.5" />
          <span>إضافة زائر جديد</span>
        </button>
      </div>
    </div>

    <!-- Filters, Search and Pagination controls -->
    <div class="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex-1 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث باسم الزائر، الهاتف أو البريد الإلكتروني..."
          class="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-slate-100 text-sm"
        />
        <Search class="absolute right-3 top-3 w-4.5 h-4.5 text-slate-500" />
      </div>

      <!-- Pagination controls -->
      <div class="flex items-center gap-3">
        <button
          @click="prevPage"
          :disabled="offset === 0 || usersStore.loading"
          class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
        <span class="text-sm font-semibold text-slate-300">الصفحة {{ currentPage }}</span>
        <button
          @click="nextPage"
          :disabled="usersStore.users.length < limit || usersStore.loading"
          class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Loading spinner -->
    <div v-if="usersStore.loading" class="flex flex-col items-center justify-center py-16 space-y-4">
      <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      <span class="text-slate-500 text-sm">جاري تحميل سجلات الزائرين...</span>
    </div>

    <!-- Users Table -->
    <div v-else class="glass-panel p-6 rounded-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-right border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-xs text-slate-400">
              <th class="pb-3 font-semibold">المستخدم</th>
              <th class="pb-3 font-semibold">البريد الإلكتروني</th>
              <th class="pb-3 font-semibold">رقم الهاتف</th>
              <th class="pb-3 font-semibold text-center">المدينة</th>
              <th class="pb-3 font-semibold text-center">تاريخ التسجيل</th>
              <th class="pb-3 font-semibold text-center">إجمالي النقاط</th>
              <th class="pb-3 font-semibold text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 text-sm">
            <tr
              v-for="user in filteredUsers"
              :key="user.userId"
              class="text-slate-300 hover:bg-slate-900/40 transition cursor-pointer"
              @click="viewUserDetails(user)"
            >
              <td class="py-4 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center font-bold text-slate-200">
                  {{ user.fullName.charAt(0) }}
                </div>
                <div>
                  <span class="font-bold text-white flex items-center gap-1.5">
                    {{ user.fullName }}
                    <span v-if="isUserActive(user.lastActiveAt)" class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" title="نشط الآن"></span>
                  </span>
                  <span class="text-xs text-slate-550 font-medium">معرف: #{{ user.userId }} | رتبة: {{ user.roleName }}</span>
                </div>
              </td>
              <td class="py-4">{{ user.email || 'غير متوفر' }}</td>
              <td class="py-4" dir="ltr">{{ user.phoneNumber || 'غير متوفر' }}</td>
              <td class="py-4 text-center font-semibold">{{ user.city || 'غير محددة' }}</td>
              <td class="py-4 text-center text-slate-400 text-xs">{{ formatDate(user.createdAt) }}</td>
              <td class="py-4 text-center font-black text-emerald-400 text-md">{{ user.totalPoints }} نقطة</td>
              <td class="py-4 text-left" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(user)" class="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition" title="تعديل">
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button @click="confirmPurgeUser(user)" class="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition" title="تطهير وحذف الحساب">
                    <UserX class="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="7" class="py-8 text-center text-slate-500">لا يوجد زائرين مطابقين لبيانات البحث الحالية.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Details Modal -->
    <div v-if="detailsModal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 class="text-lg font-bold text-white">تفاصيل ملف الزائر</h3>
          <button @click="detailsModal.show = false" class="p-1 text-slate-500 hover:text-slate-300 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xl">
              {{ detailsModal.user.fullName.charAt(0) }}
            </div>
            <div>
              <h4 class="font-extrabold text-white text-lg">{{ detailsModal.user.fullName }}</h4>
              <span class="text-xs text-slate-400">رقم التعريف للملف: #{{ detailsModal.user.userId }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800/40">
              <span class="text-xs text-slate-500 block mb-1">البريد الإلكتروني</span>
              <strong class="text-slate-200">{{ detailsModal.user.email || 'غير مسجل' }}</strong>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-850/40">
              <span class="text-xs text-slate-550 block mb-1">رقم الهاتف</span>
              <strong class="text-slate-200" dir="ltr">{{ detailsModal.user.phoneNumber || 'غير مسجل' }}</strong>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800/40">
              <span class="text-xs text-slate-500 block mb-1">تاريخ الميلاد</span>
              <strong class="text-slate-200">{{ formatDateOnly(detailsModal.user.birthDate) }}</strong>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800/40">
              <span class="text-xs text-slate-500 block mb-1">المدينة</span>
              <strong class="text-slate-200">{{ detailsModal.user.city }}</strong>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800/40">
              <span class="text-xs text-slate-500 block mb-1">دور المستخدم (الرتبة)</span>
              <span class="px-2 py-0.5 text-xs font-bold rounded bg-indigo-500/10 text-indigo-400 inline-block">
                {{ detailsModal.user.roleName === 'admin' ? 'مدير النظام' : detailsModal.user.roleName === 'super_admin' ? 'مدير عام' : 'زائر' }}
              </span>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800/40">
              <span class="text-xs text-slate-500 block mb-1">تاريخ التسجيل</span>
              <strong class="text-slate-200">{{ formatDate(detailsModal.user.createdAt) }}</strong>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800/40 col-span-2">
              <span class="text-xs text-slate-500 block mb-1">حالة النشاط والظهور</span>
              <span v-if="isUserActive(detailsModal.user.lastActiveAt)" class="text-emerald-400 font-bold text-xs flex items-center gap-1.5 mt-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                نشط الآن بالمنصة
              </span>
              <span v-else class="text-slate-400 font-medium text-xs block mt-1">
                آخر نشاط: {{ formatLastActive(detailsModal.user.lastActiveAt) }}
              </span>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800/40 col-span-2 flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-550 block mb-1">إجمالي النقاط المكتسبة</span>
                <strong class="text-emerald-400 text-lg font-black">{{ detailsModal.user.totalPoints }} نقطة</strong>
              </div>
              <Award class="w-8 h-8 text-emerald-500/30" />
            </div>

            <!-- Completed Rights Section -->
            <div class="col-span-2 border-t border-slate-800/60 pt-4 space-y-3">
              <h5 class="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <span>📚</span>
                <span>الحقوق والأذكار المقروءة والمنجزة</span>
              </h5>
              
              <div v-if="loadingProgress" class="flex items-center justify-center py-6">
                <Loader2 class="w-5 h-5 animate-spin text-primary-500" />
              </div>
              
              <div v-else-if="userProgress.length === 0" class="p-4 rounded-xl bg-slate-900/40 border border-slate-900 text-center text-xs text-slate-500">
                لا توجد حقوق أو أذكار منجزة بعد لهذا الزائر.
              </div>
              
              <div v-else class="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <div v-for="prog in userProgress" :key="prog.rightId" class="p-2.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span class="font-bold text-white block">{{ prog.title }}</span>
                    <span class="text-[10px] text-slate-550">{{ prog.stationTitle }}</span>
                  </div>
                  <div class="text-left flex-shrink-0">
                    <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold block mb-1">✓ مكتمل</span>
                    <span class="text-[9px] text-slate-500 block" dir="ltr">{{ formatDateTime(prog.completedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Completed Quizzes Section -->
            <div class="col-span-2 border-t border-slate-800/60 pt-4 space-y-3">
              <h5 class="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <span>📝</span>
                <span>الاختبارات والتقييمات المنجزة</span>
              </h5>
              
              <div v-if="loadingQuizzes" class="flex items-center justify-center py-6">
                <Loader2 class="w-5 h-5 animate-spin text-primary-500" />
              </div>
              
              <div v-else-if="userQuizzes.length === 0" class="p-4 rounded-xl bg-slate-900/40 border border-slate-900 text-center text-xs text-slate-500">
                لا توجد اختبارات أو تقييمات منجزة بعد لهذا الزائر.
              </div>
              
              <div v-else class="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <div v-for="quiz in userQuizzes" :key="quiz.submissionId" class="p-2.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span class="font-bold text-white block">{{ quiz.stationTitle }}</span>
                    <span class="text-[9px] text-slate-550 block" dir="ltr">{{ formatDateTime(quiz.submittedAt) }}</span>
                  </div>
                  <div class="text-left flex-shrink-0">
                    <span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold block mb-1">النتيجة: {{ quiz.score }} نقاط</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="editModal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 class="text-lg font-bold text-white">تعديل بيانات الزائر</h3>

        <form @submit.prevent="submitEdit" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">الاسم الكامل</label>
            <input v-model="editModal.form.fullName" type="text" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">تاريخ الميلاد</label>
              <input v-model="editModal.form.birthDate" type="date" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">المدينة</label>
              <input v-model="editModal.form.city" type="text" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">البريد الإلكتروني (اختياري)</label>
              <input v-model="editModal.form.email" type="email" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-2">رقم الهاتف (اختياري)</label>
              <input v-model="editModal.form.phoneNumber" type="text" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" @click="editModal.show = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">إلغاء</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md shadow-primary-600/15">حفظ التغييرات</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="addModal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 class="text-lg font-bold text-white">إضافة زائر جديد</h3>
          <button type="button" @click="addModal.show = false" class="p-1 text-slate-500 hover:text-slate-300 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Error display inside modal -->
        <div v-if="addModal.error" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ addModal.error }}</span>
        </div>

        <form @submit.prevent="submitAdd" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-1.5">الاسم الكامل <span class="text-rose-500">*</span></label>
            <input
              v-model="addModal.form.fullName"
              type="text"
              required
              placeholder="مثال: محمد علي أحمد"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-1.5">تاريخ الميلاد <span class="text-rose-500">*</span></label>
              <input
                v-model="addModal.form.birthDate"
                type="date"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"
              />
            </div>
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-1.5">المدينة <span class="text-rose-500">*</span></label>
              <input
                v-model="addModal.form.city"
                type="text"
                required
                placeholder="مثال: كربلاء"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-1.5">رقم الهاتف <span class="text-rose-500">*</span></label>
              <input
                v-model="addModal.form.phoneNumber"
                type="text"
                required
                placeholder="مثال: 07701234567"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"
              />
            </div>
            <div>
              <label class="block text-slate-300 text-sm font-semibold mb-1.5">البريد الإلكتروني (اختياري)</label>
              <input
                v-model="addModal.form.email"
                type="email"
                placeholder="example@mail.com"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-1.5">كلمة المرور <span class="text-rose-500">*</span></label>
            <div class="relative">
              <input
                v-model="addModal.form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                placeholder="لا تقل عن 6 أحرف أو أرقام"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute left-3 top-3 text-slate-500 hover:text-slate-300"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              @click="addModal.show = false"
              :disabled="addModal.loading"
              class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              :disabled="addModal.loading"
              class="px-5 py-2 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md shadow-primary-600/15 disabled:opacity-50 flex items-center gap-2"
            >
              <Loader2 v-if="addModal.loading" class="w-4.5 h-4.5 animate-spin" />
              <span>تسجيل وإضافة الزائر</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import axiosInstance from '@/api/axiosInstance'
import { Search, ChevronLeft, ChevronRight, Edit3, UserX, X, Loader2, Award, UserPlus, Eye, EyeOff } from 'lucide-vue-next'

const usersStore = useUsersStore()

const limit = ref(20)
const offset = ref(0)
const currentPage = ref(1)
const searchQuery = ref('')

const detailsModal = reactive({
  show: false,
  user: null
})

const userProgress = ref([])
const loadingProgress = ref(false)

const userQuizzes = ref([])
const loadingQuizzes = ref(false)

const editModal = reactive({
  show: false,
  userId: null,
  form: {
    fullName: '',
    birthDate: '',
    city: '',
    email: '',
    phoneNumber: ''
  }
})

const addModal = reactive({
  show: false,
  loading: false,
  error: null,
  form: {
    fullName: '',
    birthDate: '',
    city: '',
    phoneNumber: '',
    email: '',
    password: ''
  }
})

const showPassword = ref(false)

onMounted(() => {
  loadUsers()
})

const loadUsers = () => {
  usersStore.fetchUsers(limit.value, offset.value)
}

const nextPage = () => {
  offset.value += limit.value
  currentPage.value++
  loadUsers()
}

const prevPage = () => {
  if (offset.value >= limit.value) {
    offset.value -= limit.value
    currentPage.value--
    loadUsers()
  }
}

const filteredUsers = computed(() => {
  return usersStore.users.filter(u => {
    return (
      u.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (u.phoneNumber && u.phoneNumber.includes(searchQuery.value))
    )
  })
})

const viewUserDetails = async (user) => {
  detailsModal.user = user
  detailsModal.show = true
  loadingProgress.value = true
  loadingQuizzes.value = true
  userProgress.value = []
  userQuizzes.value = []
  
  try {
    const response = await axiosInstance.get(`/api/admin/users/${user.userId}/progress`)
    userProgress.value = response.data
  } catch (err) {
    console.error('Failed to load user progress:', err)
  } finally {
    loadingProgress.value = false
  }

  try {
    const response = await axiosInstance.get(`/api/admin/users/${user.userId}/quizzes`)
    userQuizzes.value = response.data
  } catch (err) {
    console.error('Failed to load user quizzes:', err)
  } finally {
    loadingQuizzes.value = false
  }
}

const openAddModal = () => {
  addModal.form = {
    fullName: '',
    birthDate: '',
    city: '',
    phoneNumber: '',
    email: '',
    password: ''
  }
  addModal.error = null
  addModal.loading = false
  showPassword.value = false
  addModal.show = true
}

const submitAdd = async () => {
  addModal.loading = true
  addModal.error = null
  try {
    if (addModal.form.password.length < 6) {
      addModal.error = 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.'
      addModal.loading = false
      return
    }
    await usersStore.createUser(addModal.form)
    addModal.show = false
  } catch (err) {
    console.error('Failed to create user:', err)
    addModal.error = err.message || 'حدث خطأ أثناء محاولة إضافة الزائر.'
  } finally {
    addModal.loading = false
  }
}

const openEditModal = (user) => {
  editModal.userId = user.userId
  editModal.form = {
    fullName: user.fullName,
    birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
    city: user.city,
    email: user.email,
    phoneNumber: user.phoneNumber
  }
  editModal.show = true
}

const submitEdit = async () => {
  try {
    await usersStore.updateUser(editModal.userId, editModal.form)
    editModal.show = false
    loadUsers()
  } catch (err) {
    alert('حدث خطأ أثناء محاولة تعديل بيانات المستخدم.')
  }
}

const confirmPurgeUser = async (user) => {
  const message = `🚨🚨🚨 تحذير أمني خطير جداً! 🚨🚨🚨
هل أنت متأكد من حذف الحساب الخاص بـ "${user.fullName}" بشكل كامل؟
سيقوم هذا الخيار بتطهير وحذف الحساب وجميع البيانات المرتبطة به (الأذكار المنجزة، نقاط التقييم، إجابات الاختبارات، والجلسات النشطة) نهائياً من قاعدة البيانات!`
  
  if (confirm(message)) {
    try {
      await usersStore.deleteUser(user.userId)
      loadUsers()
    } catch (err) {
      alert('حدث خطأ أثناء محاولة حذف وتطهير الحساب.')
    }
  }
}

// Format utilities
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toISOString().split('T')[0]
}
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isUserActive = (lastActiveStr) => {
  if (!lastActiveStr) return false
  const lastActive = new Date(lastActiveStr)
  const now = new Date()
  const diffMinutes = (now - lastActive) / 1000 / 60
  return diffMinutes >= 0 && diffMinutes <= 5 // active within 5 minutes
}

const formatLastActive = (lastActiveStr) => {
  if (!lastActiveStr) return 'غير متوفر (لم يسجل دخول مسبقاً)'
  const d = new Date(lastActiveStr)
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

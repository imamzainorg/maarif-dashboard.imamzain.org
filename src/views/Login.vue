<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 font-sans">
    <!-- Premium background glowing blur blobs -->
    <div class="absolute w-96 h-96 rounded-full bg-primary-600/10 blur-3xl -top-12 -left-12 pointer-events-none animate-pulse-slow"></div>
    <div class="absolute w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl -bottom-12 -right-12 pointer-events-none animate-pulse-slow"></div>

    <!-- Login card panel -->
    <div class="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10 border border-slate-800 animate-slide-up">
      <!-- Title & Branding -->
      <div class="text-center mb-8">
        <img src="/logo.png" alt="شعار معارف سجادية" class="w-16 h-16 mx-auto mb-4 object-contain" />
        <h2 class="text-2xl font-black bg-gradient-to-l from-primary-400 to-indigo-400 bg-clip-text text-transparent mb-1">
          لوحة التحكم - معارف سجادية
        </h2>
        <p class="text-slate-400 text-sm">أدخل معلومات حساب الإدارة لتسجيل الدخول</p>
      </div>

      <!-- General error alert -->
      <div v-if="authStore.error" class="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
        <AlertCircle class="w-5 h-5 flex-shrink-0" />
        <span>{{ authStore.error }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Contact (Email or Phone) -->
        <div>
          <label class="block text-slate-300 text-sm font-semibold mb-2">اسم المستخدم / البريد / الهاتف</label>
          <div class="relative">
            <input
              v-model="form.contact"
              type="text"
              required
              placeholder="admin@example.com"
              class="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition text-slate-100 placeholder-slate-600 text-left"
              dir="ltr"
            />
            <User class="absolute right-3 top-3 w-5 h-5 text-slate-500" />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-slate-300 text-sm font-semibold mb-2">كلمة المرور</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition text-slate-100 placeholder-slate-600 text-left"
              dir="ltr"
            />
            <Lock class="absolute right-3 top-3 w-5 h-5 text-slate-500" />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute left-3 top-3.5 text-slate-500 hover:text-slate-300 transition"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 font-bold text-white shadow-lg shadow-primary-600/20 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <Loader2 v-if="authStore.loading" class="w-5 h-5 animate-spin" />
          <span v-else>دخول للوحة التحكم</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  contact: '',
  password: ''
})

const showPassword = ref(false)

const handleLogin = async () => {
  try {
    const user = await authStore.login(form.contact, form.password)
    if (user.role === 'admin' || user.role === 'super_admin') {
      router.push({ name: 'DashboardOverview' })
    } else {
      authStore.error = 'عذراً، هذا الحساب لا يملك صلاحيات وصول لوحة التحكم.'
      authStore.logout()
    }
  } catch (err) {
    // Error is handled inside store and displayed in template
  }
}
</script>

<template>
  <div class="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
    <!-- Sidebar for Desktop -->
    <aside
      :class="[
        'fixed inset-y-0 right-0 z-20 flex flex-col bg-slate-900 border-l border-slate-800 transition-all duration-300 md:static',
        isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-900/50">
        <div class="flex items-center gap-2" v-if="isSidebarOpen">
          <img src="/logo.png" alt="شعار معارف سجادية" class="w-8 h-8 object-contain" />
          <span class="font-extrabold text-md bg-gradient-to-l from-primary-400 to-indigo-400 bg-clip-text text-transparent">معارف سجادية</span>
        </div>
        <div class="flex items-center justify-center w-full" v-else>
          <img src="/logo.png" alt="شعار معارف سجادية" class="w-8 h-8 object-contain" />
        </div>
        
        <!-- Toggle button on Desktop -->
        <button @click="toggleSidebar" class="hidden md:block p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
          <ChevronRight v-if="!isSidebarOpen" class="w-5 h-5" />
          <ChevronLeft v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="link in filteredLinks"
          :key="link.name"
          :to="{ name: link.routeName }"
          v-slot="{ isActive }"
          class="block"
        >
          <div
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
              isActive
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            ]"
            :title="!isSidebarOpen ? link.name : ''"
          >
            <component :is="link.icon" class="w-5 h-5 flex-shrink-0" />
            <span v-if="isSidebarOpen" class="text-sm font-medium transition-opacity duration-300">{{ link.name }}</span>
          </div>
        </RouterLink>
      </nav>

      <!-- Sidebar Footer / Admin Identity -->
      <div class="p-4 border-t border-slate-800 bg-slate-900/50" v-if="isSidebarOpen">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">
              {{ authStore.user?.fullName?.charAt(0) || 'A' }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold truncate">{{ authStore.user?.fullName || 'مسؤول النظام' }}</p>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
                {{ authStore.isSuperAdmin ? 'سوبر آدمن' : 'آدمن' }}
              </span>
            </div>
          </div>
          <button @click="logout" class="p-2 text-rose-450 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition duration-200 active:scale-95 flex-shrink-0" title="تسجيل الخروج">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Top navbar header -->
      <header class="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800 z-10">
        <!-- Sidebar toggle button for Mobile/Tablet -->
        <button @click="toggleSidebar" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden">
          <Menu class="w-6 h-6" />
        </button>

        <div class="flex items-center gap-4">
          <!-- Page title placeholder -->
          <h1 class="text-xl font-bold text-slate-100 hidden sm:block">{{ currentRouteName }}</h1>
        </div>

        <!-- Right header items -->
        <div class="flex items-center gap-4">
          <button @click="logout" class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-semibold">
            <LogOut class="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </header>

      <!-- Router View Wrapper with Scroll -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950">
        <!-- Route views outlet -->
        <router-view />
      </main>

      <!-- Overlay for mobile sidebar -->
      <div
        v-if="isSidebarOpen && isMobile"
        @click="isSidebarOpen = false"
        class="fixed inset-0 bg-black/60 z-10 transition-opacity"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  MapPin,
  HelpCircle,
  Stethoscope,
  BookOpen,
  Users,
  Bell,
  FolderOpen,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  Award,
  Image
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isSidebarOpen = ref(true)
const isMobile = ref(false)

const links = [
  { name: 'الاستعراض العام', routeName: 'DashboardOverview', icon: LayoutDashboard, requiresSuper: false },
  { name: 'المحطات والأذكار', routeName: 'Stations', icon: MapPin, requiresSuper: false },
  { name: 'الاختبارات والأسئلة', routeName: 'Quizzes', icon: HelpCircle, requiresSuper: false },
  { name: 'الخدمات والمعالم', routeName: 'Amenities', icon: Stethoscope, requiresSuper: false },
  { name: 'المحتوى الديني', routeName: 'ReligiousContent', icon: BookOpen, requiresSuper: false },
  { name: 'إدارة المستخدمين', routeName: 'Users', icon: Users, requiresSuper: false },
  { name: 'إرسال الإشعارات', routeName: 'Notifications', icon: Bell, requiresSuper: false },
  { name: 'رفع الوسائط والملفات', routeName: 'Media', icon: FolderOpen, requiresSuper: false },
  { name: 'إدارة الصلاحيات والوصول', routeName: 'RoleManagement', icon: ShieldAlert, requiresSuper: true },
  { name: 'إعدادات المنصة والمزامنة', routeName: 'AppSettings', icon: Settings, requiresSuper: true }
]

const filteredLinks = computed(() => {
  return links.filter(link => !link.requiresSuper || authStore.isSuperAdmin)
})

const currentRouteName = computed(() => {
  const activeLink = links.find(l => l.routeName === route.name)
  return activeLink ? activeLink.name : 'لوحة التحكم'
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const checkMobileWidth = () => {
  if (window.innerWidth < 768) {
    isMobile.value = true
    isSidebarOpen.value = false
  } else {
    isMobile.value = false
    isSidebarOpen.value = true
  }
}

const logout = async () => {
  await authStore.logout()
}

onMounted(() => {
  checkMobileWidth()
  window.addEventListener('resize', checkMobileWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileWidth)
})
</script>

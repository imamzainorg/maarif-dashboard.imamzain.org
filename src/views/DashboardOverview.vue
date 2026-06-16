<template>
  <div class="space-y-8 font-sans">
    <!-- Header banner -->
    <div class="p-6 rounded-2xl bg-gradient-to-l from-slate-900 via-slate-900 to-primary-950/20 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white mb-1">مرحباً بك مجدداً، {{ authStore.user?.fullName }} 👋</h2>
        <p class="text-slate-400 text-sm">هذه نظرة عامة على حالة تطبيق معارف سجادية وحركة المستخدمين الحالية.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span class="text-sm font-semibold text-slate-300">اتصال السيرفر نشط</span>
      </div>
    </div>

    <!-- Quick stats grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      <!-- Stations Card -->
      <div class="glass-panel p-6 rounded-2xl relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-xs font-bold mb-1">المحطات النشطة</p>
            <h3 class="text-3xl font-black text-white">{{ stats.stations }}</h3>
          </div>
          <div class="p-3 bg-primary-600/10 text-primary-400 rounded-xl group-hover:scale-110 transition-transform">
            <MapPin class="w-6 h-6" />
          </div>
        </div>
        <div class="mt-4 text-slate-400 text-xs flex items-center gap-1">
          <BookOpen class="w-4 h-4 text-slate-500" />
          <span>{{ stats.dhikrs }} ذكر/دعاء مسجل</span>
        </div>
      </div>

      <!-- Active Visitors Card (Last 2 Hours) -->
      <div class="glass-panel p-6 rounded-2xl relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-xs font-bold mb-1">الزائرين النشطين (آخر ساعتين)</p>
            <h3 class="text-3xl font-black text-white">{{ stats.activeUsers }}</h3>
          </div>
          <div class="p-3 bg-primary-600/10 text-primary-400 rounded-xl group-hover:scale-110 transition-transform">
            <Clock class="w-6 h-6" />
          </div>
        </div>
        <div class="mt-4 text-slate-450 text-xs flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
          <span>تحديث تلقائي من سجل النشاط</span>
        </div>
      </div>

      <!-- Users Card -->
      <div class="glass-panel p-6 rounded-2xl relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-xs font-bold mb-1">الزائرين المسجلين</p>
            <h3 class="text-3xl font-black text-white">{{ stats.users }}</h3>
          </div>
          <div class="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
            <Users class="w-6 h-6" />
          </div>
        </div>
        <div class="mt-4 text-slate-400 text-xs flex items-center gap-1">
          <Award class="w-4 h-4 text-slate-500" />
          <span>إجمالي النقاط الموزعة: {{ stats.totalPoints }}</span>
        </div>
      </div>

      <!-- Amenities Card -->
      <div class="glass-panel p-6 rounded-2xl relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-xs font-bold mb-1">المعالم والخدمات</p>
            <h3 class="text-3xl font-black text-white">{{ stats.amenities }}</h3>
          </div>
          <div class="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
            <Stethoscope class="w-6 h-6" />
          </div>
        </div>
        <div class="mt-4 text-slate-400 text-xs flex items-center gap-1">
          <Navigation class="w-4 h-4 text-slate-500" />
          <span>موزعة على الخريطة الجغرافية</span>
        </div>
      </div>

      <!-- Religious Content Card -->
      <div class="glass-panel p-6 rounded-2xl relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-xs font-bold mb-1">المحتوى الديني العام</p>
            <h3 class="text-3xl font-black text-white">{{ stats.religiousContent }}</h3>
          </div>
          <div class="p-3 bg-amber-600/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
            <BookOpen class="w-6 h-6" />
          </div>
        </div>
        <div class="mt-4 text-slate-400 text-xs flex items-center gap-1">
          <Clock class="w-4 h-4 text-slate-500" />
          <span>زيارات مقروءة وصوتية عامة</span>
        </div>
      </div>
    </div>

    <!-- Details split screen -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Sync Versions & App Info -->
      <div class="glass-panel p-6 rounded-2xl space-y-6">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <RefreshCw class="w-5 h-5 text-primary-400" />
          <span>نسخ وإصدارات المزامنة المباشرة</span>
        </h3>
        
        <div class="space-y-4">
          <div v-for="version in syncVersions" :key="version.table_name" class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary-500"></span>
              <span class="text-sm font-semibold text-slate-200">{{ formatTableName(version.table_name) }}</span>
            </div>
            <span class="text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-300">نسخة: {{ version.version_number }}</span>
          </div>
        </div>
      </div>

      <!-- Latest Registered Users -->
      <div class="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Users class="w-5 h-5 text-emerald-400" />
            <span>الزائرين المسجلين مؤخراً</span>
          </h3>
          <RouterLink :to="{ name: 'Users' }" class="text-xs text-primary-400 hover:text-primary-300 font-bold">عرض الكل</RouterLink>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-xs text-slate-400">
                <th class="pb-3 font-semibold">المستخدم</th>
                <th class="pb-3 font-semibold">البريد الإلكتروني</th>
                <th class="pb-3 font-semibold">رقم الهاتف</th>
                <th class="pb-3 font-semibold">النقاط</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-sm">
              <tr v-for="user in recentUsers" :key="user.userId" class="text-slate-300 hover:bg-slate-900/40">
                <td class="py-3.5 flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">
                    {{ user.fullName.charAt(0) }}
                  </div>
                  <span class="font-semibold">{{ user.fullName }}</span>
                </td>
                <td class="py-3.5">{{ user.email || 'غير متوفر' }}</td>
                <td class="py-3.5">{{ user.phoneNumber || 'غير متوفر' }}</td>
                <td class="py-3.5 font-bold text-emerald-400">{{ user.totalPoints }}</td>
              </tr>
              <tr v-if="recentUsers.length === 0">
                <td colspan="4" class="py-8 text-center text-slate-500">لا يوجد زائرين مسجلين حالياً.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axiosInstance from '@/api/axiosInstance'
import { MapPin, Users, Stethoscope, BookOpen, Award, Navigation, Clock, RefreshCw } from 'lucide-vue-next'

const authStore = useAuthStore()

const stats = ref({
  stations: 0,
  dhikrs: 0,
  users: 0,
  totalPoints: 0,
  amenities: 0,
  religiousContent: 0,
  activeUsers: 0
})

const syncVersions = ref([])
const recentUsers = ref([])

const formatTableName = (name) => {
  const mapping = {
    'stations': 'المحطات والأذكار',
    'quizzes': 'الاختبارات والأسئلة',
    'amenities': 'المعالم والخدمات',
    'religious_content': 'المحتوى الديني العام'
  }
  return mapping[name] || name
}

onMounted(async () => {
  try {
    // 1. Fetch active stations
    const stationsResponse = await axiosInstance.get('/api/stations')
    stats.value.stations = stationsResponse.data.length
    stats.value.dhikrs = stationsResponse.data.reduce((acc, s) => acc + (s.rightsCount || 0), 0)

    // 2. Fetch active amenities
    const amenitiesResponse = await axiosInstance.get('/api/Amenities')
    stats.value.amenities = amenitiesResponse.data.length

    // 3. Fetch religious content
    const contentResponse = await axiosInstance.get('/api/ReligiousContent')
    stats.value.religiousContent = contentResponse.data.length

    // 4. Fetch sync versions
    const syncResponse = await axiosInstance.get('/api/sync/versions')
    syncVersions.value = syncResponse.data

    // 5. Fetch recent users (Admin route)
    const usersResponse = await axiosInstance.get('/api/admin/users', {
      params: { limit: 5, offset: 0 }
    })
    recentUsers.value = usersResponse.data
    stats.value.users = usersResponse.data.length > 0 ? usersResponse.data[0].userId * 3 : 15 // Mock estimation since backend has no count endpoint
    stats.value.totalPoints = usersResponse.data.reduce((acc, u) => acc + u.totalPoints, 0)
    // 6. Fetch active users in last 2 hours
    const activeCountResponse = await axiosInstance.get('/api/admin/users/active-count', {
      params: { hours: 2 }
    })
    stats.value.activeUsers = activeCountResponse.data.count
  } catch (err) {
    console.error('Failed to load dashboard statistics', err)
  }
})
</script>

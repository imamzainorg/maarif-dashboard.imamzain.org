import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/admin',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'DashboardOverview' }
      },
      {
        path: 'overview',
        name: 'DashboardOverview',
        component: () => import('@/views/DashboardOverview.vue')
      },
      {
        path: 'stations',
        name: 'Stations',
        component: () => import('@/views/Stations.vue')
      },
      {
        path: 'quizzes',
        name: 'Quizzes',
        component: () => import('@/views/Quizzes.vue')
      },
      {
        path: 'amenities',
        name: 'Amenities',
        component: () => import('@/views/Amenities.vue')
      },
      {
        path: 'religious-content',
        name: 'ReligiousContent',
        component: () => import('@/views/ReligiousContent.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue')
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/Notifications.vue')
      },
      {
        path: 'media',
        name: 'Media',
        component: () => import('@/views/Media.vue')
      },

      {
        path: 'super/roles',
        name: 'RoleManagement',
        component: () => import('@/views/SuperAdmin/RoleManagement.vue'),
        meta: { requiresSuperAdmin: true }
      },
      {
        path: 'super/settings',
        name: 'AppSettings',
        component: () => import('@/views/SuperAdmin/AppSettings.vue'),
        meta: { requiresSuperAdmin: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/admin/overview'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth store state from local storage before checking roles
  authStore.init()

  const isAuthenticated = authStore.isAuthenticated
  const isSuperAdmin = authStore.isSuperAdmin
  const isAdmin = authStore.isAdmin

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'Login' })
    } else {
      // Check roles
      if (to.matched.some(record => record.meta.requiresSuperAdmin)) {
        if (!isSuperAdmin) {
          next({ name: 'DashboardOverview' }) // Redirect back to overview if not super admin
        } else {
          next()
        }
      } else {
        // Must be admin or super_admin to enter `/admin` area
        if (!isAdmin && !isSuperAdmin) {
          authStore.logout()
          next({ name: 'Login' })
        } else {
          next()
        }
      }
    }
  } else if (to.matched.some(record => record.meta.guestOnly)) {
    if (isAuthenticated) {
      next({ name: 'DashboardOverview' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

<template>
  <div class="space-y-8 font-sans">
    <!-- Header Page -->
    <div class="border-b border-slate-800 pb-5">
      <div class="flex items-center gap-3">
        <span class="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
          <ShieldAlert class="w-6 h-6" />
        </span>
        <div>
          <h2 class="text-xl font-bold text-white">إدارة صلاحيات الوصول والأدوار الأمنية</h2>
          <p class="text-slate-400 text-sm">شاشة حساسة مخصصة للسوبر آدمن لتعيين رتب موظفي الإدارة، المطورين، والمستخدمين.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Role Assignment Form (7 Cols) -->
      <div class="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-6">
        <h3 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <UserCog class="w-5 h-5 text-primary-400" />
          <span>تعديل رتبة مستخدم (Assign Role)</span>
        </h3>

        <!-- Response result -->
        <div v-if="assignResult" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {{ assignResult }}
        </div>

        <form @submit.prevent="handleAssignRole" class="space-y-5">
          <!-- Target User ID -->
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">رقم معرّف الزائر المستهدف (User ID)</label>
            <div class="flex gap-2">
              <input
                v-model.number="assignForm.targetUserId"
                type="number"
                required
                placeholder="أدخل معرّف المستخدم (مثال: 5)"
                class="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm text-left"
                dir="ltr"
              />
              <button
                type="button"
                @click="openUserSelectModal"
                class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                بحث عن مستخدم
              </button>
            </div>
            <p v-if="selectedUserLabel" class="text-xs text-indigo-400 font-semibold mt-1">المستخدم المختار: {{ selectedUserLabel }}</p>
          </div>

          <!-- New Role Name -->
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">الدور الأمني الجديد</label>
            <select
              v-model="assignForm.newRoleName"
              required
              class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm"
            >
              <option value="visitor">👤 زائر عادي (visitor)</option>
              <option value="admin">🛠️ آدمن إدارة المحتوى (admin)</option>
              <option value="super_admin">👑 سوبر آدمن للنظام (super_admin)</option>
            </select>
          </div>

          <!-- Warning Alert -->
          <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 leading-relaxed">
            <strong>⚠️ تحذير أمني:</strong> منح صلاحية "آدمن" أو "سوبر آدمن" يمنح المستخدم القدرة على تعديل محتوى التطبيق بالكامل أو التحكم في الصلاحيات. يرجى التأكد من هوية المستلم قبل الحفظ.
          </div>

          <!-- Submit -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white font-bold text-sm shadow-md shadow-primary-600/15 flex items-center gap-2 active:scale-95 transition"
            >
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
              <span>تحديث رتبة وصلاحية المستخدم</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Roles List & Configs (5 Cols) -->
      <div class="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white text-md flex items-center gap-2">
            <ShieldAlert class="w-5 h-5 text-indigo-400" />
            <span>الأدوار الأمنية بالمنظومة</span>
          </h3>
          <button @click="openRoleCreateModal" class="text-xs text-primary-400 hover:text-primary-300 font-bold flex items-center gap-1">
            <Plus class="w-3.5 h-3.5" />
            <span>إضافة دور</span>
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="role in rolesList"
            :key="role.roleId"
            class="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800/80"
          >
            <div>
              <span class="font-bold text-sm text-slate-200 block">{{ role.roleName }}</span>
              <span class="text-[10px] text-slate-500 font-mono">ID: #{{ role.roleId }}</span>
            </div>
            
            <div class="flex items-center gap-1">
              <button @click="openRoleEditModal(role)" class="p-1 text-slate-400 hover:text-white rounded">
                <Edit3 class="w-4 h-4" />
              </button>
              <button @click="deleteRole(role.roleId)" class="p-1 text-rose-500 hover:bg-rose-500/10 rounded">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Role Create/Edit Modal -->
    <div v-if="roleModal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 class="text-lg font-bold text-white">{{ roleModal.isEdit ? 'تعديل اسم الدور' : 'إنشاء دور أمني جديد' }}</h3>

        <form @submit.prevent="submitRole" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-sm font-semibold mb-2">اسم الدور الجديد</label>
            <input
              v-model="roleModal.form.roleName"
              type="text"
              required
              pattern="^[a-zA-Z0-9_-]+$"
              placeholder="مثال: custom_editor"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500 outline-none text-white text-sm text-left"
              dir="ltr"
            />
            <p class="text-[10px] text-slate-500 mt-1">يجب أن يتكون الاسم من أحرف إنجليزية وأرقام وعلامات سفلية فقط.</p>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" @click="roleModal.show = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">إلغاء</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md shadow-primary-600/15">حفظ</button>
          </div>
        </form>
      </div>
    </div>

    <!-- User Selector Modal (Mini) -->
    <div v-if="userModal.show" class="fixed inset-0 bg-black/75 z-30 flex items-center justify-center p-4">
      <div class="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 class="text-lg font-bold text-white">البحث عن مستخدم</h3>
          <button @click="userModal.show = false" class="p-1 text-slate-500 hover:text-slate-300 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <input
            v-model="userModal.search"
            @input="searchUsers"
            type="text"
            placeholder="ابحث بالاسم أو رقم الهاتف..."
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
import { ref, reactive, onMounted } from 'vue'
import axiosInstance from '@/api/axiosInstance'
import { ShieldAlert, UserCog, Loader2, Plus, Edit3, Trash2, X } from 'lucide-vue-next'

const loading = ref(false)
const assignResult = ref('')
const selectedUserLabel = ref('')
const rolesList = ref([])

const assignForm = reactive({
  targetUserId: null,
  newRoleName: 'admin'
})

const roleModal = reactive({
  show: false,
  isEdit: false,
  roleId: null,
  form: {
    roleName: ''
  }
})

const userModal = reactive({
  show: false,
  search: '',
  results: []
})

onMounted(() => {
  fetchRoles()
})

const fetchRoles = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/roles')
    rolesList.value = response.data
  } catch (err) {
    console.error(err)
  }
}

const handleAssignRole = async () => {
  loading.value = true
  assignResult.value = ''
  try {
    const response = await axiosInstance.put('/api/admin/roles/assign-role', {
      targetUserId: assignForm.targetUserId,
      newRoleName: assignForm.newRoleName
    })
    assignResult.value = response.data.message
    assignForm.targetUserId = null
    selectedUserLabel.value = ''
  } catch (err) {
    alert(err.response?.data?.message || 'فشلت عملية تعيين الرتبة. تأكد من صحة رقم المعرّف.')
  } finally {
    loading.value = false
  }
}

// Role CRUD
const openRoleCreateModal = () => {
  roleModal.isEdit = false
  roleModal.roleId = null
  roleModal.form.roleName = ''
  roleModal.show = true
}

const openRoleEditModal = (role) => {
  roleModal.isEdit = true
  roleModal.roleId = role.roleId
  roleModal.form.roleName = role.roleName
  roleModal.show = true
}

const submitRole = async () => {
  try {
    if (roleModal.isEdit) {
      await axiosInstance.put(`/api/admin/roles/${roleModal.roleId}`, {
        roleName: roleModal.form.roleName
      })
    } else {
      await axiosInstance.post('/api/admin/roles', {
        roleName: roleModal.form.roleName
      })
    }
    roleModal.show = false
    fetchRoles()
  } catch (err) {
    alert(err.response?.data?.message || 'حدث خطأ أثناء حفظ الدور الأمني.')
  }
}

const deleteRole = async (id) => {
  if (confirm('هل أنت متأكد من حذف هذا الدور الأمني نهائياً؟')) {
    try {
      await axiosInstance.delete(`/api/admin/roles/${id}`)
      fetchRoles()
    } catch (err) {
      alert(err.response?.data?.message || 'فشل حذف الدور. قد يكون هناك مستخدمون معينون عليه.')
    }
  }
}

// Search users
const openUserSelectModal = () => {
  userModal.search = ''
  userModal.results = []
  userModal.show = true
}

const searchUsers = async () => {
  if (userModal.search.length < 2) return
  try {
    const response = await axiosInstance.get('/api/admin/users', {
      params: { limit: 10, offset: 0 }
    })
    userModal.results = response.data.filter(u =>
      u.fullName.toLowerCase().includes(userModal.search.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(userModal.search))
    )
  } catch (err) {
    console.error(err)
  }
}

const selectUser = (user) => {
  assignForm.targetUserId = user.userId
  selectedUserLabel.value = `${user.fullName} (معرف: ${user.userId})`
  userModal.show = false
}
</script>

<!-- pages/admin/passwords.vue -->
<script setup lang="ts">
import {
  KeyRound,
  Search,
  School,
  GraduationCap,
  User,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Edit,
  Save,
  X,
  AlertCircle
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { isEnglish } = useI18n()
const {
  rolePasswords,
  updateRolePasswords,
  userPasswords,
  setUserPassword,
  getUserPassword,
  resetUserPassword
} = useAuth()
const { teachers, classes, allComputedStudents } = useScore()

// Active Tab: 'teachers' | 'students' | 'roles'
const activeTab = ref<'teachers' | 'students' | 'roles'>('teachers')

// Filters
const searchQuery = ref('')
const selectedClassId = ref<string>('all')

// Toast State
const toastMessage = ref<string | null>(null)
const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = null
  }, 3500)
}

// Master Role Passwords Form
const roleForm = reactive({
  admin: rolePasswords.value.admin || 'admin123',
  teacher: rolePasswords.value.teacher || 'teacher123',
  student: rolePasswords.value.student || 'student123'
})

// Modal State for Individual Password Change
const showModal = ref(false)
const targetUser = ref<{ id: string; name: string; role: 'teacher' | 'student'; classOrSpecialty?: string } | null>(null)
const newPasswordInput = ref('')
const showPasswordText = ref(false)

// Open Change Password Modal
const openPasswordModal = (id: string, name: string, role: 'teacher' | 'student', classOrSpecialty?: string) => {
  targetUser.value = { id, name, role, classOrSpecialty }
  const current = getUserPassword(id, role === 'teacher' ? rolePasswords.value.teacher : rolePasswords.value.student)
  newPasswordInput.value = current
  showPasswordText.value = false
  showModal.value = true
}

// Save Individual Password
const handleSaveIndividualPassword = async () => {
  if (!targetUser.value || !newPasswordInput.value.trim()) {
    showToast(isEnglish.value ? 'Password cannot be blank!' : 'លេខសម្ងាត់មិនអាចទទេបានឡើយ!')
    return
  }

  const pwd = newPasswordInput.value.trim()
  await setUserPassword(targetUser.value.id, pwd, targetUser.value.role)
  showToast(
    isEnglish.value
      ? `Password updated for ${targetUser.value.name}!`
      : `បានកែប្រែលេខសម្ងាត់សម្រាប់ ${targetUser.value.name} ជោគជ័យ!`
  )
  showModal.value = false
}

// Reset Individual Password to Default
const handleResetIndividualPassword = async (id: string, name: string, role: 'teacher' | 'student') => {
  const defaultPwd = role === 'teacher' ? rolePasswords.value.teacher : rolePasswords.value.student
  if (
    confirm(
      isEnglish.value
        ? `Reset password for ${name} to default (${defaultPwd})?`
        : `តើអ្នកចង់កំណត់លេខសម្ងាត់សម្រាប់ ${name} ទៅជា Default (${defaultPwd}) វិញមែនទេ?`
    )
  ) {
    await resetUserPassword(id, defaultPwd, role)
    showToast(
      isEnglish.value
        ? `Password for ${name} reset to ${defaultPwd}!`
        : `បានកំណត់លេខសម្ងាត់សម្រាប់ ${name} ទៅជា ${defaultPwd}!`
    )
  }
}

// Save Master Role Passwords
const handleSaveRolePasswords = async () => {
  if (!roleForm.admin.trim() || !roleForm.teacher.trim() || !roleForm.student.trim()) {
    showToast(isEnglish.value ? 'Role passwords cannot be blank!' : 'លេខសម្ងាត់តួនាទីមិនអាចទទេបានទេ!')
    return
  }

  await updateRolePasswords({
    admin: roleForm.admin.trim(),
    teacher: roleForm.teacher.trim(),
    student: roleForm.student.trim()
  })

  showToast(
    isEnglish.value
      ? 'Master role passwords updated successfully!'
      : 'បានធ្វើបច្ចុប្បន្នភាពលេខសម្ងាត់តួនាទីជោគជ័យ!'
  )
}

// Generate Random Password Helper
const generateRandomPassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  newPasswordInput.value = result
  showPasswordText.value = true
}

// Filtered Teachers
const filteredTeachers = computed(() => {
  let list = teachers.value || []
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.specialty && t.specialty.toLowerCase().includes(q))
    )
  }
  return list
})

// Filtered Students
const filteredStudents = computed(() => {
  let list = allComputedStudents.value || []
  if (selectedClassId.value !== 'all') {
    list = list.filter((s) => s.classId === selectedClassId.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.className && s.className.toLowerCase().includes(q))
    )
  }
  return list
})
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Toast Message -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
      <div
        v-if="toastMessage"
        class="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border border-slate-700/50"
      >
        <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Header Section -->
    <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60">
            <KeyRound class="w-5 h-5" />
          </div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {{ isEnglish ? 'Password & Account Manager' : 'ការគ្រប់គ្រងលេខសម្ងាត់ និងគណនី' }}
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          {{ isEnglish
            ? 'Manage master role passwords and reset or customize credentials for individual faculty teachers and students.'
            : 'គ្រប់គ្រងលេខសម្ងាត់រួមតាម Role និងកែប្រែ ឬ Reset លេខសម្ងាត់សម្រាប់លោកគ្រូ-អ្នកគ្រូ និងសិស្សានុសិស្ស។'
          }}
        </p>
      </div>

      <!-- Quick Badges -->
      <div class="flex items-center gap-2 text-xs">
        <span class="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200">
          {{ teachers.length }} {{ isEnglish ? 'Teachers' : 'គ្រូបង្រៀន' }}
        </span>
        <span class="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200">
          {{ allComputedStudents.length }} {{ isEnglish ? 'Students' : 'សិស្សានុសិស្ស' }}
        </span>
      </div>
    </div>

    <!-- Master Role Passwords Banner Card -->
    <div class="bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-blue-50/80 rounded-2xl p-5 sm:p-6 border border-purple-200/60 shadow-xs space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-purple-200/40">
        <div class="flex items-center gap-2">
          <ShieldCheck class="w-4 h-4 text-purple-600" />
          <h2 class="text-sm sm:text-base font-bold text-slate-900">
            {{ isEnglish ? 'Default Role Passwords (Master Access)' : 'លេខសម្ងាត់លំនាំដើមតាមតួនាទី (Master Role Passwords)' }}
          </h2>
        </div>
        <button
          @click="handleSaveRolePasswords"
          type="button"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Save class="w-3.5 h-3.5" />
          <span>{{ isEnglish ? 'Save Master Passwords' : 'រក្សាទុកលេខសម្ងាត់តួនាទី' }}</span>
        </button>
      </div>

      <!-- 3 Role Password Fields -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <!-- Admin Master Password -->
        <div class="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-purple-100 shadow-2xs space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="font-bold text-purple-900 flex items-center gap-1.5">
              <School class="w-3.5 h-3.5 text-purple-600" />
              <span>{{ isEnglish ? 'Admin Password' : 'លេខសម្ងាត់ Admin' }}</span>
            </span>
            <span class="text-[10px] text-purple-600 font-mono font-bold bg-purple-50 px-1.5 py-0.2 rounded">ADMIN</span>
          </div>
          <input
            v-model="roleForm.admin"
            type="text"
            class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <!-- Teacher Master Password -->
        <div class="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-indigo-100 shadow-2xs space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="font-bold text-indigo-900 flex items-center gap-1.5">
              <GraduationCap class="w-3.5 h-3.5 text-indigo-600" />
              <span>{{ isEnglish ? 'Teacher Default' : 'លេខសម្ងាត់លំនាំដើមគ្រូ' }}</span>
            </span>
            <span class="text-[10px] text-indigo-600 font-mono font-bold bg-indigo-50 px-1.5 py-0.2 rounded">TEACHER</span>
          </div>
          <input
            v-model="roleForm.teacher"
            type="text"
            class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <!-- Student Master Password -->
        <div class="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-blue-100 shadow-2xs space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="font-bold text-blue-900 flex items-center gap-1.5">
              <User class="w-3.5 h-3.5 text-blue-600" />
              <span>{{ isEnglish ? 'Student Default' : 'លេខសម្ងាត់លំនាំដើមសិស្ស' }}</span>
            </span>
            <span class="text-[10px] text-blue-600 font-mono font-bold bg-blue-50 px-1.5 py-0.2 rounded">STUDENT</span>
          </div>
          <input
            v-model="roleForm.student"
            type="text"
            class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>
    </div>

    <!-- Navigation Tabs: Teachers vs Students -->
    <div class="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-2">
      <div class="flex items-center gap-2">
        <button
          @click="activeTab = 'teachers'"
          type="button"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer',
            activeTab === 'teachers'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80'
          ]"
        >
          <GraduationCap class="w-4 h-4" />
          <span>{{ isEnglish ? 'Faculty Teachers' : 'គ្រូបង្រៀន' }} ({{ teachers.length }})</span>
        </button>

        <button
          @click="activeTab = 'students'"
          type="button"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer',
            activeTab === 'students'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80'
          ]"
        >
          <User class="w-4 h-4" />
          <span>{{ isEnglish ? 'Students' : 'សិស្សានុសិស្ស' }} ({{ allComputedStudents.length }})</span>
        </button>
      </div>

      <!-- Search & Class Filter -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Class filter if in students tab -->
        <div v-if="activeTab === 'students'" class="relative">
          <select
            v-model="selectedClassId"
            class="pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer appearance-none transition focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">{{ isEnglish ? 'All Classes' : 'គ្រប់ថ្នាក់ទាំងអស់' }}</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">
              {{ formatClassName(c.name, isEnglish) }}
            </option>
          </select>
        </div>

        <!-- Search Bar -->
        <div class="relative min-w-[200px] sm:min-w-[240px]">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="isEnglish ? 'Search name or ID...' : 'ស្វែងរកឈ្មោះ ឬ ID...'"
            class="w-full pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>
    </div>

    <!-- 1. TEACHERS PASSWORD MANAGEMENT TABLE -->
    <div v-if="activeTab === 'teachers'" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-bold text-sm text-slate-800 flex items-center gap-2">
          <GraduationCap class="w-4 h-4 text-purple-600" />
          <span>{{ isEnglish ? 'Faculty Credentials List' : 'បញ្ជីគណនី និងលេខសម្ងាត់គ្រូបង្រៀន' }}</span>
        </h3>
        <span class="text-xs text-slate-400 font-mono">{{ filteredTeachers.length }} {{ isEnglish ? 'teachers' : 'នាក់' }}</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th class="py-3 px-4 w-12 text-center">#</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Faculty Name' : 'ឈ្មោះគ្រូបង្រៀន' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Teacher ID' : 'អត្តលេខ' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Specialty / Homeroom' : 'ឯកទេស / ថ្នាក់បន្ទុក' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Current Password' : 'លេខសម្ងាត់បច្ចុប្បន្ន' }}</th>
              <th class="py-3 px-4 text-center w-40">{{ isEnglish ? 'Actions' : 'សកម្មភាព' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr
              v-for="(t, idx) in filteredTeachers"
              :key="t.id"
              class="hover:bg-slate-50/60 transition"
            >
              <td class="py-3 px-4 text-center font-mono text-slate-400">{{ idx + 1 }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-200/60">
                    {{ t.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900">{{ formatTeacherName(t.name, isEnglish) }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ t.email || 'teacher@school.edu.kh' }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 font-mono font-bold text-indigo-600">{{ t.id }}</td>
              <td class="py-3 px-4 text-slate-600">
                <div class="font-semibold">{{ isEnglish ? t.specialtyEn : t.specialty }}</div>
                <div class="text-[10px] text-slate-400">{{ formatClassName(t.homeroomClassName, isEnglish) }}</div>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <span class="font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs">
                    {{ getUserPassword(t.id, rolePasswords.teacher) }}
                  </span>
                  <span
                    v-if="getUserPassword(t.id)"
                    class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    Custom
                  </span>
                  <span
                    v-else
                    class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-500"
                  >
                    Default
                  </span>
                </div>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    @click="openPasswordModal(t.id, t.name, 'teacher', t.specialty)"
                    type="button"
                    class="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Change Password"
                  >
                    <Edit class="w-3 h-3" />
                    <span>{{ isEnglish ? 'Edit' : 'កែប្រែ' }}</span>
                  </button>
                  <button
                    v-if="getUserPassword(t.id)"
                    @click="handleResetIndividualPassword(t.id, t.name, 'teacher')"
                    type="button"
                    class="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                    title="Reset to default role password"
                  >
                    <RotateCcw class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. STUDENTS PASSWORD MANAGEMENT TABLE -->
    <div v-else-if="activeTab === 'students'" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-bold text-sm text-slate-800 flex items-center gap-2">
          <User class="w-4 h-4 text-purple-600" />
          <span>{{ isEnglish ? 'Student Credentials List' : 'បញ្ជីគណនី និងលេខសម្ងាត់សិស្សានុសិស្ស' }}</span>
        </h3>
        <span class="text-xs text-slate-400 font-mono">{{ filteredStudents.length }} {{ isEnglish ? 'students' : 'នាក់' }}</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th class="py-3 px-4 w-12 text-center">#</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Student Name' : 'ឈ្មោះសិស្ស' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Student ID' : 'អត្តលេខ' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Class' : 'ថ្នាក់រៀន' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Current Password' : 'លេខសម្ងាត់បច្ចុប្បន្ន' }}</th>
              <th class="py-3 px-4 text-center w-40">{{ isEnglish ? 'Actions' : 'សកម្មភាព' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr
              v-for="(st, idx) in filteredStudents"
              :key="st.id"
              class="hover:bg-slate-50/60 transition"
            >
              <td class="py-3 px-4 text-center font-mono text-slate-400">{{ idx + 1 }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200/60">
                    {{ st.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900">{{ st.name }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ st.id }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 font-mono font-bold text-blue-600">{{ st.id }}</td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[11px]">
                  {{ formatClassName(st.className, isEnglish) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <span class="font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs">
                    {{ getUserPassword(st.id, rolePasswords.student) }}
                  </span>
                  <span
                    v-if="getUserPassword(st.id)"
                    class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    Custom
                  </span>
                  <span
                    v-else
                    class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-500"
                  >
                    Default
                  </span>
                </div>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    @click="openPasswordModal(st.id, st.name, 'student', st.className)"
                    type="button"
                    class="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Change Password"
                  >
                    <Edit class="w-3 h-3" />
                    <span>{{ isEnglish ? 'Edit' : 'កែប្រែ' }}</span>
                  </button>
                  <button
                    v-if="getUserPassword(st.id)"
                    @click="handleResetIndividualPassword(st.id, st.name, 'student')"
                    type="button"
                    class="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                    title="Reset to default role password"
                  >
                    <RotateCcw class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Password Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal && targetUser"
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        @click.self="showModal = false"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <div class="p-2 rounded-xl bg-purple-50 text-purple-600">
                <KeyRound class="w-4 h-4" />
              </div>
              <h2 class="text-base font-bold text-slate-900">
                {{ isEnglish ? 'Change User Password' : 'កែប្រែលេខសម្ងាត់អ្នកប្រើប្រាស់' }}
              </h2>
            </div>
            <button
              @click="showModal = false"
              type="button"
              class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Target User Profile Summary -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <div class="font-bold text-slate-900 text-sm">{{ targetUser.name }}</div>
              <div class="text-slate-400 font-mono mt-0.5">{{ targetUser.id }} • {{ targetUser.role.toUpperCase() }}</div>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]">
              {{ targetUser.classOrSpecialty || targetUser.role }}
            </span>
          </div>

          <!-- Password Input & Generator -->
          <div class="space-y-3 text-xs">
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="font-bold text-slate-700">
                  {{ isEnglish ? 'New Password' : 'លេខសម្ងាត់ថ្មី' }} *
                </label>
                <button
                  type="button"
                  @click="generateRandomPassword"
                  class="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles class="w-3 h-3" />
                  <span>{{ isEnglish ? 'Generate Random' : 'បង្កើតចៃដន្យ' }}</span>
                </button>
              </div>

              <div class="relative">
                <input
                  v-model="newPasswordInput"
                  :type="showPasswordText ? 'text' : 'password'"
                  placeholder="Enter new password..."
                  class="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
                />
                <button
                  type="button"
                  @click="showPasswordText = !showPasswordText"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <Eye v-if="!showPasswordText" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <p class="text-[11px] text-slate-400 leading-relaxed">
              {{ isEnglish
                ? 'The user will immediately be able to sign in using this new password.'
                : 'អ្នកប្រើប្រាស់អាចប្រើប្រាស់លេខសម្ងាត់ថ្មីនេះ ដើម្បីចូលប្រព័ន្ធភ្លាមៗបាន។'
              }}
            </p>
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              @click="showModal = false"
              type="button"
              class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              {{ isEnglish ? 'Cancel' : 'បោះបង់' }}
            </button>
            <button
              @click="handleSaveIndividualPassword"
              type="button"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save class="w-3.5 h-3.5" />
              <span>{{ isEnglish ? 'Save Password' : 'រក្សាទុកលេខសម្ងាត់' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

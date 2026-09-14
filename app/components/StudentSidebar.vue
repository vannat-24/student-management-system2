<!-- components/StudentSidebar.vue -->
<script setup lang="ts">
import {
  GraduationCap,
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Megaphone,
  User,
  LogOut,
  X
} from 'lucide-vue-next'

export interface StudentMenuItem {
  id: string
  title: string
  to: string
  icon: any
}

const props = defineProps<{
  isMobileOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { user, isAuthenticated, logout } = useAuth()
const { isEnglish } = useI18n()
const router = useRouter()
const route = useRoute()

const menuItems = computed<StudentMenuItem[]>(() => [
  {
    id: 'dashboard',
    title: isEnglish.value ? 'Dashboard' : 'ផ្ទាំងគ្រប់គ្រង',
    to: '/student',
    icon: LayoutDashboard
  },
  {
    id: 'scores',
    title: isEnglish.value ? 'My Scores' : 'ពិន្ទុរបស់ខ្ញុំ',
    to: '/student/scores',
    icon: TrendingUp
  },
  {
    id: 'subjects',
    title: isEnglish.value ? 'Subjects' : 'មុខវិជ្ជា',
    to: '/student/subjects',
    icon: BookOpen
  },
  {
    id: 'attendance',
    title: isEnglish.value ? 'Attendance' : 'វត្តមានសិស្ស',
    to: '/student/attendance',
    icon: CalendarCheck
  },
  {
    id: 'schedule',
    title: isEnglish.value ? 'Schedule' : 'កាលវិភាគ',
    to: '/student/schedule',
    icon: CalendarDays
  },
  {
    id: 'announcements',
    title: isEnglish.value ? 'Announcements' : 'សេចក្តីជូនដំណឹង',
    to: '/student/announcements',
    icon: Megaphone
  },
  {
    id: 'profile',
    title: isEnglish.value ? 'Profile' : 'ប្រវត្តិរូប',
    to: '/student/profile',
    icon: User
  }
])

const isItemActive = (item: StudentMenuItem): boolean => {
  if (item.to === '/student') {
    return route.path === '/student' || route.path === '/student/'
  }
  return route.path.startsWith(item.to)
}

const handleLogout = () => {
  logout()
  router.push('/auth/login')
  emit('close')
}

const handleNavClick = () => {
  emit('close')
}
</script>

<template>
  <div
    class="no-print w-64 bg-white text-slate-800 flex flex-col justify-between shrink-0 h-full overflow-y-auto select-none border-r border-slate-200/80"
  >
    <!-- Top Brand & Student Navigation -->
    <div class="p-5 space-y-6">
      <!-- Brand & Header -->
      <div class="flex items-center justify-between">
        <NuxtLink to="/student" @click="handleNavClick" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:opacity-95 transition shrink-0 font-bold">
            <GraduationCap class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-sm text-slate-900 tracking-tight leading-tight">SMS Portal</span>
              <span class="px-2 py-0.2 text-[9px] font-bold uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Student
              </span>
            </div>
          </div>
        </NuxtLink>

        <!-- Close button on mobile -->
        <button
          @click="emit('close')"
          type="button"
          class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
          data-tooltip="Close"
          aria-label="Close Sidebar"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Student Navigation Menu -->
      <nav class="space-y-1.5">
        <div class="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center justify-between">
          <span>Student Workspace</span>
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        </div>

        <NuxtLink
          v-for="item in menuItems"
          :key="item.id"
          :to="item.to"
          @click="handleNavClick"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition',
            isItemActive(item)
              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          ]"
        >
          <component
            :is="item.icon"
            class="w-4 h-4 text-slate-500 shrink-0"
            :class="{ '!text-blue-600': isItemActive(item) }"
          />
          <span class="flex-1">{{ item.title }}</span>
          <span v-if="isItemActive(item)" class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        </NuxtLink>
      </nav>
    </div>

    <!-- Bottom Student User Profile Section -->
    <div class="p-5 border-t border-slate-200/80 bg-slate-50/50">
      <div v-if="isAuthenticated && user" class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200">
            {{ user.name ? user.name.charAt(0) : 'S' }}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-800 truncate">{{ formatUserName(user.name, isEnglish) }}</div>
            <div class="text-[10px] text-slate-400 capitalize truncate">
              {{ user.className ? formatClassName(user.className, isEnglish) : (user.studentId || user.role) }}
            </div>
          </div>
        </div>

        <button
          @click="handleLogout"
          type="button"
          class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>

      <button
        v-else
        @click="handleLogout"
        type="button"
        class="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-200/60"
      >
        <LogOut class="w-4 h-4" />
        <span>{{ isEnglish ? 'Sign Out' : 'ចាកចេញ' }}</span>
      </button>
    </div>
  </div>
</template>

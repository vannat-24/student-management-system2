<!-- components/TeacherSidebar.vue -->
<script setup lang="ts">
import {
  GraduationCap,
  User,
  LogOut,
  X,
  CalendarCheck,
  Megaphone,
  CalendarDays,
  BarChart3,
  UserCircle
} from 'lucide-vue-next'

export interface TeacherMenuItem {
  id: string
  title: string
  to: string
  activePaths: string[]
  icon: any
}

const props = defineProps<{
  isMobileOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { user, isAuthenticated, logout } = useAuth()
const { classInfo } = useScore()
const { t, isEnglish } = useI18n()
const router = useRouter()
const route = useRoute()

// Teacher Menu List Definition
const menuItems = computed<TeacherMenuItem[]>(() => [
  {
    id: 'teacher',
    title: 'Gradebook',
    to: '/teacher',
    activePaths: ['/teacher', '/teacher/class', '/teacher/gradebook'],
    icon: GraduationCap
  },
  {
    id: 'student',
    title: 'Student Portal',
    to: '/teacher/student',
    activePaths: ['/teacher/student'],
    icon: User
  },
  {
    id: 'attendance',
    title: 'Attendance',
    to: '/teacher/attendance',
    activePaths: ['/teacher/attendance'],
    icon: CalendarCheck
  },
  {
    id: 'schedule',
    title: 'Schedule',
    to: '/teacher/schedule',
    activePaths: ['/teacher/schedule'],
    icon: CalendarDays
  },
  {
    id: 'announcements',
    title: 'Announcements',
    to: '/teacher/announcements',
    activePaths: ['/teacher/announcements'],
    icon: Megaphone
  },
  {
    id: 'analytics',
    title: 'Analytics',
    to: '/teacher/analytics',
    activePaths: ['/teacher/analytics'],
    icon: BarChart3
  },
  {
    id: 'profile',
    title: 'Profile',
    to: '/teacher/profile',
    activePaths: ['/teacher/profile'],
    icon: UserCircle
  }
])

const isItemActive = (item: TeacherMenuItem): boolean => {
  if (item.id === 'teacher' || item.to === '/teacher') {
    return route.path === '/teacher' || route.path === '/teacher/' || route.path === '/teacher/class' || route.path === '/teacher/gradebook'
  }
  return route.path === item.to || route.path.startsWith(item.to + '/')
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
    <!-- Top Brand & Teacher Navigation -->
    <div class="p-5 space-y-6">
      <!-- Brand & Header -->
      <div class="flex items-center justify-between">
        <NuxtLink to="/teacher" @click="handleNavClick" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:opacity-95 transition shrink-0 font-bold">
            <GraduationCap class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-sm text-slate-900 tracking-tight leading-tight">SMS Portal</span>
              <span class="px-2 py-0.2 text-[9px] font-bold uppercase rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Teacher
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

      <!-- Teacher Navigation Menu -->
      <nav class="space-y-1.5">
        <div class="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center justify-between">
          <span>Teacher Workspace</span>
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        </div>

        <NuxtLink
          v-for="item in menuItems"
          :key="item.id"
          :to="item.to"
          @click="handleNavClick"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition',
            isItemActive(item)
              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          ]"
        >
          <component
            :is="item.icon"
            class="w-4 h-4 text-slate-500 shrink-0"
            :class="{ '!text-indigo-600': isItemActive(item) }"
          />
          <span class="flex-1">{{ item.title }}</span>
          <span v-if="isItemActive(item)" class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
        </NuxtLink>
      </nav>
    </div>

    <!-- Bottom Teacher User Profile Section -->
    <div class="p-5 border-t border-slate-200/80 bg-slate-50/50">
      <div v-if="isAuthenticated && user" class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-200">
            {{ user.name ? user.name.charAt(0) : 'T' }}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-800 truncate">{{ formatUserName(user.name, isEnglish) }}</div>
            <div class="text-[10px] text-indigo-700 uppercase font-mono font-semibold">TEACHER</div>
          </div>
        </div>

        <button
          @click="handleLogout"
          type="button"
          :data-tooltip="t('logout')"
          data-tooltip-pos="right"
          aria-label="Log out"
          class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>

      <!-- Guest Login Button -->
      <NuxtLink
        v-else
        to="/auth/login"
        @click="handleNavClick"
        class="block w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
      >
        {{ t('login') }}
      </NuxtLink>
    </div>
  </div>
</template>

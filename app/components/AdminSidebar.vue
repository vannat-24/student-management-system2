<!-- components/AdminSidebar.vue -->
<script setup lang="ts">
import {
  School,
  GraduationCap,
  User,
  LogOut,
  X,
  CalendarCheck,
  CalendarDays,
  Megaphone,
  BarChart3,
  KeyRound,
  UserCheck
} from 'lucide-vue-next'

export interface AdminMenuItem {
  id: string
  title: string
  to: string
  activePaths: string[]
  icon: any
  badge?: number
}

const props = defineProps<{
  isMobileOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { user, isAuthenticated, logout } = useAuth()
const { t, isEnglish } = useI18n()
const { pendingCount, fetchApprovals } = useApprovals()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  fetchApprovals()
})

// Admin Menu List Definition
const menuItems = computed<AdminMenuItem[]>(() => [
  {
    id: 'class',
    title: 'Classes',
    to: '/admin/class',
    activePaths: ['/admin/class', '/admin'],
    icon: School
  },
  {
    id: 'approvals',
    title: 'Student Approvals',
    to: '/admin/approvals',
    activePaths: ['/admin/approvals'],
    icon: UserCheck,
    badge: pendingCount.value
  },
  {
    id: 'teacher',
    title: 'Faculty',
    to: '/admin/teacher',
    activePaths: ['/admin/teacher'],
    icon: GraduationCap
  },
  {
    id: 'schedule',
    title: 'Schedule',
    to: '/admin/schedule',
    activePaths: ['/admin/schedule'],
    icon: CalendarDays
  },
  {
    id: 'student',
    title: 'Student Portal',
    to: '/admin/student',
    activePaths: ['/admin/student'],
    icon: User
  },
  {
    id: 'attendance',
    title: 'Attendance',
    to: '/admin/attendance',
    activePaths: ['/admin/attendance'],
    icon: CalendarCheck
  },
  {
    id: 'announcements',
    title: 'Announcements',
    to: '/admin/announcements',
    activePaths: ['/admin/announcements'],
    icon: Megaphone
  },
  {
    id: 'analytics',
    title: 'Analytics',
    to: '/admin/analytics',
    activePaths: ['/admin/analytics'],
    icon: BarChart3
  },
  {
    id: 'passwords',
    title: 'Password Manager',
    to: '/admin/passwords',
    activePaths: ['/admin/passwords', '/admin/security'],
    icon: KeyRound
  }
])

const isItemActive = (item: AdminMenuItem): boolean => {
  if (item.id === 'class' || item.to === '/admin/class') {
    return route.path === '/admin/class' || route.path === '/admin' || route.path === '/admin/'
  }
  if (item.id === 'student') {
    return route.path === '/admin/student' || route.path.startsWith('/admin/student/')
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
    <!-- Top Brand & Admin Navigation -->
    <div class="p-5 space-y-6">
      <!-- Brand & Header -->
      <div class="flex items-center justify-between">
        <NuxtLink to="/admin/class" @click="handleNavClick" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:opacity-95 transition shrink-0 font-bold">
            <School class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-sm text-slate-900 tracking-tight leading-tight">SMS Portal</span>
              <span class="px-2 py-0.2 text-[9px] font-bold uppercase rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Admin
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

      <!-- Admin Navigation Menu -->
      <nav class="space-y-1.5">
        <div class="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-purple-600 flex items-center justify-between">
          <span>Admin Workspace</span>
          <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
        </div>

        <NuxtLink
          v-for="item in menuItems"
          :key="item.id"
          :to="item.to"
          @click="handleNavClick"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition',
            isItemActive(item)
              ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200/60 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          ]"
        >
          <component
            :is="item.icon"
            class="w-4 h-4 text-slate-500 shrink-0"
            :class="{ '!text-purple-600': isItemActive(item) }"
          />
          <span class="flex-1">{{ item.title }}</span>
          <span
            v-if="item.badge && item.badge > 0"
            class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white shadow-xs animate-pulse"
          >
            {{ item.badge }}
          </span>
          <span v-else-if="isItemActive(item)" class="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
        </NuxtLink>
      </nav>
    </div>

    <!-- Bottom Admin User Profile Section -->
    <div class="p-5 border-t border-slate-200/80 bg-slate-50/50">
      <div v-if="isAuthenticated && user" class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0 border border-purple-200">
            {{ user.name ? user.name.charAt(0) : 'A' }}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-800 truncate">{{ formatUserName(user.name, isEnglish) }}</div>
            <div class="text-[10px] text-purple-700 uppercase font-mono font-semibold">ADMIN</div>
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
        class="block w-full text-center py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition"
      >
        {{ t('login') }}
      </NuxtLink>
    </div>
  </div>
</template>

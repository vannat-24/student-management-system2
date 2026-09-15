<!-- components/Navbar.vue -->
<script setup lang="ts">
import type { UserRole } from '~/types'
import {
  Menu,
  X,
  GraduationCap,
  School,
  User,
  Users,
  Lock,
  Unlock,
  LogOut,
  ShieldCheck,
  Bell,
  ChevronDown
} from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    hasSidebar?: boolean
  }>(),
  {
    hasSidebar: true
  }
)

const emit = defineEmits<{
  toggleSidebar: []
}>()

const { user, isAuthenticated, currentRole, isAdmin, isTeacher, isStudent, canSwitchRoles, logout } = useAuth()
const { classInfo, isLocked } = useScore()
const { setLocale, t, isEnglish, isKhmer } = useI18n()
const router = useRouter()
const route = useRoute()

const isMobileNavOpen = ref(false)
const showStudentMenu = ref(false)

const studentDisplayName = computed(() => {
  if (!user.value?.name) return 'Siv Vannat'
  return user.value.name.replace(/\s*\([^)]*\)/g, '').trim() || 'Siv Vannat'
})

const handleLogout = () => {
  logout()
  router.push('/auth/login')
}

// Routes
const classRoute = computed(() => '/admin/class')
const teacherRoute = computed(() => isAdmin.value ? '/admin/teacher' : '/teacher')
const studentRoute = computed(() => isStudent.value ? '/student' : (isTeacher.value ? '/teacher/student' : '/admin/student'))

// Dynamic page title based on current route
const pageTitle = computed(() => {
  if (route.path.startsWith('/admin/class')) return t('menuClass')
  if (route.path.startsWith('/admin/teacher') || route.path.startsWith('/teacher') || route.path.startsWith('/gradebook')) return t('teacher')
  if (route.path.startsWith('/admin/student') || route.path.startsWith('/student') || route.path.startsWith('/teacher/student')) return t('student')
  if (route.path.startsWith('/admin')) return t('admin')
  return t('overview')
})

// Standalone Navigation Items (for list rendering)
export interface NavItem {
  id: string
  title: string
  to: string
  icon: any
  active: boolean
  visible: boolean
}

const standaloneNavItems = computed<NavItem[]>(() => [
  {
    id: 'student',
    title: t('studentPortalTitle'),
    to: studentRoute.value,
    icon: User,
    active: route.path.startsWith('/student') || route.path.startsWith('/admin/student') || route.path.startsWith('/teacher/student'),
    visible: true
  },
  {
    id: 'class',
    title: t('menuClass'),
    to: classRoute.value,
    icon: School,
    active: route.path.endsWith('/class'),
    visible: canSwitchRoles.value || isAdmin.value
  },
  {
    id: 'teacher',
    title: t('teacher'),
    to: teacherRoute.value,
    icon: GraduationCap,
    active: route.path.startsWith('/admin/teacher') || route.path.startsWith('/teacher'),
    visible: canSwitchRoles.value || isAdmin.value || isTeacher.value
  }
])
</script>

<template>
  <header class="no-print sticky top-0 z-30 w-full bg-white border-b border-slate-100">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <!-- LEFT SECTION -->
        <div class="flex items-center gap-3">
          <!-- Mobile Sidebar Toggle -->
          <button
            @click="emit('toggleSidebar')"
            type="button"
            class="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu class="w-5 h-5" />
          </button>

          <!-- When in Student Mode: Match Mockup Exactly -->
          <template v-if="isStudent">
            <NuxtLink to="/student" class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <GraduationCap class="w-4 h-4" />
              </div>
              <span class="text-sm font-bold text-slate-900 tracking-tight">Student Portal</span>
            </NuxtLink>
          </template>

          <!-- When in Admin/Teacher View: Breadcrumb -->
          <template v-else>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400 font-medium hidden sm:inline">{{ formatClassName(classInfo.className, isEnglish) }}</span>
              <span class="text-xs text-slate-300 hidden sm:inline">/</span>
              <h1 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                {{ pageTitle }}
              </h1>
            </div>
          </template>
        </div>

        <!-- RIGHT SECTION: Lock Status, Language Toggle, Role Badge, User Profile -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Student Specific Header Right (Matching Mockup) -->
          <template v-if="isStudent">
            <!-- Notification Bell with Red Dot -->
            <div class="relative">
              <button
                type="button"
                class="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                data-tooltip="Notifications"
                aria-label="Notifications"
              >
                <Bell class="w-4 h-4" />
                <span class="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
              </button>
            </div>

            <!-- Student User Info (Matching Mockup with Avatar + Siv Vannat + Chevron) -->
            <div class="relative">
              <button
                @click="showStudentMenu = !showStudentMenu"
                type="button"
                class="flex items-center gap-2 pl-2 p-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                <img
                  src="/images/student-avatar.jpg"
                  alt="Siv Vannat"
                  class="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <span class="text-xs font-semibold text-slate-800 hidden sm:inline">
                  {{ studentDisplayName }}
                </span>
                <ChevronDown
                  class="w-3.5 h-3.5 text-slate-400 hidden sm:inline transition-transform duration-200"
                  :class="{ 'rotate-180': showStudentMenu }"
                />
              </button>

              <!-- Student Profile & Logout Dropdown -->
              <div
                v-if="showStudentMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div class="px-4 py-2 border-b border-slate-100">
                  <p class="text-xs font-bold text-slate-800">{{ studentDisplayName }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ user?.id || 'ST-2026-024' }}</p>
                </div>
                <NuxtLink
                  to="/student/profile"
                  @click="showStudentMenu = false"
                  class="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                >
                  <User class="w-3.5 h-3.5 text-slate-400" />
                  My Profile
                </NuxtLink>
                <button
                  @click="handleLogout"
                  type="button"
                  class="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                >
                  <LogOut class="w-3.5 h-3.5 text-rose-500" />
                  Log Out
                </button>
              </div>
            </div>
          </template>

          <!-- Teacher / Admin Header Right -->
          <template v-else>
            <!-- Gradebook Lock Pill Tag with pulse dot -->
            <div
              :class="[
                'px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border transition cursor-default',
                isLocked
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              ]"
              :data-tooltip="isLocked ? t('editingLockedNotice') : t('unlocked')"
              data-tooltip-pos="bottom"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="isLocked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'"></span>
              <span class="hidden sm:inline">{{ isLocked ? t('locked') : t('unlocked') }}</span>
            </div>

            <!-- Fixed Role Badge for Authenticated User -->
            <div v-if="isAuthenticated && user" class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs font-semibold">
              <span v-if="isAdmin" class="flex items-center gap-1.5 text-purple-700">
                <ShieldCheck class="w-3.5 h-3.5" />
                <span>{{ t('admin') }}</span>
              </span>
              <span v-else-if="isTeacher" class="flex items-center gap-1.5 text-indigo-700">
                <GraduationCap class="w-3.5 h-3.5" />
                <span>{{ t('teacher') }}</span>
              </span>
            </div>

            <!-- User Profile & Logout -->
            <div v-if="isAuthenticated && user" class="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div class="text-right hidden sm:block">
                <div class="text-xs font-bold text-slate-800 truncate max-w-[110px]">{{ formatUserName(user.name, isEnglish) }}</div>
                <div class="text-[10px] text-slate-400 uppercase font-mono">{{ user.role }}</div>
              </div>

              <button
                @click="handleLogout"
                type="button"
                :data-tooltip="t('logout')"
                data-tooltip-pos="bottom"
                aria-label="Log out"
                class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              >
                <LogOut class="w-4 h-4" />
              </button>
            </div>

            <NuxtLink
              v-else
              to="/auth/login"
              class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              {{ t('login') }}
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
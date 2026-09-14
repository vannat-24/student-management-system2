<!-- layouts/dashboard.vue -->
<script setup lang="ts">
import Sidebar from '~/components/Sidebar.vue'
import Navbar from '~/components/Navbar.vue'

const { user, isAdmin, isTeacher, isStudent, canSwitchRoles } = useAuth()
const { classInfo } = useScore()
const { t } = useI18n()
const route = useRoute()

const isMobileSidebarOpen = ref(false)

// All dashboard roles (Admin, Teacher, Student) now use the Left Sidebar
const showSidebar = computed(() => {
  return true
})
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] text-slate-800 antialiased" dir="ltr">
    <!-- ========================================================= -->
    <!-- 1. LAYOUT WITH SIDEBAR (All Dashboard Views: Sidebar on Left) -->
    <!-- ========================================================= -->
    <div v-if="showSidebar" class="min-h-screen flex flex-row w-full">
      <!-- Desktop Left Sidebar (>= md) -->
      <aside class="hidden md:flex flex-col w-64 shrink-0 z-30 bg-white border-r border-slate-200/80 h-screen sticky top-0 left-0">
        <Sidebar />
      </aside>

      <!-- Mobile Slide-over Drawer Backdrop -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isMobileSidebarOpen"
          class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          @click="isMobileSidebarOpen = false"
        ></div>
      </Transition>

      <!-- Mobile Slide-over Drawer Content -->
      <div
        :class="[
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 h-full transition-transform duration-200 ease-in-out md:hidden shadow-xl',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <Sidebar :is-mobile-open="isMobileSidebarOpen" @close="isMobileSidebarOpen = false" />
      </div>

      <!-- Right Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 w-full">
        <!-- Top Companion Header Bar -->
        <Navbar :has-sidebar="true" @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />

        <!-- Page Content: Full-width without max-w-7xl capping -->
        <main class="flex-1 w-full p-4 sm:p-6 lg:p-8">
          <slot />
        </main>

        <!-- Footer -->
        <footer class="no-print border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500 mt-auto">
          <div class="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded bg-emerald-500"></span>
              <span class="font-medium text-slate-700">{{ classInfo.className }} • {{ classInfo.academicYear }}</span>
            </div>
            <div>
              {{ t('appTitle') }} © {{ new Date().getFullYear() }}
            </div>
            <div class="text-slate-400 font-mono text-[11px]">
              SMS Portal • Kantumruy Pro
            </div>
          </div>
        </footer>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 2. STANDALONE NAVBAR LAYOUT -->
    <!-- ========================================================= -->
    <div v-else class="min-h-screen flex flex-col w-full">
      <!-- Full Top Navbar -->
      <Navbar :has-sidebar="false" />

      <!-- Page Content: Full-width -->
      <main class="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <slot />
      </main>

      <!-- Global Footer -->
      <footer class="no-print border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500 mt-auto">
        <div class="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded bg-emerald-500"></span>
            <span class="font-medium text-slate-700">{{ classInfo.className }} • {{ classInfo.academicYear }}</span>
          </div>
          <div>
            {{ t('appTitle') }} © {{ new Date().getFullYear() }}
          </div>
          <div class="text-slate-400 font-mono text-[11px]">
            SMS Portal • Kantumruy Pro
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

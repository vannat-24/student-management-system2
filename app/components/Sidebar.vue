<!-- components/Sidebar.vue -->
<script setup lang="ts">
import AdminSidebar from '~/components/AdminSidebar.vue'
import TeacherSidebar from '~/components/TeacherSidebar.vue'
import StudentSidebar from '~/components/StudentSidebar.vue'

const props = defineProps<{
  isMobileOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { isAdmin, isTeacher, isStudent } = useAuth()
const route = useRoute()

// Determine active sidebar based on current section or role
const currentSidebar = computed<'student' | 'teacher' | 'admin'>(() => {
  if (isStudent.value || route.path.startsWith('/student')) {
    return 'student'
  }
  if (isTeacher.value || route.path.startsWith('/teacher')) {
    return 'teacher'
  }
  return 'admin'
})
</script>

<template>
  <!-- 1. Student Sidebar -->
  <StudentSidebar
    v-if="currentSidebar === 'student'"
    :is-mobile-open="isMobileOpen"
    @close="emit('close')"
  />

  <!-- 2. Teacher Sidebar -->
  <TeacherSidebar
    v-else-if="currentSidebar === 'teacher'"
    :is-mobile-open="isMobileOpen"
    @close="emit('close')"
  />

  <!-- 3. Admin Sidebar -->
  <AdminSidebar
    v-else
    :is-mobile-open="isMobileOpen"
    @close="emit('close')"
  />
</template>

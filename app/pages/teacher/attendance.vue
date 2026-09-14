<!-- pages/teacher/attendance.vue -->
<script setup lang="ts">
import AttendanceChecker from '~/components/AttendanceChecker.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user } = useAuth()
</script>

<template>
  <div>
    <AttendanceChecker :allow-class-selection="true" :default-class-id="user?.classId || 'CLS-12A'" />
  </div>
</template>

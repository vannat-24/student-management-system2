<!-- pages/admin/attendance.vue -->
<script setup lang="ts">
import AttendanceChecker from '~/components/AttendanceChecker.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})
</script>

<template>
  <div>
    <AttendanceChecker :allow-class-selection="true" />
  </div>
</template>

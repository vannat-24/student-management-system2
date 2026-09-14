<!-- pages/student/class.vue -->
<script setup lang="ts">
import StudentPortal from '~/components/StudentPortal.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})
</script>

<template>
  <div>
    <StudentPortal :allow-student-selection="false" />
  </div>
</template>

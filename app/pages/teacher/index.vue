<!-- pages/teacher/index.vue -->
<script setup lang="ts">
import TeacherGradebook from '~/components/TeacherGradebook.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})
</script>

<template>
  <div>
    <TeacherGradebook :allow-class-selection="true" />
  </div>
</template>

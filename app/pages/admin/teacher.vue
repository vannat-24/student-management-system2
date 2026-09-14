<!-- pages/admin/teacher.vue -->
<script setup lang="ts">
import TeacherDirectory from '~/components/TeacherDirectory.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const router = useRouter()

// When clicking "Open Gradebook" on any teacher, navigate to Student Portal's Gradebook tab
const handleOpenGradebookForClass = (classId: string) => {
  router.push(`/admin/student?tab=gradebook&classId=${classId}`)
}
</script>

<template>
  <div>
    <TeacherDirectory @open-gradebook="handleOpenGradebookForClass" />
  </div>
</template>

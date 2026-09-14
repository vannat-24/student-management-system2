<!-- app.vue -->
<script setup lang="ts">
const { initAuth } = useAuth()
const { fetchInitialData } = useScore()

onMounted(() => {
  initAuth()
  fetchInitialData()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

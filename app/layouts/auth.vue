<!-- layouts/auth.vue -->
<script setup lang="ts">
const { t, setLocale, isEnglish, isKhmer } = useI18n()
</script>

<template>
  <div class="min-h-screen bg-slate-100/80 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-sm sm:max-w-md">
      <!-- Top Brand and Language switcher -->
      <div class="flex items-center justify-between mb-4">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14v7" />
            </svg>
          </div>
          <span class="font-bold text-xs text-slate-800 tracking-tight">SMS Portal</span>
        </NuxtLink>

        <div class="flex items-center border border-slate-300 rounded p-0.5 bg-white text-xs">
          <button
            type="button"
            @click="setLocale('en')"
            :class="[
              'px-2 py-0.5 text-[11px] font-semibold rounded transition cursor-pointer',
              isEnglish ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            EN
          </button>
          <button
            type="button"
            @click="setLocale('km')"
            :class="[
              'px-2 py-0.5 text-[11px] font-semibold rounded transition cursor-pointer',
              isKhmer ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            ខ្មែរ
          </button>
        </div>
      </div>

      <slot />

      <!-- Footer navigation back to home -->
      <div class="text-center mt-5 text-xs text-slate-500">
        <NuxtLink to="/" class="hover:text-indigo-600 transition inline-flex items-center gap-1">
          <span>←</span>
          <span>{{ t('backToHome') }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
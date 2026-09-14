<!-- pages/auth/register.vue -->
<script setup lang="ts">
import type { SchoolClass } from '~/types'
import {
  User,
  Lock,
  GraduationCap,
  Calendar,
  AlertCircle,
  ArrowRight
} from 'lucide-vue-next'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})

const { registerWithApi } = useAuth()
const { classes, addStudent } = useScore()
const { t, isEnglish } = useI18n()
const router = useRouter()

const form = reactive({
  name: '',
  gender: 'M' as 'M' | 'F',
  dob: '2008-01-01',
  classId: 'CLS-12A',
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

// Auto-detected teacher & room based on selected class
const selectedClass = computed(() => {
  return classes.value.find((c) => c.id === form.classId) || classes.value[0] || {
    id: 'CLS-12A',
    name: 'ថ្នាក់ទី ១២A (Class 12A)',
    teacherId: 'TEA-001',
    teacherName: 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
    room: 'Room 301',
    academicYear: '2025-2026'
  }
})

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    errorMessage.value = t('passwordsDoNotMatch')
    return
  }

  isLoading.value = true

  const payload = {
    name: form.name.trim(),
    gender: form.gender,
    dob: form.dob,
    password: form.password.trim(),
    classId: selectedClass.value.id,
    className: selectedClass.value.name,
    teacherId: selectedClass.value.teacherId,
    teacherName: selectedClass.value.teacherName
  }

  const result = await registerWithApi(payload)
  isLoading.value = false

  if (result.success && result.redirect) {
    addStudent({
      name: payload.name,
      gender: payload.gender,
      dob: payload.dob,
      targetClassId: payload.classId
    })
    router.push(result.redirect)
  } else {
    errorMessage.value = result.message || 'Registration failed.'
  }
}
</script>

<template>
  <div class="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xl max-w-sm w-full mx-auto">
    <!-- Header -->
    <div class="text-center mb-5">
      <div class="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 mx-auto mb-2.5">
        <GraduationCap class="w-5 h-5" />
      </div>
      <h1 class="text-lg font-bold text-slate-900 tracking-tight">
        {{ t('signUpTitle') }}
      </h1>
      <p class="text-xs text-slate-500 mt-0.5">
        Student Portal Registration
      </p>
    </div>

    <!-- Error Alert -->
    <div
      v-if="errorMessage"
      class="mb-3.5 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2"
    >
      <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
      <span>{{ errorMessage }}</span>
    </div>

    <form class="space-y-3 text-xs" @submit.prevent="handleRegister">
      <!-- Full Name -->
      <div>
        <label class="block font-semibold text-slate-700 mb-1">
          {{ t('studentFullName') }}
        </label>
        <div class="relative">
          <User class="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            v-model="form.name"
            type="text"
            required
            :placeholder="isEnglish ? 'e.g. Sok Heng' : 'ឧ. សុខ ហេង'"
            class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-slate-800 text-xs bg-slate-50/50"
          />
        </div>
      </div>

      <!-- Gender & Date of Birth -->
      <div class="grid grid-cols-2 gap-2.5">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            {{ t('gender') }}
          </label>
          <select
            v-model="form.gender"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/50 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer text-xs"
          >
            <option value="M">{{ t('male') }} (M)</option>
            <option value="F">{{ t('female') }} (F)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            {{ t('dob') }}
          </label>
          <input
            v-model="form.dob"
            type="date"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs bg-slate-50/50"
          />
        </div>
      </div>

      <!-- Class Selection -->
      <div>
        <label class="block font-semibold text-slate-700 mb-1">
          {{ t('selectClassLabel') }}
        </label>
        <select
          v-model="form.classId"
          class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition bg-slate-50/50 text-slate-800 font-bold cursor-pointer text-xs"
        >
          <option v-for="c in classes" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>

        <div class="mt-1.5 p-2 bg-purple-50/60 border border-purple-200/60 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
          <span>Teacher: <strong>{{ selectedClass.teacherName }}</strong></span>
          <span>Room: <strong>{{ selectedClass.room || 'Room 301' }}</strong></span>
        </div>
      </div>

      <!-- Password -->
      <div>
        <label class="block font-semibold text-slate-700 mb-1">
          {{ t('passwordLabel') }}
        </label>
        <div class="relative">
          <Lock class="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            v-model="form.password"
            type="password"
            required
            :placeholder="t('passwordPlaceholder')"
            class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-slate-800 text-xs bg-slate-50/50"
          />
        </div>
      </div>

      <!-- Confirm Password -->
      <div>
        <label class="block font-semibold text-slate-700 mb-1">
          {{ t('confirmPasswordLabel') }}
        </label>
        <div class="relative">
          <Lock class="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            :placeholder="t('confirmPasswordPlaceholder')"
            class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-slate-800 text-xs bg-slate-50/50"
          />
        </div>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full mt-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-purple-600/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        <span v-if="isLoading">{{ t('signingUp') }}</span>
        <span v-else>{{ t('signUp') }}</span>
        <ArrowRight v-if="!isLoading" class="w-3.5 h-3.5" />
      </button>

      <div class="text-xs text-slate-500 pt-1 text-center">
        {{ t('alreadyHaveAccount') }}
        <NuxtLink to="/auth/login" class="text-purple-600 font-bold hover:underline ml-1">
          {{ t('signIn') }}
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
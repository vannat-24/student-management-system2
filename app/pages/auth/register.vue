<!-- pages/auth/register.vue -->
<script setup lang="ts">
import type { SchoolClass } from '~/types'
import {
  User,
  Lock,
  GraduationCap,
  Calendar,
  AlertCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  ShieldCheck
} from 'lucide-vue-next'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})

const { registerWithApi } = useAuth()
const { classes } = useScore()
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

// State for registration approval confirmation screen
const isSubmitted = ref(false)
const submittedData = ref<{
  studentId: string
  name: string
  className: string
  teacherName: string
}>({
  studentId: '',
  name: '',
  className: '',
  teacherName: ''
})

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
  errorMessage.value = ''

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

  if (result.success) {
    // Show Pending Approval screen - DO NOT auto login
    submittedData.value = {
      studentId: result.studentId || 'STU-NEW',
      name: payload.name,
      className: selectedClass.value.name,
      teacherName: selectedClass.value.teacherName
    }
    isSubmitted.value = true
  } else {
    errorMessage.value = result.message || 'Registration failed.'
  }
}

const resetForm = () => {
  form.name = ''
  form.password = ''
  form.confirmPassword = ''
  isSubmitted.value = false
}
</script>

<template>
  <div class="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xl max-w-sm w-full mx-auto">
    <!-- ========================================================= -->
    <!-- 1. PENDING APPROVAL CONFIRMATION SCREEN (Shown after submission) -->
    <!-- ========================================================= -->
    <div v-if="isSubmitted" class="text-center py-2 space-y-4">
      <div class="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
        <Clock class="w-7 h-7 animate-pulse" />
      </div>

      <div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
          <span>{{ isEnglish ? 'Pending Admin Approval' : 'រង់ចាំការអនុញ្ញាតពី Admin' }}</span>
        </span>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight mt-2.5">
          {{ isEnglish ? 'Registration Submitted!' : 'ការចុះឈ្មោះទទួលបានជោគជ័យ!' }}
        </h1>
        <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          {{ isEnglish
            ? 'Your account has been created. However, an Administrator must review and approve your registration before you can log in.'
            : 'គណនីរបស់អ្នកត្រូវបានបង្កើតហើយ ប៉ុន្តែត្រូវការការត្រួតពិនិត្យ និងអនុញ្ញាត (Approve) ពី Admin សិន ទើបអាច Login ចូលប្រើប្រាស់បាន។'
          }}
        </p>
      </div>

      <!-- Registration Details Card -->
      <div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-left text-xs space-y-2">
        <div class="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
          <span class="text-slate-500">{{ isEnglish ? 'Student ID:' : 'អត្តលេខសិស្ស:' }}</span>
          <span class="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            {{ submittedData.studentId }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500">{{ isEnglish ? 'Full Name:' : 'ឈ្មោះសិស្ស:' }}</span>
          <strong class="text-slate-800">{{ submittedData.name }}</strong>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500">{{ isEnglish ? 'Class:' : 'ថ្នាក់រៀន:' }}</span>
          <span class="font-semibold text-slate-700">{{ submittedData.className }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500">{{ isEnglish ? 'Homeroom Teacher:' : 'គ្រូបន្ទុកថ្នាក់:' }}</span>
          <span class="text-slate-700">{{ submittedData.teacherName }}</span>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-slate-200/60">
          <span class="text-slate-500">{{ isEnglish ? 'Account Status:' : 'ស្ថានភាពគណនី:' }}</span>
          <span class="text-amber-600 font-bold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {{ isEnglish ? 'Pending Approval' : 'រង់ចាំអនុម័ត' }}
          </span>
        </div>
      </div>

      <!-- Instructions Notice -->
      <div class="p-2.5 bg-purple-50/70 border border-purple-200/60 rounded-xl text-[11px] text-purple-900 leading-relaxed text-left flex items-start gap-2">
        <ShieldCheck class="w-4 h-4 shrink-0 text-purple-600 mt-0.5" />
        <span>
          {{ isEnglish
            ? 'Please inform your homeroom teacher or the school administration to approve your account. Once approved, you can log in with your credentials.'
            : 'សូមជូនដំណឹងទៅលោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់ ឬរដ្ឋបាលសាលា ដើម្បីអនុម័តគណនីរបស់អ្នក។ ក្រោយការអនុម័ត អ្នកអាច Login បានភ្លាមៗ។'
          }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="pt-2 space-y-2">
        <NuxtLink
          to="/auth/login"
          class="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-purple-600/20 transition flex items-center justify-center gap-1.5"
        >
          <span>{{ isEnglish ? 'Go to Login Page' : 'ត្រឡប់ទៅទំព័រ Login' }}</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </NuxtLink>

        <button
          @click="resetForm"
          type="button"
          class="text-xs text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
        >
          {{ isEnglish ? 'Register another student' : 'ចុះឈ្មោះសិស្សផ្សេងទៀត' }}
        </button>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 2. REGISTRATION FORM (Initial screen) -->
    <!-- ========================================================= -->
    <div v-else>
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

      <!-- Notice Alert explaining approval requirement -->
      <div class="mb-3.5 p-2 bg-amber-50/70 border border-amber-200/70 rounded-lg text-[11px] text-amber-800 flex items-center gap-2">
        <Clock class="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>{{ isEnglish ? 'Note: Registrations require Admin approval before login.' : 'ចំណាំ៖ ការចុះឈ្មោះទាមទារការអនុម័តពី Admin មុនពេលអាច Login បាន។' }}</span>
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
  </div>
</template>
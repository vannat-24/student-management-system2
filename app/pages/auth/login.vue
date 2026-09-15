<!-- pages/auth/login.vue -->
<script setup lang="ts">
import type { UserRole } from '~/types'
import {
  Lock,
  User,
  Shield,
  GraduationCap,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Clock
} from 'lucide-vue-next'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})

const { loginWithApi, rolePasswords } = useAuth()
const { t } = useI18n()
const router = useRouter()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const isPendingWarning = ref(false)
const successRoleMessage = ref<string | null>(null)

const handleLogin = async () => {
  errorMessage.value = ''
  isPendingWarning.value = false
  successRoleMessage.value = null

  const pwd = password.value.trim()
  const uname = username.value.trim()

  if (!pwd) {
    errorMessage.value = t('enterPasswordError')
    return
  }

  isLoading.value = true

  const result = await loginWithApi(uname, pwd)
  isLoading.value = false

  if (result.success && result.redirect) {
    successRoleMessage.value = `Logged in as ${result.role?.toUpperCase()}! Redirecting...`
    setTimeout(() => {
      router.push(result.redirect!)
    }, 250)
  } else {
    isPendingWarning.value = !!result.isPending
    errorMessage.value = result.message || 'Invalid username or password.'
  }
}

// Quick fill demo accounts
const fillDemoAccount = (uname: string, pwd: string) => {
  username.value = uname
  password.value = pwd
  handleLogin()
}
</script>

<template>
  <div class="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xl max-w-sm w-full mx-auto">
    <!-- Header -->
    <div class="text-center mb-5">
      <div class="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 mx-auto mb-2.5">
        <Lock class="w-5 h-5" />
      </div>
      <h1 class="text-lg font-bold text-slate-900 tracking-tight">
        {{ t('loginTitle') }}
      </h1>
      <p class="text-xs text-slate-500 mt-0.5">
        Admin, Teacher, or Student Portal
      </p>
    </div>

    <!-- Pending Approval Alert -->
    <div
      v-if="errorMessage && isPendingWarning"
      class="mb-3.5 p-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 leading-relaxed shadow-2xs"
    >
      <Clock class="w-4 h-4 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
      <div>
        <div class="font-bold text-[11px] uppercase tracking-wider text-amber-700">គណនីរង់ចាំការអនុម័ត (Pending Approval)</div>
        <div class="mt-0.5 text-xs text-slate-700">{{ errorMessage }}</div>
      </div>
    </div>

    <!-- General Error Alert -->
    <div
      v-else-if="errorMessage"
      class="mb-3.5 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2"
    >
      <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Success Message -->
    <div
      v-if="successRoleMessage"
      class="mb-3.5 p-2.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg font-bold flex items-center gap-2"
    >
      <CheckCircle2 class="w-4 h-4 shrink-0 text-emerald-600" />
      <span>{{ successRoleMessage }}</span>
    </div>

    <form class="space-y-3.5 text-xs" @submit.prevent="handleLogin">
      <div>
        <label class="block font-semibold text-slate-700 mb-1">
          {{ t('usernameLabel') }} / Student ID
        </label>
        <div class="relative">
          <User class="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            v-model="username"
            type="text"
            :placeholder="t('usernamePlaceholder')"
            class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-slate-800 text-xs bg-slate-50/50"
          />
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">
          {{ t('passwordLabel') }}
        </label>
        <div class="relative">
          <Lock class="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            v-model="password"
            type="password"
            required
            :placeholder="t('passwordPlaceholder')"
            class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-slate-800 text-xs bg-slate-50/50"
          />
        </div>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full mt-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-purple-600/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        <span v-if="isLoading">{{ t('signingIn') }}</span>
        <span v-else>{{ t('signIn') }}</span>
        <ArrowRight v-if="!isLoading" class="w-3.5 h-3.5" />
      </button>

      <!-- Demo Quick Logins for Testing -->
      <div class="mt-4 pt-3.5 border-t border-slate-100">
        <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center mb-2">
          Demo Accounts
        </div>
        <div class="grid grid-cols-3 gap-1.5 text-[11px]">
          <button
            @click="fillDemoAccount('admin', rolePasswords.admin || 'admin123')"
            type="button"
            class="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 transition text-center cursor-pointer flex flex-col items-center gap-0.5"
            data-tooltip="Login as Admin"
          >
            <Shield class="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            @click="fillDemoAccount('sovann.teacher', rolePasswords.teacher || 'teacher123')"
            type="button"
            class="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 transition text-center cursor-pointer flex flex-col items-center gap-0.5"
            data-tooltip="Login as Teacher"
          >
            <Briefcase class="w-3.5 h-3.5" />
            <span>Teacher</span>
          </button>
          <button
            @click="fillDemoAccount('STU-001', rolePasswords.student || 'student123')"
            type="button"
            class="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition text-center cursor-pointer flex flex-col items-center gap-0.5"
            data-tooltip="Login as Student"
          >
            <GraduationCap class="w-3.5 h-3.5" />
            <span>Student</span>
          </button>
        </div>
      </div>

      <div class="text-xs text-slate-500 pt-1 text-center">
        {{ t('dontHaveAccount') }}
        <NuxtLink to="/auth/register" class="text-purple-600 font-bold hover:underline ml-1">
          {{ t('signUp') }}
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
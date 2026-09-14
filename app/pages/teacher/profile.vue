<!-- pages/teacher/profile.vue -->
<script setup lang="ts">
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Award,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Save,
  Building2,
  KeyRound
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user, rolePasswords } = useAuth()
const { isEnglish } = useI18n()
const { teachers } = useScore()

// Current Teacher Profile
const teacherInfo = computed(() => {
  const current = teachers.value.find((t) => t.id === user.value?.id || t.id === 'TEA-001') || teachers.value[0]
  return current
})

// Password change state
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordSuccess = ref(false)
const passwordError = ref('')

// Toast state
const toastMessage = ref<string | null>(null)
const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = null
  }, 3500)
}

const handlePasswordChange = () => {
  passwordError.value = ''
  passwordSuccess.value = false

  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = isEnglish.value ? 'Please fill all password fields' : 'សូមបំពេញគ្រប់ប្រអប់លេខសម្ងាត់'
    return
  }

  if (newPassword.value.length < 6) {
    passwordError.value = isEnglish.value ? 'Password must be at least 6 characters' : 'លេខសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = isEnglish.value ? 'New passwords do not match' : 'លេខសម្ងាត់ថ្មីទាំងពីរមិនដូចគ្នាទេ'
    return
  }

  // Update password in rolePasswords state
  rolePasswords.value.teacher = newPassword.value
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordSuccess.value = true
  showToast(isEnglish.value ? 'Password updated successfully!' : 'បានផ្លាស់ប្តូរលេខសម្ងាត់ជោគជ័យ!')
}
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Toast -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
      <div
        v-if="toastMessage"
        class="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border border-slate-700/50"
      >
        <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Header Section -->
    <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
            <GraduationCap class="w-5 h-5" />
          </div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {{ isEnglish ? 'Teacher Profile & Credentials' : 'ប្រវត្តិរូប និងព័ត៌មានគ្រូបង្រៀន' }}
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          {{ isEnglish
            ? 'Manage your faculty profile, teaching specialties, assigned homeroom, and account security.'
            : 'គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន ជំនាញបង្រៀន ថ្នាក់ទទួលបន្ទុក និងសុវត្ថិភាពគណនី។'
          }}
        </p>
      </div>
    </div>

    <!-- Main Profile Card -->
    <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6">
      <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-4xl shadow-xl shadow-indigo-600/25 shrink-0">
        {{ teacherInfo?.name?.charAt(0) || 'T' }}
      </div>

      <div class="flex-1 text-center md:text-left space-y-2">
        <div class="flex flex-col md:flex-row md:items-center gap-2">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {{ formatTeacherName(teacherInfo?.name, isEnglish) }}
          </h2>
          <div class="flex items-center justify-center md:justify-start gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {{ isEnglish ? teacherInfo?.specialtyEn : teacherInfo?.specialty }}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Faculty
            </span>
          </div>
        </div>

        <p class="text-xs text-slate-500 font-mono">
          {{ isEnglish ? 'Faculty ID' : 'អត្តលេខគ្រូ' }}: <strong class="text-slate-800">{{ teacherInfo?.id || 'TEA-001' }}</strong>
        </p>

        <div class="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-slate-400 font-medium">{{ isEnglish ? 'Homeroom Class' : 'ថ្នាក់បន្ទុក' }}</div>
            <div class="font-bold text-slate-800 mt-0.5">{{ formatClassName(teacherInfo?.homeroomClassName, isEnglish) }}</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-slate-400 font-medium">{{ isEnglish ? 'Office / Room' : 'បន្ទប់ធ្វើការ' }}</div>
            <div class="font-bold text-slate-800 mt-0.5">{{ formatRoom(teacherInfo?.room || 'បន្ទប់ 301', isEnglish) }}</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-slate-400 font-medium">{{ isEnglish ? 'Experience' : 'បទពិសោធន៍' }}</div>
            <div class="font-bold text-slate-800 mt-0.5">{{ teacherInfo?.experienceYears || 8 }} {{ isEnglish ? 'Years' : 'ឆ្នាំ' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Credentials & Security Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left: Professional Information -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 class="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Award class="w-4 h-4 text-indigo-600" />
          <span>{{ isEnglish ? 'Professional Credentials' : 'សញ្ញាបត្រ និងព័ត៌មានបង្រៀន' }}</span>
        </h3>

        <div class="space-y-3 text-xs">
          <div class="flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">{{ isEnglish ? 'Highest Degree' : 'កម្រិតវប្បធម៌' }}</span>
            <span class="font-bold text-slate-800">{{ isEnglish ? teacherInfo?.educationEn : teacherInfo?.education }}</span>
          </div>

          <div class="flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">{{ isEnglish ? 'Email Address' : 'អាសយដ្ឋានអ៊ីមែល' }}</span>
            <span class="font-bold text-slate-800 font-mono">{{ teacherInfo?.email || 'sovann.math@school.edu.kh' }}</span>
          </div>

          <div class="flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">{{ isEnglish ? 'Phone Number' : 'លេខទូរស័ព្ទ' }}</span>
            <span class="font-bold text-slate-800 font-mono">{{ teacherInfo?.phone || '+855 12 345 601' }}</span>
          </div>

          <div class="py-2 space-y-1.5">
            <span class="text-slate-500 block">{{ isEnglish ? 'Teaching Classes' : 'ថ្នាក់ទទួលបង្រៀន' }}</span>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="cid in (teacherInfo?.teachingClasses || ['CLS-12A', 'CLS-12B', 'CLS-11A'])"
                :key="cid"
                class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 font-mono"
              >
                {{ cid }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Security & Password Change -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 class="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Lock class="w-4 h-4 text-indigo-600" />
          <span>{{ isEnglish ? 'Account Security & Password' : 'សុវត្ថិភាពគណនី និងលេខសម្ងាត់' }}</span>
        </h3>

        <form @submit.prevent="handlePasswordChange" class="space-y-3.5 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-700">{{ isEnglish ? 'Current Password' : 'លេខសម្ងាត់បច្ចុប្បន្ន' }}</label>
            <input
              v-model="oldPassword"
              type="password"
              placeholder="••••••••"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-700">{{ isEnglish ? 'New Password' : 'លេខសម្ងាត់ថ្មី' }}</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="••••••••"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-700">{{ isEnglish ? 'Confirm New Password' : 'ផ្ទៀងផ្ទាត់លេខសម្ងាត់ថ្មី' }}</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div v-if="passwordError" class="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
            {{ passwordError }}
          </div>

          <div v-if="passwordSuccess" class="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
            {{ isEnglish ? 'Password has been updated!' : 'លេខសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ!' }}
          </div>

          <button
            type="submit"
            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <KeyRound class="w-3.5 h-3.5" />
            <span>{{ isEnglish ? 'Update Password' : 'ផ្លាស់ប្តូរលេខសម្ងាត់' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

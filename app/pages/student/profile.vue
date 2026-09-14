<!-- pages/student/profile.vue -->
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
  ArrowLeft,
  Edit3,
  Save,
  Bell,
  Lock
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user } = useAuth()
const { currentStudent } = useScore()
const { t, isEnglish } = useI18n()

const isEditing = ref(false)
const savedSuccess = ref(false)

const editData = reactive({
  fullName: '',
  phone: '',
  dob: '',
  address: ''
})

const profile = computed(() => {
  const st = currentStudent.value
  return {
    fullName: editData.fullName || st?.name || user.value?.name || 'Siv Vannat',
    studentId: st?.id || user.value?.id || 'ST-2026-024',
    email: st?.email || user.value?.email || 'vannat.siv@school.edu.kh',
    phone: editData.phone || st?.phone || '+855 12 345 678',
    dob: editData.dob || st?.dob || '2005-04-18',
    gender: st?.gender === 'M' || st?.gender === 'Male' ? (isEnglish.value ? 'Male' : 'ប្រុស') : (st?.gender === 'F' ? (isEnglish.value ? 'Female' : 'ស្រី') : (isEnglish.value ? 'Male' : 'ប្រុស')),
    nationality: isEnglish.value ? 'Cambodian' : 'ខ្មែរ',
    nationalId: st?.nationalId || '010293847',
    address: editData.address || st?.address || 'Sangkat Boeung Keng Kang 1, Khan Boeng Keng Kang, Phnom Penh',
    program: isEnglish.value ? 'Science Track' : 'វិទ្យាសាស្ត្រពិត',
    degree: isEnglish.value ? 'Upper Secondary' : 'មធ្យមសិក្សាទុតិយភូមិ',
    year: isEnglish.value ? 'Grade 12' : 'ថ្នាក់ទី ១២',
    className: formatClassName(st?.className || 'CLS-12A', isEnglish.value),
    semester: isEnglish.value ? 'Semester 1' : 'ឆមាសទី ១',
    advisor: formatTeacherName(st?.teacherName || 'លោកគ្រូ សុវណ្ណ', isEnglish.value),
    admissionYear: isEnglish.value ? 'Academic Year 2025 - 2026' : 'ឆ្នាំសិក្សា ២០២៥ - ២០២៦',
    campus: isEnglish.value ? 'Building C, Room 301' : 'អគារ C បន្ទប់ ៣០១',
    totalScore: '555 / 600',
    avgScore: '92.5 / 100',
    rank: '#1',
    standing: isEnglish.value ? 'Grade A' : 'និទ្ទេស A'
  }
})

watch(profile, (p) => {
  if (!editData.fullName) editData.fullName = p.fullName
  if (!editData.phone) editData.phone = p.phone
  if (!editData.dob) editData.dob = p.dob
  if (!editData.address) editData.address = p.address
}, { immediate: true })

const saveProfile = () => {
  isEditing.value = false
  savedSuccess.value = true
  setTimeout(() => {
    savedSuccess.value = false
  }, 3000)
}
</script>

<template>
  <div class="w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/student"
          class="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft class="w-4 h-4" />
        </NuxtLink>
        <div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">
            Student Profile
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Manage your personal credentials and view academic enrollment records
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="!isEditing"
          @click="isEditing = true"
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
        >
          <Edit3 class="w-3.5 h-3.5 text-slate-500" />
          Edit Profile
        </button>
        <button
          v-else
          @click="saveProfile"
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs"
        >
          <Save class="w-3.5 h-3.5" />
          Save Changes
        </button>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <div
        v-if="savedSuccess"
        class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-xs flex items-center gap-2 shadow-xs"
      >
        <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Profile changes have been successfully saved to your student record.</span>
      </div>
    </Transition>

    <!-- Top Identity Card -->
    <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
      <div class="absolute -right-16 -top-16 w-52 h-52 bg-blue-50/70 rounded-full blur-2xl pointer-events-none"></div>

      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
        <!-- Avatar -->
        <div class="relative group shrink-0">
          <img
            src="/images/student-avatar.jpg"
            alt="Student Avatar"
            class="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white shadow-md"
          />
          <span class="absolute bottom-0 right-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white border-2 border-white shadow-xs">
            Active
          </span>
        </div>

        <!-- Details -->
        <div class="text-center sm:text-left flex-1 space-y-2">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 class="text-xl font-bold text-slate-900 tracking-tight">
                {{ profile.fullName }}
              </h2>
              <p class="text-xs font-medium text-slate-500 mt-0.5">
                {{ profile.program }} • {{ profile.year }}
              </p>
            </div>

            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 self-center sm:self-auto">
              <Award class="w-3.5 h-3.5 text-blue-600" />
              {{ profile.standing }}
            </div>
          </div>

          <div class="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
            <div class="flex items-center gap-1.5">
              <ShieldCheck class="w-3.5 h-3.5 text-slate-400" />
              <span>ID: <strong class="text-slate-800">{{ profile.studentId }}</strong></span>
            </div>
            <div class="flex items-center gap-1.5">
              <Mail class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ profile.email }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-slate-400" />
              <span>Phnom Penh</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid of Academic & Personal Details -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Academic & Personal info -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Academic Information -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <h3 class="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
            <GraduationCap class="w-4 h-4 text-blue-600" />
            Academic Details
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span class="text-slate-400 font-medium block">{{ isEnglish ? 'Track / Stream' : 'ជំនាញសិក្សា' }}</span>
              <span class="font-semibold text-slate-800 mt-0.5 block">{{ profile.program }}</span>
            </div>
            <div class="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span class="text-slate-400 font-medium block">{{ isEnglish ? 'Education Level' : 'កម្រិតសិក្សា' }}</span>
              <span class="font-semibold text-slate-800 mt-0.5 block">{{ profile.degree }}</span>
            </div>
            <div class="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span class="text-slate-400 font-medium block">{{ isEnglish ? 'Academic Class' : 'ថ្នាក់រៀន' }}</span>
              <span class="font-semibold text-slate-800 mt-0.5 block">{{ profile.className }}</span>
            </div>
            <div class="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span class="text-slate-400 font-medium block">{{ isEnglish ? 'Homeroom Teacher' : 'គ្រូបន្ទុកថ្នាក់' }}</span>
              <span class="font-semibold text-blue-600 mt-0.5 block">{{ profile.advisor }}</span>
            </div>
            <div class="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span class="text-slate-400 font-medium block">{{ isEnglish ? 'Classroom' : 'បន្ទប់រៀន' }}</span>
              <span class="font-semibold text-slate-800 mt-0.5 block">{{ profile.campus }}</span>
            </div>
            <div class="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span class="text-slate-400 font-medium block">{{ isEnglish ? 'Academic Year' : 'ឆ្នាំសិក្សា' }}</span>
              <span class="font-semibold text-slate-800 mt-0.5 block">{{ profile.admissionYear }}</span>
            </div>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <h3 class="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
            <User class="w-4 h-4 text-blue-600" />
            {{ isEnglish ? 'Personal Information' : 'ព័ត៌មានផ្ទាល់ខ្លួន' }}
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="text-slate-500 font-medium mb-1 block">{{ isEnglish ? 'Full Legal Name' : 'គោត្តនាម និងនាម' }}</label>
              <input
                v-model="profile.fullName"
                :disabled="!isEditing"
                type="text"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 disabled:opacity-80 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label class="text-slate-500 font-medium mb-1 block">{{ isEnglish ? 'Student Email' : 'អ៊ីមែលសិស្ស' }}</label>
              <input
                v-model="profile.email"
                disabled
                type="text"
                class="w-full px-3 py-2 bg-slate-100 border border-slate-200/80 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label class="text-slate-500 font-medium mb-1 block">{{ isEnglish ? 'Phone Number' : 'លេខទូរស័ព្ទ' }}</label>
              <input
                v-model="profile.phone"
                :disabled="!isEditing"
                type="text"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 disabled:opacity-80 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label class="text-slate-500 font-medium mb-1 block">{{ isEnglish ? 'Date of Birth' : 'ថ្ងៃខែឆ្នាំកំណើត' }}</label>
              <input
                v-model="profile.dob"
                :disabled="!isEditing"
                type="date"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 disabled:opacity-80 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="text-slate-500 font-medium mb-1 block">{{ isEnglish ? 'Residential Address' : 'អាសយដ្ឋានបច្ចុប្បន្ន' }}</label>
              <input
                v-model="profile.address"
                :disabled="!isEditing"
                type="text"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 disabled:opacity-80 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Col: Academic Stats & Quick Actions -->
      <div class="space-y-6">
        <!-- Progress Summary -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award class="w-4 h-4 text-blue-600" />
            {{ isEnglish ? 'Academic Results' : 'លទ្ធផលសិក្សា' }}
          </h3>

          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-500 font-medium">{{ isEnglish ? 'Subjects' : 'មុខវិជ្ជាប្រឡង' }}</span>
                <span class="font-bold text-slate-800">{{ isEnglish ? '6 / 6 Subjects' : '៦ / ៦ មុខវិជ្ជា' }}</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 100%"></div>
              </div>
            </div>

            <div class="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
              <span class="text-xs text-blue-700 font-medium">{{ isEnglish ? 'Total Score' : 'ពិន្ទុសរុប' }}</span>
              <span class="text-sm font-bold text-blue-700">{{ profile.totalScore }}</span>
            </div>

            <div class="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
              <span class="text-xs text-indigo-700 font-medium">{{ isEnglish ? 'Average' : 'ពិន្ទុមធ្យមភាគ' }}</span>
              <span class="text-sm font-bold text-indigo-700">{{ profile.avgScore }}</span>
            </div>

            <div class="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span class="text-xs text-emerald-700 font-medium">{{ isEnglish ? 'Rank' : 'ចំណាត់ថ្នាក់' }}</span>
              <span class="text-xs font-bold text-emerald-700">{{ profile.rank }} ({{ profile.standing }})</span>
            </div>
          </div>
        </div>

        <!-- Security & Account Info -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 text-blue-600" />
            Security & Access
          </h3>

          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <span class="text-slate-600">Two-Factor Auth (2FA)</span>
              <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Enabled</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <span class="text-slate-600">Password</span>
              <span class="text-slate-400">••••••••••••</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-slate-600">Account Role</span>
              <span class="font-semibold text-slate-800 uppercase text-[11px] bg-slate-100 px-2 py-0.5 rounded">Student</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

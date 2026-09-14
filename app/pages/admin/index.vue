<!-- app/pages/admin/index.vue -->
<script setup lang="ts">
import type { RawStudent } from '~/types'
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Users,
  TrendingUp,
  CheckCircle2,
  Award,
  AlertTriangle,
  X,
  Check,
  Sparkles
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const {
  classInfo,
  students,
  computedStudents,
  classStats,
  isLocked,
  addStudent,
  removeStudent,
  toggleLock,
  updateClassInfo,
  resetToDefault
} = useScore()

const { rolePasswords, updateRolePasswords } = useAuth()
const { t } = useI18n()

// Modals and state
const showAddModal = ref(false)
const showEditClassModal = ref(false)
const showPasswordModal = ref(false)
const showResetConfirmModal = ref(false)
const deleteTargetId = ref<string | null>(null)
const passwordSaveToast = ref(false)

// Form for adding new student
const newStudentForm = reactive({
  name: '',
  gender: 'M' as 'M' | 'F',
  dob: '2008-01-01',
  remarks: '',
  scores: {
    math: 75,
    physics: 75,
    chemistry: 75,
    biology: 75,
    khmer: 75,
    english: 75
  }
})

// Form for editing class metadata
const classForm = reactive({
  className: '',
  academicYear: '',
  homeroomTeacher: '',
  month: ''
})

// Form for managing role passwords
const passwordForm = reactive({
  admin: '',
  teacher: '',
  student: ''
})

const openEditClassModal = () => {
  classForm.className = classInfo.value.className
  classForm.academicYear = classInfo.value.academicYear
  classForm.homeroomTeacher = classInfo.value.homeroomTeacher
  classForm.month = classInfo.value.month
  showEditClassModal.value = true
}

const openPasswordModal = () => {
  passwordForm.admin = rolePasswords.value.admin
  passwordForm.teacher = rolePasswords.value.teacher
  passwordForm.student = rolePasswords.value.student
  showPasswordModal.value = true
}

const handleSavePasswords = () => {
  updateRolePasswords({
    admin: passwordForm.admin.trim(),
    teacher: passwordForm.teacher.trim(),
    student: passwordForm.student.trim()
  })
  showPasswordModal.value = false
  passwordSaveToast.value = true
  setTimeout(() => {
    passwordSaveToast.value = false
  }, 3000)
}

const handleSaveClassInfo = () => {
  updateClassInfo(classForm)
  showEditClassModal.value = false
}

const handleToggleLock = () => {
  toggleLock()
}

const handleAddStudent = () => {
  if (!newStudentForm.name.trim()) return

  addStudent({
    name: newStudentForm.name.trim(),
    gender: newStudentForm.gender,
    dob: newStudentForm.dob,
    remarks: newStudentForm.remarks.trim() || 'New student',
    scores: { ...newStudentForm.scores }
  })

  // Reset form
  newStudentForm.name = ''
  newStudentForm.remarks = ''
  showAddModal.value = false
}

const confirmDeleteStudent = (id: string) => {
  deleteTargetId.value = id
}

const executeDeleteStudent = () => {
  if (deleteTargetId.value) {
    removeStudent(deleteTargetId.value)
    deleteTargetId.value = null
  }
}

const handleResetAll = async () => {
  await resetToDefault()
  showResetConfirmModal.value = false
}
</script>

<template>
  <div class="space-y-5">
    <!-- Admin Header & Control Center -->
    <div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Title & Subtitle -->
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-900 tracking-tight">{{ t('adminCenterTitle') }}</h1>
              <span
                :class="[
                  'px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border flex items-center gap-1',
                  isLocked ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                ]"
                :data-tooltip="isLocked ? t('editingLockedNoticeBody') : 'Gradebook editing is open'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="isLocked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'"></span>
                <span>{{ isLocked ? t('locked') : t('unlocked') }}</span>
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ t('adminCenterSubtitle') }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Manage Passwords Button -->
          <button
            @click="openPasswordModal"
            type="button"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            data-tooltip="Manage login credentials for demo roles"
          >
            <KeyRound class="w-3.5 h-3.5 text-slate-500" />
            <span>{{ t('manageRolePasswords') }}</span>
          </button>

          <!-- Class Lock Toggle Button -->
          <button
            @click="handleToggleLock"
            type="button"
            :class="[
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer',
              isLocked
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            ]"
            :data-tooltip="isLocked ? 'Unlock marks editing' : 'Lock marks editing'"
          >
            <Lock v-if="isLocked" class="w-3.5 h-3.5" />
            <Unlock v-else class="w-3.5 h-3.5" />
            <span>{{ isLocked ? t('unlockGradebook') : t('lockGradebook') }}</span>
          </button>

          <!-- Add Student Button -->
          <button
            @click="showAddModal = true"
            type="button"
            class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs shadow-purple-600/20 transition flex items-center gap-1.5 cursor-pointer"
            data-tooltip="Enroll a new student"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>{{ t('addStudent') }}</span>
          </button>
        </div>
      </div>

      <!-- System Role Passwords Pill Strip -->
      <div class="mt-4 p-3 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-purple-400 shrink-0">
            <KeyRound class="w-3.5 h-3.5" />
          </div>
          <div>
            <div class="text-xs font-bold">{{ t('activeRolePasswordsTitle') }}</div>
            <div class="text-[10px] text-slate-400">{{ t('activeRolePasswordsSubtitle') }}</div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs">
          <div class="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 flex items-center gap-1.5">
            <span class="text-purple-400 font-semibold text-[11px]">Admin:</span>
            <span class="font-mono font-bold text-slate-100 text-xs">{{ rolePasswords.admin }}</span>
          </div>

          <div class="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 flex items-center gap-1.5">
            <span class="text-indigo-400 font-semibold text-[11px]">Teacher:</span>
            <span class="font-mono font-bold text-slate-100 text-xs">{{ rolePasswords.teacher }}</span>
          </div>

          <div class="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 flex items-center gap-1.5">
            <span class="text-blue-400 font-semibold text-[11px]">Student:</span>
            <span class="font-mono font-bold text-slate-100 text-xs">{{ rolePasswords.student }}</span>
          </div>

          <button
            @click="openPasswordModal"
            class="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 font-semibold transition text-xs cursor-pointer text-white"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>

      <!-- Quick Class Metadata Display -->
      <div class="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500">
          <div>{{ t('className') }}: <strong class="text-slate-800">{{ classInfo.className }}</strong></div>
          <div>•</div>
          <div>{{ t('academicYear') }}: <strong class="text-slate-800">{{ classInfo.academicYear }}</strong></div>
          <div>•</div>
          <div>{{ t('evaluationMonth') }}: <strong class="text-slate-800">{{ classInfo.month }}</strong></div>
          <div>•</div>
          <div>{{ t('homeroomTeacher') }}: <strong class="text-slate-800">{{ classInfo.homeroomTeacher }}</strong></div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="openEditClassModal"
            class="px-2.5 py-1 text-xs text-purple-700 hover:bg-purple-50 font-semibold rounded-md border border-purple-200 transition flex items-center gap-1 cursor-pointer"
          >
            <Edit3 class="w-3 h-3" />
            <span>{{ t('editClassInfo') }}</span>
          </button>
          <button
            @click="showResetConfirmModal = true"
            class="px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-semibold rounded-md border border-slate-200 transition flex items-center gap-1 cursor-pointer"
            data-tooltip="Reset all marks to initial seed state"
          >
            <RefreshCw class="w-3 h-3" />
            <span>{{ t('resetData') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <!-- Total Students -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ t('totalStudents') }}</span>
          <Users class="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div class="text-xl font-bold text-slate-800 mt-1 font-mono">
          {{ classStats.totalStudents }} <span class="text-xs font-normal text-slate-400">{{ t('studentCountUnit') }}</span>
        </div>
      </div>

      <!-- Class Average -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ t('classAverage') }}</span>
          <TrendingUp class="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <div class="text-xl font-bold text-indigo-600 mt-1 font-mono">
          {{ classStats.classAverage }} <span class="text-xs font-normal text-slate-400">/ 100</span>
        </div>
      </div>

      <!-- Pass Rate -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ t('passRate') }}</span>
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div class="text-xl font-bold text-emerald-600 mt-1 font-mono">
          {{ classStats.passRate }}%
        </div>
      </div>

      <!-- Highest Score -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ t('highestScore') }}</span>
          <Award class="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div class="text-xl font-bold text-amber-600 mt-1 font-mono">
          {{ classStats.highestScore }}
        </div>
      </div>
    </div>

    <!-- Student Roster Management Table -->
    <div class="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
      <div class="p-4 border-b border-slate-200/80 flex items-center justify-between">
        <div>
          <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider">{{ t('classRosterTitle') }}</h2>
          <p class="text-xs text-slate-400">{{ t('classRosterSubtitle') }}</p>
        </div>
        <span class="text-xs text-slate-600 font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          {{ computedStudents.length }} students
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 text-slate-600 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
              <th class="py-2.5 px-3 text-center w-12">#</th>
              <th class="py-2.5 px-3">{{ t('student') }}</th>
              <th class="py-2.5 px-2 text-center w-12">{{ t('gender') }}</th>
              <th class="py-2.5 px-3 text-center">{{ t('dob') }}</th>
              <th class="py-2.5 px-3 text-center">{{ t('average') }}</th>
              <th class="py-2.5 px-3 text-center">{{ t('grade') }}</th>
              <th class="py-2.5 px-3 text-center">{{ t('rank') }}</th>
              <th class="py-2.5 px-3 text-right">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr
              v-for="(student, index) in computedStudents"
              :key="student.id"
              class="hover:bg-slate-50 transition"
            >
              <td class="py-2 px-3 text-center font-mono text-slate-400 text-xs">
                {{ index + 1 }}
              </td>

              <td class="py-2 px-3">
                <div class="flex items-center gap-2">
                  <div
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0',
                      student.gender === 'F' ? 'bg-pink-600' : 'bg-blue-600'
                    ]"
                  >
                    {{ student.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-800">{{ student.name }}</div>
                    <div class="text-[9px] font-mono text-slate-400">{{ student.id }}</div>
                  </div>
                </div>
              </td>

              <td class="py-2 px-2 text-center">
                <span
                  :class="[
                    'font-bold text-[11px]',
                    student.gender === 'F' ? 'text-pink-600' : 'text-blue-600'
                  ]"
                >
                  {{ student.gender }}
                </span>
              </td>

              <td class="py-2 px-3 text-center text-slate-600 font-mono text-xs">
                {{ student.dob }}
              </td>

              <td class="py-2 px-3 text-center font-mono font-bold text-indigo-600 text-xs">
                {{ student.average.toFixed(2) }}
              </td>

              <td class="py-2 px-3 text-center">
                <span
                  :class="[
                    'px-1.5 py-0.5 rounded font-bold text-[10px] border',
                    student.grade === 'A' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                    student.grade === 'B' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                    student.grade === 'C' ? 'bg-cyan-50 text-cyan-700 border-cyan-300' :
                    student.grade === 'D' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                    student.grade === 'E' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                    'bg-rose-50 text-rose-700 border-rose-300'
                  ]"
                >
                  {{ student.grade }}
                </span>
              </td>

              <td class="py-2 px-3 text-center font-bold font-mono text-amber-600 text-xs">
                #{{ student.rank }}
              </td>

              <td class="py-2 px-3 text-right">
                <button
                  @click="confirmDeleteStudent(student.id)"
                  type="button"
                  class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                  data-tooltip="Delete student"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>

            <tr v-if="computedStudents.length === 0">
              <td colspan="8" class="py-8 text-center text-slate-400">
                {{ t('noDataFound') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Manage Role Passwords -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <KeyRound class="w-4 h-4" />
            </div>
            <h3 class="text-sm font-bold text-slate-900">{{ t('modalManagePasswordsTitle') }}</h3>
          </div>
          <button @click="showPasswordModal = false" class="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X class="w-4 h-4" />
          </button>
        </div>

        <p class="text-xs text-slate-500 mt-2">
          {{ t('modalManagePasswordsSubtitle') }}
        </p>

        <form class="space-y-3 mt-3.5 text-xs" @submit.prevent="handleSavePasswords">
          <div>
            <label class="block font-bold text-purple-700 mb-1">
              {{ t('adminPasswordLabel') }}
            </label>
            <input
              v-model="passwordForm.admin"
              type="text"
              required
              class="w-full px-3 py-1.5 font-mono rounded-lg border border-purple-200 bg-purple-50/40 focus:bg-white focus:ring-2 focus:ring-purple-500/20 text-slate-800"
            />
          </div>

          <div>
            <label class="block font-bold text-indigo-700 mb-1">
              {{ t('teacherPasswordLabel') }}
            </label>
            <input
              v-model="passwordForm.teacher"
              type="text"
              required
              class="w-full px-3 py-1.5 font-mono rounded-lg border border-indigo-200 bg-indigo-50/40 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
            />
          </div>

          <div>
            <label class="block font-bold text-blue-700 mb-1">
              {{ t('studentPasswordLabel') }}
            </label>
            <input
              v-model="passwordForm.student"
              type="text"
              required
              class="w-full px-3 py-1.5 font-mono rounded-lg border border-blue-200 bg-blue-50/40 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="showPasswordModal = false"
              class="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              {{ t('cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs transition"
            >
              {{ t('save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Add New Student -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold text-slate-900">{{ t('modalAddStudentTitle') }}</h3>
          <button @click="showAddModal = false" class="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form class="space-y-3 mt-3 text-xs" @submit.prevent="handleAddStudent">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('studentFullName') }}</label>
            <input
              v-model="newStudentForm.name"
              type="text"
              required
              placeholder="e.g. Heng Virak"
              class="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 text-xs"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('gender') }}</label>
              <select
                v-model="newStudentForm.gender"
                class="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-slate-800 font-bold text-xs"
              >
                <option value="M">{{ t('male') }}</option>
                <option value="F">{{ t('female') }}</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('dob') }}</label>
              <input
                v-model="newStudentForm.dob"
                type="date"
                class="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-slate-800 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('remarks') }}</label>
            <input
              v-model="newStudentForm.remarks"
              type="text"
              placeholder="e.g. Transferred student"
              class="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-slate-800 text-xs"
            />
          </div>

          <!-- Initial Scores -->
          <div class="border-t border-slate-100 pt-2.5">
            <label class="block font-semibold text-slate-700 mb-1.5">{{ t('initialScoresTitle') }}</label>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              <div>
                <label class="text-[10px] text-slate-400 block mb-0.5">MATH</label>
                <input
                  v-model.number="newStudentForm.scores.math"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full p-1 text-xs text-center border border-slate-200 rounded font-mono font-bold"
                />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-0.5">PHYS</label>
                <input
                  v-model.number="newStudentForm.scores.physics"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full p-1 text-xs text-center border border-slate-200 rounded font-mono font-bold"
                />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-0.5">CHEM</label>
                <input
                  v-model.number="newStudentForm.scores.chemistry"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full p-1 text-xs text-center border border-slate-200 rounded font-mono font-bold"
                />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-0.5">BIO</label>
                <input
                  v-model.number="newStudentForm.scores.biology"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full p-1 text-xs text-center border border-slate-200 rounded font-mono font-bold"
                />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-0.5">KHM</label>
                <input
                  v-model.number="newStudentForm.scores.khmer"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full p-1 text-xs text-center border border-slate-200 rounded font-mono font-bold"
                />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-0.5">ENG</label>
                <input
                  v-model.number="newStudentForm.scores.english"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full p-1 text-xs text-center border border-slate-200 rounded font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              {{ t('cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs transition"
            >
              {{ t('addStudent') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Edit Class Info -->
    <div
      v-if="showEditClassModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold text-slate-900">{{ t('modalEditClassTitle') }}</h3>
          <button @click="showEditClassModal = false" class="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form class="space-y-3 mt-3 text-xs" @submit.prevent="handleSaveClassInfo">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('className') }}</label>
            <input
              v-model="classForm.className"
              type="text"
              required
              class="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-slate-800 text-xs"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('academicYear') }}</label>
            <input
              v-model="classForm.academicYear"
              type="text"
              required
              class="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-slate-800 text-xs"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('evaluationMonth') }}</label>
            <input
              v-model="classForm.month"
              type="text"
              required
              class="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-slate-800 text-xs"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('homeroomTeacher') }}</label>
            <input
              v-model="classForm.homeroomTeacher"
              type="text"
              required
              class="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-slate-800 text-xs"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="showEditClassModal = false"
              class="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              {{ t('cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs transition"
            >
              {{ t('save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Confirm Delete Student -->
    <div
      v-if="deleteTargetId"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center space-y-3 border border-slate-200">
        <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900">{{ t('modalDeleteStudentTitle') }}</h3>
          <p class="text-xs text-slate-500 mt-1">
            {{ t('modalDeleteStudentBody', { id: deleteTargetId }) }}
          </p>
        </div>
        <div class="flex items-center justify-center gap-2 pt-2">
          <button
            @click="deleteTargetId = null"
            class="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            {{ t('cancel') }}
          </button>
          <button
            @click="executeDeleteStudent"
            class="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition cursor-pointer"
          >
            {{ t('deleteConfirmBtn') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Reset Seed Data Confirmation -->
    <div
      v-if="showResetConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center space-y-3 border border-slate-200">
        <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900">{{ t('modalResetTitle') }}</h3>
          <p class="text-xs text-slate-500 mt-1">
            {{ t('modalResetBody') }}
          </p>
        </div>
        <div class="flex items-center justify-center gap-2 pt-2">
          <button
            @click="showResetConfirmModal = false"
            class="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            {{ t('cancel') }}
          </button>
          <button
            @click="handleResetAll"
            class="px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs transition cursor-pointer"
          >
            {{ t('resetConfirmBtn') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast: Password Updated Successfully -->
    <Transition
      enter-active-class="transform transition ease-out duration-200"
      enter-from-class="translate-y-2 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="passwordSaveToast"
        class="fixed top-5 right-5 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl backdrop-blur flex items-center gap-2.5 text-xs font-semibold border border-slate-800"
      >
        <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{{ t('passwordUpdatedToast') }}</span>
      </div>
    </Transition>
  </div>
</template>

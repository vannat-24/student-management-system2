<!-- pages/admin/class.vue -->
<script setup lang="ts">
import type { SchoolClass, RawStudent, ComputedStudent, ClassSubjectConfig } from '~/types'
import {
  School,
  GraduationCap,
  Plus,
  Lock,
  Unlock,
  KeyRound,
  Users,
  Edit3,
  Trash2,
  UserPlus,
  Search,
  Filter,
  LayoutGrid,
  List,
  TrendingUp,
  Award,
  CheckCircle2,
  X,
  ChevronRight,
  BookOpen
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const {
  classes,
  activeClassId,
  students,
  overallStats,
  setActiveClass,
  addClass,
  updateClass,
  deleteClass,
  toggleClassLock,
  lockAllClasses,
  unlockAllClasses,
  getStudentsForClass,
  getClassStats,
  addStudent,
  removeStudent,
  getGradeBadgeColor
} = useScore()

const { rolePasswords, updateRolePasswords } = useAuth()
const { t, isEnglish } = useI18n()

// Search, Filters & View Options
const searchQuery = ref('')
const selectedGradeFilter = ref<'all' | '12' | '11' | '10'>('all')
const selectedStatusFilter = ref<'all' | 'unlocked' | 'locked'>('all')
const sortBy = ref<'name' | 'average' | 'students' | 'passRate'>('name')
const viewMode = ref<'grid' | 'table'>('grid')

// Modals and Drawers state
const showCreateClassModal = ref(false)
const showEditClassModal = ref(false)
const showRosterDrawer = ref(false)
const showAddStudentModal = ref(false)
const showPasswordModal = ref(false)
const showDeleteConfirmModal = ref(false)
const targetClassForAction = ref<SchoolClass | null>(null)
const targetStudentToDelete = ref<string | null>(null)
const toastMessage = ref<string | null>(null)

const DEFAULT_SUBJECT_CONFIGS: ClassSubjectConfig[] = [
  { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', coefficient: 2, enabled: true },
  { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', coefficient: 2, enabled: true },
  { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', coefficient: 1.5, enabled: true },
  { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', coefficient: 1.5, enabled: true },
  { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', coefficient: 1.5, enabled: true },
  { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', coefficient: 1, enabled: true }
]

// Class Form state
const classForm = reactive({
  id: '',
  name: '',
  teacherName: '',
  teacherId: '',
  room: '',
  academicYear: '2025-2026',
  month: 'តុលា',
  isLocked: false,
  gradeLevel: '12' as '10' | '11' | '12',
  track: 'science' as 'science' | 'social' | 'general',
  subjectConfigs: JSON.parse(JSON.stringify(DEFAULT_SUBJECT_CONFIGS)) as ClassSubjectConfig[]
})

const applyTrackPreset = (preset: 'science' | 'social' | 'equal') => {
  classForm.track = preset === 'equal' ? 'general' : preset
  if (preset === 'science') {
    classForm.subjectConfigs = [
      { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', coefficient: 2, enabled: true },
      { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', coefficient: 1.5, enabled: true },
      { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', coefficient: 1.5, enabled: true },
      { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', coefficient: 1.5, enabled: true },
      { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', coefficient: 1.5, enabled: true },
      { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', coefficient: 1, enabled: true }
    ]
  } else if (preset === 'social') {
    classForm.subjectConfigs = [
      { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', coefficient: 2, enabled: true },
      { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', coefficient: 1.5, enabled: true },
      { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', coefficient: 1.5, enabled: true },
      { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', coefficient: 1, enabled: true },
      { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', coefficient: 1, enabled: true },
      { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', coefficient: 1, enabled: true }
    ]
  } else {
    classForm.subjectConfigs = [
      { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', coefficient: 1, enabled: true },
      { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', coefficient: 1, enabled: true },
      { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', coefficient: 1, enabled: true },
      { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', coefficient: 1, enabled: true },
      { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', coefficient: 1, enabled: true },
      { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', coefficient: 1, enabled: true }
    ]
  }
}

const totalFormCoefficients = computed(() => {
  return (classForm.subjectConfigs || [])
    .filter(s => s.enabled)
    .reduce((sum, s) => sum + (Number(s.coefficient) || 0), 0)
})

// Student Form for direct class enrollment
const newStudentForm = reactive({
  targetClassId: '',
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

// Password Form
const passwordForm = reactive({
  admin: '',
  teacher: '',
  student: ''
})

// Toast notification helper
const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = null
  }, 3000)
}

// Filtered & Sorted Classes List
const filteredClasses = computed(() => {
  let list = [...classes.value]

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q) ||
        (c.room && c.room.toLowerCase().includes(q))
    )
  }

  // Grade filter
  if (selectedGradeFilter.value !== 'all') {
    if (selectedGradeFilter.value === '12') {
      list = list.filter((c) => c.name.includes('12') || c.id.includes('12'))
    } else if (selectedGradeFilter.value === '11') {
      list = list.filter((c) => c.name.includes('11') || c.id.includes('11'))
    } else if (selectedGradeFilter.value === '10') {
      list = list.filter((c) => c.name.includes('10') || c.id.includes('10'))
    }
  }

  // Status filter
  if (selectedStatusFilter.value === 'locked') {
    list = list.filter((c) => c.isLocked)
  } else if (selectedStatusFilter.value === 'unlocked') {
    list = list.filter((c) => !c.isLocked)
  }

  // Sort
  list.sort((a, b) => {
    if (sortBy.value === 'average') {
      return getClassStats(b.id).classAverage - getClassStats(a.id).classAverage
    }
    if (sortBy.value === 'students') {
      return getClassStats(b.id).totalStudents - getClassStats(a.id).totalStudents
    }
    if (sortBy.value === 'passRate') {
      return getClassStats(b.id).passRate - getClassStats(a.id).passRate
    }
    return a.name.localeCompare(b.name)
  })

  return list
})

// Helper to get grade short code (e.g. "12A", "12B", "11A")
const getClassShortCode = (cls: SchoolClass): string => {
  const match = cls.name.match(/(?:Class|ថ្នាក់ទី)?\s*([0-9]{1,2}[A-Z])/i)
  if (match && match[1]) return match[1].toUpperCase()
  return cls.id.replace('CLS-', '')
}

// Helper to determine gradient theme based on grade level
const getCardGradientTheme = (cls: SchoolClass) => {
  const code = getClassShortCode(cls)
  if (code.startsWith('12A')) {
    return {
      border: 'border-purple-200',
      badgeBg: 'bg-purple-600 text-white',
      accentText: 'text-purple-700',
      headerGradient: 'from-purple-500/10 via-indigo-500/5 to-transparent',
      avatarBg: 'bg-purple-100 text-purple-700'
    }
  }
  if (code.startsWith('12B')) {
    return {
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-600 text-white',
      accentText: 'text-emerald-700',
      headerGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      avatarBg: 'bg-emerald-100 text-emerald-700'
    }
  }
  if (code.startsWith('11')) {
    return {
      border: 'border-amber-200',
      badgeBg: 'bg-amber-600 text-white',
      accentText: 'text-amber-700',
      headerGradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
      avatarBg: 'bg-amber-100 text-amber-700'
    }
  }
  return {
    border: 'border-blue-200',
    badgeBg: 'bg-blue-600 text-white',
    accentText: 'text-blue-700',
    headerGradient: 'from-blue-500/10 via-sky-500/5 to-transparent',
    avatarBg: 'bg-blue-100 text-blue-700'
  }
}

// Open Create Class Modal
const openCreateClassModal = () => {
  const nextNum = classes.value.length + 1
  classForm.id = `CLS-${nextNum}`
  classForm.name = isEnglish.value ? `Class 12${String.fromCharCode(64 + nextNum)}` : `ថ្នាក់ទី ១២${String.fromCharCode(64 + nextNum)}`
  classForm.teacherName = isEnglish.value ? `Teacher ${nextNum}` : `លោកគ្រូ/អ្នកគ្រូ ថ្មី`
  classForm.teacherId = `TEA-${String(nextNum).padStart(3, '0')}`
  classForm.room = isEnglish.value ? `Room ${100 + nextNum}` : `បន្ទប់ ${100 + nextNum}`
  classForm.academicYear = '2025-2026'
  classForm.month = isEnglish.value ? 'October' : 'តុលា'
  classForm.isLocked = false
  classForm.gradeLevel = '12'
  classForm.track = 'science'
  applyTrackPreset('science')
  showCreateClassModal.value = true
}

// Open Edit Class Modal
const openEditClassModal = (cls: SchoolClass) => {
  targetClassForAction.value = cls
  classForm.id = cls.id
  classForm.name = cls.name
  classForm.teacherName = cls.teacherName
  classForm.teacherId = cls.teacherId
  classForm.room = cls.room || ''
  classForm.academicYear = cls.academicYear || '2025-2026'
  classForm.month = formatMonth(cls.month || 'តុលា', isEnglish.value)
  classForm.isLocked = !!cls.isLocked
  classForm.gradeLevel = cls.gradeLevel || '12'
  classForm.track = cls.track || 'general'
  classForm.subjectConfigs = cls.subjectConfigs
    ? JSON.parse(JSON.stringify(cls.subjectConfigs))
    : JSON.parse(JSON.stringify(DEFAULT_SUBJECT_CONFIGS))
  showEditClassModal.value = true
}

// Save New Class
const handleCreateClass = () => {
  if (!classForm.name.trim()) return
  const created = addClass({
    id: classForm.id.trim() || undefined,
    name: classForm.name.trim(),
    teacherName: classForm.teacherName.trim(),
    teacherId: classForm.teacherId.trim(),
    room: classForm.room.trim(),
    academicYear: classForm.academicYear.trim(),
    month: classForm.month.trim(),
    isLocked: classForm.isLocked,
    gradeLevel: classForm.gradeLevel,
    track: classForm.track,
    subjectConfigs: classForm.subjectConfigs
  })
  showCreateClassModal.value = false
  showToast(isEnglish.value ? `Class "${created.name}" created!` : `បានបង្កើតថ្នាក់ "${created.name}"!`)
}

// Save Edit Class
const handleSaveEditClass = () => {
  if (!targetClassForAction.value || !classForm.name.trim()) return
  updateClass({
    id: classForm.id,
    name: classForm.name.trim(),
    teacherName: classForm.teacherName.trim(),
    teacherId: classForm.teacherId.trim(),
    room: classForm.room.trim(),
    academicYear: classForm.academicYear.trim(),
    month: classForm.month.trim(),
    isLocked: classForm.isLocked,
    gradeLevel: classForm.gradeLevel,
    track: classForm.track,
    subjectConfigs: classForm.subjectConfigs
  })
  showEditClassModal.value = false
  showToast(isEnglish.value ? `Class "${classForm.name}" updated!` : `បានកែប្រែថ្នាក់ "${classForm.name}"!`)
}

// Open Delete Class Confirmation
const openDeleteClassModal = (cls: SchoolClass) => {
  targetClassForAction.value = cls
  showDeleteConfirmModal.value = true
}

const handleConfirmDeleteClass = () => {
  if (targetClassForAction.value) {
    const deletedName = targetClassForAction.value.name
    const success = deleteClass(targetClassForAction.value.id)
    showDeleteConfirmModal.value = false
    if (success) {
      showToast(isEnglish.value ? `Class "${deletedName}" removed.` : `បានលុបថ្នាក់ "${deletedName}"។`)
    }
  }
}

// Open Roster Drawer
const openRosterDrawer = (cls: SchoolClass) => {
  targetClassForAction.value = cls
  showRosterDrawer.value = true
}

// Current Roster in Drawer
const currentDrawerRoster = computed<ComputedStudent[]>(() => {
  if (!targetClassForAction.value) return []
  return getStudentsForClass(targetClassForAction.value.id)
})

// Open Add Student Modal for a specific class
const openAddStudentModal = (cls: SchoolClass) => {
  targetClassForAction.value = cls
  newStudentForm.targetClassId = cls.id
  newStudentForm.name = ''
  newStudentForm.gender = 'M'
  newStudentForm.dob = '2008-01-01'
  newStudentForm.remarks = ''
  newStudentForm.scores = {
    math: 75,
    physics: 75,
    chemistry: 75,
    biology: 75,
    khmer: 75,
    english: 75
  }
  showAddStudentModal.value = true
}

// Handle Add Student
const handleAddStudent = () => {
  if (!newStudentForm.name.trim() || !targetClassForAction.value) return
  addStudent({
    name: newStudentForm.name.trim(),
    gender: newStudentForm.gender,
    dob: newStudentForm.dob,
    remarks: newStudentForm.remarks.trim() || (isEnglish.value ? 'New Student' : 'សិស្សទើបចូលថ្មី'),
    scores: { ...newStudentForm.scores },
    targetClassId: targetClassForAction.value.id
  })
  showAddStudentModal.value = false
  showToast(isEnglish.value ? `Student added to ${targetClassForAction.value.name}!` : `បានបន្ថែមសិស្សទៅ ${targetClassForAction.value.name}!`)
}

// Toggle Lock for a specific class
const handleToggleClassLock = (cls: SchoolClass) => {
  const newLock = toggleClassLock(cls.id)
  showToast(
    newLock
      ? (isEnglish.value ? `${cls.name} locked.` : `ថ្នាក់ ${cls.name} បានចាក់សោ។`)
      : (isEnglish.value ? `${cls.name} unlocked.` : `ថ្នាក់ ${cls.name} បានដោះសោ។`)
  )
}

// Set Active Class
const handleSetActiveClass = (cls: SchoolClass) => {
  setActiveClass(cls.id)
  showToast(isEnglish.value ? `${cls.name} set as active.` : `បានកំណត់ ${cls.name} ជាថ្នាក់សកម្ម។`)
}

// Manage Role Passwords Modal
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
  showToast(t('passwordUpdatedToast'))
}
</script>

<template>
  <div class="space-y-6">
    <!-- Toast Notification Banner -->
    <Transition
      enter-active-class="transform transition ease-out duration-200"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toastMessage"
        class="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 text-white rounded-xl shadow-xl backdrop-blur border border-slate-700 text-xs font-semibold"
      >
        <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- ========================================================= -->
    <!-- 1. TOP ADMIN HEADER & GLOBAL CONTROL CENTER               -->
    <!-- ========================================================= -->
    <div class="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Title & Breadcrumb -->
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
            <School class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-xl font-bold text-slate-900 tracking-tight">
                {{ t('classesTitle') }}
              </h1>
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                Admin
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              {{ t('classesSubtitle') }}
            </p>
          </div>
        </div>

        <!-- Global Action Controls (Distinct Primary CTA + Subtle Icons) -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Role Passwords Icon Button -->
          <button
            @click="openPasswordModal"
            type="button"
            class="p-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center justify-center cursor-pointer shadow-2xs"
            :data-tooltip="t('manageRolePasswords')"
            data-tooltip-pos="bottom"
            aria-label="Manage Role Passwords"
          >
            <KeyRound class="w-4 h-4 text-slate-600" />
          </button>

          <!-- Bulk Lock All Icon Button -->
          <button
            @click="lockAllClasses"
            type="button"
            class="p-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition flex items-center justify-center cursor-pointer"
            :data-tooltip="t('lockAll')"
            data-tooltip-pos="bottom"
            aria-label="Lock All Classes"
          >
            <Lock class="w-4 h-4" />
          </button>

          <!-- Bulk Unlock All Icon Button -->
          <button
            @click="unlockAllClasses"
            type="button"
            class="p-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition flex items-center justify-center cursor-pointer"
            :data-tooltip="t('unlockAll')"
            data-tooltip-pos="bottom"
            aria-label="Unlock All Classes"
          >
            <Unlock class="w-4 h-4" />
          </button>

          <!-- Primary Call-to-Action: Create New Class -->
          <button
            @click="openCreateClassModal"
            type="button"
            class="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs shadow-purple-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>{{ t('createNewClass') }}</span>
          </button>
        </div>
      </div>

      <!-- School-Wide KPI Metrics Strip (Balanced 4-col Grid) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs">
        <div class="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold text-slate-500">{{ t('activeClassesCount') }}</span>
            <School class="w-4 h-4" />
          </div>
          <div class="mt-2">
            <div class="text-2xl font-black text-slate-900 font-mono">
              {{ overallStats.totalClasses }}
            </div>
            <div class="text-xs text-slate-400 mt-0.5">Active Classrooms</div>
          </div>
        </div>

        <div class="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold text-slate-500">{{ t('totalSchoolStudents') }}</span>
            <Users class="w-4 h-4" />
          </div>
          <div class="mt-2">
            <div class="text-2xl font-black text-slate-900 font-mono">
              {{ overallStats.totalStudents }}
            </div>
            <div class="text-xs text-slate-400 mt-0.5">Enrolled Students</div>
          </div>
        </div>

        <div class="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold text-slate-500">{{ t('schoolAverage') }}</span>
            <TrendingUp class="w-4 h-4 text-indigo-500" />
          </div>
          <div class="mt-2">
            <div class="text-2xl font-black text-indigo-600 font-mono">
              {{ overallStats.overallAverage }}
            </div>
            <div class="text-xs text-slate-400 mt-0.5">Scale / 100</div>
          </div>
        </div>

        <div class="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold text-slate-500">{{ t('homeroomTeachers') }}</span>
            <GraduationCap class="w-4 h-4 text-purple-500" />
          </div>
          <div class="mt-2">
            <div class="text-2xl font-black text-slate-900 font-mono">
              {{ overallStats.totalTeachers }}
            </div>
            <div class="text-xs text-slate-400 mt-0.5">Faculty Members</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 2. FILTER, SEARCH & VIEW CONTROLS TOOLBAR                 -->
    <!-- ========================================================= -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <!-- Search input -->
      <div class="relative flex-1 max-w-sm">
        <Search class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('searchStudentPlaceholder')"
          class="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
        />
      </div>

      <!-- Filters & Sort Options -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <!-- Grade Filter Tabs -->
        <div class="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80">
          <button
            @click="selectedGradeFilter = 'all'"
            :class="[
              'px-3 py-1 font-semibold rounded-lg transition cursor-pointer text-xs',
              selectedGradeFilter === 'all' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            {{ t('filterAll') }}
          </button>
          <button
            @click="selectedGradeFilter = '12'"
            :class="[
              'px-3 py-1 font-semibold rounded-lg transition cursor-pointer text-xs',
              selectedGradeFilter === '12' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            {{ t('filterGrade12') }}
          </button>
          <button
            @click="selectedGradeFilter = '11'"
            :class="[
              'px-3 py-1 font-semibold rounded-lg transition cursor-pointer text-xs',
              selectedGradeFilter === '11' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            {{ t('filterGrade11') }}
          </button>
          <button
            @click="selectedGradeFilter = '10'"
            :class="[
              'px-3 py-1 font-semibold rounded-lg transition cursor-pointer text-xs',
              selectedGradeFilter === '10' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            {{ t('filterGrade10') }}
          </button>
        </div>

        <!-- Lock Status Filter -->
        <select
          v-model="selectedStatusFilter"
          class="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none focus:border-purple-500 cursor-pointer text-xs"
        >
          <option value="all">{{ isEnglish ? 'Status: All' : 'ស្ថានភាព៖ ទាំងអស់' }}</option>
          <option value="unlocked">{{ isEnglish ? '🟢 Active' : '🟢 សកម្ម' }}</option>
          <option value="locked">{{ isEnglish ? '🔒 Locked' : '🔒 បានចាក់សោ' }}</option>
        </select>

        <!-- Sort dropdown -->
        <select
          v-model="sortBy"
          class="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none focus:border-purple-500 cursor-pointer text-xs"
        >
          <option value="name">{{ t('sortName') }}</option>
          <option value="average">{{ t('sortAverage') }}</option>
          <option value="students">{{ t('sortStudents') }}</option>
          <option value="passRate">{{ t('sortPassRate') }}</option>
        </select>

        <!-- Grid / Table View toggle -->
        <div class="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-1.5 rounded-lg transition cursor-pointer',
              viewMode === 'grid' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-400 hover:text-slate-600'
            ]"
            data-tooltip="Cards View"
            data-tooltip-pos="bottom"
            aria-label="Cards View"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
          <button
            @click="viewMode = 'table'"
            :class="[
              'p-1.5 rounded-lg transition cursor-pointer',
              viewMode === 'table' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-400 hover:text-slate-600'
            ]"
            data-tooltip="Table View"
            data-tooltip-pos="bottom"
            aria-label="Table View"
          >
            <List class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 3. CLASS CARDS GRID VIEW                                  -->
    <!-- ========================================================= -->
    <div
      v-if="viewMode === 'grid'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="cls in filteredClasses"
        :key="cls.id"
        :class="[
          'bg-white rounded-2xl border transition flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md',
          cls.id === activeClassId ? 'ring-2 ring-purple-600 border-purple-300' : 'border-slate-200/80 hover:border-slate-300'
        ]"
      >
        <!-- Card Top Area -->
        <div>
          <div :class="['p-5 pb-4 bg-gradient-to-br border-b border-slate-100', getCardGradientTheme(cls).headerGradient]">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3.5 min-w-0">
                <div :class="['w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0', getCardGradientTheme(cls).badgeBg]">
                  {{ getClassShortCode(cls) }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h2 class="text-sm font-bold text-slate-900 truncate" :title="formatClassName(cls.name, isEnglish)">
                      {{ formatClassName(cls.name, isEnglish) }}
                    </h2>
                    <span
                      v-if="cls.id === activeClassId"
                      class="px-2 py-0.2 text-[10px] font-bold uppercase rounded-md bg-purple-600 text-white shrink-0"
                    >
                      Active
                    </span>
                  </div>
                  <div class="text-xs text-slate-500 font-medium mt-0.5">
                    {{ formatRoom(cls.room, isEnglish) }} • {{ cls.academicYear || '2025-2026' }}
                  </div>
                  <div class="flex items-center gap-1.5 flex-wrap mt-1">
                    <span v-if="cls.gradeLevel" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {{ isEnglish ? `Grade ${cls.gradeLevel}` : `ថ្នាក់ទី ${cls.gradeLevel}` }}
                    </span>
                    <span v-if="cls.track" class="px-1.5 py-0.5 rounded text-[10px] font-semibold" :class="cls.track === 'science' ? 'bg-purple-100 text-purple-700' : cls.track === 'social' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'">
                      {{ cls.track === 'science' ? (isEnglish ? 'Science' : 'វិទ្យាសាស្ត្រ') : cls.track === 'social' ? (isEnglish ? 'Social' : 'សង្គម') : (isEnglish ? 'General' : 'ទូទៅ') }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">
                      {{ (cls.subjectConfigs?.filter(s => s.enabled).length || 6) }} {{ isEnglish ? 'Subjects' : 'មុខវិជ្ជា' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Lock Toggle Pill with Tooltip -->
              <button
                @click="handleToggleClassLock(cls)"
                type="button"
                :data-tooltip="cls.isLocked ? t('unlockGradebook') : t('lockGradebook')"
                data-tooltip-pos="left"
                :class="[
                  'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0 border',
                  cls.isLocked
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="cls.isLocked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'"></span>
                <span>{{ cls.isLocked ? t('locked') : t('unlocked') }}</span>
              </button>
            </div>

            <!-- Homeroom Teacher Profile Row -->
            <div class="mt-3.5 pt-3 border-t border-slate-200/50 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2 min-w-0">
                <div :class="['w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0', getCardGradientTheme(cls).avatarBg]">
                  {{ formatTeacherName(cls.teacherName, isEnglish).charAt(0) }}
                </div>
                <span class="font-bold text-slate-800 truncate">{{ formatTeacherName(cls.teacherName, isEnglish) }}</span>
              </div>
              <span class="text-[11px] font-mono text-slate-400">{{ cls.id }}</span>
            </div>
          </div>

          <!-- Card Body: 3 KPIs + Mini Progress Bar -->
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div class="text-[10px] font-semibold uppercase text-slate-400">{{ t('enrolledStudents') }}</div>
                <div class="text-base font-black text-slate-900 font-mono mt-0.5">
                  {{ getClassStats(cls.id).totalStudents }}
                </div>
              </div>

              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div class="text-[10px] font-semibold uppercase text-slate-400">{{ t('averageScore') }}</div>
                <div class="text-base font-black text-indigo-600 font-mono mt-0.5">
                  {{ getClassStats(cls.id).classAverage }}
                </div>
              </div>

              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div class="text-[10px] font-semibold uppercase text-slate-400">{{ t('passRateLabel') }}</div>
                <div class="text-base font-black text-emerald-600 font-mono mt-0.5">
                  {{ getClassStats(cls.id).passRate }}%
                </div>
              </div>
            </div>

            <!-- Visual Pass Rate Progress Bar -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-[11px] text-slate-400">
                <span>{{ isEnglish ? 'Pass Rate' : 'អត្រាជាប់' }}</span>
                <span class="font-mono font-bold text-slate-600">{{ getClassStats(cls.id).passedCount }}/{{ getClassStats(cls.id).totalStudents }}</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  :style="{ width: `${getClassStats(cls.id).passRate}%` }"
                ></div>
              </div>
            </div>

            <!-- Grade Breakdown Mini Pills -->
            <div class="flex items-center gap-1 text-[10px] font-bold">
              <div
                v-for="(count, letter) in getClassStats(cls.id).gradeCounts"
                :key="letter"
                :class="[
                  'flex-1 py-0.5 text-center rounded-md border font-mono',
                  count > 0 ? getGradeBadgeColor(letter as any) : 'bg-slate-50 text-slate-300 border-slate-100'
                ]"
                :data-tooltip="`Grade ${letter}: ${count}`"
                data-tooltip-pos="bottom"
              >
                {{ letter }}:{{ count }}
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <!-- View Roster Button -->
            <button
              @click="openRosterDrawer(cls)"
              type="button"
              class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Users class="w-3.5 h-3.5 text-purple-600" />
              <span>{{ t('viewRoster') }}</span>
            </button>

            <!-- Set Active Button -->
            <button
              @click="handleSetActiveClass(cls)"
              type="button"
              :class="[
                'px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer border',
                cls.id === activeClassId
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              ]"
            >
              {{ cls.id === activeClassId ? 'Active' : 'Set' }}
            </button>
          </div>

          <!-- Micro Action Icon Buttons with Tooltips (Contextual Iconography) -->
          <div class="flex items-center gap-1">
            <!-- Add student to this class -->
            <button
              @click="openAddStudentModal(cls)"
              class="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition cursor-pointer"
              :data-tooltip="t('addStudent')"
              data-tooltip-pos="left"
              aria-label="Enroll Student"
            >
              <UserPlus class="w-4 h-4" />
            </button>

            <!-- Edit Class -->
            <button
              @click="openEditClassModal(cls)"
              class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
              :data-tooltip="t('editClassModalTitle')"
              data-tooltip-pos="left"
              aria-label="Edit Class"
            >
              <Edit3 class="w-4 h-4" />
            </button>

            <!-- Delete Class -->
            <button
              @click="openDeleteClassModal(cls)"
              class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              :data-tooltip="t('deleteClass')"
              data-tooltip-pos="left"
              aria-label="Delete Class"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 4. TABLE VIEW ALTERNATIVE                                 -->
    <!-- ========================================================= -->
    <div
      v-else
      class="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <th class="py-3 px-4">{{ isEnglish ? 'Class' : 'ថ្នាក់រៀន' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Teacher' : 'គ្រូបន្ទុក' }}</th>
              <th class="py-3 px-3 text-center">{{ isEnglish ? 'Room' : 'បន្ទប់' }}</th>
              <th class="py-3 px-3 text-center">{{ isEnglish ? 'Students' : 'សិស្ស' }}</th>
              <th class="py-3 px-3 text-center">{{ isEnglish ? 'Average' : 'មធ្យមភាគ' }}</th>
              <th class="py-3 px-3 text-center">{{ isEnglish ? 'Pass Rate' : 'អត្រាជាប់' }}</th>
              <th class="py-3 px-3 text-center">{{ isEnglish ? 'Status' : 'ស្ថានភាព' }}</th>
              <th class="py-3 px-4 text-center">{{ isEnglish ? 'Actions' : 'សកម្មភាព' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="cls in filteredClasses"
              :key="cls.id"
              class="hover:bg-slate-50/60 transition"
            >
              <td class="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                <span :class="['w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs', getCardGradientTheme(cls).badgeBg]">
                  {{ getClassShortCode(cls) }}
                </span>
                <div>
                  <div class="font-bold flex items-center gap-1.5">
                    <span>{{ formatClassName(cls.name, isEnglish) }}</span>
                    <span v-if="cls.track" class="px-1.5 py-0.2 rounded text-[9px] font-bold" :class="cls.track === 'science' ? 'bg-purple-100 text-purple-700' : cls.track === 'social' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'">
                      {{ cls.track === 'science' ? (isEnglish ? 'Science' : 'វិទ្យាសាស្ត្រ') : cls.track === 'social' ? (isEnglish ? 'Social' : 'សង្គម') : (isEnglish ? 'General' : 'ទូទៅ') }}
                    </span>
                  </div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ cls.id }}</div>
                </div>
              </td>
              <td class="py-3 px-4 font-medium text-slate-700">{{ formatTeacherName(cls.teacherName, isEnglish) }}</td>
              <td class="py-3 px-3 text-center font-medium text-slate-600">{{ formatRoom(cls.room, isEnglish) }}</td>
              <td class="py-3 px-3 text-center font-mono font-bold text-slate-800">{{ getClassStats(cls.id).totalStudents }}</td>
              <td class="py-3 px-3 text-center font-mono font-bold text-indigo-600">{{ getClassStats(cls.id).classAverage }}</td>
              <td class="py-3 px-3 text-center font-mono font-bold text-emerald-600">{{ getClassStats(cls.id).passRate }}%</td>
              <td class="py-3 px-3 text-center">
                <button
                  @click="handleToggleClassLock(cls)"
                  type="button"
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer border',
                    cls.isLocked ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  ]"
                >
                  {{ cls.isLocked ? t('locked') : t('unlocked') }}
                </button>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="inline-flex items-center gap-1">
                  <button
                    @click="openRosterDrawer(cls)"
                    class="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                    data-tooltip="View Roster"
                    data-tooltip-pos="left"
                    aria-label="View Roster"
                  >
                    <Users class="w-4 h-4" />
                  </button>
                  <button
                    @click="openEditClassModal(cls)"
                    class="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                    :data-tooltip="t('edit')"
                    data-tooltip-pos="left"
                    aria-label="Edit Class"
                  >
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button
                    @click="openDeleteClassModal(cls)"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    :data-tooltip="t('deleteClass')"
                    data-tooltip-pos="left"
                    aria-label="Delete Class"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty search result fallback -->
    <div
      v-if="filteredClasses.length === 0"
      class="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs"
    >
      <School class="w-12 h-12 mx-auto text-slate-300 mb-3" />
      <h3 class="text-sm font-bold text-slate-800">{{ t('noDataFound') }}</h3>
      <p class="text-xs text-slate-500 mt-1">No class matched your filter criteria.</p>
      <button
        @click="searchQuery = ''; selectedGradeFilter = 'all'; selectedStatusFilter = 'all'"
        class="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
      >
        Clear Filters
      </button>
    </div>

    <!-- ========================================================= -->
    <!-- 5. ROSTER INSPECTION MODAL                                -->
    <!-- ========================================================= -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showRosterDrawer && targetClassForAction"
        class="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-xs flex flex-col p-3 sm:p-6"
      >
        <div class="w-full h-full bg-white rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs', getCardGradientTheme(targetClassForAction).badgeBg]">
                {{ getClassShortCode(targetClassForAction) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-900">
                    {{ formatClassName(targetClassForAction.name, isEnglish) }} - {{ t('classRosterTitle') }}
                  </h3>
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {{ currentDrawerRoster.length }} {{ isEnglish ? 'Students' : 'សិស្ស' }}
                  </span>
                </div>
                <div class="text-xs text-slate-500 mt-0.5">
                  {{ formatTeacherName(targetClassForAction.teacherName, isEnglish) }} • {{ formatRoom(targetClassForAction.room, isEnglish) }}
                </div>
              </div>
            </div>

            <!-- Right Buttons -->
            <div class="flex items-center gap-2">
              <button
                @click="openAddStudentModal(targetClassForAction)"
                class="px-3.5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus class="w-4 h-4" />
                <span>{{ t('addStudent') }}</span>
              </button>

              <button
                @click="showRosterDrawer = false"
                class="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Drawer Table Content -->
          <div class="flex-1 overflow-auto p-6">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50/80 text-slate-600 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th class="py-3 px-3 text-center w-12">#</th>
                  <th class="py-3 px-4">{{ t('student') }}</th>
                  <th class="py-3 px-2 text-center w-12">{{ isEnglish ? 'Gender' : 'ភេទ' }}</th>
                  <th class="py-3 px-2 text-center">{{ isEnglish ? 'Math' : 'គណិត' }}</th>
                  <th class="py-3 px-2 text-center">{{ isEnglish ? 'Phys' : 'រូប' }}</th>
                  <th class="py-3 px-2 text-center">{{ isEnglish ? 'Chem' : 'គីមី' }}</th>
                  <th class="py-3 px-2 text-center">{{ isEnglish ? 'Bio' : 'ជីវ' }}</th>
                  <th class="py-3 px-2 text-center">{{ isEnglish ? 'Khm' : 'ខ្មែរ' }}</th>
                  <th class="py-3 px-2 text-center">{{ isEnglish ? 'Eng' : 'អង់គ្លេស' }}</th>
                  <th class="py-3 px-3 text-center">{{ isEnglish ? 'Total' : 'សរុប' }}</th>
                  <th class="py-3 px-3 text-center">{{ isEnglish ? 'GPA' : 'មធ្យមភាគ' }}</th>
                  <th class="py-3 px-3 text-center">{{ isEnglish ? 'Grade' : 'និទ្ទេស' }}</th>
                  <th class="py-3 px-4 text-center">{{ isEnglish ? 'Actions' : 'សកម្មភាព' }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                <tr v-for="(st, idx) in currentDrawerRoster" :key="st.id" class="hover:bg-slate-50/60 transition">
                  <td class="py-2.5 px-3 text-center font-mono text-slate-400">{{ idx + 1 }}</td>
                  <td class="py-2.5 px-4 font-bold text-slate-800">{{ st.name }}</td>
                  <td class="py-2.5 px-2 text-center font-semibold" :class="st.gender === 'F' ? 'text-pink-600' : 'text-blue-600'">{{ st.gender === 'F' ? (isEnglish ? 'F' : 'ស្រី') : (isEnglish ? 'M' : 'ប្រុស') }}</td>
                  <td class="py-2.5 px-2 text-center font-mono">{{ st.scores.math }}</td>
                  <td class="py-2.5 px-2 text-center font-mono">{{ st.scores.physics }}</td>
                  <td class="py-2.5 px-2 text-center font-mono">{{ st.scores.chemistry }}</td>
                  <td class="py-2.5 px-2 text-center font-mono">{{ st.scores.biology }}</td>
                  <td class="py-2.5 px-2 text-center font-mono">{{ st.scores.khmer }}</td>
                  <td class="py-2.5 px-2 text-center font-mono">{{ st.scores.english }}</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-indigo-900">{{ st.total }}</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-purple-900">{{ st.average }}</td>
                  <td class="py-2.5 px-3 text-center">
                    <span :class="['px-2 py-0.5 rounded-md font-bold text-[10px] border', getGradeBadgeColor(st.grade)]">
                      {{ st.grade }}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 text-center">
                    <button
                      @click="removeStudent(st.id)"
                      class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      data-tooltip="Remove Student"
                      data-tooltip-pos="left"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="currentDrawerRoster.length === 0">
                  <td colspan="13" class="py-12 text-center text-slate-400">
                    {{ isEnglish ? 'No students enrolled in this class yet. Click "+ Add Student" to enroll.' : 'មិនទាន់មានសិស្សក្នុងថ្នាក់នេះនៅឡើយទេ។ ចុច "+ បន្ថែមសិស្ស" ដើម្បីចុះឈ្មោះ។' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ========================================================= -->
    <!-- 6. MODAL: CREATE NEW CLASS                                -->
    <!-- ========================================================= -->
    <div
      v-if="showCreateClassModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Plus class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">{{ t('addClassModalTitle') }}</h3>
              <p class="text-xs text-slate-500">{{ isEnglish ? 'Configure new classroom and homeroom teacher.' : 'រៀបចំថ្នាក់រៀនថ្មី និងគ្រូបន្ទុកថ្នាក់។' }}</p>
            </div>
          </div>
          <button @click="showCreateClassModal = false" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleCreateClass" class="mt-4 space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('className') }} *</label>
            <input
              v-model="classForm.name"
              type="text"
              required
              :placeholder="isEnglish ? 'e.g. Class 12C' : 'ឧ. ថ្នាក់ទី ១២C'"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('classIdLabel') }}</label>
              <input
                v-model="classForm.id"
                type="text"
                placeholder="e.g. CLS-12C"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('roomLabel') }}</label>
              <input
                v-model="classForm.room"
                type="text"
                :placeholder="isEnglish ? 'e.g. Room 303' : 'ឧ. បន្ទប់ 303'"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('homeroomTeacher') }} *</label>
              <input
                v-model="classForm.teacherName"
                type="text"
                required
                :placeholder="isEnglish ? 'e.g. Mr. Sokha' : 'ឧ. លោកគ្រូ សុខា'"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Teacher ID</label>
              <input
                v-model="classForm.teacherId"
                type="text"
                placeholder="e.g. TEA-004"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('academicYear') }}</label>
              <input
                v-model="classForm.academicYear"
                type="text"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('evaluationMonth') }}</label>
              <input
                v-model="classForm.month"
                type="text"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <!-- Grade Level & Track -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ isEnglish ? 'Grade Level' : 'កម្រិតថ្នាក់' }}</label>
              <select
                v-model="classForm.gradeLevel"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                <option value="10">{{ isEnglish ? 'Grade 10' : 'ថ្នាក់ទី ១០' }}</option>
                <option value="11">{{ isEnglish ? 'Grade 11' : 'ថ្នាក់ទី ១១' }}</option>
                <option value="12">{{ isEnglish ? 'Grade 12' : 'ថ្នាក់ទី ១២' }}</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ isEnglish ? 'Study Track' : 'ផ្នែកសិក្សា' }}</label>
              <select
                v-model="classForm.track"
                @change="applyTrackPreset(classForm.track as any)"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                <option value="science">{{ isEnglish ? 'Science' : 'វិទ្យាសាស្ត្រ' }}</option>
                <option value="social">{{ isEnglish ? 'Social Studies' : 'សង្គម' }}</option>
                <option value="general">{{ isEnglish ? 'General / Standard' : 'ទូទៅ / មេគុណស្មើ' }}</option>
              </select>
            </div>
          </div>

          <!-- Subject Selection & Coefficients Config -->
          <div class="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>{{ isEnglish ? 'Subjects & Weighted Coefficients' : 'មុខវិជ្ជា និងមេគុណសម្រាប់គណនាមធ្យមភាគ' }}</span>
                </div>
                <div class="text-[11px] text-slate-500">
                  {{ isEnglish ? 'Select subjects and specify weighting coefficient (e.g. x2, x1.5, x1)' : 'ជ្រើសរើសមុខវិជ្ជា និងកំណត់មេគុណសម្រាប់គណនាពិន្ទុមធ្យមភាគ' }}
                </div>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 font-bold font-mono text-xs">
                  {{ isEnglish ? 'Total Coeff:' : 'មេគុណសរុប:' }} {{ totalFormCoefficients }}
                </span>
              </div>
            </div>

            <!-- Preset Buttons -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[11px] font-semibold text-slate-500">{{ isEnglish ? 'Quick Presets:' : 'កំណត់គំរូរហ័ស:' }}</span>
              <button
                type="button"
                @click="applyTrackPreset('science')"
                class="px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer"
                :class="classForm.track === 'science' ? 'bg-purple-600 text-white border-purple-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'"
              >
                {{ isEnglish ? '🔬 Science' : '🔬 វិទ្យាសាស្ត្រ' }}
              </button>
              <button
                type="button"
                @click="applyTrackPreset('social')"
                class="px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer"
                :class="classForm.track === 'social' ? 'bg-amber-600 text-white border-amber-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'"
              >
                {{ isEnglish ? '📚 Social' : '📚 សង្គម' }}
              </button>
              <button
                type="button"
                @click="applyTrackPreset('equal')"
                class="px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer"
                :class="classForm.track === 'general' ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'"
              >
                {{ isEnglish ? '⚖️ Equal (1.0)' : '⚖️ មេគុណស្មើ (1.0)' }}
              </button>
            </div>

            <!-- Subject rows list -->
            <div class="space-y-1.5 bg-white p-2 rounded-lg border border-slate-200">
              <div
                v-for="sub in classForm.subjectConfigs"
                :key="sub.key"
                class="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    v-model="sub.enabled"
                    class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span class="font-bold text-slate-800 text-xs">
                      {{ isEnglish ? sub.nameEn : sub.nameKm }}
                    </span>
                    <span class="text-[10px] text-slate-400 ml-1.5 font-mono">({{ sub.key }})</span>
                  </div>
                </label>

                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-slate-400">{{ isEnglish ? 'Coeff:' : 'មេគុណ:' }}</span>
                  <div class="flex items-center gap-1">
                    <input
                      type="number"
                      v-model.number="sub.coefficient"
                      :disabled="!sub.enabled"
                      min="0.5"
                      max="5"
                      step="0.5"
                      class="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold font-mono text-slate-800 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-40"
                    />
                    <span class="text-xs font-bold text-purple-700 font-mono">x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              @click="showCreateClassModal = false"
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
            >
              {{ t('cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition cursor-pointer shadow-xs"
            >
              {{ t('confirm') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 7. MODAL: EDIT CLASS                                      -->
    <!-- ========================================================= -->
    <div
      v-if="showEditClassModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Edit3 class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">{{ t('editClassModalTitle') }}</h3>
              <p class="text-xs text-slate-500">{{ isEnglish ? 'Update metadata and assigned homeroom teacher.' : 'កែប្រែព័ត៌មានថ្នាក់ និងគ្រូបន្ទុកថ្នាក់។' }}</p>
            </div>
          </div>
          <button @click="showEditClassModal = false" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSaveEditClass" class="mt-4 space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('className') }} *</label>
            <input
              v-model="classForm.name"
              type="text"
              required
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('homeroomTeacher') }} *</label>
              <input
                v-model="classForm.teacherName"
                type="text"
                required
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('roomLabel') }}</label>
              <input
                v-model="classForm.room"
                type="text"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('academicYear') }}</label>
              <input
                v-model="classForm.academicYear"
                type="text"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('evaluationMonth') }}</label>
              <input
                v-model="classForm.month"
                type="text"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <!-- Grade Level & Track -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ isEnglish ? 'Grade Level' : 'កម្រិតថ្នាក់' }}</label>
              <select
                v-model="classForm.gradeLevel"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                <option value="10">{{ isEnglish ? 'Grade 10' : 'ថ្នាក់ទី ១០' }}</option>
                <option value="11">{{ isEnglish ? 'Grade 11' : 'ថ្នាក់ទី ១១' }}</option>
                <option value="12">{{ isEnglish ? 'Grade 12' : 'ថ្នាក់ទី ១២' }}</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ isEnglish ? 'Study Track' : 'ផ្នែកសិក្សា' }}</label>
              <select
                v-model="classForm.track"
                @change="applyTrackPreset(classForm.track as any)"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                <option value="science">{{ isEnglish ? 'Science' : 'វិទ្យាសាស្ត្រ' }}</option>
                <option value="social">{{ isEnglish ? 'Social Studies' : 'សង្គម' }}</option>
                <option value="general">{{ isEnglish ? 'General / Standard' : 'ទូទៅ / មេគុណស្មើ' }}</option>
              </select>
            </div>
          </div>

          <!-- Subject Selection & Coefficients Config -->
          <div class="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>{{ isEnglish ? 'Subjects & Weighted Coefficients' : 'មុខវិជ្ជា និងមេគុណសម្រាប់គណនាមធ្យមភាគ' }}</span>
                </div>
                <div class="text-[11px] text-slate-500">
                  {{ isEnglish ? 'Select subjects and specify weighting coefficient (e.g. x2, x1.5, x1)' : 'ជ្រើសរើសមុខវិជ្ជា និងកំណត់មេគុណសម្រាប់គណនាពិន្ទុមធ្យមភាគ' }}
                </div>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 font-bold font-mono text-xs">
                  {{ isEnglish ? 'Total Coeff:' : 'មេគុណសរុប:' }} {{ totalFormCoefficients }}
                </span>
              </div>
            </div>

            <!-- Preset Buttons -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[11px] font-semibold text-slate-500">{{ isEnglish ? 'Quick Presets:' : 'កំណត់គំរូរហ័ស:' }}</span>
              <button
                type="button"
                @click="applyTrackPreset('science')"
                class="px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer"
                :class="classForm.track === 'science' ? 'bg-purple-600 text-white border-purple-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'"
              >
                {{ isEnglish ? '🔬 Science' : '🔬 វិទ្យាសាស្ត្រ' }}
              </button>
              <button
                type="button"
                @click="applyTrackPreset('social')"
                class="px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer"
                :class="classForm.track === 'social' ? 'bg-amber-600 text-white border-amber-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'"
              >
                {{ isEnglish ? '📚 Social' : '📚 សង្គម' }}
              </button>
              <button
                type="button"
                @click="applyTrackPreset('equal')"
                class="px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer"
                :class="classForm.track === 'general' ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'"
              >
                {{ isEnglish ? '⚖️ Equal (1.0)' : '⚖️ មេគុណស្មើ (1.0)' }}
              </button>
            </div>

            <!-- Subject rows list -->
            <div class="space-y-1.5 bg-white p-2 rounded-lg border border-slate-200">
              <div
                v-for="sub in classForm.subjectConfigs"
                :key="sub.key"
                class="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    v-model="sub.enabled"
                    class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span class="font-bold text-slate-800 text-xs">
                      {{ isEnglish ? sub.nameEn : sub.nameKm }}
                    </span>
                    <span class="text-[10px] text-slate-400 ml-1.5 font-mono">({{ sub.key }})</span>
                  </div>
                </label>

                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-slate-400">{{ isEnglish ? 'Coeff:' : 'មេគុណ:' }}</span>
                  <div class="flex items-center gap-1">
                    <input
                      type="number"
                      v-model.number="sub.coefficient"
                      :disabled="!sub.enabled"
                      min="0.5"
                      max="5"
                      step="0.5"
                      class="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold font-mono text-slate-800 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-40"
                    />
                    <span class="text-xs font-bold text-purple-700 font-mono">x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lock Toggle Checkbox -->
          <div class="pt-2 flex items-center gap-2">
            <input
              id="editClassLock"
              v-model="classForm.isLocked"
              type="checkbox"
              class="rounded-md text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
            />
            <label for="editClassLock" class="font-semibold text-slate-700 cursor-pointer">
              {{ t('lockGradebook') }} (Prevent teacher editing)
            </label>
          </div>

          <div class="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              @click="showEditClassModal = false"
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
            >
              {{ t('cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer shadow-xs"
            >
              {{ t('save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 8. MODAL: ADD STUDENT TO CLASS                            -->
    <!-- ========================================================= -->
    <div
      v-if="showAddStudentModal && targetClassForAction"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <UserPlus class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">{{ t('modalAddStudentTitle') }}</h3>
              <p class="text-xs text-slate-500">Enrolling to <strong class="text-purple-700">{{ targetClassForAction.name }}</strong></p>
            </div>
          </div>
          <button @click="showAddStudentModal = false" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleAddStudent" class="mt-4 space-y-4 text-xs">
          <!-- Full Name -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('studentFullName') }}</label>
            <input
              v-model="newStudentForm.name"
              type="text"
              required
              placeholder="e.g. ឈន វាសនា"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            />
          </div>

          <!-- Gender & DOB -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('gender') }}</label>
              <select
                v-model="newStudentForm.gender"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
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
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
              />
            </div>
          </div>

          <!-- Remarks -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('remarks') }}</label>
            <input
              v-model="newStudentForm.remarks"
              type="text"
              placeholder="e.g. សិស្សទើបផ្ទេរចូល"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <!-- Initial Subject Scores -->
          <div>
            <label class="block font-semibold text-slate-700 mb-2">{{ t('initialScoresTitle') }}</label>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div>
                <label class="text-[10px] font-semibold text-slate-500 block mb-1">{{ t('subjectMath') }}</label>
                <input
                  v-model.number="newStudentForm.scores.math"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label class="text-[10px] font-semibold text-slate-500 block mb-1">{{ t('subjectPhysics') }}</label>
                <input
                  v-model.number="newStudentForm.scores.physics"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label class="text-[10px] font-semibold text-slate-500 block mb-1">{{ t('subjectChemistry') }}</label>
                <input
                  v-model.number="newStudentForm.scores.chemistry"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label class="text-[10px] font-semibold text-slate-500 block mb-1">{{ t('subjectBiology') }}</label>
                <input
                  v-model.number="newStudentForm.scores.biology"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label class="text-[10px] font-semibold text-slate-500 block mb-1">{{ t('subjectKhmer') }}</label>
                <input
                  v-model.number="newStudentForm.scores.khmer"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label class="text-[10px] font-semibold text-slate-500 block mb-1">{{ t('subjectEnglish') }}</label>
                <input
                  v-model.number="newStudentForm.scores.english"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              @click="showAddStudentModal = false"
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
            >
              {{ t('cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer shadow-xs"
            >
              {{ t('addStudent') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 9. MODAL: MANAGE ROLE PASSWORDS                           -->
    <!-- ========================================================= -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <KeyRound class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">{{ t('modalManagePasswordsTitle') }}</h3>
              <p class="text-xs text-slate-500">{{ t('modalManagePasswordsSubtitle') }}</p>
            </div>
          </div>
          <button @click="showPasswordModal = false" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSavePasswords" class="mt-4 space-y-4 text-xs">
          <!-- Admin Password -->
          <div>
            <label class="block font-semibold text-purple-700 mb-1">{{ t('adminPasswordLabel') }} *</label>
            <input
              v-model="passwordForm.admin"
              type="text"
              required
              class="w-full px-3.5 py-2 bg-purple-50/50 border border-purple-200 rounded-xl text-slate-900 font-mono font-bold"
            />
            <p class="text-[11px] text-slate-400 mt-1">{{ t('adminPassDesc') }}</p>
          </div>

          <!-- Teacher Password -->
          <div>
            <label class="block font-semibold text-indigo-700 mb-1">{{ t('teacherPasswordLabel') }} *</label>
            <input
              v-model="passwordForm.teacher"
              type="text"
              required
              class="w-full px-3.5 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-slate-900 font-mono font-bold"
            />
            <p class="text-[11px] text-slate-400 mt-1">{{ t('teacherPassDesc') }}</p>
          </div>

          <!-- Student Password -->
          <div>
            <label class="block font-semibold text-blue-700 mb-1">{{ t('studentPasswordLabel') }} *</label>
            <input
              v-model="passwordForm.student"
              type="text"
              required
              class="w-full px-3.5 py-2 bg-blue-50/50 border border-blue-200 rounded-xl text-slate-900 font-mono font-bold"
            />
            <p class="text-[11px] text-slate-400 mt-1">{{ t('studentPassDesc') }}</p>
          </div>

          <div class="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              @click="showPasswordModal = false"
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
            >
              {{ t('cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition cursor-pointer shadow-xs"
            >
              {{ t('save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 10. MODAL: DELETE CLASS CONFIRMATION                      -->
    <!-- ========================================================= -->
    <div
      v-if="showDeleteConfirmModal && targetClassForAction"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
        <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
          <Trash2 class="w-6 h-6" />
        </div>
        <h3 class="text-base font-bold text-slate-900">{{ t('deleteClassConfirm') }}</h3>
        <p class="text-xs text-slate-500 mt-1">
          {{ isEnglish ? 'Are you sure you want to remove' : 'តើអ្នកពិតជាចង់លុប' }} <strong class="text-rose-600">{{ formatClassName(targetClassForAction.name, isEnglish) }}</strong>? {{ t('deleteClassWarning') }}
        </p>

        <div class="mt-6 flex items-center justify-center gap-3">
          <button
            @click="showDeleteConfirmModal = false"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            {{ t('cancel') }}
          </button>
          <button
            @click="handleConfirmDeleteClass"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
          >
            {{ t('deleteConfirmBtn') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

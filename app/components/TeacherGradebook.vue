<!-- components/TeacherGradebook.vue -->
<script setup lang="ts">
import type { RawStudent, ComputedStudent, SchoolClass, SubjectKey } from '~/types'
import { computeStudentsGrades } from '~/utils/gradeCalculation'
import {
  GraduationCap,
  Search,
  Plus,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  Trash2,
  FileText,
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  Filter,
  X,
  UserPlus,
  School
} from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    initialClassId?: string
    allowClassSelection?: boolean
  }>(),
  {
    allowClassSelection: true
  }
)

const { user, isTeacher, isAdmin } = useAuth()
const {
  classes,
  students,
  activeClassId,
  batchUpdateScores,
  addStudent,
  removeStudent,
  toggleClassLock,
  getGradeBadgeColor
} = useScore()
const { t, isEnglish } = useI18n()
const router = useRouter()

// Selected Class state
const selectedClassId = ref<string>(
  props.initialClassId || (isTeacher.value && user.value?.classId ? user.value.classId : activeClassId.value)
)

// Search & Filter state
const searchQuery = ref('')
const selectedGradeFilter = ref<'all' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('all')
const selectedGenderFilter = ref<'all' | 'M' | 'F'>('all')
const sortBy = ref<'rank' | 'name' | 'average' | 'total'>('rank')

// Modals and notifications state
const showAddStudentModal = ref(false)
const showDeleteConfirmModal = ref(false)
const targetStudentToDelete = ref<string | null>(null)
const toastMessage = ref<string | null>(null)
const lastSavedTimeString = ref<string | null>(null)

// Form for enrolling student
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

// Current Class Metadata
const currentClass = computed<SchoolClass>(() => {
  return (
    classes.value.find((c) => c.id === selectedClassId.value) ||
    classes.value[0] || {
      id: 'CLS-12A',
      name: 'ថ្នាក់ទី ១២A (Class 12A)',
      teacherId: 'TEA-001',
      teacherName: 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
      room: 'Room 301',
      academicYear: '2025-2026',
      isLocked: false
    }
  )
})

// Local working copy of students for live mark editing
const localRoster = ref<RawStudent[]>([])

// Sync local working copy from store
const syncLocalRoster = () => {
  const currentStudents = students.value.filter(
    (s) => !s.classId || s.classId === selectedClassId.value
  )
  localRoster.value = JSON.parse(JSON.stringify(currentStudents))
}

watch(
  [selectedClassId, () => students.value.length],
  () => {
    syncLocalRoster()
  },
  { immediate: true }
)

// Check for unsaved changes
const hasUnsavedChanges = computed(() => {
  const currentStudents = students.value.filter(
    (s) => !s.classId || s.classId === selectedClassId.value
  )
  if (localRoster.value.length !== currentStudents.length) return true
  return JSON.stringify(localRoster.value) !== JSON.stringify(currentStudents)
})

// Live automated calculations of Grades, GPA, Total, and Rank
const computedRoster = computed<ComputedStudent[]>(() => {
  return computeStudentsGrades(localRoster.value, currentClass.value?.subjectConfigs)
})

// Filtered and Sorted list for the table
const filteredRoster = computed<ComputedStudent[]>(() => {
  let list = [...computedRoster.value]

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    )
  }

  // Grade filter
  if (selectedGradeFilter.value !== 'all') {
    list = list.filter((s) => s.grade === selectedGradeFilter.value)
  }

  // Gender filter
  if (selectedGenderFilter.value !== 'all') {
    list = list.filter((s) => s.gender === selectedGenderFilter.value)
  }

  // Sort
  list.sort((a, b) => {
    if (sortBy.value === 'average') return b.average - a.average
    if (sortBy.value === 'total') return b.total - a.total
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    return a.rank - b.rank
  })

  return list
})

// Real-time Class KPIs
const liveClassStats = computed(() => {
  const list = computedRoster.value
  const totalStudents = list.length

  if (totalStudents === 0) {
    return {
      totalStudents: 0,
      maleCount: 0,
      femaleCount: 0,
      classAverage: 0,
      passRate: 0,
      passedCount: 0,
      topStudent: null,
      gradeCounts: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
    }
  }

  const maleCount = list.filter((s) => s.gender === 'M').length
  const femaleCount = list.filter((s) => s.gender === 'F').length

  const sumOfAverages = list.reduce((acc, s) => acc + s.average, 0)
  const classAverage = Number((sumOfAverages / totalStudents).toFixed(1))

  const passedCount = list.filter((s) => s.grade !== 'F').length
  const passRate = Math.round((passedCount / totalStudents) * 100)

  const topStudent = [...list].sort((a, b) => b.average - a.average)[0] || null

  const gradeCounts = {
    A: list.filter((s) => s.grade === 'A').length,
    B: list.filter((s) => s.grade === 'B').length,
    C: list.filter((s) => s.grade === 'C').length,
    D: list.filter((s) => s.grade === 'D').length,
    E: list.filter((s) => s.grade === 'E').length,
    F: list.filter((s) => s.grade === 'F').length
  }

  return {
    totalStudents,
    maleCount,
    femaleCount,
    classAverage,
    passRate,
    passedCount,
    topStudent,
    gradeCounts
  }
})

// Toast notification helper
const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = null
  }, 3500)
}

// Score change handler for live validation
const handleScoreInput = (studentId: string, subject: SubjectKey, val: string | number) => {
  if (currentClass.value.isLocked) return
  const num = Math.min(100, Math.max(0, Number(val) || 0))
  const target = localRoster.value.find((s) => s.id === studentId)
  if (target) {
    target.scores[subject] = num
  }
}

// Batch Save Marks
const handleSaveMarks = () => {
  if (currentClass.value.isLocked) {
    showToast(isEnglish.value ? 'Gradebook is locked.' : 'ពិន្ទុត្រូវបានចាក់សោ។')
    return
  }

  const success = batchUpdateScores(localRoster.value)
  if (success) {
    lastSavedTimeString.value = new Date().toLocaleTimeString('km-KH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    showToast(t('marksSavedSuccess'))
  }
}

// Discard Unsaved Changes
const handleDiscardChanges = () => {
  syncLocalRoster()
  showToast(isEnglish.value ? 'Changes discarded.' : 'បានបោះបង់ការកែប្រែ។')
}

// Add Student to Current Class
const handleAddStudent = () => {
  if (!newStudentForm.name.trim()) return
  addStudent({
    name: newStudentForm.name.trim(),
    gender: newStudentForm.gender,
    dob: newStudentForm.dob,
    remarks: newStudentForm.remarks.trim() || 'New student',
    scores: { ...newStudentForm.scores },
    targetClassId: currentClass.value.id
  })
  showAddStudentModal.value = false
  syncLocalRoster()
  showToast(isEnglish.value ? `Enrolled ${newStudentForm.name}` : `បានបញ្ចូលសិស្ស ${newStudentForm.name}`)
}

// Open Delete Confirm
const openDeleteModal = (studentId: string) => {
  targetStudentToDelete.value = studentId
  showDeleteConfirmModal.value = true
}

const confirmDeleteStudent = () => {
  if (targetStudentToDelete.value) {
    removeStudent(targetStudentToDelete.value)
    showDeleteConfirmModal.value = false
    syncLocalRoster()
    showToast(isEnglish.value ? 'Student removed.' : 'បានលុបសិស្សរួចរាល់។')
  }
}

// Jump to Student Portal for detailed scorecard
const viewStudentScorecard = (studentId: string) => {
  if (isAdmin.value) {
    router.push(`/admin/student?id=${studentId}`)
  } else {
    router.push(`/teacher/student?id=${studentId}`)
  }
}

// Toggle Lock for current class (Admin only)
const handleToggleLock = () => {
  const locked = toggleClassLock(currentClass.value.id)
  showToast(locked ? 'Gradebook locked.' : 'Gradebook unlocked.')
}

// Subjects list
const subjects: Array<{ key: SubjectKey; labelKm: string; labelEn: string; short: string }> = [
  { key: 'math', labelKm: 'គណិត', labelEn: 'Math', short: 'MATH' },
  { key: 'physics', labelKm: 'រូបវិទ្យា', labelEn: 'Physics', short: 'PHYS' },
  { key: 'chemistry', labelKm: 'គីមី', labelEn: 'Chem', short: 'CHEM' },
  { key: 'biology', labelKm: 'ជីវវិទ្យា', labelEn: 'Biology', short: 'BIO' },
  { key: 'khmer', labelKm: 'ភាសាខ្មែរ', labelEn: 'Khmer', short: 'KHM' },
  { key: 'english', labelKm: 'អង់គ្លេស', labelEn: 'English', short: 'ENG' }
]

// Get subject weighting coefficient for the current class
const getSubjectCoefficient = (subKey: string): number => {
  const cfg = currentClass.value?.subjectConfigs?.find((c) => c.key === subKey)
  return cfg ? cfg.coefficient : 1
}
</script>

<template>
  <div class="space-y-6">
    <!-- Toast Notification Banner -->
    <Transition
      enter-active-class="transform transition ease-out duration-200"
      enter-from-class="translate-y-2 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="toastMessage"
        class="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 text-white rounded-xl shadow-xl backdrop-blur border border-slate-800 text-xs font-semibold"
      >
        <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- ========================================================= -->
    <!-- 1. DASHBOARD HEADER & CONTEXT BAR                         -->
    <!-- ========================================================= -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Title, Class Name & Info -->
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <GraduationCap class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-xl font-bold text-slate-900 tracking-tight">
                {{ t('gradebookTitle') }}
              </h1>
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                {{ formatClassName(currentClass.name, isEnglish) }}
              </span>
              <!-- Grade & Track Badges -->
              <span v-if="currentClass.gradeLevel" class="px-2 py-0.5 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700">
                {{ isEnglish ? 'Grade ' + currentClass.gradeLevel : 'ថ្នាក់ទី ' + currentClass.gradeLevel }}
              </span>
              <span v-if="currentClass.track" class="px-2 py-0.5 text-[11px] font-semibold rounded-lg" :class="currentClass.track === 'science' ? 'bg-purple-100 text-purple-700' : currentClass.track === 'social' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'">
                {{ currentClass.track === 'science' ? (isEnglish ? 'Science Track' : 'ផ្នែកវិទ្យាសាស្ត្រ') : currentClass.track === 'social' ? (isEnglish ? 'Social Track' : 'ផ្នែកសង្គម') : (isEnglish ? 'General' : 'ទូទៅ') }}
              </span>
              <!-- Visual Status Badge -->
              <span
                :class="[
                  'px-2.5 py-0.5 text-[11px] font-semibold rounded-full border flex items-center gap-1.5',
                  currentClass.isLocked
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                ]"
                :data-tooltip="currentClass.isLocked ? t('editingLockedNoticeBody') : 'Marks editing is enabled'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="currentClass.isLocked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'"></span>
                <span>{{ currentClass.isLocked ? t('locked') : t('unlocked') }}</span>
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              {{ formatTeacherName(currentClass.teacherName, isEnglish) }} • {{ formatRoom(currentClass.room, isEnglish) }} • {{ currentClass.academicYear || '2025-2026' }}
            </p>
          </div>
        </div>

        <!-- Class Selector & Actions Strip -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Class Selector Dropdown -->
          <div v-if="allowClassSelection" class="flex items-center gap-2">
            <div class="relative">
              <select
                v-model="selectedClassId"
                class="pl-8 pr-7 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none"
              >
                <option v-for="c in classes" :key="c.id" :value="c.id">
                  {{ formatClassName(c.name, isEnglish) }}
                </option>
              </select>
              <School class="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <!-- Add Student Button (Contextual CTA) -->
          <button
            @click="showAddStudentModal = true"
            type="button"
            class="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            data-tooltip="Enroll new student"
          >
            <Plus class="w-4 h-4 text-slate-600" />
            <span class="hidden sm:inline">{{ t('addStudent') }}</span>
          </button>

          <!-- Discard Changes (Icon button with tooltip) -->
          <button
            v-if="hasUnsavedChanges"
            @click="handleDiscardChanges"
            type="button"
            class="p-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition flex items-center justify-center cursor-pointer"
            data-tooltip="Revert uncommitted edits"
          >
            <RotateCcw class="w-4 h-4" />
          </button>

          <!-- Admin Lock Toggle (Subtle icon button) -->
          <button
            v-if="isAdmin"
            @click="handleToggleLock"
            type="button"
            :class="[
              'p-2 rounded-xl border transition cursor-pointer flex items-center justify-center',
              currentClass.isLocked
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            ]"
            :data-tooltip="currentClass.isLocked ? 'Unlock Gradebook' : 'Lock Gradebook'"
          >
            <Lock v-if="currentClass.isLocked" class="w-4 h-4 text-rose-600" />
            <Unlock v-else class="w-4 h-4 text-slate-500" />
          </button>

          <!-- Primary Call-to-Action: Save Marks -->
          <button
            @click="handleSaveMarks"
            type="button"
            :disabled="currentClass.isLocked || !hasUnsavedChanges"
            :class="[
              'px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs',
              hasUnsavedChanges && !currentClass.isLocked
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 ring-2 ring-emerald-400/30'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60 shadow-none'
            ]"
            :data-tooltip="hasUnsavedChanges ? 'Commit changes to storage' : 'All marks saved'"
          >
            <Save class="w-4 h-4" />
            <span>{{ t('saveMarks') }}</span>
            <span v-if="hasUnsavedChanges" class="w-2 h-2 rounded-full bg-emerald-200 animate-pulse"></span>
          </button>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- 2. SCANNABLE CLASS KPIS GRID (Clean 4-column layout)       -->
      <!-- ========================================================= -->
      <div class="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- KPI 1: Enrolled Students -->
        <div class="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold text-slate-500">{{ t('totalStudents') }}</span>
            <Users class="w-4 h-4" />
          </div>
          <div class="mt-2">
            <div class="text-2xl font-black text-slate-900 font-mono">{{ liveClassStats.totalStudents }}</div>
            <div class="text-xs text-slate-500 mt-0.5">
              <span class="text-blue-600 font-semibold">{{ isEnglish ? `${liveClassStats.maleCount} M` : `ប្រុស ${liveClassStats.maleCount}` }}</span> • 
              <span class="text-pink-600 font-semibold">{{ isEnglish ? `${liveClassStats.femaleCount} F` : `ស្រី ${liveClassStats.femaleCount}` }}</span>
            </div>
          </div>
        </div>

        <!-- KPI 2: Live Class Average -->
        <div class="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold text-slate-500">{{ t('classAverage') }}</span>
            <TrendingUp class="w-4 h-4 text-indigo-500" />
          </div>
          <div class="mt-2">
            <div class="text-2xl font-black text-indigo-600 font-mono">{{ liveClassStats.classAverage }}</div>
            <div class="text-xs text-slate-400 font-mono">{{ isEnglish ? 'Scale / 100' : 'ពិន្ទុពេញ / ១០០' }}</div>
          </div>
        </div>

        <!-- KPI 3: Pass Rate -->
        <div class="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold text-slate-500">{{ t('passRate') }}</span>
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          </div>
          <div class="mt-2">
            <div class="flex items-baseline justify-between">
              <span class="text-2xl font-black text-emerald-600 font-mono">{{ liveClassStats.passRate }}%</span>
              <span class="text-xs text-slate-400 font-mono">{{ liveClassStats.passedCount }}/{{ liveClassStats.totalStudents }}</span>
            </div>
            <div class="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                class="bg-emerald-500 h-full rounded-full transition-all duration-300"
                :style="{ width: `${liveClassStats.passRate}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- KPI 4: Top Performer -->
        <div class="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Top Performer' : 'សិស្សឆ្នើម' }}</span>
            <Award class="w-4 h-4 text-amber-500" />
          </div>
          <div class="mt-2">
            <div class="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
              <span>🥇</span>
              <span class="truncate">{{ liveClassStats.topStudent ? liveClassStats.topStudent.name : '—' }}</span>
            </div>
            <div class="text-xs text-slate-400 font-mono mt-0.5">
              {{ liveClassStats.topStudent ? `${liveClassStats.topStudent.average} Avg • Grade ${liveClassStats.topStudent.grade}` : 'No data' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 3. SEARCH & QUICK FILTER CONTROLS TOOLBAR                 -->
    <!-- ========================================================= -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-sm">
        <Search class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('searchStudentPlaceholder')"
          class="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
        />
      </div>

      <!-- Quick Filter & Sort Options -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <!-- Grade Filter -->
        <div class="relative">
          <select
            v-model="selectedGradeFilter"
            class="pl-7 pr-6 py-2 rounded-xl bg-slate-50/80 border border-slate-200 font-medium text-slate-700 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
          >
            <option value="all">{{ isEnglish ? 'Grade: All' : 'និទ្ទេស៖ ទាំងអស់' }}</option>
            <option value="A">{{ isEnglish ? 'Grade A' : 'និទ្ទេស A' }}</option>
            <option value="B">{{ isEnglish ? 'Grade B' : 'និទ្ទេស B' }}</option>
            <option value="C">{{ isEnglish ? 'Grade C' : 'និទ្ទេស C' }}</option>
            <option value="D">{{ isEnglish ? 'Grade D' : 'និទ្ទេស D' }}</option>
            <option value="E">{{ isEnglish ? 'Grade E' : 'និទ្ទេស E' }}</option>
            <option value="F">{{ isEnglish ? 'Grade F' : 'និទ្ទេស F' }}</option>
          </select>
          <Filter class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
        </div>

        <!-- Gender Filter -->
        <select
          v-model="selectedGenderFilter"
          class="px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 font-medium text-slate-700 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="all">{{ isEnglish ? 'Gender: All' : 'ភេទ៖ ទាំងអស់' }}</option>
          <option value="M">{{ isEnglish ? 'Male' : 'ប្រុស' }}</option>
          <option value="F">{{ isEnglish ? 'Female' : 'ស្រី' }}</option>
        </select>

        <!-- Sort By -->
        <div class="relative">
          <select
            v-model="sortBy"
            class="pl-7 pr-6 py-2 rounded-xl bg-slate-50/80 border border-slate-200 font-medium text-slate-700 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
          >
            <option value="rank">{{ isEnglish ? 'Sort: Rank' : 'តម្រៀប៖ ចំណាត់ថ្នាក់' }}</option>
            <option value="name">{{ isEnglish ? 'Sort: Name' : 'តម្រៀប៖ ឈ្មោះ' }}</option>
            <option value="average">{{ isEnglish ? 'Sort: GPA' : 'តម្រៀប៖ មធ្យមភាគ' }}</option>
            <option value="total">{{ isEnglish ? 'Sort: Total' : 'តម្រៀប៖ សរុប' }}</option>
          </select>
          <ArrowUpDown class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
        </div>

        <span class="text-xs text-slate-400 font-mono px-2">
          {{ filteredRoster.length }} {{ isEnglish ? 'students' : 'នាក់' }}
        </span>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 4. CLEAN GRADEBOOK SPREADSHEET TABLE                      -->
    <!-- ========================================================= -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Unsaved Changes Notice Banner -->
      <div
        v-if="hasUnsavedChanges && !currentClass.isLocked"
        class="bg-amber-50/90 border-b border-amber-200 py-2.5 px-4 text-xs font-semibold text-amber-900 flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <AlertCircle class="w-4 h-4 text-amber-600 animate-pulse" />
          <span>{{ t('unsavedWarning') }}</span>
        </div>
        <button
          @click="handleSaveMarks"
          class="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <Save class="w-3.5 h-3.5" />
          <span>{{ t('saveMarks') }}</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <th class="py-3 px-3 text-center w-14 border-r border-slate-200/60">{{ isEnglish ? 'Rank' : 'ចំណាត់ថ្នាក់' }}</th>
              <th class="py-3 px-4 min-w-[180px] border-r border-slate-200/60">{{ t('student') }}</th>
              <th class="py-3 px-2 text-center w-12 border-r border-slate-200/60">{{ isEnglish ? 'Gender' : 'ភេទ' }}</th>

              <!-- 6 Subject Columns with clear headers & coefficients -->
              <th
                v-for="sub in subjects"
                :key="sub.key"
                class="py-3 px-2 text-center w-20 border-r border-slate-200/60"
              >
                <div class="flex flex-col items-center">
                  <span class="font-bold">{{ isEnglish ? sub.labelEn : sub.labelKm }}</span>
                  <div class="flex items-center gap-1 mt-0.5">
                    <span class="text-[9px] font-normal text-slate-400 font-mono">{{ sub.short }}</span>
                    <span class="text-[9px] font-bold font-mono px-1 rounded bg-purple-100 text-purple-700" :title="`Coefficient: x${getSubjectCoefficient(sub.key)}`">
                      x{{ getSubjectCoefficient(sub.key) }}
                    </span>
                  </div>
                </div>
              </th>

              <!-- Calculated Columns -->
              <th class="py-3 px-3 text-center w-18 border-r border-slate-200/60 bg-indigo-50/30 text-indigo-950 font-bold">
                {{ isEnglish ? 'Total' : 'សរុប' }}
              </th>
              <th class="py-3 px-3 text-center w-18 border-r border-slate-200/60 bg-purple-50/30 text-purple-950 font-bold">
                {{ isEnglish ? 'GPA' : 'មធ្យមភាគ' }}
              </th>
              <th class="py-3 px-3 text-center w-16 border-r border-slate-200/60">{{ isEnglish ? 'Grade' : 'និទ្ទេស' }}</th>
              <th class="py-3 px-4 text-center w-20">{{ isEnglish ? 'Actions' : 'សកម្មភាព' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr
              v-for="st in filteredRoster"
              :key="st.id"
              class="hover:bg-slate-50/60 transition group"
            >
              <!-- Rank Column with Medals -->
              <td class="py-3 px-3 text-center font-mono font-bold border-r border-slate-100 text-xs">
                <span v-if="st.rank === 1" class="text-base" data-tooltip="Rank #1">🥇</span>
                <span v-else-if="st.rank === 2" class="text-base" data-tooltip="Rank #2">🥈</span>
                <span v-else-if="st.rank === 3" class="text-base" data-tooltip="Rank #3">🥉</span>
                <span v-else class="text-slate-400">#{{ st.rank }}</span>
              </td>

              <!-- Student Name & ID -->
              <td class="py-3 px-4 border-r border-slate-100">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/60">
                    {{ st.name.charAt(0) }}
                  </div>
                  <div class="truncate">
                    <div class="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition">{{ st.name }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ st.id }}</div>
                  </div>
                </div>
              </td>

              <!-- Gender -->
              <td class="py-3 px-2 text-center border-r border-slate-100 font-semibold text-xs">
                <span :class="st.gender === 'F' ? 'text-pink-600' : 'text-blue-600'">
                  {{ st.gender }}
                </span>
              </td>

              <!-- 6 Subject Live Editable Inputs -->
              <td
                v-for="sub in subjects"
                :key="sub.key"
                class="py-2 px-1.5 text-center border-r border-slate-100"
              >
                <input
                  :value="st.scores[sub.key]"
                  @input="handleScoreInput(st.id, sub.key, ($event.target as HTMLInputElement).value)"
                  type="number"
                  min="0"
                  max="100"
                  :disabled="currentClass.isLocked"
                  :class="[
                    'w-16 py-1.5 px-1 rounded-lg text-center font-mono font-bold transition text-xs border focus:outline-none focus:ring-2',
                    currentClass.isLocked
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : st.scores[sub.key] < 50
                      ? 'bg-rose-50/80 border-rose-300 text-rose-700 focus:ring-rose-500/20'
                      : 'bg-white border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-800'
                  ]"
                />
              </td>

              <!-- Total Score -->
              <td class="py-3 px-3 text-center font-mono font-bold text-indigo-900 border-r border-slate-100 bg-indigo-50/10">
                {{ st.total }}
              </td>

              <!-- GPA Average -->
              <td class="py-3 px-3 text-center font-mono font-black text-purple-900 border-r border-slate-100 bg-purple-50/10">
                {{ st.average }}
              </td>

              <!-- Letter Grade Badge -->
              <td class="py-3 px-3 text-center border-r border-slate-100">
                <span :class="['px-2 py-0.5 rounded-md font-bold text-[10px] border', getGradeBadgeColor(st.grade)]">
                  {{ st.grade }}
                </span>
              </td>

              <!-- Action Buttons with Tooltips (Contextual Iconography) -->
              <td class="py-2 px-3 text-center whitespace-nowrap">
                <div class="inline-flex items-center gap-1">
                  <button
                    @click="viewStudentScorecard(st.id)"
                    type="button"
                    class="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                    data-tooltip="View Student Scorecard"
                    data-tooltip-pos="left"
                    aria-label="View Student Scorecard"
                  >
                    <FileText class="w-4 h-4" />
                  </button>
                  <button
                    @click="openDeleteModal(st.id)"
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    data-tooltip="Remove Student"
                    data-tooltip-pos="left"
                    aria-label="Remove Student"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredRoster.length === 0">
              <td colspan="13" class="py-12 text-center text-slate-400">
                No students found. Click "+ Add Student" to enroll students.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- MODAL: ADD STUDENT TO CLASS                               -->
    <!-- ========================================================= -->
    <div
      v-if="showAddStudentModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <UserPlus class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">{{ t('modalAddStudentTitle') }}</h3>
              <p class="text-xs text-slate-500">{{ isEnglish ? 'Enrolling into' : 'បញ្ចូលទៅក្នុងថ្នាក់' }} <strong class="text-indigo-600">{{ formatClassName(currentClass.name, isEnglish) }}</strong></p>
            </div>
          </div>
          <button @click="showAddStudentModal = false" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleAddStudent" class="mt-5 space-y-4 text-xs">
          <!-- Full Name -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('studentFullName') }}</label>
            <input
              v-model="newStudentForm.name"
              type="text"
              required
              :placeholder="isEnglish ? 'e.g. Piseth Sun' : 'ឧ. ស៊ុន ពិសិដ្ឋ'"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 text-xs"
            />
          </div>

          <!-- Gender & DOB -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('gender') }}</label>
              <select
                v-model="newStudentForm.gender"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-xs"
              >
                <option value="M">{{ isEnglish ? 'Male' : 'ប្រុស' }}</option>
                <option value="F">{{ isEnglish ? 'Female' : 'ស្រី' }}</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('dob') }}</label>
              <input
                v-model="newStudentForm.dob"
                type="date"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs"
              />
            </div>
          </div>

          <!-- Initial Subject Scores -->
          <div>
            <label class="block font-semibold text-slate-700 mb-2">{{ t('initialScoresTitle') }}</label>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div v-for="sub in subjects" :key="sub.key">
                <label class="text-[10px] font-semibold text-slate-500 block mb-1">{{ isEnglish ? sub.labelEn : sub.labelKm }}</label>
                <input
                  v-model.number="newStudentForm.scores[sub.key]"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              @click="showAddStudentModal = false"
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              {{ t('cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
            >
              {{ t('addStudent') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- MODAL: DELETE CONFIRMATION                                -->
    <!-- ========================================================= -->
    <div
      v-if="showDeleteConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
        <div class="w-11 h-11 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
          <Trash2 class="w-5 h-5" />
        </div>
        <h3 class="text-sm font-bold text-slate-900">{{ t('modalDeleteStudentTitle') }}</h3>
        <p class="text-xs text-slate-500 mt-1">Remove this student from class roster?</p>

        <div class="mt-5 flex items-center justify-center gap-2">
          <button
            @click="showDeleteConfirmModal = false"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            {{ t('cancel') }}
          </button>
          <button
            @click="confirmDeleteStudent"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
          >
            {{ t('deleteConfirmBtn') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

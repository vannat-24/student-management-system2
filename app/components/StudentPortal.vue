<!-- components/StudentPortal.vue -->
<script setup lang="ts">
import type { ComputedStudent, SchoolClass, SubjectKey } from '~/types'
import {
  User,
  Users,
  Printer,
  Search,
  Award,
  TrendingUp,
  Plus,
  X,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileCheck,
  School,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileSpreadsheet
} from 'lucide-vue-next'
import TeacherGradebook from '~/components/TeacherGradebook.vue'

const props = withDefaults(
  defineProps<{
    initialStudentId?: string
    initialClassId?: string
    allowStudentSelection?: boolean
  }>(),
  {
    allowStudentSelection: true
  }
)

const { user, isStudent, isTeacher, isAdmin } = useAuth()
const {
  classes,
  allComputedStudents,
  getStudentsForClass,
  getClassStats,
  addStudent,
  getGradeBadgeColor
} = useScore()
const { t, isEnglish } = useI18n()
const route = useRoute()

// Selected Class and Student state
const selectedClassId = ref<string>(
  props.initialClassId || (isStudent.value && user.value?.classId ? user.value.classId : 'CLS-12A')
)
const selectedStudentId = ref<string>('')
const studentSearchQuery = ref<string>('')
const classmateSearchQuery = ref<string>('')
const viewTab = ref<'personal' | 'classRoster' | 'gradebook' | 'reportCard'>('personal')

// Modal & Toast states
const showAddStudentModal = ref(false)
const toastMessage = ref<string | null>(null)

// New Student Form
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

// Subject configuration
const SUBJECTS: Array<{
  key: SubjectKey
  nameKm: string
  nameEn: string
  short: string
  color: string
  iconBg: string
}> = [
  { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', short: 'MATH-12', color: 'bg-blue-600', iconBg: 'bg-blue-50 text-blue-600' },
  { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', short: 'PHYS-12', color: 'bg-amber-500', iconBg: 'bg-amber-50 text-amber-600' },
  { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', short: 'CHEM-12', color: 'bg-emerald-600', iconBg: 'bg-emerald-50 text-emerald-600' },
  { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', short: 'BIO-12', color: 'bg-teal-600', iconBg: 'bg-teal-50 text-teal-600' },
  { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', short: 'KHM-12', color: 'bg-rose-500', iconBg: 'bg-rose-50 text-rose-600' },
  { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', short: 'ENG-12', color: 'bg-indigo-600', iconBg: 'bg-indigo-50 text-indigo-600' }
]

// Determine available students in current class selection
const availableStudents = computed<ComputedStudent[]>(() => {
  if (selectedClassId.value === 'all') {
    return allComputedStudents.value
  }
  return getStudentsForClass(selectedClassId.value)
})

// Filtered classmates for the class roster tab
const filteredClassmates = computed<ComputedStudent[]>(() => {
  let list = availableStudents.value
  if (classmateSearchQuery.value.trim()) {
    const q = classmateSearchQuery.value.toLowerCase().trim()
    list = list.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
  }
  return list
})

// Initialize current selected student
const initSelectedStudent = () => {
  if (isStudent.value && user.value) {
    const found = allComputedStudents.value.find(
      (s) =>
        (user.value?.studentId && s.id === user.value.studentId) ||
        (user.value?.id && s.id === user.value.id) ||
        s.name.toLowerCase().includes(user.value?.name.toLowerCase() || '')
    )
    if (found) {
      selectedStudentId.value = found.id
      selectedClassId.value = found.classId || 'CLS-12A'
      return
    }
  }

  if (props.initialStudentId) {
    selectedStudentId.value = props.initialStudentId
    return
  }

  if (availableStudents.value.length > 0) {
    selectedStudentId.value = availableStudents.value[0].id
  } else if (allComputedStudents.value.length > 0) {
    selectedStudentId.value = allComputedStudents.value[0].id
  }
}

watch(
  [selectedClassId, () => allComputedStudents.value.length],
  () => {
    if (!isStudent.value) {
      if (!availableStudents.value.some((s) => s.id === selectedStudentId.value)) {
        if (availableStudents.value.length > 0) {
          selectedStudentId.value = availableStudents.value[0].id
        }
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  initSelectedStudent()
  if (route.query.tab === 'gradebook') {
    viewTab.value = 'gradebook'
  }
  if (route.query.classId) {
    selectedClassId.value = String(route.query.classId)
  }
})

watch(
  () => route.query,
  (q) => {
    if (q.tab === 'gradebook') {
      viewTab.value = 'gradebook'
    }
    if (q.classId) {
      selectedClassId.value = String(q.classId)
    }
  }
)

// Current Student Computed Record
const currentStudent = computed<ComputedStudent | null>(() => {
  if (!selectedStudentId.value) {
    return availableStudents.value[0] || allComputedStudents.value[0] || null
  }
  return (
    allComputedStudents.value.find((s) => s.id === selectedStudentId.value) ||
    availableStudents.value[0] ||
    null
  )
})

// Current Class Metadata
const currentClass = computed<SchoolClass | null>(() => {
  if (!currentStudent.value) return classes.value[0] || null
  const classId = currentStudent.value.classId || selectedClassId.value
  return classes.value.find((c) => c.id === classId) || classes.value[0] || null
})

// Top 3 Students in class for Honor Roll
const topThreeStudents = computed<ComputedStudent[]>(() => {
  return [...availableStudents.value].sort((a, b) => b.average - a.average).slice(0, 3)
})

// Performance Label
const getPerformanceLabel = (avg: number) => {
  if (avg >= 90) return { labelKm: 'ឆ្នើម', labelEn: 'Excellent', color: 'text-purple-600 bg-purple-50 border-purple-200' }
  if (avg >= 80) return { labelKm: 'ល្អណាស់', labelEn: 'Very Good', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
  if (avg >= 70) return { labelKm: 'ល្អ', labelEn: 'Good', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
  if (avg >= 60) return { labelKm: 'ល្អបង្គួរ', labelEn: 'Fair', color: 'text-blue-600 bg-blue-50 border-blue-200' }
  if (avg >= 50) return { labelKm: 'មធ្យម', labelEn: 'Passed', color: 'text-amber-600 bg-amber-50 border-amber-200' }
  return { labelKm: 'ធ្លាក់', labelEn: 'Needs Improvement', color: 'text-rose-600 bg-rose-50 border-rose-200' }
}

// Subject grade variant helpers
const getSubjectGradeVariant = (score: number) => {
  if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (score >= 75) return 'bg-blue-50 text-blue-700 border-blue-200'
  if (score >= 65) return 'bg-indigo-50 text-indigo-700 border-indigo-200'
  if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-rose-50 text-rose-700 border-rose-200'
}

const getSubjectGradeLetter = (score: number) => {
  if (score >= 85) return 'A'
  if (score >= 75) return 'B'
  if (score >= 65) return 'C'
  if (score >= 55) return 'D'
  if (score >= 50) return 'E'
  return 'F'
}

// Calculate subject average for current class
const getClassSubjectAverage = (subKey: SubjectKey): number => {
  const classStudents = availableStudents.value
  if (classStudents.length === 0) return 0
  const sum = classStudents.reduce((acc, s) => acc + (s.scores[subKey] || 0), 0)
  return Number((sum / classStudents.length).toFixed(1))
}

// Get subject weighting coefficient for the current class
const getSubjectCoefficient = (subKey: string): number => {
  const cfg = currentClass.value?.subjectConfigs?.find((c) => c.key === subKey)
  return cfg ? cfg.coefficient : 1
}

// Select classmate to view
const selectClassmateToView = (st: ComputedStudent) => {
  selectedStudentId.value = st.id
  viewTab.value = 'personal'
}

// Handle Add Student Submit
const handleAddStudentSubmit = () => {
  if (!newStudentForm.name.trim()) return
  const added = addStudent({
    name: newStudentForm.name.trim(),
    gender: newStudentForm.gender,
    dob: newStudentForm.dob,
    remarks: newStudentForm.remarks.trim() || 'New student',
    scores: { ...newStudentForm.scores },
    targetClassId: selectedClassId.value
  })

  showAddStudentModal.value = false
  if (added) {
    selectedStudentId.value = added.id
    toastMessage.value = isEnglish.value
      ? `Enrolled ${added.name}`
      : `បានបញ្ចូលសិស្ស ${added.name}`
    setTimeout(() => {
      toastMessage.value = null
    }, 3500)
  }
}

// Print trigger
const handlePrint = () => {
  window.print()
}
</script>

<template>
  <div class="w-full space-y-6">
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
    <!-- 1. PAGE HEADER WITH CLEAN TAB NAVIGATION                  -->
    <!-- ========================================================= -->
    <div class="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 flex-wrap">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {{ t('studentPortalTitle') }}
          </h1>
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 font-mono">
            {{ formatClassName(currentClass?.name, isEnglish) }}
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          {{ formatTeacherName(currentClass?.teacherName, isEnglish) }} • {{ formatRoom(currentClass?.room, isEnglish) }} • {{ currentClass?.academicYear || '2025-2026' }}
        </p>
      </div>

      <!-- 4-Tab Segmented Navigation Bar -->
      <div class="inline-flex rounded-xl border border-slate-200/80 bg-slate-100/90 p-1 text-xs font-semibold self-start sm:self-auto shadow-2xs">
        <!-- Tab 1: Personal Scorecard -->
        <button
          @click="viewTab = 'personal'"
          type="button"
          :class="[
            'px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 cursor-pointer text-xs',
            viewTab === 'personal'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <User class="w-3.5 h-3.5" />
          <span>{{ t('tabMyScorecard') }}</span>
        </button>

        <!-- Tab 2: Class Roster / Leaderboard -->
        <button
          @click="viewTab = 'classRoster'"
          type="button"
          :class="[
            'px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 cursor-pointer text-xs',
            viewTab === 'classRoster'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <Users class="w-3.5 h-3.5" />
          <span>{{ t('tabClassRoster') }}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 font-mono">
            {{ availableStudents.length }}
          </span>
        </button>

        <!-- Tab 3: Class Gradebook (Spreadsheet) -->
        <button
          @click="viewTab = 'gradebook'"
          type="button"
          :class="[
            'px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 cursor-pointer text-xs',
            viewTab === 'gradebook'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <FileSpreadsheet class="w-3.5 h-3.5" />
          <span>{{ t('tabClassGradebook') }}</span>
        </button>

        <!-- Tab 4: Official Printable Report Card -->
        <button
          @click="viewTab = 'reportCard'"
          type="button"
          :class="[
            'px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 cursor-pointer text-xs',
            viewTab === 'reportCard'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <FileCheck class="w-3.5 h-3.5" />
          <span>{{ t('tabPrintReport') }}</span>
        </button>
      </div>
    </div>


    <!-- ========================================================= -->
    <!-- 2. SINGLE-ROW PROFILE BANNER (Clean & Spacious Strip)     -->
    <!-- ========================================================= -->
    <div
      v-if="currentStudent"
      class="no-print bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
    >
      <!-- Left: Profile Avatar, Name, Badges & Academic Details -->
      <div class="flex items-center gap-4 min-w-0">
        <!-- Avatar with Active Indicator and Image Fallback -->
        <div class="relative shrink-0">
          <img
            :src="currentStudent.avatar || '/images/student-avatar.jpg'"
            :alt="currentStudent.name"
            class="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-xs"
            @error="(e: any) => { e.target.style.display = 'none'; if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex' }"
          />
          <div
            class="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white items-center justify-center font-bold text-lg hidden shadow-xs"
          >
            {{ currentStudent.name.charAt(0) }}
          </div>
          <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {{ currentStudent.name }}
            </h2>
            <!-- Grade Badge -->
            <span :class="['px-2 py-0.5 text-xs font-bold rounded-md border', getGradeBadgeColor(currentStudent.grade)]">
              {{ isEnglish ? 'Grade ' + currentStudent.grade : 'ថ្នាក់ទី ' + currentStudent.grade }}
            </span>
            <!-- Gender Badge -->
            <span
              class="px-2 py-0.5 text-xs font-semibold rounded-md border"
              :class="currentStudent.gender === 'F' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-blue-50 text-blue-700 border-blue-200'"
            >
              {{ currentStudent.gender === 'F' ? (isEnglish ? 'Female' : 'ស្រី') : (isEnglish ? 'Male' : 'ប្រុស') }}
            </span>
            <!-- Rank Pill -->
            <span class="px-2 py-0.5 text-xs font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200/80 font-mono">
              {{ isEnglish ? 'Rank #' + currentStudent.rank : 'ចំណាត់ថ្នាក់ #' + currentStudent.rank }}
            </span>
            <!-- You Badge -->
            <span
              v-if="user && (user.studentId === currentStudent.id || user.id === currentStudent.id)"
              class="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300"
            >
              📍 {{ t('youBadge') }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
            <span>ID: <strong class="font-mono text-slate-800">{{ currentStudent.id }}</strong></span>
            <span class="text-slate-300">•</span>
            <span>{{ isEnglish ? 'Class:' : 'ថ្នាក់៖' }} <strong class="text-blue-600 font-medium">{{ formatClassName(currentClass?.name, isEnglish) }}</strong></span>
            <span class="text-slate-300">•</span>
            <span>{{ isEnglish ? 'Teacher:' : 'គ្រូ៖' }} <strong class="text-slate-700">{{ formatTeacherName(currentClass?.teacherName, isEnglish) }}</strong></span>
            <span class="text-slate-300">•</span>
            <span>{{ isEnglish ? 'Room:' : 'បន្ទប់៖' }} <strong class="text-slate-700">{{ formatRoom(currentClass?.room, isEnglish) }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Right: Action Area (Class Dropdown, Student Dropdown, Add Student, Print) -->
      <div class="flex flex-wrap items-center gap-2.5 shrink-0 self-start xl:self-center">
        <!-- Class Selector Dropdown (Teacher/Admin only) -->
        <div v-if="allowStudentSelection && !isStudent" class="relative">
          <School class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            v-model="selectedClassId"
            class="pl-8 pr-7 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none transition"
            title="Select Class"
          >
            <option value="all">
              {{ isEnglish ? 'All Classes' : 'ថ្នាក់ទាំងអស់' }} ({{ allComputedStudents.length }})
            </option>
            <option v-for="c in classes" :key="c.id" :value="c.id">
              {{ formatClassName(c.name, isEnglish) }} ({{ getStudentsForClass(c.id).length }})
            </option>
          </select>
          <ChevronDown class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <!-- Student Selector Dropdown (Replaces horizontal buttons!) -->
        <div v-if="allowStudentSelection && !isStudent && availableStudents.length > 0" class="relative min-w-[210px] sm:min-w-[230px]">
          <User class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            v-model="selectedStudentId"
            @change="viewTab = 'personal'"
            class="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none transition"
            title="Select Student"
          >
            <option v-for="st in availableStudents" :key="st.id" :value="st.id">
              #{{ st.rank }} • {{ st.name }} ({{ st.id }})
            </option>
          </select>
          <ChevronDown class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <!-- Add Student CTA -->
        <button
          v-if="allowStudentSelection && !isStudent"
          @click="showAddStudentModal = true"
          type="button"
          class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="Enroll New Student"
        >
          <Plus class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">{{ t('addStudent') }}</span>
        </button>

        <!-- Print Direct Button -->
        <button
          @click="handlePrint"
          type="button"
          class="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center cursor-pointer border border-slate-200 shadow-xs"
          title="Print Report"
          aria-label="Print Report"
        >
          <Printer class="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!currentStudent"
      class="bg-white rounded-xl p-12 text-center border border-slate-200/80 shadow-xs"
    >
      <GraduationCap class="w-12 h-12 mx-auto text-slate-300 mb-3" />
      <h3 class="text-sm font-bold text-slate-800">{{ t('emptyStudentData') }}</h3>
      <p class="text-xs text-slate-500 mt-1">Please select or enroll a student.</p>
    </div>

    <!-- ========================================================= -->
    <!-- 3. TAB 1: PERSONAL SCORECARD (Flat, Spacious & Balanced)  -->
    <!-- ========================================================= -->
    <div v-else-if="viewTab === 'personal'" class="space-y-6">
      <!-- 4-Grid Key Performance Metrics (Equal-Sized Cards) -->
      <div class="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Metric 1: Class Rank -->
        <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">{{ isEnglish ? 'Class Rank' : 'ចំណាត់ថ្នាក់' }}</span>
            <div class="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award class="w-4 h-4" />
            </div>
          </div>
          <div class="my-3">
            <div class="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              #{{ currentStudent.rank }}
              <span class="text-xs font-normal text-slate-400">/ {{ availableStudents.length }}</span>
            </div>
            <div class="text-xs text-purple-600 font-semibold mt-1">
              {{ isEnglish ? `Top ${Math.max(1, Math.round((currentStudent.rank / availableStudents.length) * 100))}% in class` : `លំដាប់កំពូល ${Math.max(1, Math.round((currentStudent.rank / availableStudents.length) * 100))}% ក្នុងថ្នាក់` }}
            </div>
          </div>
          <div class="text-[11px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
            {{ isEnglish ? 'Ranked by average score' : 'គិតតាមមធ្យមភាគពិន្ទុ' }}
          </div>
        </div>

        <!-- Metric 2: Average GPA -->
        <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">{{ isEnglish ? 'Average GPA' : 'មធ្យមភាគពិន្ទុ' }}</span>
            <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp class="w-4 h-4" />
            </div>
          </div>
          <div class="my-3">
            <div class="text-2xl font-bold text-blue-600 font-mono tracking-tight">
              {{ currentStudent.average }}
              <span class="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <div class="text-xs text-slate-600 font-mono mt-1">
              {{ isEnglish ? 'Total:' : 'សរុប៖' }} <strong class="text-slate-800">{{ currentStudent.total }}</strong> / 600
            </div>
          </div>
          <div class="text-[11px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
            {{ isEnglish ? 'Across 6 high school subjects' : 'មុខវិជ្ជាវិទ្យាល័យទាំង ៦' }}
          </div>
        </div>

        <!-- Metric 3: Letter Grade -->
        <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">{{ isEnglish ? 'Letter Grade' : 'និទ្ទេសរួម' }}</span>
            <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles class="w-4 h-4" />
            </div>
          </div>
          <div class="my-3">
            <div class="flex items-center gap-2">
              <span :class="['px-2.5 py-0.5 rounded-md text-base font-black border', getGradeBadgeColor(currentStudent.grade)]">
                {{ currentStudent.grade }}
              </span>
              <span class="text-xs font-bold text-slate-700">
                {{ isEnglish ? getPerformanceLabel(currentStudent.average).labelEn : getPerformanceLabel(currentStudent.average).labelKm }}
              </span>
            </div>
            <div class="text-xs text-slate-400 mt-1">
              {{ isEnglish ? 'Grade Scale: A ≥ 85, B ≥ 75, C ≥ 65' : 'ស្ដង់ដារ៖ A ≥ ៨៥, B ≥ ៧៥, C ≥ ៦៥' }}
            </div>
          </div>
          <div class="text-[11px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
            {{ isEnglish ? 'Ministry grading standard' : 'ស្ដង់ដារក្រសួងអប់រំ' }}
          </div>
        </div>

        <!-- Metric 4: Academic Status -->
        <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">{{ isEnglish ? 'Academic Status' : 'លទ្ធផលសិក្សា' }}</span>
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              :class="currentStudent.grade !== 'F' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'"
            >
              <CheckCircle2 v-if="currentStudent.grade !== 'F'" class="w-4 h-4" />
              <AlertCircle v-else class="w-4 h-4" />
            </div>
          </div>
          <div class="my-3">
            <div
              class="text-xl font-bold flex items-center gap-2"
              :class="currentStudent.grade !== 'F' ? 'text-emerald-600' : 'text-rose-600'"
            >
              <span class="w-2.5 h-2.5 rounded-full" :class="currentStudent.grade !== 'F' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
              <span>{{ currentStudent.grade !== 'F' ? (isEnglish ? 'Passed' : 'ជាប់') : (isEnglish ? 'Failed' : 'ធ្លាក់') }}</span>
            </div>
            <div class="text-xs text-slate-400 mt-1">
              {{ isEnglish ? 'Pass Mark: ≥ 50 / 100' : 'ពិន្ទុជាប់៖ ≥ ៥០ / ១០០' }}
            </div>
          </div>
          <div class="text-[11px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
            {{ isEnglish ? 'Semester 1 qualification' : 'លទ្ធផលឆមាសទី ១' }}
          </div>
        </div>
      </div>

      <!-- 6-Subject Performance Breakdown (Flat Grid, Equal-Sized Cards) -->
      <div class="no-print space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {{ isEnglish ? 'Subject Performance Breakdown' : 'ពិន្ទុតាមមុខវិជ្ជាទាំង ៦' }}
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ isEnglish ? 'Individual subject marks, grade standing, and class average comparison' : 'ពិន្ទុតាមមុខវិជ្ជា និទ្ទេស និងការប្រៀបធៀបជាមួយមធ្យមភាគថ្នាក់' }}
            </p>
          </div>
          <div class="text-xs font-mono font-bold px-3 py-1 bg-white border border-slate-200/80 rounded-lg text-slate-700 shadow-2xs self-start sm:self-auto">
            {{ isEnglish ? 'Total:' : 'សរុប៖' }} <span class="text-blue-600">{{ currentStudent.total }}</span> / 600
          </div>
        </div>

        <!-- 6 Subjects Grid (Equal 3-column on large screens, matching Student UI) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="sub in SUBJECTS"
            :key="sub.key"
            class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between h-full"
          >
            <!-- Top Row: Subject Title, Short Code & Grade Badge -->
            <div>
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div :class="['w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0', sub.iconBg]">
                    <BookOpen class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-900 leading-snug">
                      {{ isEnglish ? sub.nameEn : sub.nameKm }}
                    </div>
                    <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                      {{ sub.short }} • {{ isEnglish ? sub.nameEn : sub.nameKm }}
                    </div>
                  </div>
                </div>

                <!-- Grade & Coefficient Badges -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <span
                    class="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200"
                    :title="`Coefficient: x${getSubjectCoefficient(sub.key)}`"
                  >
                    x{{ getSubjectCoefficient(sub.key) }}
                  </span>
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-md text-xs font-bold border shrink-0',
                      getSubjectGradeVariant(currentStudent.scores[sub.key])
                    ]"
                  >
                    {{ getSubjectGradeLetter(currentStudent.scores[sub.key]) }}
                  </span>
                </div>
              </div>

              <!-- Middle: Score & Pass/Fail status -->
              <div class="mt-4 flex items-baseline justify-between">
                <div>
                  <span class="text-2xl font-bold font-mono text-slate-900">
                    {{ currentStudent.scores[sub.key] }}
                  </span>
                  <span class="text-xs font-normal text-slate-400 font-mono ml-1">/ 100</span>
                </div>

                <span
                  class="inline-flex items-center gap-1 text-[11px] font-semibold"
                  :class="currentStudent.scores[sub.key] >= 50 ? 'text-emerald-600' : 'text-rose-600'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="currentStudent.scores[sub.key] >= 50 ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  <span>{{ currentStudent.scores[sub.key] >= 50 ? (isEnglish ? 'Passed' : 'ជាប់') : (isEnglish ? 'Failed' : 'ធ្លាក់') }}</span>
                </span>
              </div>

              <!-- Visual Progress Bar -->
              <div class="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  :class="['h-full rounded-full transition-all duration-500', sub.color]"
                  :style="{ width: `${currentStudent.scores[sub.key]}%` }"
                ></div>
              </div>
            </div>

            <!-- Bottom Row: Class Avg Comparison -->
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{{ isEnglish ? 'Class Avg:' : 'មធ្យមភាគថ្នាក់៖' }} <strong class="font-mono text-slate-700">{{ getClassSubjectAverage(sub.key) }}</strong></span>
              <span
                class="font-mono font-semibold flex items-center gap-0.5 text-xs"
                :class="currentStudent.scores[sub.key] >= getClassSubjectAverage(sub.key) ? 'text-emerald-600' : 'text-amber-600'"
              >
                <ArrowUpRight v-if="currentStudent.scores[sub.key] >= getClassSubjectAverage(sub.key)" class="w-3.5 h-3.5" />
                <ArrowDownRight v-else class="w-3.5 h-3.5" />
                <span>{{ currentStudent.scores[sub.key] >= getClassSubjectAverage(sub.key) ? '+' : '-' }}{{ Math.abs(Number((currentStudent.scores[sub.key] - getClassSubjectAverage(sub.key)).toFixed(1))) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Homeroom Remarks (Clean Flat Card) -->
      <div class="no-print bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1 flex-1">
          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <span>{{ isEnglish ? 'Homeroom Remarks' : 'មតិយោបល់គ្រូបន្ទុកថ្នាក់' }}</span>
            <span class="text-slate-400 font-normal">({{ formatTeacherName(currentClass?.teacherName, isEnglish) }})</span>
          </div>
          <p class="text-xs text-slate-600 italic leading-relaxed">
            "{{ currentStudent.remarks || (isEnglish ? 'Student shows high responsibility and discipline in study.' : 'សិស្សមានការយកចិត្តទុកដាក់ និងវិន័យល្អក្នុងការសិក្សា។') }}"
          </p>
        </div>
        <div class="shrink-0 text-left sm:text-right sm:border-l sm:border-slate-100 sm:pl-5">
          <div class="text-[11px] text-slate-400">{{ isEnglish ? 'Class Advisor' : 'គ្រូបន្ទុកថ្នាក់' }}</div>
          <div class="text-xs font-bold text-slate-800">{{ formatTeacherName(currentClass?.teacherName, isEnglish) }}</div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 4. TAB 2: CLASS LEADERBOARD (Clean & Spacious)            -->
    <!-- ========================================================= -->
    <div v-else-if="viewTab === 'classRoster'" class="space-y-6">
      <!-- Top 3 Honor Roll Cards -->
      <div class="no-print grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          v-for="(topSt, idx) in topThreeStudents"
          :key="topSt.id"
          :class="[
            'p-5 rounded-xl border transition flex items-center gap-3.5 shadow-xs',
            idx === 0 ? 'bg-amber-50/70 border-amber-200' : (idx === 1 ? 'bg-slate-50 border-slate-200' : 'bg-orange-50/60 border-orange-200/80')
          ]"
        >
          <div class="text-3xl shrink-0">
            {{ idx === 0 ? '🥇' : (idx === 1 ? '🥈' : '🥉') }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-xs text-slate-900 truncate">{{ topSt.name }}</span>
              <span
                v-if="user && (user.studentId === topSt.id || user.id === topSt.id)"
                class="px-1.5 py-0.2 rounded text-[9px] bg-emerald-600 text-white font-bold"
              >
                You
              </span>
            </div>
            <div class="text-xs text-slate-500 font-mono mt-0.5">
              {{ topSt.average }} Avg • Grade {{ topSt.grade }}
            </div>
          </div>
          <button
            @click="selectClassmateToView(topSt)"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shrink-0 cursor-pointer shadow-2xs"
          >
            View
          </button>
        </div>
      </div>

      <!-- Classmates Roster Table with Search -->
      <div class="no-print bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <!-- Table Search Strip -->
        <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="relative flex-1 max-w-sm">
            <Search class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              v-model="classmateSearchQuery"
              type="text"
              placeholder="Search classmates by name or ID..."
              class="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>

          <div class="text-xs text-slate-500 font-mono">
            {{ filteredClassmates.length }} students
          </div>
        </div>

        <!-- Leaderboard Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <th class="py-3 px-3 text-center w-14">{{ t('rank') }}</th>
                <th class="py-3 px-4">{{ t('student') }}</th>
                <th class="py-3 px-2 text-center w-12">{{ t('gender') }}</th>
                <th class="py-3 px-2 text-center">
                  <div>MATH</div>
                  <div class="text-[9px] font-mono text-purple-600 font-normal">x{{ getSubjectCoefficient('math') }}</div>
                </th>
                <th class="py-3 px-2 text-center">
                  <div>PHYS</div>
                  <div class="text-[9px] font-mono text-purple-600 font-normal">x{{ getSubjectCoefficient('physics') }}</div>
                </th>
                <th class="py-3 px-2 text-center">
                  <div>CHEM</div>
                  <div class="text-[9px] font-mono text-purple-600 font-normal">x{{ getSubjectCoefficient('chemistry') }}</div>
                </th>
                <th class="py-3 px-2 text-center">
                  <div>BIO</div>
                  <div class="text-[9px] font-mono text-purple-600 font-normal">x{{ getSubjectCoefficient('biology') }}</div>
                </th>
                <th class="py-3 px-2 text-center">
                  <div>KHM</div>
                  <div class="text-[9px] font-mono text-purple-600 font-normal">x{{ getSubjectCoefficient('khmer') }}</div>
                </th>
                <th class="py-3 px-2 text-center">
                  <div>ENG</div>
                  <div class="text-[9px] font-mono text-purple-600 font-normal">x{{ getSubjectCoefficient('english') }}</div>
                </th>
                <th class="py-3 px-3 text-center">{{ t('average') }}</th>
                <th class="py-3 px-3 text-center">{{ t('grade') }}</th>
                <th class="py-3 px-4 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              <tr
                v-for="st in filteredClassmates"
                :key="st.id"
                :class="[
                  'transition',
                  user && (user.studentId === st.id || user.id === st.id)
                    ? 'bg-blue-50/50 font-semibold'
                    : 'hover:bg-slate-50/60'
                ]"
              >
                <!-- Rank with Medal -->
                <td class="py-3 px-3 text-center font-mono font-bold">
                  <span v-if="st.rank === 1" class="text-base">🥇</span>
                  <span v-else-if="st.rank === 2" class="text-base">🥈</span>
                  <span v-else-if="st.rank === 3" class="text-base">🥉</span>
                  <span v-else class="text-slate-400">#{{ st.rank }}</span>
                </td>

                <!-- Student Info -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-slate-900">{{ st.name }}</span>
                    <span
                      v-if="selectedClassId === 'all' && st.classId"
                      class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {{ st.classId.replace('CLS-', '') }}
                    </span>
                    <span
                      v-if="user && (user.studentId === st.id || user.id === st.id)"
                      class="px-1.5 py-0.2 rounded text-[9px] bg-blue-600 text-white font-bold"
                    >
                      You
                    </span>
                  </div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ st.id }}</div>
                </td>

                <!-- Gender -->
                <td class="py-3 px-2 text-center font-semibold text-xs">
                  <span :class="st.gender === 'F' ? 'text-pink-600' : 'text-blue-600'">
                    {{ st.gender }}
                  </span>
                </td>

                <!-- 6 Subject Marks -->
                <td class="py-3 px-2 text-center font-mono">{{ st.scores.math }}</td>
                <td class="py-3 px-2 text-center font-mono">{{ st.scores.physics }}</td>
                <td class="py-3 px-2 text-center font-mono">{{ st.scores.chemistry }}</td>
                <td class="py-3 px-2 text-center font-mono">{{ st.scores.biology }}</td>
                <td class="py-3 px-2 text-center font-mono">{{ st.scores.khmer }}</td>
                <td class="py-3 px-2 text-center font-mono">{{ st.scores.english }}</td>

                <!-- GPA Average -->
                <td class="py-3 px-3 text-center font-mono font-bold text-blue-600">
                  {{ st.average }}
                </td>

                <!-- Grade Badge -->
                <td class="py-3 px-3 text-center">
                  <span :class="['px-2 py-0.5 rounded-md font-bold text-[10px] border', getGradeBadgeColor(st.grade)]">
                    {{ st.grade }}
                  </span>
                </td>

                <!-- Action: View Scorecard -->
                <td class="py-3 px-4 text-center">
                  <button
                    @click="selectClassmateToView(st)"
                    type="button"
                    class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
                    title="View Scorecard"
                  >
                    {{ isEnglish ? 'View' : 'មើល' }}
                  </button>
                </td>
              </tr>

              <tr v-if="filteredClassmates.length === 0">
                <td colspan="12" class="py-12 text-center text-slate-400">
                  {{ isEnglish ? 'No student matched your search.' : 'មិនមានសិស្សត្រូវនឹងការស្វែងរកឡើយ។' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- TAB 3: CLASS GRADEBOOK (Embedded Spreadsheet from Faculty) -->
    <!-- ========================================================= -->
    <div v-else-if="viewTab === 'gradebook'" class="no-print space-y-6">
      <TeacherGradebook :initial-class-id="selectedClassId !== 'all' ? selectedClassId : 'CLS-12A'" />
    </div>

    <!-- ========================================================= -->
    <!-- 5. TAB 3: OFFICIAL PRINTABLE A4 REPORT CARD               -->
    <!-- ========================================================= -->
    <div
      :class="[
        'print-area bg-white rounded-xl shadow-lg border border-slate-200 p-8 sm:p-10 max-w-4xl mx-auto',
        viewTab === 'reportCard' ? 'block' : 'hidden print:block'
      ]"
    >
      <!-- Printable Header: Kingdom of Cambodia & School Title -->
      <div class="text-center pb-5 border-b-2 border-slate-900">
        <div class="text-sm font-bold tracking-widest text-slate-800">
          ព្រះរាជាណាចក្រកម្ពុជា
        </div>
        <div class="text-xs font-semibold text-slate-600 mt-0.5">
          KINGDOM OF CAMBODIA
        </div>
        <div class="text-xs font-bold text-slate-700 mt-0.5">
          ជាតិ សាសនា ព្រះមហាក្សត្រ • NATION RELIGION KING
        </div>

        <div class="my-3 flex items-center justify-center gap-3">
          <div class="h-0.5 w-14 bg-slate-300"></div>
          <div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-serif">
            SMS
          </div>
          <div class="h-0.5 w-14 bg-slate-300"></div>
        </div>

        <h2 class="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
          {{ isEnglish ? 'MONTHLY STUDENT REPORT CARD' : 'ព្រឹត្តិបត្រពិន្ទុសិស្សប្រចាំខែ' }}
        </h2>
        <div class="text-xs font-semibold text-slate-600 mt-0.5">
          {{ isEnglish ? 'Academic Evaluation • School Year ' + (currentClass?.academicYear || '2025-2026') : 'ការវាយតម្លៃការសិក្សា • ឆ្នាំសិក្សា ' + (currentClass?.academicYear || '2025-2026') }}
        </div>
      </div>

      <!-- Student Metadata Information Table -->
      <div class="mt-5 grid grid-cols-2 gap-3 text-xs">
        <div class="space-y-1.5">
          <div><strong>{{ isEnglish ? 'Student Name:' : 'ឈ្មោះសិស្ស៖' }}</strong> <span class="font-bold text-slate-900 ml-1">{{ currentStudent.name }}</span></div>
          <div><strong>{{ isEnglish ? 'Student ID:' : 'អត្តលេខ៖' }}</strong> <span class="font-mono font-bold text-slate-900 ml-1">{{ currentStudent.id }}</span></div>
          <div><strong>{{ isEnglish ? 'Gender:' : 'ភេទ៖' }}</strong> <span class="ml-1">{{ currentStudent.gender === 'F' ? (isEnglish ? 'Female' : 'ស្រី') : (isEnglish ? 'Male' : 'ប្រុស') }}</span></div>
          <div><strong>{{ isEnglish ? 'Date of Birth:' : 'ថ្ងៃខែឆ្នាំកំណើត៖' }}</strong> <span class="font-mono ml-1">{{ currentStudent.dob }}</span></div>
        </div>
        <div class="space-y-1.5 text-right sm:text-left">
          <div><strong>{{ isEnglish ? 'Class:' : 'ថ្នាក់រៀន៖' }}</strong> <span class="font-bold text-slate-900 ml-1">{{ formatClassName(currentClass?.name, isEnglish) }}</span></div>
          <div><strong>{{ isEnglish ? 'Room:' : 'បន្ទប់៖' }}</strong> <span class="ml-1">{{ formatRoom(currentClass?.room, isEnglish) }}</span></div>
          <div><strong>{{ isEnglish ? 'Homeroom Teacher:' : 'គ្រូបន្ទុកថ្នាក់៖' }}</strong> <span class="font-bold ml-1">{{ formatTeacherName(currentClass?.teacherName, isEnglish) }}</span></div>
          <div><strong>{{ isEnglish ? 'Date:' : 'កាលបរិច្ឆេទ៖' }}</strong> <span class="font-mono ml-1">{{ new Date().toLocaleDateString(isEnglish ? 'en-US' : 'km-KH') }}</span></div>
        </div>
      </div>

      <!-- Subject Scores Table -->
      <div class="mt-5 border-2 border-slate-900 rounded-lg overflow-hidden">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-100 text-slate-900 font-bold border-b-2 border-slate-900">
              <th class="py-2 px-3 text-center w-10 border-r border-slate-300">#</th>
              <th class="py-2 px-3 border-r border-slate-300">{{ isEnglish ? 'Subject' : 'មុខវិជ្ជា' }}</th>
              <th class="py-2 px-3 text-center border-r border-slate-300 w-16">{{ isEnglish ? 'Coeff' : 'មេគុណ' }}</th>
              <th class="py-2 px-3 text-center border-r border-slate-300 w-20">{{ isEnglish ? 'Max' : 'ពិន្ទុពេញ' }}</th>
              <th class="py-2 px-3 text-center border-r border-slate-300 w-20">{{ isEnglish ? 'Score' : 'ពិន្ទុ' }}</th>
              <th class="py-2 px-3 text-center w-24">{{ isEnglish ? 'Result' : 'លទ្ធផល' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-300 font-medium">
            <tr v-for="(sub, idx) in SUBJECTS" :key="sub.key">
              <td class="py-2 px-3 text-center font-mono border-r border-slate-300">{{ idx + 1 }}</td>
              <td class="py-2 px-3 border-r border-slate-300 font-bold">
                {{ isEnglish ? sub.nameEn : sub.nameKm }}
              </td>
              <td class="py-2 px-3 text-center font-mono font-bold text-purple-700 border-r border-slate-300">
                x{{ getSubjectCoefficient(sub.key) }}
              </td>
              <td class="py-2 px-3 text-center font-mono border-r border-slate-300">100</td>
              <td class="py-2 px-3 text-center font-mono font-bold text-slate-900 border-r border-slate-300">
                {{ currentStudent.scores[sub.key] }}
              </td>
              <td class="py-2 px-3 text-center font-bold" :class="currentStudent.scores[sub.key] >= 50 ? 'text-emerald-700' : 'text-rose-700'">
                {{ currentStudent.scores[sub.key] >= 50 ? (isEnglish ? 'Pass' : 'ជាប់') : (isEnglish ? 'Fail' : 'ធ្លាក់') }}
              </td>
            </tr>

            <!-- Total and GPA summary row -->
            <tr class="bg-slate-50 font-black border-t-2 border-slate-900">
              <td colspan="3" class="py-2.5 px-3 text-right border-r border-slate-300 uppercase">
                {{ isEnglish ? 'TOTAL & WEIGHTED AVERAGE' : 'ពិន្ទុសរុប និងមធ្យមភាគ' }}
              </td>
              <td class="py-2.5 px-3 text-center font-mono border-r border-slate-300">600</td>
              <td class="py-2.5 px-3 text-center font-mono text-blue-900 border-r border-slate-300">
                {{ currentStudent.total }}
              </td>
              <td class="py-2.5 px-3 text-center font-mono text-purple-900">
                {{ currentStudent.average }} / 100
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Badges -->
      <div class="mt-4 grid grid-cols-3 gap-3 text-center text-xs font-bold">
        <div class="p-2.5 rounded-lg border border-slate-300 bg-slate-50">
          <div class="text-[10px] text-slate-500 uppercase">{{ isEnglish ? 'Rank' : 'ចំណាត់ថ្នាក់' }}</div>
          <div class="text-sm font-black text-slate-900 font-mono mt-0.5">
            {{ isEnglish ? `#${currentStudent.rank} / ${availableStudents.length}` : `លេខ ${currentStudent.rank} / ${availableStudents.length}` }}
          </div>
        </div>
        <div class="p-2.5 rounded-lg border border-slate-300 bg-slate-50">
          <div class="text-[10px] text-slate-500 uppercase">{{ isEnglish ? 'Grade' : 'និទ្ទេស' }}</div>
          <div class="text-sm font-black text-slate-900 font-mono mt-0.5">
            {{ currentStudent.grade }}
          </div>
        </div>
        <div class="p-2.5 rounded-lg border border-slate-300 bg-slate-50">
          <div class="text-[10px] text-slate-500 uppercase">{{ isEnglish ? 'Status' : 'លទ្ធផល' }}</div>
          <div class="text-sm font-black mt-0.5" :class="currentStudent.grade !== 'F' ? 'text-emerald-700' : 'text-rose-700'">
            {{ currentStudent.grade !== 'F' ? (isEnglish ? 'PASSED' : 'ជាប់') : (isEnglish ? 'FAILED' : 'ធ្លាក់') }}
          </div>
        </div>
      </div>

      <!-- Remarks -->
      <div class="mt-4 p-3.5 rounded-lg border border-slate-300 bg-slate-50/50 text-xs leading-relaxed">
        <div class="font-bold text-slate-800 mb-0.5">{{ isEnglish ? 'Homeroom Remarks:' : 'មតិយោបល់គ្រូបន្ទុកថ្នាក់៖' }}</div>
        <div class="text-slate-700 italic">
          "{{ currentStudent.remarks || (isEnglish ? 'Student shows high responsibility and discipline in study.' : 'សិស្សមានការយកចិត្តទុកដាក់ និងវិន័យល្អក្នុងការសិក្សា។') }}"
        </div>
      </div>

      <!-- Signatures -->
      <div class="mt-8 pt-4 grid grid-cols-2 gap-8 text-center text-xs page-break-inside-avoid">
        <div>
          <div class="text-slate-500 mb-1">{{ isEnglish ? 'Seen & Approved' : 'បានឃើញ និងយល់ព្រម' }}</div>
          <div class="font-bold text-slate-900">{{ isEnglish ? 'Homeroom Teacher' : 'គ្រូបន្ទុកថ្នាក់' }}</div>
          <div class="h-16 flex items-end justify-center font-bold text-slate-800">
            {{ formatTeacherName(currentClass?.teacherName, isEnglish) }}
          </div>
        </div>

        <div>
          <div class="text-slate-500 mb-1">{{ isEnglish ? 'Phnom Penh, Date: ..... / ..... / .........' : 'រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ.......' }}</div>
          <div class="font-bold text-slate-900">{{ isEnglish ? 'School Principal' : 'នាយក / នាយិកាសាលា' }}</div>
          <div class="h-16 flex items-center justify-center">
            <div class="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center p-1">
              {{ isEnglish ? 'Official Seal' : 'ត្រាផ្លូវការ' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- MODAL: ADD STUDENT                                        -->
    <!-- ========================================================= -->
    <div
      v-if="showAddStudentModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Plus class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">{{ t('modalAddStudentTitle') }}</h3>
              <p class="text-xs text-slate-400">{{ currentClass?.name }}</p>
            </div>
          </div>
          <button @click="showAddStudentModal = false" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleAddStudentSubmit" class="mt-4 space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('studentFullName') }}</label>
            <input
              v-model="newStudentForm.name"
              type="text"
              required
              :placeholder="isEnglish ? 'e.g. Sok Heng' : 'ឧ. សុខ ហេង'"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 text-xs"
            />
          </div>

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

          <!-- Scores -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1.5">{{ t('initialScoresTitle') }}</label>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div v-for="sub in SUBJECTS" :key="sub.key">
                <label class="text-[10px] font-semibold text-slate-500 block mb-0.5">{{ sub.short }}</label>
                <input
                  v-model.number="newStudentForm.scores[sub.key]"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-800 text-xs"
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
              class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
            >
              {{ t('addStudent') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

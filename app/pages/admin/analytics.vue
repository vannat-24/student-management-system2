<!-- pages/admin/analytics.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  BarChart3,
  Users,
  GraduationCap,
  School,
  TrendingUp,
  Award,
  BookOpen,
  Lock,
  Unlock,
  Printer,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-vue-next'
import type { SubjectKey } from '~/types'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const {
  classes,
  teachers,
  allComputedStudents,
  getClassStats,
  lockAllClasses,
  unlockAllClasses,
  getGradeBadgeColor
} = useScore()

const { t, isEnglish } = useI18n()
const router = useRouter()

const toastMessage = ref<string | null>(null)

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = null
  }, 3000)
}

// 1. Overall School Performance KPIs
const totalStudents = computed(() => allComputedStudents.value.length)
const totalClasses = computed(() => classes.value.length)
const totalTeachers = computed(() => teachers.value.length)

const schoolAverage = computed(() => {
  if (allComputedStudents.value.length === 0) return 0
  const sum = allComputedStudents.value.reduce((acc, s) => acc + s.average, 0)
  return Number((sum / allComputedStudents.value.length).toFixed(2))
})

const schoolPassedCount = computed(() => {
  return allComputedStudents.value.filter((s) => s.grade !== 'F').length
})

const schoolPassRate = computed(() => {
  if (totalStudents.value === 0) return 0
  return Number(((schoolPassedCount.value / totalStudents.value) * 100).toFixed(1))
})

// Gender Distribution
const maleCount = computed(() => allComputedStudents.value.filter((s) => s.gender === 'M').length)
const femaleCount = computed(() => allComputedStudents.value.filter((s) => s.gender === 'F').length)

// 2. Cross-Grade Comparisons (Grade 10, 11, 12)
const gradeLevels = computed(() => {
  const levels = ['10', '11', '12']
  return levels.map((lvl) => {
    const levelClasses = classes.value.filter((c) => c.gradeLevel === lvl)
    const levelStudents = allComputedStudents.value.filter((s) =>
      levelClasses.some((c) => c.id === s.classId)
    )

    const count = levelStudents.length
    const avgSum = levelStudents.reduce((sum, s) => sum + s.average, 0)
    const average = count > 0 ? Number((avgSum / count).toFixed(1)) : 0
    const passed = levelStudents.filter((s) => s.grade !== 'F').length
    const passRate = count > 0 ? Math.round((passed / count) * 100) : 0

    return {
      level: lvl,
      name: isEnglish.value ? `Grade ${lvl}` : `ថ្នាក់ទី ${lvl}`,
      classes: levelClasses,
      studentCount: count,
      average,
      passRate
    }
  })
})

// 3. Subject-by-Subject Schoolwide Performance Matrix
const SUBJECT_CONFIGS: Array<{ key: SubjectKey; nameKm: string; nameEn: string; color: string }> = [
  { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', color: 'bg-blue-600' },
  { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', color: 'bg-amber-500' },
  { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', color: 'bg-emerald-600' },
  { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', color: 'bg-teal-600' },
  { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', color: 'bg-rose-500' },
  { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', color: 'bg-indigo-600' }
]

const subjectAverages = computed(() => {
  return SUBJECT_CONFIGS.map((sub) => {
    if (allComputedStudents.value.length === 0) {
      return { ...sub, avg: 0, highest: 0, lowest: 0 }
    }
    const scores = allComputedStudents.value.map((s) => s.scores[sub.key] || 0)
    const sum = scores.reduce((a, b) => a + b, 0)
    const avg = Number((sum / scores.length).toFixed(1))
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)
    return {
      ...sub,
      avg,
      highest,
      lowest
    }
  })
})

// 4. Schoolwide Honor Roll (Top 5 Students across entire school)
const topFiveStudents = computed(() => {
  return [...allComputedStudents.value]
    .sort((a, b) => b.average - a.average)
    .slice(0, 5)
})

// Check if all classes are locked
const areAllClassesLocked = computed(() => {
  return classes.value.length > 0 && classes.value.every((c) => c.isLocked)
})

// Batch Lock Handler
const handleBatchLockToggle = () => {
  if (areAllClassesLocked.value) {
    unlockAllClasses()
    showToast(isEnglish.value ? 'All class gradebooks unlocked.' : 'បានដោះសោសៀវភៅពិន្ទុគ្រប់ថ្នាក់ទាំងអស់។')
  } else {
    lockAllClasses()
    showToast(isEnglish.value ? 'All class gradebooks locked.' : 'បានចាក់សោសៀវភៅពិន្ទុគ្រប់ថ្នាក់ទាំងអស់។')
  }
}

// Print Handler
const handlePrint = () => {
  window.print()
}

// View student in student portal
const viewStudentInPortal = (studentId: string) => {
  router.push(`/admin/student?id=${studentId}`)
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
        class="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 text-white rounded-xl shadow-xl backdrop-blur border border-slate-800 text-xs font-semibold"
      >
        <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- ========================================================= -->
    <!-- 1. PAGE HEADER & EXECUTIVE ACTIONS                        -->
    <!-- ========================================================= -->
    <div class="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 flex-wrap">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {{ isEnglish ? 'School Analytics & Executive Overview' : 'ផ្ទាំងវិភាគ និងស្ថិតិសាលារៀន' }}
          </h1>
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-200/80 font-mono">
            Academic Year 2025-2026
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          {{ isEnglish ? 'Comprehensive high-level performance metrics, cross-grade comparisons, and faculty allocations.' : 'ទិន្នន័យស្ថិតិលទ្ធផលសិក្សាសរុប ការប្រៀបធៀបតាមកម្រិតថ្នាក់ និងការគ្រប់គ្រងសាលា។' }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Batch Lock/Unlock Button -->
        <button
          @click="handleBatchLockToggle"
          type="button"
          :class="[
            'px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs border',
            areAllClassesLocked
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          ]"
        >
          <Lock v-if="areAllClassesLocked" class="w-4 h-4 text-rose-600" />
          <Unlock v-else class="w-4 h-4 text-slate-600" />
          <span>{{ areAllClassesLocked ? (isEnglish ? 'Unlock All Classes' : 'ដោះសោគ្រប់ថ្នាក់') : (isEnglish ? 'Lock All Classes' : 'ចាក់សោគ្រប់ថ្នាក់') }}</span>
        </button>

        <!-- Print Direct Button -->
        <button
          @click="handlePrint"
          type="button"
          class="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Printer class="w-4 h-4" />
          <span>{{ isEnglish ? 'Print Summary' : 'បោះពុម្ពរបាយការណ៍' }}</span>
        </button>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 2. HIGH-LEVEL KPI METRIC CARDS                            -->
    <!-- ========================================================= -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- KPI 1: Enrolled Students -->
      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {{ isEnglish ? 'Total Students' : 'សិស្សសរុបទូទាំងសាលា' }}
          </div>
          <div class="text-2xl font-black text-slate-900 font-mono mt-1">
            {{ totalStudents }}
          </div>
          <div class="text-xs text-slate-500 mt-1">
            <span class="font-semibold text-blue-600">{{ maleCount }} M</span> •
            <span class="font-semibold text-pink-600">{{ femaleCount }} F</span>
          </div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Users class="w-6 h-6" />
        </div>
      </div>

      <!-- KPI 2: Overall School Average -->
      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {{ isEnglish ? 'Schoolwide Average' : 'មធ្យមភាគទូទាំងសាលា' }}
          </div>
          <div class="text-2xl font-black text-indigo-600 font-mono mt-1">
            {{ schoolAverage }}
          </div>
          <div class="text-xs text-slate-500 mt-1">
            Scale 0 - 100 Points
          </div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <TrendingUp class="w-6 h-6" />
        </div>
      </div>

      <!-- KPI 3: Overall Pass Rate -->
      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {{ isEnglish ? 'School Pass Rate' : 'អត្រាប្រឡងជាប់សរុប' }}
          </div>
          <div class="text-2xl font-black text-emerald-600 font-mono mt-1">
            {{ schoolPassRate }}%
          </div>
          <div class="text-xs text-slate-500 mt-1">
            {{ schoolPassedCount }} / {{ totalStudents }} Passed
          </div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 class="w-6 h-6" />
        </div>
      </div>

      <!-- KPI 4: Faculty & Class Coverage -->
      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {{ isEnglish ? 'Classes & Faculty' : 'ថ្នាក់រៀន និងគ្រូបង្រៀន' }}
          </div>
          <div class="text-2xl font-black text-purple-700 font-mono mt-1">
            {{ totalClasses }} Classes
          </div>
          <div class="text-xs text-slate-500 mt-1">
            {{ totalTeachers }} Assigned Faculty
          </div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <School class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 3. CROSS-GRADE COMPARISONS (Grade 10 vs 11 vs 12)         -->
    <!-- ========================================================= -->
    <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm sm:text-base font-bold text-slate-900">
            {{ isEnglish ? 'Cross-Grade Performance Comparison' : 'ការប្រៀបធៀបលទ្ធផលសិក្សាតាមកម្រិតថ្នាក់' }}
          </h2>
          <p class="text-xs text-slate-500">
            {{ isEnglish ? 'Enrollment, academic average, and pass rate benchmarking' : 'ស្ថិតិចំនួនសិស្ស ពិន្ទុមធ្យមភាគ និងអត្រាជាប់ធៀបរវាងថ្នាក់ទី ១០ ដល់ទី ១២' }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="g in gradeLevels"
          :key="g.level"
          class="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-purple-100 text-purple-700">
              {{ g.name }}
            </span>
            <span class="text-xs text-slate-500 font-medium">
              {{ g.classes.length }} {{ isEnglish ? 'Classes' : 'ថ្នាក់' }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <div class="p-2.5 rounded-lg bg-white border border-slate-200">
              <div class="text-[10px] uppercase font-semibold text-slate-400">{{ isEnglish ? 'Students' : 'សិស្ស' }}</div>
              <div class="text-lg font-black text-slate-900 font-mono mt-0.5">{{ g.studentCount }}</div>
            </div>
            <div class="p-2.5 rounded-lg bg-white border border-slate-200">
              <div class="text-[10px] uppercase font-semibold text-slate-400">{{ isEnglish ? 'Average' : 'មធ្យមភាគ' }}</div>
              <div class="text-lg font-black text-indigo-600 font-mono mt-0.5">{{ g.average }}</div>
            </div>
          </div>

          <!-- Progress Bar for Pass Rate -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-500 font-medium">{{ isEnglish ? 'Pass Rate' : 'អត្រាជាប់' }}</span>
              <span class="font-bold text-emerald-600 font-mono">{{ g.passRate }}%</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                :style="{ width: `${g.passRate}%` }"
              ></div>
            </div>
          </div>

          <!-- Classes in this grade -->
          <div class="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
            <span
              v-for="c in g.classes"
              :key="c.id"
              class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white border border-slate-200 text-slate-700"
            >
              {{ formatClassName(c.name, isEnglish) }} ({{ getClassStats(c.id).totalStudents }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 4. SUBJECT MASTERY MATRIX & SCHOOLWIDE HONOR ROLL         -->
    <!-- ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Subject-by-Subject Schoolwide Performance -->
      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900">
            {{ isEnglish ? 'Schoolwide Subject Performance Matrix' : 'ការវិភាគពិន្ទុមធ្យមភាគតាមមុខវិជ្ជាទូទាំងសាលា' }}
          </h3>
          <p class="text-xs text-slate-500">
            {{ isEnglish ? 'Average mark distribution across all 6 core subjects' : 'ការបែងចែកពិន្ទុមធ្យមភាគលើមុខវិជ្ជាស្នូលទាំង ៦' }}
          </p>
        </div>

        <div class="space-y-3">
          <div
            v-for="sub in subjectAverages"
            :key="sub.key"
            class="p-3 rounded-xl bg-slate-50/70 border border-slate-150 space-y-2"
          >
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :class="sub.color"></span>
                <span class="font-bold text-slate-800">
                  {{ isEnglish ? sub.nameEn : sub.nameKm }}
                </span>
              </div>
              <div class="flex items-center gap-3 font-mono">
                <span class="text-slate-400 text-[11px]">Min: {{ sub.lowest }} • Max: {{ sub.highest }}</span>
                <span class="font-bold text-indigo-700 text-sm">{{ sub.avg }} / 100</span>
              </div>
            </div>

            <!-- Visual Bar -->
            <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                :class="['h-full rounded-full transition-all duration-500', sub.color]"
                :style="{ width: `${sub.avg}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Schoolwide Top 5 Honor Roll -->
      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award class="w-4 h-4 text-amber-500" />
            <span>{{ isEnglish ? 'Schoolwide Honor Roll' : 'តារាងកិត្តិយសសិស្សឆ្នើមទូទាំងសាលា' }}</span>
          </h3>
          <p class="text-xs text-slate-500">
            {{ isEnglish ? 'Top academic performers across all grades and classes' : 'សិស្សឆ្នើមដែលមានពិន្ទុខ្ពស់ជាងគេនៅគ្រប់កម្រិតថ្នាក់' }}
          </p>
        </div>

        <div class="space-y-2.5">
          <div
            v-for="(st, idx) in topFiveStudents"
            :key="st.id"
            class="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-purple-300 hover:shadow-xs transition flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <!-- Medal or Rank -->
              <div class="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-base shrink-0">
                <span v-if="idx === 0">🥇</span>
                <span v-else-if="idx === 1">🥈</span>
                <span v-else-if="idx === 2">🥉</span>
                <span v-else class="text-xs font-mono text-slate-400">#{{ idx + 1 }}</span>
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-xs">{{ st.name }}</span>
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                    {{ st.classId ? st.classId.replace('CLS-', '') : '12A' }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                  ID: {{ st.id }} • {{ st.gender === 'F' ? (isEnglish ? 'Female' : 'ស្រី') : (isEnglish ? 'Male' : 'ប្រុស') }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <div class="text-right">
                <div class="font-bold font-mono text-indigo-600 text-xs">{{ st.average }} {{ isEnglish ? 'GPA' : 'មធ្យមភាគ' }}</div>
                <div class="text-[10px] text-slate-400 font-mono">{{ isEnglish ? 'Total:' : 'សរុប:' }} {{ st.total }}</div>
              </div>
              <button
                @click="viewStudentInPortal(st.id)"
                class="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                title="View Scorecard"
              >
                <ArrowUpRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

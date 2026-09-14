<!-- pages/teacher/analytics.vue -->
<script setup lang="ts">
import {
  BarChart3,
  Users,
  GraduationCap,
  School,
  TrendingUp,
  Award,
  BookOpen,
  Printer,
  Sparkles,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user } = useAuth()
const { isEnglish } = useI18n()
const {
  classes,
  allComputedStudents,
  getStudentsForClass,
  getClassStats,
  getGradeBadgeColor
} = useScore()

// Default class ID: homeroom class or CLS-12A
const selectedClassId = ref<string>(user.value?.classId || 'CLS-12A')

// Current Class Metadata
const currentClass = computed(() => {
  return classes.value.find((c) => c.id === selectedClassId.value) || classes.value[0]
})

// Students in selected class
const classStudents = computed(() => {
  if (!currentClass.value) return []
  return getStudentsForClass(currentClass.value.id)
})

// Computed Students with scores, averages, ranks, and grades
const computedClassStudents = computed(() => {
  if (!currentClass.value) return []
  return allComputedStudents.value
    .filter((s) => s.classId === currentClass.value.id)
    .sort((a, b) => a.rank - b.rank)
})

// Class Stats
const stats = computed(() => {
  if (!currentClass.value) return null
  return getClassStats(currentClass.value.id)
})

// Grade Distribution Breakdown
const gradeCounts = computed(() => {
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
  computedClassStudents.value.forEach((s) => {
    if (counts[s.grade] !== undefined) {
      counts[s.grade]++
    }
  })
  return counts
})

// Top 5 High Achievers
const topStudents = computed(() => {
  return computedClassStudents.value.slice(0, 5)
})

// At-Risk Students (Grade E or F, or score < 50)
const atRiskStudents = computed(() => {
  return computedClassStudents.value.filter((s) => s.grade === 'F' || s.grade === 'E' || s.average < 50)
})

// Subject Average Scores for the Class
const subjectAverages = computed(() => {
  const subjects = [
    { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics' },
    { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics' },
    { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry' },
    { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology' },
    { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature' },
    { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language' }
  ]

  const total = computedClassStudents.value.length
  if (total === 0) return []

  return subjects.map((sub) => {
    const sum = computedClassStudents.value.reduce((acc, s) => acc + (Number(s.scores[sub.key]) || 0), 0)
    const avg = Number((sum / total).toFixed(1))
    return {
      ...sub,
      average: avg,
      percentage: Math.min(100, Math.round((avg / 100) * 100))
    }
  })
})

const handlePrint = () => {
  if (process.client) {
    window.print()
  }
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header Section -->
    <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
            <BarChart3 class="w-5 h-5" />
          </div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {{ isEnglish ? 'Class Analytics & Performance' : 'ស្ថិតិ និងការវិភាគពិន្ទុថ្នាក់រៀន' }}
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          {{ isEnglish
            ? 'Detailed class performance indicators, grade distribution, subject averages, and student progress tracking.'
            : 'ទិន្នន័យស្ថិតិលម្អិតនៃលទ្ធផលសិក្សារបស់សិស្ស បំណែងចែកនិទ្ទេស និងការតាមដានការរីកចម្រើន។'
          }}
        </p>
      </div>

      <!-- Class Switcher & Print Button -->
      <div class="flex items-center gap-3">
        <div class="relative">
          <select
            v-model="selectedClassId"
            class="pl-3.5 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer appearance-none transition focus:ring-2 focus:ring-indigo-500/20"
          >
            <option v-for="c in classes" :key="c.id" :value="c.id">
              {{ formatClassName(c.name, isEnglish) }} ({{ getStudentsForClass(c.id).length }} {{ isEnglish ? 'students' : 'សិស្ស' }})
            </option>
          </select>
        </div>

        <button
          @click="handlePrint"
          type="button"
          class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Printer class="w-3.5 h-3.5" />
          <span>{{ isEnglish ? 'Print Report' : 'បោះពុម្ពរបាយការណ៍' }}</span>
        </button>
      </div>
    </div>

    <!-- 4 Key Performance Indicator Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Class Average -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Class Average (GPA)' : 'មធ្យមភាគពិន្ទុថ្នាក់' }}</span>
          <TrendingUp class="w-4 h-4 text-indigo-500" />
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-indigo-600 font-mono">
            {{ stats?.classAverage || 0 }} <span class="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <span class="text-[11px] text-slate-400">{{ isEnglish ? 'Class mean score' : 'មធ្យមភាគរួមនៃសិស្សទាំងអស់' }}</span>
        </div>
      </div>

      <!-- 2. Pass Rate -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Passing Rate' : 'អត្រាសិស្សជាប់' }}</span>
          <Award class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-emerald-600 font-mono">
            {{ stats?.passRate || 0 }}%
          </div>
          <span class="text-[11px] text-emerald-600 font-medium">
            {{ stats?.passedCount || 0 }} / {{ stats?.totalStudents || 0 }} {{ isEnglish ? 'passed' : 'សិស្សជាប់' }}
          </span>
        </div>
      </div>

      <!-- 3. Highest Score -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Highest Score' : 'ពិន្ទុខ្ពស់បំផុត' }}</span>
          <Sparkles class="w-4 h-4 text-amber-500" />
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-amber-600 font-mono">
            {{ stats?.highestAverage || 0 }}
          </div>
          <span class="text-[11px] text-slate-400 font-medium">
            {{ topStudents[0]?.name || (isEnglish ? 'Top student' : 'សិស្សចំណាត់ថ្នាក់ទី ១') }}
          </span>
        </div>
      </div>

      <!-- 4. Total Enrolled -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Total Students' : 'សិស្សសរុប' }}</span>
          <Users class="w-4 h-4 text-blue-500" />
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-slate-900 font-mono">
            {{ stats?.totalStudents || 0 }}
          </div>
          <span class="text-[11px] text-slate-400">{{ isEnglish ? 'Enrolled students' : 'សិស្សក្នុងបញ្ជីវត្តមាន' }}</span>
        </div>
      </div>
    </div>

    <!-- Main Analytics Content: Two Columns -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Subject Averages & Grade Distribution -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Subject Performance Breakdown -->
        <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <BookOpen class="w-4 h-4 text-indigo-600" />
              <span>{{ isEnglish ? 'Subject Performance Overview' : 'លទ្ធផលពិន្ទុមធ្យមតាមមុខវិជ្ជា' }}</span>
            </h3>
            <span class="text-xs font-mono text-slate-400">{{ isEnglish ? 'Max 100 pts' : 'ពិន្ទុពេញ ១០០' }}</span>
          </div>

          <div class="space-y-3.5">
            <div
              v-for="sub in subjectAverages"
              :key="sub.key"
              class="space-y-1.5"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-700">{{ isEnglish ? sub.nameEn : sub.nameKm }}</span>
                <span class="font-mono font-bold text-indigo-600">{{ sub.average }} pts</span>
              </div>
              <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="[
                    sub.average >= 80 ? 'bg-emerald-500' : sub.average >= 65 ? 'bg-indigo-500' : sub.average >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  ]"
                  :style="{ width: `${sub.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Grade Distribution Matrix -->
        <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Award class="w-4 h-4 text-indigo-600" />
              <span>{{ isEnglish ? 'Grade Distribution (A - F)' : 'បំណែងចែកនិទ្ទេស (A - F)' }}</span>
            </h3>
            <span class="text-xs text-slate-400 font-mono">{{ computedClassStudents.length }} {{ isEnglish ? 'students' : 'សិស្ស' }}</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div
              v-for="g in ['A', 'B', 'C', 'D', 'E', 'F']"
              :key="g"
              class="p-3 rounded-xl border text-center space-y-1"
              :class="[
                g === 'A' ? 'bg-emerald-50/60 border-emerald-200 text-emerald-700' :
                g === 'B' ? 'bg-blue-50/60 border-blue-200 text-blue-700' :
                g === 'C' ? 'bg-cyan-50/60 border-cyan-200 text-cyan-700' :
                g === 'D' ? 'bg-amber-50/60 border-amber-200 text-amber-700' :
                g === 'E' ? 'bg-orange-50/60 border-orange-200 text-orange-700' :
                'bg-rose-50/60 border-rose-200 text-rose-700'
              ]"
            >
              <div class="text-xs font-black uppercase">{{ isEnglish ? 'Grade' : 'និទ្ទេស' }} {{ g }}</div>
              <div class="text-xl font-black font-mono">{{ gradeCounts[g] || 0 }}</div>
              <div class="text-[10px] text-slate-400">
                {{ computedClassStudents.length > 0 ? Math.round(((gradeCounts[g] || 0) / computedClassStudents.length) * 100) : 0 }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right 1 Col: Top Students & Support Needed -->
      <div class="space-y-6">
        <!-- Top 5 Achievers -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Award class="w-4 h-4 text-amber-500" />
              <span>{{ isEnglish ? 'Top 5 High Achievers' : 'សិស្សឆ្នើមទាំង ៥ នាក់' }}</span>
            </h3>
            <span class="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Honors
            </span>
          </div>

          <div class="space-y-2.5 text-xs">
            <div
              v-for="(st, idx) in topStudents"
              :key="st.id"
              class="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
            >
              <div class="flex items-center gap-2.5">
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                  :class="[
                    idx === 0 ? 'bg-amber-400 text-slate-950 font-mono' :
                    idx === 1 ? 'bg-slate-300 text-slate-800 font-mono' :
                    idx === 2 ? 'bg-amber-700 text-white font-mono' : 'bg-slate-100 text-slate-500 font-mono'
                  ]"
                >
                  {{ idx + 1 }}
                </span>
                <div>
                  <div class="font-bold text-slate-900">{{ st.name }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ st.id }}</div>
                </div>
              </div>

              <div class="text-right">
                <span class="font-mono font-bold text-indigo-600">{{ st.average }}</span>
                <span
                  class="ml-2 px-1.5 py-0.2 rounded text-[10px] font-black uppercase"
                  :class="getGradeBadgeColor(st.grade)"
                >
                  {{ st.grade }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Academic Support Alert (At Risk) -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <AlertTriangle class="w-4 h-4 text-rose-500" />
              <span>{{ isEnglish ? 'Needs Academic Support' : 'សិស្សត្រូវការជំនួយបន្ថែម' }}</span>
            </h3>
            <span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {{ atRiskStudents.length }}
            </span>
          </div>

          <div v-if="atRiskStudents.length > 0" class="space-y-2 text-xs">
            <div
              v-for="st in atRiskStudents"
              :key="st.id"
              class="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between"
            >
              <div>
                <div class="font-bold text-slate-900">{{ st.name }}</div>
                <div class="text-[10px] text-slate-500 font-mono">{{ st.id }}</div>
              </div>
              <div class="text-right">
                <div class="font-mono font-bold text-rose-600">{{ st.average }} pts</div>
                <span class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-200 text-rose-800">
                  Grade {{ st.grade }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-4 text-xs text-slate-400">
            <Sparkles class="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p>{{ isEnglish ? 'Great job! No at-risk students in this class.' : 'អស្ចារ្យណាស់! គ្មានសិស្សជាប់និទ្ទេស F ក្នុងថ្នាក់នេះទេ។' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

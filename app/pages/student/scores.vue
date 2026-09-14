<!-- pages/student/scores.vue -->
<script setup lang="ts">
import {
  TrendingUp,
  Award,
  BookOpen,
  ArrowLeft,
  Printer,
  Sparkles,
  CheckCircle2
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { currentStudent } = useScore()
const { t, isEnglish } = useI18n()

const subjectScores = computed(() => {
  const scores = currentStudent.value?.scores || {
    math: 95,
    physics: 92,
    chemistry: 90,
    biology: 88,
    khmer: 94,
    english: 96
  }

  const getGrade = (score: number) => {
    if (score >= 85) return 'A'
    if (score >= 75) return 'B'
    if (score >= 65) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }

  const getVariant = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (score >= 75) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-rose-50 text-rose-700 border-rose-200'
  }

  return [
    { id: 1, nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', code: 'MATH-12', score: scores.math ?? 95, max: 100, grade: getGrade(scores.math ?? 95), variant: getVariant(scores.math ?? 95), passed: (scores.math ?? 95) >= 50 },
    { id: 2, nameKm: 'រូបវិទ្យា', nameEn: 'Physics', code: 'PHYS-12', score: scores.physics ?? 92, max: 100, grade: getGrade(scores.physics ?? 92), variant: getVariant(scores.physics ?? 92), passed: (scores.physics ?? 92) >= 50 },
    { id: 3, nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', code: 'CHEM-12', score: scores.chemistry ?? 90, max: 100, grade: getGrade(scores.chemistry ?? 90), variant: getVariant(scores.chemistry ?? 90), passed: (scores.chemistry ?? 90) >= 50 },
    { id: 4, nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', code: 'BIO-12', score: scores.biology ?? 88, max: 100, grade: getGrade(scores.biology ?? 88), variant: getVariant(scores.biology ?? 88), passed: (scores.biology ?? 88) >= 50 },
    { id: 5, nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', code: 'KHM-12', score: scores.khmer ?? 94, max: 100, grade: getGrade(scores.khmer ?? 94), variant: getVariant(scores.khmer ?? 94), passed: (scores.khmer ?? 94) >= 50 },
    { id: 6, nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', code: 'ENG-12', score: scores.english ?? 96, max: 100, grade: getGrade(scores.english ?? 96), variant: getVariant(scores.english ?? 96), passed: (scores.english ?? 96) >= 50 }
  ]
})

const totalScore = computed(() => subjectScores.value.reduce((acc, s) => acc + s.score, 0))
const avgScore = computed(() => (totalScore.value / 6).toFixed(1))
const overallGrade = computed(() => {
  const avg = Number(avgScore.value)
  if (avg >= 85) return isEnglish.value ? 'Grade A' : 'និទ្ទេស A'
  if (avg >= 75) return isEnglish.value ? 'Grade B' : 'និទ្ទេស B'
  if (avg >= 65) return isEnglish.value ? 'Grade C' : 'និទ្ទេស C'
  return isEnglish.value ? 'Grade D' : 'និទ្ទេស D'
})

const printScores = () => {
  window.print()
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
            {{ isEnglish ? 'Monthly Academic Scores' : 'លទ្ធផលពិន្ទុប្រចាំខែ' }}
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ formatClassName(currentStudent?.className || 'CLS-12A', isEnglish) }} • {{ isEnglish ? 'Academic Year 2025-2026' : 'ឆ្នាំសិក្សា ២០២៥-២០២៦' }}
          </p>
        </div>
      </div>

      <button
        @click="printScores"
        type="button"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
      >
        <Printer class="w-4 h-4" />
        <span>{{ isEnglish ? 'Print Report' : 'បោះពុម្ពរបាយការណ៍' }}</span>
      </button>
    </div>

    <!-- 3 Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Award class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs text-slate-400 font-medium">{{ isEnglish ? 'Class Average' : 'មធ្យមភាគរួម' }}</div>
          <div class="text-2xl font-bold text-blue-600 font-mono tracking-tight">{{ avgScore }} <span class="text-sm font-normal text-slate-400">/ 100</span></div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <BookOpen class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs text-slate-400 font-medium">{{ isEnglish ? 'Total Score' : 'ពិន្ទុសរុប' }}</div>
          <div class="text-2xl font-bold text-slate-900 font-mono tracking-tight">{{ totalScore }} <span class="text-sm font-normal text-slate-400">/ 600</span></div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Sparkles class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs text-slate-400 font-medium">{{ isEnglish ? 'Academic Standing' : 'ចំណាត់ថ្នាក់និទ្ទេស' }}</div>
          <div class="text-base font-bold text-emerald-600 tracking-tight">{{ overallGrade }}</div>
        </div>
      </div>
    </div>

    <!-- Full Scores Table -->
    <div class="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs overflow-hidden">
      <h2 class="text-sm font-bold text-slate-900 mb-4">
        {{ isEnglish ? '6 High School Subjects' : 'ពិន្ទុមុខវិជ្ជាទាំង ៦' }}
      </h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 pb-2">
              <th class="py-3 px-3 text-center w-12">#</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Subject' : 'មុខវិជ្ជា' }}</th>
              <th class="py-3 px-3 text-center">{{ isEnglish ? 'Code' : 'កូដ' }}</th>
              <th class="py-3 px-3 text-center">{{ isEnglish ? 'Score' : 'ពិន្ទុ' }}</th>
              <th class="py-3 px-3 text-center">{{ isEnglish ? 'Grade' : 'និទ្ទេស' }}</th>
              <th class="py-3 px-4 text-center">{{ isEnglish ? 'Status' : 'លទ្ធផល' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr v-for="sub in subjectScores" :key="sub.id" class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-3 text-center text-slate-400 font-mono">{{ sub.id }}</td>
              <td class="py-3 px-4 font-semibold text-slate-800">
                <span>{{ isEnglish ? sub.nameEn : sub.nameKm }}</span>
              </td>
              <td class="py-3 px-3 text-center font-mono text-slate-500">{{ sub.code }}</td>
              <td class="py-3 px-3 text-center font-mono font-bold text-slate-900">{{ sub.score }} / {{ sub.max }}</td>
              <td class="py-3 px-3 text-center">
                <span :class="['inline-block px-2.5 py-0.5 text-xs font-bold rounded-md border', sub.variant]">
                  {{ sub.grade }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  class="inline-flex items-center gap-1 text-xs font-semibold"
                  :class="sub.passed ? 'text-emerald-600' : 'text-rose-600'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="sub.passed ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  <span>{{ sub.passed ? (isEnglish ? 'Passed' : 'ជាប់') : (isEnglish ? 'Failed' : 'ធ្លាក់') }}</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<!-- pages/student/subjects.vue -->
<script setup lang="ts">
import {
  BookOpen,
  ArrowLeft,
  Clock,
  MapPin,
  User
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { subjects: realSubjects } = useScore()
const { isEnglish } = useI18n()

const subjects = computed(() => {
  return [
    {
      id: 'sub-1',
      nameKm: 'គណិតវិទ្យា',
      nameEn: 'Mathematics',
      code: 'MATH-12',
      credits: 5,
      instructorKm: 'លោកគ្រូ សុវណ្ណ',
      instructorEn: 'Mr. Sovann',
      room: 'បន្ទប់ 301',
      scheduleKm: 'ចន្ទ, ពុធ 07:00 - 08:30',
      scheduleEn: 'Mon, Wed 07:00 - 08:30',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      id: 'sub-2',
      nameKm: 'រូបវិទ្យា',
      nameEn: 'Physics',
      code: 'PHYS-12',
      credits: 4,
      instructorKm: 'លោកគ្រូ សុវណ្ណ',
      instructorEn: 'Mr. Sovann',
      room: 'បន្ទប់ 301',
      scheduleKm: 'អង្គារ, ព្រហស្បតិ៍ 07:00 - 08:30',
      scheduleEn: 'Tue, Thu 07:00 - 08:30',
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'sub-3',
      nameKm: 'គីមីវិទ្យា',
      nameEn: 'Chemistry',
      code: 'CHEM-12',
      credits: 4,
      instructorKm: 'អ្នកគ្រូ ចិន្តា',
      instructorEn: 'Ms. Chenda',
      room: 'បន្ទប់ 301',
      scheduleKm: 'ចន្ទ, សុក្រ 08:45 - 10:15',
      scheduleEn: 'Mon, Fri 08:45 - 10:15',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'sub-4',
      nameKm: 'ជីវវិទ្យា',
      nameEn: 'Biology',
      code: 'BIO-12',
      credits: 4,
      instructorKm: 'អ្នកគ្រូ ចិន្តា',
      instructorEn: 'Ms. Chenda',
      room: 'បន្ទប់ 301',
      scheduleKm: 'អង្គារ, ព្រហស្បតិ៍ 08:45 - 10:15',
      scheduleEn: 'Tue, Thu 08:45 - 10:15',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      id: 'sub-5',
      nameKm: 'ភាសាខ្មែរ',
      nameEn: 'Khmer Literature',
      code: 'KHM-12',
      credits: 5,
      instructorKm: 'លោកគ្រូ វិសាល',
      instructorEn: 'Mr. Visal',
      room: 'បន្ទប់ 301',
      scheduleKm: 'ពុធ, សៅរ៍ 07:00 - 08:30',
      scheduleEn: 'Wed, Sat 07:00 - 08:30',
      color: 'from-rose-500 to-pink-600'
    },
    {
      id: 'sub-6',
      nameKm: 'ភាសាអង់គ្លេស',
      nameEn: 'English Language',
      code: 'ENG-12',
      credits: 3,
      instructorKm: 'អ្នកគ្រូ សារ៉ា',
      instructorEn: 'Ms. Sarah',
      room: 'បន្ទប់ 301',
      scheduleKm: 'សុក្រ, សៅរ៍ 08:45 - 10:15',
      scheduleEn: 'Fri, Sat 08:45 - 10:15',
      color: 'from-purple-500 to-indigo-600'
    }
  ]
})
</script>

<template>
  <div class="w-full space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink
        to="/student"
        class="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft class="w-4 h-4" />
      </NuxtLink>
      <div>
        <h1 class="text-xl font-bold text-slate-900 tracking-tight">
          {{ isEnglish ? 'High School Subjects' : 'មុខវិជ្ជាសិក្សា' }}
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">
          {{ subjects.length }} {{ isEnglish ? 'Subjects • Class 12A • Academic Year 2025-2026' : 'មុខវិជ្ជា • ថ្នាក់ទី ១២A • ឆ្នាំសិក្សា ២០២៥-២០២៦' }}
        </p>
      </div>
    </div>

    <!-- Course Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="sub in subjects"
        :key="sub.id"
        class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition"
      >
        <div class="p-5">
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
              {{ sub.code }}
            </span>
            <span class="text-xs font-semibold text-slate-400">
              {{ sub.credits }} {{ isEnglish ? 'hours/week' : 'ម៉ោង/សប្តាហ៍' }}
            </span>
          </div>

          <h2 class="text-sm font-bold text-slate-900 mb-3">
            {{ isEnglish ? sub.nameEn : sub.nameKm }}
          </h2>

          <div class="space-y-2 text-xs text-slate-500">
            <div class="flex items-center gap-2">
              <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span class="truncate">{{ isEnglish ? sub.instructorEn : sub.instructorKm }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{{ formatRoom(sub.room, isEnglish) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span class="truncate">{{ isEnglish ? sub.scheduleEn : sub.scheduleKm }}</span>
            </div>
          </div>
        </div>

        <div class="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-[11px] font-semibold text-emerald-600">{{ isEnglish ? 'Enrolled' : 'បានចុះឈ្មោះ' }}</span>
          <span class="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer">{{ isEnglish ? 'Syllabus' : 'មាតិកាមេរៀន' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- pages/student/index.vue -->
<script setup lang="ts">
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CalendarDays,
  Megaphone,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user } = useAuth()
const { currentStudent, announcements: realAnnouncements, subjects: realSubjects } = useScore()
const { t, isEnglish } = useI18n()
const router = useRouter()

const cleanStudentName = computed(() => {
  if (currentStudent.value?.name) return currentStudent.value.name
  if (!user.value?.name) return 'Siv Vannat'
  return user.value.name.replace(/\s*\([^)]*\)/g, '').trim() || 'Siv Vannat'
})

const greetingFirstName = computed(() => {
  const parts = cleanStudentName.value.split(' ')
  return parts[0] || 'Siv'
})

// Student Information Data loaded dynamically from JSON
const studentInfo = computed(() => {
  const st = currentStudent.value
  const scores = st?.scores || { math: 95, physics: 92, chemistry: 90, biology: 88, khmer: 94, english: 96 }
  const total = Object.values(scores).reduce((sum: number, s: any) => sum + (Number(s) || 0), 0)
  const avg = Number((total / 6).toFixed(1))

  return {
    name: cleanStudentName.value,
    studentId: st?.id || 'ST-2026-024',
    className: formatClassName(st?.className || 'CLS-12A', isEnglish.value),
    teacher: formatTeacherName(st?.teacherName || 'លោកគ្រូ សុវណ្ណ', isEnglish.value),
    semester: isEnglish.value ? 'Semester 1' : 'ឆមាសទី ១',
    avatarUrl: st?.avatar || '/images/student-avatar.jpg',
    overallGpa: avg.toFixed(1),
    maxGpa: '100',
    totalScore: total,
    gpaStatus: avg >= 85 ? (isEnglish.value ? 'Grade A' : 'និទ្ទេស A') : (avg >= 75 ? (isEnglish.value ? 'Grade B' : 'និទ្ទេស B') : (isEnglish.value ? 'Grade C' : 'និទ្ទេស C')),
    attendanceRate: st?.attendance?.rate ?? 96,
    presentCount: st?.attendance?.present ?? 48,
    absentCount: st?.attendance?.absent ?? 1,
    lateCount: st?.attendance?.late ?? 1,
    totalClasses: st?.attendance?.total ?? 50
  }
})

// 6 High School Subjects & Scores from JSON database
const subjectScores = computed(() => {
  const st = currentStudent.value
  const scores = st?.scores || {
    math: 95,
    physics: 92,
    chemistry: 90,
    biology: 88,
    khmer: 94,
    english: 96
  }

  const getVariant = (score: number) => {
    if (score >= 85) return 'green'
    if (score >= 75) return 'blue'
    if (score >= 50) return 'amber'
    return 'slate'
  }

  const getGrade = (score: number) => {
    if (score >= 85) return 'A'
    if (score >= 75) return 'B'
    if (score >= 65) return 'C'
    if (score >= 55) return 'D'
    if (score >= 50) return 'E'
    return 'F'
  }

  return [
    { id: 1, name: isEnglish.value ? 'Mathematics' : 'គណិតវិទ្យា', score: scores.math ?? 95, max: 100, grade: getGrade(scores.math ?? 95), gradeVariant: getVariant(scores.math ?? 95) },
    { id: 2, name: isEnglish.value ? 'Physics' : 'រូបវិទ្យា', score: scores.physics ?? 92, max: 100, grade: getGrade(scores.physics ?? 92), gradeVariant: getVariant(scores.physics ?? 92) },
    { id: 3, name: isEnglish.value ? 'Chemistry' : 'គីមីវិទ្យា', score: scores.chemistry ?? 90, max: 100, grade: getGrade(scores.chemistry ?? 90), gradeVariant: getVariant(scores.chemistry ?? 90) },
    { id: 4, name: isEnglish.value ? 'Biology' : 'ជីវវិទ្យា', score: scores.biology ?? 88, max: 100, grade: getGrade(scores.biology ?? 88), gradeVariant: getVariant(scores.biology ?? 88) },
    { id: 5, name: isEnglish.value ? 'Khmer Literature' : 'ភាសាខ្មែរ', score: scores.khmer ?? 94, max: 100, grade: getGrade(scores.khmer ?? 94), gradeVariant: getVariant(scores.khmer ?? 94) },
    { id: 6, name: isEnglish.value ? 'English Language' : 'ភាសាអង់គ្លេស', score: scores.english ?? 96, max: 100, grade: getGrade(scores.english ?? 96), gradeVariant: getVariant(scores.english ?? 96) }
  ]
})

// Recent Announcements loaded from JSON database
const announcements = computed(() => {
  if (realAnnouncements.value && realAnnouncements.value.length > 0) {
    return realAnnouncements.value.slice(0, 3).map((ann: any, idx: number) => ({
      id: ann.id,
      title: ann.title,
      description: ann.content,
      date: ann.date,
      icon: idx === 0 ? Megaphone : (idx === 1 ? FileText : Clock),
      bgClass: idx === 0 ? 'bg-blue-50 text-blue-600' : (idx === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600')
    }))
  }
  return [
    {
      id: 'ann-1',
      title: isEnglish.value ? 'Grade 12 Mock Exam Schedule' : 'កាលវិភាគប្រឡងសាកល្បងបាក់ឌុប',
      description: isEnglish.value ? 'Grade 12 mock exams start on October 25 covering all 6 subjects.' : 'ការប្រឡងសាកល្បងសម្រាប់សិស្សថ្នាក់ទី ១២ នឹងចាប់ផ្តើមពីថ្ងៃទី ២៥ ខែតុលា លើមុខវិជ្ជាទាំង ៦។',
      date: 'Oct 15, 2025',
      icon: Megaphone,
      bgClass: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'ann-2',
      title: isEnglish.value ? 'Chemistry Lab Relocation' : 'ប្តូរបន្ទប់ពិសោធន៍គីមីវិទ្យា',
      description: isEnglish.value ? 'Monday chemistry lab class is relocated to Lab 1.' : 'ម៉ោងពិសោធន៍គីមីវិទ្យាថ្ងៃចន្ទនឹងត្រូវផ្លាស់ប្តូរទៅបន្ទប់ពិសោធន៍វិទ្យាសាស្ត្រ (Lab 1)។',
      date: 'Oct 12, 2025',
      icon: FileText,
      bgClass: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'ann-3',
      title: isEnglish.value ? 'Math Olympiad Competition' : 'ការប្រកួតប្រជែងសិស្សពូកែគណិតវិទ្យា',
      description: isEnglish.value ? 'Grade 12 students interested in competing please register with Mr. Sovann.' : 'សូមអញ្ជើញសិស្សានុសិស្សថ្នាក់ទី ១២ ដែលមានបំណងចូលរួមប្រឡងសិស្សពូកែ មកចុះឈ្មោះជាមួយលោកគ្រូ សុវណ្ណ។',
      date: 'Oct 08, 2025',
      icon: Clock,
      bgClass: 'bg-purple-50 text-purple-600'
    }
  ]
})

// Helper for Grade pill badge color classes
const getGradeClass = (variant: string) => {
  if (variant === 'green') return 'bg-emerald-50 text-emerald-600 border-emerald-200'
  if (variant === 'blue') return 'bg-blue-50 text-blue-600 border-blue-200'
  if (variant === 'amber') return 'bg-amber-50 text-amber-600 border-amber-200'
  return 'bg-slate-50 text-slate-600 border-slate-200'
}

// Attendance Donut SVG circle parameters
// Radius = 38, Circumference = 2 * PI * 38 ≈ 238.76
const radius = 38
const circumference = 2 * Math.PI * radius
const strokeDashoffset = computed(() => {
  return circumference - (studentInfo.value.attendanceRate / 100) * circumference
})

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="w-full space-y-6">
    <!-- ========================================================= -->
    <!-- GREETING HEADER                                           -->
    <!-- ========================================================= -->
    <div>
      <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
        <span>Good morning, {{ greetingFirstName }}</span>
        <span>👋</span>
      </h1>
      <p class="text-xs text-slate-500 mt-1">
        Here is your academic overview.
      </p>
    </div>

    <!-- ========================================================= -->
    <!-- TOP ROW CARDS (Student Info, Overall GPA, Attendance)     -->
    <!-- ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- 1. Student Information Card -->
      <div class="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <!-- Avatar on Left -->
        <div class="w-20 h-20 rounded-full bg-blue-50 overflow-hidden border-2 border-blue-100 shadow-xs shrink-0">
          <img
            :src="studentInfo.avatarUrl"
            alt="Student Avatar"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Information List on Right -->
        <div class="flex-1 w-full">
          <h2 class="text-sm font-bold text-slate-900 mb-3">
            Student Information
          </h2>

          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-medium">Name</span>
              <span class="font-semibold text-slate-800">{{ studentInfo.name }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-medium">Student ID</span>
              <span class="font-semibold text-slate-800 font-mono">{{ studentInfo.studentId }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-medium">Class</span>
              <span class="font-semibold text-slate-800">{{ studentInfo.className }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-medium">Teacher</span>
              <span class="font-semibold text-slate-800">{{ studentInfo.teacher }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-medium">Semester</span>
              <span class="font-semibold text-slate-800">{{ studentInfo.semester }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Overall Average Card -->
      <div class="lg:col-span-3 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <h3 class="text-xs font-bold text-slate-900">
          {{ isEnglish ? 'Average Score' : 'ពិន្ទុមធ្យមភាគ' }}
        </h3>

        <div class="my-4">
          <div class="text-3xl font-extrabold text-blue-600 tracking-tight font-mono">
            {{ studentInfo.overallGpa }}
            <span class="text-slate-400 font-normal text-xl">/ 100</span>
          </div>

          <div class="mt-2.5">
            <span class="inline-block px-2.5 py-0.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
              {{ studentInfo.gpaStatus }}
            </span>
          </div>
        </div>

        <div class="text-[11px] text-slate-500 font-mono">
          Total: <strong class="text-slate-800">{{ studentInfo.totalScore }}</strong> / 600
        </div>
      </div>

      <!-- 3. Attendance Card -->
      <div class="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-900">
            Attendance
          </h3>
          <NuxtLink
            to="/student/attendance"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 group"
          >
            <span>View details</span>
            <span class="group-hover:translate-x-0.5 transition-transform">→</span>
          </NuxtLink>
        </div>

        <div class="mt-4 flex items-center justify-between gap-4">
          <!-- Circular Donut Progress Ring -->
          <div class="relative w-22 h-22 shrink-0 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              <!-- Background circle -->
              <circle
                cx="48"
                cy="48"
                :r="radius"
                fill="transparent"
                stroke="#e2e8f0"
                stroke-width="8"
              />
              <!-- Progress circle -->
              <circle
                cx="48"
                cy="48"
                :r="radius"
                fill="transparent"
                stroke="#0d9488"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset"
                class="transition-all duration-700 ease-out"
              />
            </svg>

            <!-- Centered Text inside Donut -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-lg font-bold text-slate-900 leading-none font-mono">
                {{ studentInfo.attendanceRate }}%
              </span>
              <span class="text-[10px] text-slate-400 mt-0.5 font-medium">Present</span>
            </div>
          </div>

          <!-- Attendance Counts Legend on Right -->
          <div class="space-y-1.5 text-xs flex-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span class="text-slate-600">Present</span>
              </div>
              <span class="font-bold text-slate-800 font-mono">{{ studentInfo.presentCount }}</span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                <span class="text-slate-600">Absent</span>
              </div>
              <span class="font-bold text-slate-800 font-mono">{{ studentInfo.absentCount }}</span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <span class="text-slate-600">Late</span>
              </div>
              <span class="font-bold text-slate-800 font-mono">{{ studentInfo.lateCount }}</span>
            </div>

            <div class="pt-1 text-[11px] text-slate-400 border-t border-slate-100">
              Total: {{ studentInfo.totalClasses }} classes
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- MIDDLE ROW: 3 QUICK METRIC CARDS                          -->
    <!-- ========================================================= -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: GPA -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <GraduationCap class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs text-slate-400 font-medium">{{ isEnglish ? 'Average' : 'មធ្យមភាគ' }}</div>
          <div class="text-base font-bold text-slate-900 tracking-tight font-mono">
            {{ studentInfo.overallGpa }}
            <span class="text-xs font-normal text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Subjects -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <BookOpen class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs text-slate-400 font-medium">{{ isEnglish ? 'Subjects' : 'មុខវិជ្ជា' }}</div>
          <div class="text-base font-bold text-slate-900 tracking-tight font-mono">
            {{ subjectScores.length }}
          </div>
        </div>
      </div>

      <!-- Card 3: Attendance -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Calendar class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs text-slate-400 font-medium">{{ isEnglish ? 'Attendance' : 'វត្តមាន' }}</div>
          <div class="text-base font-bold text-slate-900 tracking-tight font-mono">
            {{ studentInfo.attendanceRate }}%
          </div>
        </div>
      </div>

      <!-- Card 4: Schedule / Timetable -->
      <NuxtLink
        to="/student/schedule"
        class="bg-white hover:bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 transition group cursor-pointer"
      >
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CalendarDays class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xs text-slate-400 font-medium">{{ isEnglish ? 'Timetable' : 'កាលវិភាគ' }}</div>
            <div class="text-xs font-bold text-indigo-600 tracking-tight group-hover:underline">
              {{ isEnglish ? 'Mon - Sat View' : 'ចន្ទ - សៅរ៍' }}
            </div>
          </div>
        </div>
        <ArrowRight class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
      </NuxtLink>
    </div>

    <!-- ========================================================= -->
    <!-- BOTTOM ROW: SUBJECT SCORES TABLE & RECENT ANNOUNCEMENTS   -->
    <!-- ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <!-- 1. Subject Scores Table (Left 2/3) -->
      <div class="lg:col-span-8 bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between pb-4">
          <h2 class="text-sm font-bold text-slate-900">
            Subject Scores
          </h2>
          <NuxtLink
            to="/student/scores"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 group"
          >
            <span>View all scores</span>
            <span class="group-hover:translate-x-0.5 transition-transform">→</span>
          </NuxtLink>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 pb-2">
                <th class="py-2.5 px-3 w-10 text-center font-medium">#</th>
                <th class="py-2.5 px-3 font-medium">Subject</th>
                <th class="py-2.5 px-3 font-medium text-center">Score</th>
                <th class="py-2.5 px-3 font-medium text-center w-20">Grade</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100/70 font-medium">
              <tr
                v-for="sub in subjectScores"
                :key="sub.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <!-- Index -->
                <td class="py-3 px-3 text-center text-slate-400 font-mono">
                  {{ sub.id }}
                </td>

                <!-- Subject Name -->
                <td class="py-3 px-3 font-semibold text-slate-800">
                  {{ sub.name }}
                </td>

                <!-- Score -->
                <td class="py-3 px-3 text-center font-mono text-slate-700">
                  {{ sub.score }} / {{ sub.max }}
                </td>

                <!-- Grade Badge -->
                <td class="py-3 px-3 text-center">
                  <span
                    :class="[
                      'inline-block px-2.5 py-0.5 text-xs font-bold rounded-md border text-center min-w-[32px]',
                      getGradeClass(sub.gradeVariant)
                    ]"
                  >
                    {{ sub.grade }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Recent Announcements Card (Right 1/3) -->
      <div class="lg:col-span-4 bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between pb-4">
          <h2 class="text-sm font-bold text-slate-900">
            Recent Announcements
          </h2>
          <NuxtLink
            to="/student/announcements"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 group"
          >
            <span>View all</span>
            <span class="group-hover:translate-x-0.5 transition-transform">→</span>
          </NuxtLink>
        </div>

        <div class="space-y-4 pt-1">
          <div
            v-for="ann in announcements"
            :key="ann.id"
            class="flex items-start gap-3.5 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
          >
            <!-- Icon Bubble -->
            <div
              :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                ann.bgClass
              ]"
            >
              <component :is="ann.icon" class="w-4 h-4" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h3 class="text-xs font-bold text-slate-900 leading-snug">
                {{ ann.title }}
              </h3>
              <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {{ ann.description }}
              </p>
              <div class="text-[10px] text-slate-400 font-medium mt-1.5">
                {{ ann.date }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- pages/student/attendance.vue -->
<script setup lang="ts">
import {
  CalendarCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { currentStudent, attendanceLogs: realAttendanceLogs } = useScore()
const { isEnglish } = useI18n()

const attendanceStats = computed(() => {
  const att = currentStudent.value?.attendance
  return {
    rate: att?.rate ?? 94,
    present: att?.present ?? 46,
    absent: att?.absent ?? 2,
    late: att?.late ?? 1,
    total: att?.total ?? 49
  }
})

const attendanceRecords = computed(() => {
  return [
    { id: 1, date: '2026-09-08', subject: isEnglish.value ? 'Mathematics' : 'គណិតវិទ្យា', time: '07:00 - 08:30', status: 'Present', statusClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 2, date: '2026-09-08', subject: isEnglish.value ? 'Chemistry' : 'គីមីវិទ្យា', time: '08:45 - 10:15', status: 'Present', statusClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 3, date: '2026-09-07', subject: isEnglish.value ? 'Physics' : 'រូបវិទ្យា', time: '07:00 - 08:30', status: 'Present', statusClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 4, date: '2026-09-05', subject: isEnglish.value ? 'Biology' : 'ជីវវិទ្យា', time: '08:45 - 10:15', status: 'Late', statusClass: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 5, date: '2026-09-04', subject: isEnglish.value ? 'Khmer Literature' : 'ភាសាខ្មែរ', time: '07:00 - 08:30', status: 'Present', statusClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 6, date: '2026-09-03', subject: isEnglish.value ? 'English Language' : 'ភាសាអង់គ្លេស', time: '08:45 - 10:15', status: 'Present', statusClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 7, date: '2026-09-02', subject: isEnglish.value ? 'Physics' : 'រូបវិទ្យា', time: '07:00 - 08:30', status: 'Absent', statusClass: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 8, date: '2026-09-01', subject: isEnglish.value ? 'Mathematics' : 'គណិតវិទ្យា', time: '07:00 - 08:30', status: 'Present', statusClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
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
          {{ isEnglish ? 'Attendance Record' : 'កំណត់ត្រាវត្តមាន' }}
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">
          {{ isEnglish ? `Overall Attendance: ${attendanceStats.rate}%` : `អត្រាវត្តមានសរុប៖ ${attendanceStats.rate}%` }} •
          {{ attendanceStats.present }} {{ isEnglish ? 'Present' : 'វត្តមាន' }} /
          {{ attendanceStats.absent }} {{ isEnglish ? 'Absent' : 'អវត្តមាន' }} /
          {{ attendanceStats.late }} {{ isEnglish ? 'Late' : 'យឺត' }}
        </p>
      </div>
    </div>

    <!-- 3 Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Present' : 'វត្តមាន' }}</span>
          <div class="text-2xl font-black text-emerald-600 font-mono mt-1">{{ attendanceStats.present }}</div>
          <span class="text-[11px] text-slate-400">{{ attendanceStats.rate }}% {{ isEnglish ? 'Rate' : 'អត្រា' }}</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Absent' : 'អវត្តមាន' }}</span>
          <div class="text-2xl font-black text-rose-600 font-mono mt-1">{{ attendanceStats.absent }}</div>
          <span class="text-[11px] text-slate-400">{{ isEnglish ? 'Sessions' : 'ម៉ោង' }}</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Late' : 'យឺត' }}</span>
          <div class="text-2xl font-black text-amber-500 font-mono mt-1">{{ attendanceStats.late }}</div>
          <span class="text-[11px] text-slate-400">{{ isEnglish ? 'Sessions' : 'ម៉ោង' }}</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
          <Clock class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Log Table -->
    <div class="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <h2 class="text-sm font-bold text-slate-900 mb-4">
        {{ isEnglish ? 'Recent Attendance Logs' : 'កំណត់ត្រាវត្តមានថ្មីៗ' }}
      </h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 pb-2">
              <th class="py-3 px-3">{{ isEnglish ? 'Date' : 'កាលបរិច្ឆេទ' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Subject' : 'មុខវិជ្ជា' }}</th>
              <th class="py-3 px-3 text-center">{{ isEnglish ? 'Class Time' : 'ម៉ោងសិក្សា' }}</th>
              <th class="py-3 px-4 text-center">{{ isEnglish ? 'Status' : 'ស្ថានភាព' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr v-for="log in attendanceRecords" :key="log.id" class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-3 font-mono text-slate-600">{{ log.date }}</td>
              <td class="py-3 px-4 font-semibold text-slate-800">{{ log.subject }}</td>
              <td class="py-3 px-3 text-center font-mono text-slate-500">{{ log.time }}</td>
              <td class="py-3 px-4 text-center">
                <span :class="['inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border', log.statusClass]">
                  {{ formatAttendanceStatus(log.status, isEnglish) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

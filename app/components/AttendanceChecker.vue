<!-- components/AttendanceChecker.vue -->
<script setup lang="ts">
import type { AttendanceStatus } from '~/types'
import {
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserX,
  Users,
  Save,
  Check,
  Search,
  Filter,
  ArrowRight,
  School,
  Calendar,
  Sparkles
} from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    allowClassSelection?: boolean
    defaultClassId?: string
  }>(),
  {
    allowClassSelection: true
  }
)

const {
  classes,
  activeClassId,
  getStudentsForClass,
  attendanceLogs,
  saveClassAttendance
} = useScore()
const { t, isEnglish } = useI18n()

// Selected Class & Date
const selectedClassId = ref<string>(props.defaultClassId || activeClassId.value || 'CLS-12A')
const selectedDate = ref<string>(new Date().toISOString().split('T')[0])
const searchQuery = ref<string>('')
const activeTab = ref<'record' | 'history'>('record')

// Toast notification
const toastMessage = ref<string | null>(null)
const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = null
  }, 3500)
}

// Enrolled students in currently selected class
const classStudents = computed(() => {
  return getStudentsForClass(selectedClassId.value)
})

// Current Class Metadata
const currentClass = computed(() => {
  return classes.value.find((c) => c.id === selectedClassId.value) || classes.value[0]
})

// Daily attendance state mapping (studentId -> { status, remarks })
const attendanceState = reactive<Record<string, { status: AttendanceStatus; remarks: string }>>({})

// Initialize attendance state for all students in class
const initAttendanceState = () => {
  classStudents.value.forEach((st) => {
    if (!attendanceState[st.id]) {
      attendanceState[st.id] = {
        status: 'Present',
        remarks: ''
      }
    }
  })
}

watch(
  [selectedClassId, () => classStudents.value.length],
  () => {
    initAttendanceState()
  },
  { immediate: true }
)

// Filtered students by search
const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) return classStudents.value
  const q = searchQuery.value.toLowerCase().trim()
  return classStudents.value.filter(
    (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
  )
})

// Blacklisted / Hard locked student IDs (Seed with some sample if absences are high)
const blacklistedStudentIds = ref<Set<string>>(new Set(['STU-003']))

const isStudentBlacklisted = (st: any): boolean => {
  if (blacklistedStudentIds.value.has(st.id)) return true
  if (st.remarks?.toLowerCase().includes('blacklist') || st.remarks?.toLowerCase().includes('hard lock')) return true
  return false
}

const toggleBlacklist = (studentId: string) => {
  if (blacklistedStudentIds.value.has(studentId)) {
    blacklistedStudentIds.value.delete(studentId)
    showToast(isEnglish.value ? 'Removed student from blacklist!' : 'បានដកសិស្សចេញពី Blacklist!')
  } else {
    blacklistedStudentIds.value.add(studentId)
    showToast(isEnglish.value ? 'Flagged student as BLACKLIST (HARD LOCK)!' : 'បានកំណត់សិស្សជា BLACKLIST (HARD LOCK)!')
  }
}

// Live Counters (No rate)
const stats = computed(() => {
  const total = classStudents.value.length
  let present = 0
  let excused = 0
  let absent = 0

  classStudents.value.forEach((st) => {
    const s = attendanceState[st.id]?.status || 'Present'
    if (s === 'Present') present++
    else if (s === 'Excused') excused++
    else if (s === 'Absent') absent++
  })

  return { total, present, excused, absent }
})

// Quick Action: Mark All Present (P)
const markAllPresent = () => {
  classStudents.value.forEach((st) => {
    if (attendanceState[st.id]) {
      attendanceState[st.id].status = 'Present'
    }
  })
  showToast(isEnglish.value ? 'Marked all students as Present (P)!' : 'បានកំណត់សិស្សទាំងអស់៖ វត្តមាន (P)!')
}

// Quick Action: Mark All Absent (A)
const markAllAbsent = () => {
  classStudents.value.forEach((st) => {
    if (attendanceState[st.id]) {
      attendanceState[st.id].status = 'Absent'
    }
  })
  showToast(isEnglish.value ? 'Marked all students as Absent (A)!' : 'បានកំណត់សិស្សទាំងអស់៖ អវត្តមាន (A)!')
}

// Quick Action: Mark All Permission (PM)
const markAllPermission = () => {
  classStudents.value.forEach((st) => {
    if (attendanceState[st.id]) {
      attendanceState[st.id].status = 'Excused'
    }
  })
  showToast(isEnglish.value ? 'Marked all students as Permission (PM)!' : 'បានកំណត់សិស្សទាំងអស់៖ ច្បាប់ (PM)!')
}

const setIndividualStatus = (studentId: string, status: AttendanceStatus) => {
  if (!attendanceState[studentId]) {
    attendanceState[studentId] = { status: 'Present', remarks: '' }
  }
  attendanceState[studentId].status = status
}

// Save Daily Attendance
const handleSave = () => {
  const records = classStudents.value.map((st) => ({
    studentId: st.id,
    status: attendanceState[st.id]?.status || ('Present' as AttendanceStatus),
    remarks: attendanceState[st.id]?.remarks || ''
  }))

  saveClassAttendance(selectedClassId.value, selectedDate.value, records)
  showToast(
    isEnglish.value
      ? `Attendance saved for ${currentClass.value?.name || selectedClassId.value} (${selectedDate.value})!`
      : `បានរក្សាទុកវត្តមានសម្រាប់ ${currentClass.value?.name || selectedClassId.value} (${selectedDate.value})!`
  )
}

// Filtered History Logs for Selected Class
const classHistoryLogs = computed(() => {
  return (attendanceLogs.value || []).filter(
    (log: any) => !log.classId || log.classId === selectedClassId.value
  )
})
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

    <!-- Header & Controls -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 flex-wrap">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {{ isEnglish ? 'Attendance Management' : 'ការគ្រប់គ្រងវត្តមានសិស្ស' }}
          </h1>
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono">
            {{ formatClassName(currentClass?.name, isEnglish) }}
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          {{ isEnglish ? 'Take daily attendance, monitor absent rates, and maintain student attendance records.' : 'កត់ត្រាវត្តមានប្រចាំថ្ងៃ តាមដានអត្រាអវត្តមាន និងគ្រប់គ្រងទិន្នន័យវត្តមានសិស្ស។' }}
        </p>
      </div>

      <!-- Segmented View Mode Tabs (Record vs History) -->
      <div class="inline-flex rounded-xl border border-slate-200/80 bg-slate-100/90 p-1 text-xs font-semibold self-start md:self-auto shadow-2xs">
        <button
          @click="activeTab = 'record'"
          type="button"
          :class="[
            'px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 cursor-pointer text-xs',
            activeTab === 'record'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <CalendarCheck class="w-3.5 h-3.5" />
          <span>{{ isEnglish ? 'Daily Roll Call' : 'កត់ត្រាវត្តមាន' }}</span>
        </button>

        <button
          @click="activeTab = 'history'"
          type="button"
          :class="[
            'px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 cursor-pointer text-xs',
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <Clock class="w-3.5 h-3.5" />
          <span>{{ isEnglish ? 'Attendance Logs' : 'ប្រវត្តិវត្តមាន' }}</span>
        </button>
      </div>
    </div>

    <!-- Attendance Action Strip: Class Selector, Date Picker, Quick Actions -->
    <div class="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Class Selector Dropdown -->
        <div v-if="allowClassSelection" class="relative">
          <School class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            v-model="selectedClassId"
            class="pl-8.5 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer appearance-none transition focus:ring-2 focus:ring-blue-500/20"
          >
            <option v-for="c in classes" :key="c.id" :value="c.id">
              {{ formatClassName(c.name, isEnglish) }} ({{ getStudentsForClass(c.id).length }} {{ isEnglish ? 'students' : 'សិស្ស' }})
            </option>
          </select>
        </div>

        <!-- Date Picker -->
        <div class="relative">
          <Calendar class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            v-model="selectedDate"
            type="date"
            class="pl-8.5 pr-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer transition font-mono focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <!-- Search input -->
        <div class="relative min-w-[180px] sm:min-w-[200px]">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="isEnglish ? 'Search student...' : 'ស្វែងរកសិស្ស...'"
            class="w-full pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <!-- Quick Action Buttons: Clean & Standard 2 Buttons -->
      <div class="flex items-center gap-2.5 shrink-0 self-start xl:self-center">
        <button
          @click="markAllPresent"
          type="button"
          class="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Check class="w-3.5 h-3.5" />
          <span>{{ isEnglish ? 'Mark All Present' : 'វត្តមានទាំងអស់' }}</span>
        </button>

        <button
          @click="handleSave"
          type="button"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Save class="w-3.5 h-3.5" />
          <span>{{ isEnglish ? 'Save Attendance' : 'រក្សាទុកវត្តមាន' }}</span>
        </button>
      </div>
    </div>

    <!-- 4 Attendance Counters (Total, P, A, PM) - Rate Removed -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
      <!-- 1. Enrolled -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="font-medium text-slate-500">{{ isEnglish ? 'Total Enrolled' : 'សិស្សសរុប' }}</span>
          <Users class="w-4 h-4 text-slate-400" />
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-slate-900 font-mono">{{ stats.total }}</div>
          <span class="text-[11px] text-slate-400">{{ isEnglish ? 'Enrolled students' : 'សិស្សក្នុងថ្នាក់' }}</span>
        </div>
      </div>

      <!-- 2. Present (P) -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="font-medium text-slate-500">{{ isEnglish ? 'Present (P)' : 'មានវត្តមាន (P)' }}</span>
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-emerald-600 font-mono">{{ stats.present }}</div>
          <span class="text-[11px] text-emerald-600 font-semibold">{{ isEnglish ? 'Present today' : 'សិស្សមានវត្តមាន' }}</span>
        </div>
      </div>

      <!-- 3. Absent (A) -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="font-medium text-slate-500">{{ isEnglish ? 'Absent (A)' : 'អវត្តមាន (A)' }}</span>
          <UserX class="w-4 h-4 text-rose-500" />
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-rose-600 font-mono">{{ stats.absent }}</div>
          <span class="text-[11px] text-rose-600 font-semibold">{{ isEnglish ? 'Unexcused absence' : 'អវត្តមានឥតច្បាប់' }}</span>
        </div>
      </div>

      <!-- 4. Permission (PM) -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="font-medium text-slate-500">{{ isEnglish ? 'Permission (PM)' : 'ច្បាប់ (PM)' }}</span>
          <AlertCircle class="w-4 h-4 text-amber-500" />
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-amber-500 font-mono">{{ stats.excused }}</div>
          <span class="text-[11px] text-amber-600 font-semibold">{{ isEnglish ? 'With permission' : 'អវត្តមានមានច្បាប់' }}</span>
        </div>
      </div>
    </div>

    <!-- TAB 1: Daily Roll Call Table -->
    <div v-if="activeTab === 'record'" class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div class="text-xs font-bold text-slate-800 flex items-center gap-2">
          <span>{{ isEnglish ? 'Daily Attendance Sheet' : 'បញ្ជីវត្តមានសិស្សប្រចាំថ្ងៃ' }}</span>
          <span class="text-slate-400 font-normal">({{ filteredStudents.length }} {{ isEnglish ? 'students' : 'សិស្ស' }})</span>
        </div>
        <div class="text-xs font-mono font-medium text-slate-500">
          {{ isEnglish ? 'Date:' : 'កាលបរិច្ឆេទ៖' }} <strong class="text-slate-800">{{ selectedDate }}</strong>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
              <th class="py-3 px-3 text-center w-12">#</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Student' : 'សិស្ស' }}</th>
              <th class="py-3 px-2 text-center w-16">{{ isEnglish ? 'Gender' : 'ភេទ' }}</th>
              <th class="py-3 px-4 text-center">{{ isEnglish ? 'Status (P • A • PM)' : 'ស្ថានភាព (P • A • PM)' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Remarks' : 'សម្គាល់' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <template v-for="(st, idx) in filteredStudents" :key="st.id">
              <!-- BLACKLIST (HARD LOCK) Banner Row -->
              <tr v-if="isStudentBlacklisted(st)" class="bg-red-100/90 border-t border-b border-red-200">
                <td colspan="5" class="py-1 px-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-[11px] font-black text-red-700 tracking-wider uppercase">
                      <span>⛔</span>
                      <span>BLACKLIST (HARD LOCK)</span>
                    </div>
                    <button
                      type="button"
                      @click="toggleBlacklist(st.id)"
                      class="text-[10px] text-red-600 hover:text-red-800 underline font-bold cursor-pointer"
                    >
                      {{ isEnglish ? 'Unlock' : 'ដោះសោ' }}
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Student Roll Call Row -->
              <tr
                :class="[
                  'transition',
                  isStudentBlacklisted(st) ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-slate-50/50'
                ]"
              >
                <!-- Index -->
                <td class="py-3 px-3 text-center font-mono text-slate-400">{{ idx + 1 }}</td>

                <!-- Student Name & ID -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                      {{ st.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{{ st.name }}</span>
                        <span
                          v-if="isStudentBlacklisted(st)"
                          class="px-1.5 py-0.2 text-[9px] font-black rounded bg-red-600 text-white uppercase"
                        >
                          Locked
                        </span>
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono">{{ st.id }}</div>
                    </div>
                  </div>
                </td>

                <!-- Gender -->
                <td class="py-3 px-2 text-center">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-semibold"
                    :class="st.gender === 'F' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'"
                  >
                    {{ st.gender === 'F' ? (isEnglish ? 'Female' : 'ស្រី') : (isEnglish ? 'Male' : 'ប្រុស') }}
                  </span>
                </td>

                <!-- Attendance Status Buttons: P, A, PM -->
                <td class="py-3 px-4 text-center">
                  <div class="inline-flex items-center justify-center gap-1.5 p-1 bg-slate-100/70 rounded-xl border border-slate-200/60">
                    <!-- P Button (Present) -->
                    <button
                      @click="setIndividualStatus(st.id, 'Present')"
                      type="button"
                      :class="[
                        'w-9 h-8 sm:w-10 sm:h-9 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center select-none shadow-xs',
                        attendanceState[st.id]?.status === 'Present'
                          ? 'bg-[#107c41] text-white ring-2 ring-[#107c41]/40 font-black scale-105'
                          : 'bg-[#5fa883] text-white/90 hover:bg-[#488e6b]'
                      ]"
                      :title="isEnglish ? 'Present (P)' : 'មានវត្តមាន (P)'"
                    >
                      P
                    </button>

                    <!-- A Button (Absent) -->
                    <button
                      @click="setIndividualStatus(st.id, 'Absent')"
                      type="button"
                      :class="[
                        'w-9 h-8 sm:w-10 sm:h-9 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center select-none shadow-xs',
                        attendanceState[st.id]?.status === 'Absent'
                          ? 'bg-[#d9383a] text-white ring-2 ring-[#d9383a]/40 font-black scale-105'
                          : 'bg-[#e28385] text-white/90 hover:bg-[#d4585a]'
                      ]"
                      :title="isEnglish ? 'Absent (A)' : 'អវត្តមាន (A)'"
                    >
                      A
                    </button>

                    <!-- PM Button (Permission) -->
                    <button
                      @click="setIndividualStatus(st.id, 'Excused')"
                      type="button"
                      :class="[
                        'w-11 h-8 sm:w-12 sm:h-9 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center select-none shadow-xs tracking-tight',
                        attendanceState[st.id]?.status === 'Excused'
                          ? 'bg-[#f59e0b] text-slate-950 ring-2 ring-[#f59e0b]/40 font-black scale-105'
                          : 'bg-[#fcd34d] text-amber-950 font-bold hover:bg-[#fbbf24]'
                      ]"
                      :title="isEnglish ? 'Permission (PM)' : 'ច្បាប់ (PM)'"
                    >
                      PM
                    </button>
                  </div>
                </td>

                <!-- Remarks Input & Blacklist Button -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <input
                      v-if="attendanceState[st.id]"
                      v-model="attendanceState[st.id].remarks"
                      type="text"
                      :placeholder="isEnglish ? 'Reason or note...' : 'មូលហេតុ ឬកំណត់សម្គាល់...'"
                      class="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      @click="toggleBlacklist(st.id)"
                      :class="[
                        'p-1 rounded-md transition cursor-pointer shrink-0 text-xs',
                        isStudentBlacklisted(st) ? 'text-red-600 bg-red-100 hover:bg-red-200' : 'text-slate-300 hover:text-red-500 hover:bg-slate-100'
                      ]"
                      :title="isStudentBlacklisted(st) ? (isEnglish ? 'Unlock student' : 'ដោះសោសិស្ស') : (isEnglish ? 'Flag as BLACKLIST (HARD LOCK)' : 'ដាក់កម្រិត BLACKLIST (HARD LOCK)')"
                    >
                      ⛔
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Table Footer with Save Button -->
      <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span class="text-xs text-slate-500">
          {{ isEnglish ? `Showing ${filteredStudents.length} students` : `បង្ហាញសិស្សចំនួន ${filteredStudents.length} នាក់` }}
        </span>
        <button
          @click="handleSave"
          type="button"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Save class="w-3.5 h-3.5" />
          <span>{{ isEnglish ? 'Save Attendance' : 'រក្សាទុកវត្តមាន' }}</span>
        </button>
      </div>
    </div>

    <!-- TAB 2: History Logs Table -->
    <div v-else class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h2 class="text-xs font-bold text-slate-800">
          {{ isEnglish ? 'Recent Attendance Logs' : 'កំណត់ត្រាវត្តមានកន្លងមក' }}
        </h2>
        <span class="text-xs font-mono text-slate-400">{{ classHistoryLogs.length }} {{ isEnglish ? 'records' : 'កំណត់ត្រា' }}</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
              <th class="py-3 px-3 font-mono">{{ isEnglish ? 'Date' : 'កាលបរិច្ឆេទ' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Class' : 'ថ្នាក់រៀន' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Student' : 'សិស្ស' }}</th>
              <th class="py-3 px-3 text-center">{{ isEnglish ? 'Status' : 'ស្ថានភាព' }}</th>
              <th class="py-3 px-4">{{ isEnglish ? 'Remarks' : 'សម្គាល់' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr
              v-for="log in classHistoryLogs"
              :key="log.id"
              class="hover:bg-slate-50/50 transition"
            >
              <td class="py-3 px-3 font-mono text-slate-600">{{ log.date }}</td>
              <td class="py-3 px-4 font-semibold text-slate-800">{{ formatClassName(log.className || currentClass?.name, isEnglish) }}</td>
              <td class="py-3 px-4 text-slate-800">{{ log.studentName || log.studentId || (isEnglish ? 'Class Roll' : 'បញ្ជីរួម') }}</td>
              <td class="py-3 px-3 text-center">
                <span
                  class="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border"
                  :class="
                    log.status === 'Present'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : (log.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200')
                  "
                >
                  {{ formatAttendanceStatus(log.status, isEnglish) }}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-500 italic">{{ log.remarks || (isEnglish ? 'Normal attendance' : 'វត្តមានធម្មតា') }}</td>
            </tr>
            <tr v-if="classHistoryLogs.length === 0">
              <td colspan="5" class="py-12 text-center text-slate-400">
                No attendance logs found for this class. Take roll call in the first tab.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

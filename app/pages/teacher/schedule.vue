<!-- pages/teacher/schedule.vue -->
<script setup lang="ts">
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Printer,
  Sparkles,
  School,
  Coffee,
  LayoutGrid,
  Table,
  CheckCircle2,
  GraduationCap
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user } = useAuth()
const { isEnglish } = useI18n()
const { teachers } = useScore()
const {
  weekDays,
  timeSlots,
  getTeacherSchedule,
  getTeacherScheduleStats,
  teachersList
} = useSchedule()

// Default to the logged-in teacher ID (e.g. TEA-001)
const selectedTeacherId = ref<string>(user.value?.id && user.value.id.startsWith('TEA') ? user.value.id : 'TEA-001')

// Day filter: 'all' | 'Monday' | 'Tuesday' | ...
const selectedDayFilter = ref<string>('all')

// View Mode: 'grid' (Cards) | 'table' (Matrix)
const viewMode = ref<'grid' | 'table'>('grid')

// Current Teacher Profile
const currentTeacher = computed(() => {
  return teachers.value.find((t) => t.id === selectedTeacherId.value) || teachers.value[0]
})

// Full Schedule for selected teacher (Mon-Sat)
const fullSchedule = computed(() => {
  if (!currentTeacher.value) return []
  return getTeacherSchedule(currentTeacher.value.id)
})

// Filtered Schedule based on day selection
const displayedSchedule = computed(() => {
  if (selectedDayFilter.value === 'all') {
    return fullSchedule.value
  }
  return fullSchedule.value.filter((d) => d.day === selectedDayFilter.value)
})

// Workload Stats
const stats = computed(() => {
  if (!currentTeacher.value) return { totalSlots: 24, teachingSlots: 0, freeSlots: 24, classesCount: 0 }
  return getTeacherScheduleStats(currentTeacher.value.id)
})

// Today's Day Name in English
const todayDayName = computed(() => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date().getDay()]
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
            <CalendarDays class="w-5 h-5" />
          </div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {{ isEnglish ? 'My Teaching Schedule' : 'កាលវិភាគបង្រៀនរបស់ខ្ញុំ' }}
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          {{ isEnglish
            ? 'Weekly teaching timetable from Monday to Saturday, classroom locations, and allocated free periods.'
            : 'កាលវិភាគបង្រៀនប្រចាំសប្តាហ៍ពីថ្ងៃចន្ទ ដល់ សៅរ៍ ទីតាំងបន្ទប់រៀន និងម៉ោងទំនេរ។'
          }}
        </p>
      </div>

      <!-- Actions: Teacher Switcher (for reference) & Print -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Faculty Switcher (Optional) -->
        <div class="relative">
          <select
            v-model="selectedTeacherId"
            class="pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer appearance-none transition focus:ring-2 focus:ring-indigo-500/20"
          >
            <option v-for="t in teachers" :key="t.id" :value="t.id">
              {{ formatTeacherName(t.name, isEnglish) }} ({{ isEnglish ? t.specialtyEn : t.specialty }})
            </option>
          </select>
        </div>

        <!-- View Mode Switcher -->
        <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs">
          <button
            @click="viewMode = 'grid'"
            type="button"
            :class="[
              'p-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer',
              viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            ]"
            :title="isEnglish ? 'Grid Cards' : 'ទម្រង់កាត'"
          >
            <LayoutGrid class="w-3.5 h-3.5" />
          </button>
          <button
            @click="viewMode = 'table'"
            type="button"
            :class="[
              'p-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer',
              viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            ]"
            :title="isEnglish ? 'Matrix Table' : 'ទម្រង់តារាង'"
          >
            <Table class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Print Button -->
        <button
          @click="handlePrint"
          type="button"
          class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Printer class="w-3.5 h-3.5" />
          <span>{{ isEnglish ? 'Print' : 'បោះពុម្ព' }}</span>
        </button>
      </div>
    </div>

    <!-- Teacher Profile & Workload Strip -->
    <div
      v-if="currentTeacher"
      class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
    >
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-600/20 shrink-0">
          {{ currentTeacher.name.charAt(0) }}
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-lg font-bold text-slate-900">
              {{ formatTeacherName(currentTeacher.name, isEnglish) }}
            </h2>
            <span class="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              {{ isEnglish ? currentTeacher.specialtyEn : currentTeacher.specialty }}
            </span>
            <span class="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              {{ currentTeacher.status }}
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
            <span>{{ isEnglish ? 'Homeroom:' : 'បន្ទុកថ្នាក់៖' }} <strong class="text-slate-800">{{ formatClassName(currentTeacher.homeroomClassName, isEnglish) }}</strong></span>
            <span>•</span>
            <span>{{ isEnglish ? 'Room:' : 'បន្ទប់៖' }} <strong class="text-slate-800">{{ formatRoom(currentTeacher.room || 'បន្ទប់ 301', isEnglish) }}</strong></span>
            <span>•</span>
            <span>{{ isEnglish ? 'Education:' : 'កម្រិតវប្បធម៌៖' }} <strong class="text-slate-800">{{ isEnglish ? currentTeacher.educationEn : currentTeacher.education }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Workload Metrics -->
      <div class="grid grid-cols-3 gap-3 shrink-0">
        <div class="px-4 py-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center">
          <div class="text-xl font-bold font-mono text-indigo-700">{{ stats.teachingSlots }}</div>
          <div class="text-[10px] font-bold text-indigo-600 uppercase">{{ isEnglish ? 'Teaching Hours' : 'ម៉ោងបង្រៀន' }}</div>
        </div>
        <div class="px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-center">
          <div class="text-xl font-bold font-mono text-amber-700">{{ stats.freeSlots }}</div>
          <div class="text-[10px] font-bold text-amber-600 uppercase">{{ isEnglish ? 'Free Hours' : 'ម៉ោងទំនេរ' }}</div>
        </div>
        <div class="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div class="text-xl font-bold font-mono text-slate-800">{{ stats.classesCount }}</div>
          <div class="text-[10px] font-bold text-slate-600 uppercase">{{ isEnglish ? 'Classes Taught' : 'ថ្នាក់ទទួលខុសត្រូវ' }}</div>
        </div>
      </div>
    </div>

    <!-- Day Filter Pills (Monday - Saturday) -->
    <div class="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto text-xs font-semibold no-print">
      <button
        type="button"
        @click="selectedDayFilter = 'all'"
        :class="[
          'px-4 py-2 rounded-xl transition cursor-pointer shrink-0',
          selectedDayFilter === 'all'
            ? 'bg-indigo-600 text-white font-bold shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        ]"
      >
        {{ isEnglish ? 'All Days (Mon - Sat)' : 'រាល់ថ្ងៃ (ចន្ទ - សៅរ៍)' }}
      </button>

      <button
        v-for="d in weekDays"
        :key="d.key"
        type="button"
        @click="selectedDayFilter = d.key"
        :class="[
          'px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0',
          selectedDayFilter === d.key
            ? 'bg-indigo-600 text-white font-bold shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        ]"
      >
        <span>{{ isEnglish ? d.shortEn : d.shortKm }}</span>
        <span
          v-if="todayDayName === d.key"
          :class="[
            'px-1.5 py-0.2 rounded text-[9px] font-bold uppercase',
            selectedDayFilter === d.key ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
          ]"
        >
          {{ isEnglish ? 'Today' : 'ថ្ងៃនេះ' }}
        </span>
      </button>
    </div>

    <!-- 1. GRID VIEW (Card by Day) -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="d in displayedSchedule"
        :key="d.day"
        class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
      >
        <div>
          <!-- Day Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h3 class="font-bold text-sm text-slate-900">
                {{ isEnglish ? d.labelEn : d.labelKm }}
              </h3>
              <span
                v-if="todayDayName === d.day"
                class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold"
              >
                {{ isEnglish ? 'Today' : 'ថ្ងៃនេះ' }}
              </span>
            </div>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {{ d.slots.filter((s: any) => !s.isFree).length }} / 4 {{ isEnglish ? 'Teaching Slots' : 'ម៉ោងបង្រៀន' }}
            </span>
          </div>

          <!-- Slots for the Day -->
          <div class="space-y-2.5">
            <div
              v-for="slot in d.slots"
              :key="slot.slotNumber"
              :class="[
                'p-3.5 rounded-xl border transition flex flex-col justify-between gap-1.5',
                slot.isFree
                  ? 'bg-slate-50/70 border-dashed border-slate-200 text-slate-400'
                  : 'bg-white border-indigo-100 shadow-2xs hover:border-indigo-300'
              ]"
            >
              <!-- Time & Period Header -->
              <div class="flex items-center justify-between text-xs">
                <span class="font-mono font-semibold text-slate-500 flex items-center gap-1">
                  <Clock class="w-3 h-3 text-slate-400" />
                  {{ slot.time }}
                </span>
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded',
                    slot.isFree
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-indigo-50 text-indigo-700 font-semibold'
                  ]"
                >
                  {{ isEnglish ? slot.periodNameEn : slot.periodNameKm }}
                </span>
              </div>

              <!-- Teaching Session Details -->
              <div v-if="!slot.isFree" class="mt-1 space-y-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-sm text-slate-900">
                    {{ isEnglish ? slot.subjectEn : slot.subjectKm }}
                  </h4>
                  <span class="px-2 py-0.5 text-[11px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    {{ formatClassName(slot.className, isEnglish) }}
                  </span>
                </div>
                <div class="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin class="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{{ formatRoom(slot.room || 'បន្ទប់ 301', isEnglish) }}</span>
                </div>
              </div>

              <!-- Free Period Callout -->
              <div v-else class="mt-1 py-1 flex items-center justify-between text-xs">
                <span class="italic font-medium text-slate-400 flex items-center gap-1.5">
                  <Coffee class="w-3.5 h-3.5 text-amber-500" />
                  {{ isEnglish ? 'Free Period / Research' : 'ម៉ោងទំនេរ / ស្រាវជ្រាវ' }}
                </span>
                <span class="text-[10px] text-slate-400 font-mono">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. TABLE MATRIX VIEW -->
    <div v-else class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th class="py-3 px-4 w-36">{{ isEnglish ? 'Day / Slot' : 'ថ្ងៃ / ម៉ោង' }}</th>
              <th v-for="slot in timeSlots" :key="slot.slotNumber" class="py-3 px-4 text-center">
                <div>{{ isEnglish ? slot.periodEn : slot.periodNameKm }}</div>
                <div class="text-[10px] font-mono text-slate-400 font-normal">{{ slot.time }}</div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="d in displayedSchedule"
              :key="d.day"
              :class="todayDayName === d.day ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'"
            >
              <!-- Day Column -->
              <td class="py-3.5 px-4 font-bold text-slate-900 border-r border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="todayDayName === d.day ? 'bg-indigo-600' : 'bg-slate-300'"></span>
                  <span>{{ isEnglish ? d.labelEn : d.labelKm }}</span>
                </div>
              </td>

              <!-- 4 Time Slot Cells -->
              <td
                v-for="slot in d.slots"
                :key="slot.slotNumber"
                class="py-3 px-3 text-center border-r border-slate-100 last:border-r-0"
              >
                <div
                  v-if="!slot.isFree"
                  class="p-2 rounded-xl bg-indigo-50/80 border border-indigo-100 text-left space-y-1 shadow-2xs"
                >
                  <div class="font-bold text-indigo-900 text-xs truncate">
                    {{ isEnglish ? slot.subjectEn : slot.subjectKm }}
                  </div>
                  <div class="flex items-center justify-between text-[10px] text-slate-600">
                    <span class="font-bold text-blue-700 font-mono">{{ formatClassName(slot.className, isEnglish) }}</span>
                    <span>{{ formatRoom(slot.room || 'បន្ទប់ 301', isEnglish) }}</span>
                  </div>
                </div>

                <div v-else class="p-2 rounded-xl bg-slate-50/50 border border-dashed border-slate-200 text-slate-400 italic text-[11px]">
                  {{ isEnglish ? 'Free' : 'ទំនេរ' }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

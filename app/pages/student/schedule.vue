<!-- pages/student/schedule.vue -->
<script setup lang="ts">
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  Printer,
  Sparkles,
  School,
  Coffee,
  LayoutGrid,
  Table,
  CheckCircle2
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user } = useAuth()
const { isEnglish } = useI18n()
const { classes } = useScore()
const {
  weekDays,
  timeSlots,
  getClassSchedule,
  getClassScheduleStats
} = useSchedule()

// Default to student's class, or CLS-12A
const selectedClassId = ref<string>(
  user.value?.classId || 'CLS-12A'
)

// Day filter: 'all' | 'Monday' | 'Tuesday' | ...
const selectedDayFilter = ref<string>('all')

// View Mode: 'grid' (Cards) | 'table' (Matrix)
const viewMode = ref<'grid' | 'table'>('grid')

// Current Class Object
const currentClass = computed(() => {
  return classes.value.find((c) => c.id === selectedClassId.value) || classes.value[0]
})

// Full Schedule for selected class
const fullSchedule = computed(() => {
  if (!currentClass.value) return []
  return getClassSchedule(currentClass.value.id)
})

// Filtered Schedule based on selected day
const displayedSchedule = computed(() => {
  if (selectedDayFilter.value === 'all') {
    return fullSchedule.value
  }
  return fullSchedule.value.filter((d) => d.day === selectedDayFilter.value)
})

// Class Stats
const stats = computed(() => {
  if (!currentClass.value) return { totalSlots: 24, studySlots: 0, freeSlots: 24, daysCount: 6 }
  return getClassScheduleStats(currentClass.value.id)
})

// Today's Day Name in English
const todayDayName = computed(() => {
  const dayIndex = new Date().getDay()
  const map: Record<number, string> = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    0: 'Sunday'
  }
  return map[dayIndex] || 'Monday'
})

// Subject badge color helper
const getSubjectColor = (key?: string) => {
  switch (key) {
    case 'math':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'physics':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'chemistry':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'biology':
      return 'bg-teal-50 text-teal-700 border-teal-200'
    case 'khmer':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'english':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

const printSchedule = () => {
  window.print()
}
</script>

<template>
  <div class="w-full space-y-6">
    <!-- ========================================================= -->
    <!-- 1. HEADER & ACTIONS                                       -->
    <!-- ========================================================= -->
    <div class="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/student"
          class="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition shadow-2xs"
        >
          <ArrowLeft class="w-4 h-4" />
        </NuxtLink>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {{ isEnglish ? 'Weekly Class Schedule' : 'កាលវិភាគសិក្សាប្រចាំសប្តាហ៍' }}
            </h1>
            <span class="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              {{ formatClassName(currentClass?.name, isEnglish) }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            {{ formatTeacherName(currentClass?.teacherName, isEnglish) }} • {{ formatRoom(currentClass?.room, isEnglish) }} • {{ currentClass?.academicYear || '2025-2026' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-center">
        <!-- View Toggle (Grid / Table) -->
        <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <button
            type="button"
            @click="viewMode = 'grid'"
            :class="[
              'px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold cursor-pointer',
              viewMode === 'grid' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
            ]"
          >
            <LayoutGrid class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ isEnglish ? 'Cards' : 'កាត' }}</span>
          </button>
          <button
            type="button"
            @click="viewMode = 'table'"
            :class="[
              'px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold cursor-pointer',
              viewMode === 'table' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
            ]"
          >
            <Table class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ isEnglish ? 'Matrix' : 'តារាង' }}</span>
          </button>
        </div>

        <!-- Print Button -->
        <button
          @click="printSchedule"
          type="button"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Printer class="w-4 h-4" />
          <span>{{ isEnglish ? 'Print Timetable' : 'បោះពុម្ពកាលវិភាគ' }}</span>
        </button>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 2. CLASS SELECTOR (កាត់ដែលអាច Select បានទៅតាមថ្នាក់)        -->
    <!-- ========================================================= -->
    <div class="no-print bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
      <div class="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
        <span class="flex items-center gap-1.5">
          <School class="w-4 h-4 text-blue-500" />
          {{ isEnglish ? 'Select Class to View Timetable:' : 'ជ្រើសរើសថ្នាក់ដើម្បីមើលកាលវិភាគសិក្សា៖' }}
        </span>
        <span class="font-mono text-slate-400">({{ classes.length }} {{ isEnglish ? 'Classes' : 'ថ្នាក់រៀន' }})</span>
      </div>

      <!-- Quick Class Buttons (10A - 12B) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          v-for="c in classes"
          :key="c.id"
          type="button"
          @click="selectedClassId = c.id"
          :class="[
            'p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1',
            selectedClassId === c.id
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-600/30 font-bold'
              : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200 font-semibold'
          ]"
        >
          <span class="text-xs">{{ formatClassName(c.name, isEnglish) }}</span>
          <span
            :class="[
              'text-[10px] font-mono',
              selectedClassId === c.id ? 'text-blue-100' : 'text-slate-400'
            ]"
          >
            {{ formatRoom(c.room || 'បន្ទប់ 301', isEnglish) }}
          </span>
        </button>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 3. CLASS SUMMARY & WORKLOAD METRICS                       -->
    <!-- ========================================================= -->
    <div
      v-if="currentClass"
      class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
    >
      <div class="flex items-center gap-4">
        <div class="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-600/20 shrink-0">
          <CalendarDays class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-base sm:text-lg font-bold text-slate-900">
              {{ isEnglish ? 'Timetable for ' : 'កាលវិភាគ ' }} {{ formatClassName(currentClass.name, isEnglish) }}
            </h2>
            <span class="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              {{ isEnglish ? 'Live Academic Term' : 'ឆមាសបច្ចុប្បន្ន' }}
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
            <span>{{ isEnglish ? 'Homeroom Teacher:' : 'គ្រូបន្ទុកថ្នាក់៖' }} <strong class="text-slate-800">{{ formatTeacherName(currentClass.teacherName, isEnglish) }}</strong></span>
            <span>•</span>
            <span>{{ isEnglish ? 'Classroom:' : 'បន្ទប់រៀន៖' }} <strong class="text-slate-800">{{ formatRoom(currentClass.room || 'បន្ទប់ 301', isEnglish) }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Metrics -->
      <div class="grid grid-cols-3 gap-3 shrink-0">
        <div class="px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
          <div class="text-xl font-bold font-mono text-blue-700">{{ stats.studySlots }}</div>
          <div class="text-[10px] font-bold text-blue-600 uppercase">{{ isEnglish ? 'Class Sessions' : 'ម៉ោងសិក្សា' }}</div>
        </div>
        <div class="px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-center">
          <div class="text-xl font-bold font-mono text-amber-700">{{ stats.freeSlots }}</div>
          <div class="text-[10px] font-bold text-amber-600 uppercase">{{ isEnglish ? 'Free / Study' : 'ម៉ោងទំនេរ' }}</div>
        </div>
        <div class="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div class="text-xl font-bold font-mono text-slate-800">6</div>
          <div class="text-[10px] font-bold text-slate-600 uppercase">{{ isEnglish ? 'Days (Mon-Sat)' : 'ថ្ងៃក្នុង១សប្តាហ៍' }}</div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 4. DAY FILTER BAR (Mon - Sat Filter)                      -->
    <!-- ========================================================= -->
    <div class="no-print flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
      <button
        type="button"
        @click="selectedDayFilter = 'all'"
        :class="[
          'px-3.5 py-1.5 rounded-xl transition shrink-0 cursor-pointer border',
          selectedDayFilter === 'all'
            ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
        ]"
      >
        {{ isEnglish ? 'All Days (Mon - Sat)' : 'គ្រប់ថ្ងៃទាំងអស់ (ចន្ទ - សៅរ៍)' }}
      </button>

      <button
        v-for="d in weekDays"
        :key="d.key"
        type="button"
        @click="selectedDayFilter = d.key"
        :class="[
          'px-3.5 py-1.5 rounded-xl transition shrink-0 cursor-pointer border flex items-center gap-1.5',
          selectedDayFilter === d.key
            ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200',
          d.key === todayDayName && selectedDayFilter !== d.key ? 'border-amber-400 bg-amber-50/50' : ''
        ]"
      >
        <span>{{ isEnglish ? d.shortEn : d.shortKm }}</span>
        <span
          v-if="d.key === todayDayName"
          class="w-1.5 h-1.5 rounded-full bg-emerald-500"
          title="Today"
        ></span>
      </button>
    </div>

    <!-- ========================================================= -->
    <!-- 5. VIEW MODE: GRID (Cards View)                           -->
    <!-- ========================================================= -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="d in displayedSchedule"
        :key="d.day"
        :class="[
          'bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition',
          d.day === todayDayName
            ? 'border-blue-400 ring-2 ring-blue-500/10'
            : 'border-slate-200/80'
        ]"
      >
        <div>
          <!-- Day Header with Today Badge -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'w-2.5 h-2.5 rounded-full',
                  d.day === todayDayName ? 'bg-emerald-500' : 'bg-blue-600'
                ]"
              ></span>
              <h3 class="font-bold text-sm text-slate-900">
                {{ isEnglish ? d.labelEn : d.labelKm }}
              </h3>
              <span
                v-if="d.day === todayDayName"
                class="px-2 py-0.2 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                {{ isEnglish ? 'TODAY' : 'ថ្ងៃនេះ' }}
              </span>
            </div>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              {{ d.slots.filter(s => !s.isFree).length }} {{ isEnglish ? 'Classes' : 'មុខវិជ្ជា' }}
            </span>
          </div>

          <!-- 4 Slots for this Day -->
          <div class="space-y-3">
            <div
              v-for="slot in d.slots"
              :key="slot.slotNumber"
              :class="[
                'p-3.5 rounded-xl border transition flex flex-col justify-between gap-2',
                slot.isFree
                  ? 'bg-amber-50/40 border-dashed border-amber-200/80 text-amber-800'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:shadow-xs'
              ]"
            >
              <!-- Slot Meta: Time & Period -->
              <div class="flex items-center justify-between text-xs">
                <span class="font-mono font-semibold text-slate-500 flex items-center gap-1.5">
                  <Clock class="w-3.5 h-3.5 text-slate-400" />
                  {{ slot.time }}
                </span>
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded',
                    slot.isFree ? 'bg-amber-100/80 text-amber-800' : 'bg-slate-200/70 text-slate-700'
                  ]"
                >
                  {{ isEnglish ? 'Period ' + slot.slotNumber : 'ម៉ោងទី ' + slot.slotNumber }}
                </span>
              </div>

              <!-- Regular Subject Class -->
              <div v-if="!slot.isFree" class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-slate-900">
                    {{ isEnglish ? slot.subjectEn : slot.subjectKm }}
                  </span>
                  <span :class="['px-2 py-0.5 text-[10px] font-bold rounded-md border', getSubjectColor(slot.subjectKey)]">
                    {{ slot.subjectKey?.toUpperCase() }}
                  </span>
                </div>
                <div class="flex items-center gap-3 text-[11px] text-slate-500">
                  <span class="flex items-center gap-1">
                    <User class="w-3 h-3 text-slate-400" />
                    {{ formatTeacherName(slot.teacherName, isEnglish) }}
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1">
                    <MapPin class="w-3 h-3 text-slate-400" />
                    {{ formatRoom(slot.room, isEnglish) }}
                  </span>
                </div>
              </div>

              <!-- Free Period / Self-Study Slot (ម៉ោងទំនេរ) -->
              <div v-else class="py-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                    <Sparkles class="w-3.5 h-3.5 text-amber-600" />
                    {{ isEnglish ? 'Free Period / Self-Study' : 'ម៉ោងទំនេរ / ស្វ័យសិក្សា' }}
                  </span>
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-200/60 text-amber-900">
                    {{ isEnglish ? 'FREE' : 'ទំនេរ' }}
                  </span>
                </div>
                <p class="text-[10px] text-amber-700/80 mt-1">
                  {{ isEnglish ? 'Individual study, homework, or library research time.' : 'ម៉ោងស្វ័យសិក្សា ធ្វើលំហាត់ ឬស្រាវជ្រាវក្នុងបណ្ណាល័យ។' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 6. VIEW MODE: TABLE (Spreadsheet Matrix)                   -->
    <!-- ========================================================= -->
    <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <th class="p-3.5 border-r border-slate-200 text-center w-28">
                {{ isEnglish ? 'Time Slot' : 'ម៉ោងសិក្សា' }}
              </th>
              <th
                v-for="d in weekDays"
                :key="d.key"
                :class="[
                  'p-3.5 border-r border-slate-200 text-center min-w-[150px]',
                  d.key === todayDayName ? 'bg-blue-50/70 text-blue-700' : ''
                ]"
              >
                <div class="flex items-center justify-center gap-1.5">
                  <span>{{ isEnglish ? d.labelEn : d.labelKm }}</span>
                  <span v-if="d.key === todayDayName" class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="slot in timeSlots" :key="slot.slotNumber" class="hover:bg-slate-50/50 transition">
              <td class="p-3.5 border-r border-slate-200 text-center bg-slate-50/50 font-mono">
                <div class="font-bold text-slate-800 text-xs">{{ isEnglish ? slot.periodEn : slot.periodNameKm }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">{{ slot.time }}</div>
              </td>
              <td
                v-for="d in weekDays"
                :key="d.key"
                :class="[
                  'p-3 border-r border-slate-200 align-top',
                  d.key === todayDayName ? 'bg-blue-50/20' : ''
                ]"
              >
                <template v-for="entry in fullSchedule.find(x => x.day === d.key)?.slots.filter(s => s.slotNumber === slot.slotNumber)" :key="entry.id">
                  <div
                    v-if="!entry.isFree"
                    class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                  >
                    <div class="font-bold text-slate-900">
                      {{ isEnglish ? entry.subjectEn : entry.subjectKm }}
                    </div>
                    <div class="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>{{ formatTeacherName(entry.teacherName, isEnglish) }}</span>
                      <span class="font-mono text-slate-400">{{ formatRoom(entry.room, isEnglish) }}</span>
                    </div>
                  </div>
                  <div
                    v-else
                    class="p-2.5 rounded-xl bg-amber-50/50 border border-dashed border-amber-200 text-amber-800 text-center space-y-0.5"
                  >
                    <div class="font-bold text-[11px] text-amber-900">
                      {{ isEnglish ? 'Free Period' : 'ម៉ោងទំនេរ' }}
                    </div>
                    <div class="text-[10px] text-amber-600">
                      {{ isEnglish ? 'Self-Study' : 'ស្វ័យសិក្សា' }}
                    </div>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

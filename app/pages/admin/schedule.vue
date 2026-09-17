<!-- pages/admin/schedule.vue -->
<script setup lang="ts">
import {
  CalendarDays,
  GraduationCap,
  School,
  Clock,
  MapPin,
  User,
  Printer,
  Sparkles,
  Coffee,
  BookOpen,
  CheckCircle2,
  Table,
  LayoutGrid,
  Search,
  ChevronRight,
  ChevronDown
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { isEnglish } = useI18n()
const { classes, teachers } = useScore()
const {
  weekDays,
  timeSlots,
  getClassSchedule,
  getTeacherSchedule,
  getClassScheduleStats,
  getTeacherScheduleStats
} = useSchedule()

// Active Mode Tab: 'teacher' | 'class'
const activeTab = ref<'teacher' | 'class'>('teacher')

// Selected Teacher & Class
const selectedTeacherId = ref<string>('TEA-001')
const selectedClassId = ref<string>('CLS-12A')

// Display View for Class Schedule: 'grid' (Cards) | 'table' (Matrix)
const classViewMode = ref<'grid' | 'table'>('grid')

// Current Teacher
const currentTeacher = computed(() => {
  return teachers.value.find((t) => t.id === selectedTeacherId.value) || teachers.value[0]
})

// Current Class
const currentClass = computed(() => {
  return classes.value.find((c) => c.id === selectedClassId.value) || classes.value[0]
})

// Teacher Schedule Data & Stats
const teacherScheduleData = computed(() => {
  if (!currentTeacher.value) return []
  return getTeacherSchedule(currentTeacher.value.id)
})
const teacherStats = computed(() => {
  if (!currentTeacher.value) return { totalSlots: 24, teachingSlots: 0, freeSlots: 24, classesCount: 0 }
  return getTeacherScheduleStats(currentTeacher.value.id)
})

// Class Schedule Data & Stats
const classScheduleData = computed(() => {
  if (!currentClass.value) return []
  return getClassSchedule(currentClass.value.id)
})
const classStats = computed(() => {
  if (!currentClass.value) return { totalSlots: 24, studySlots: 0, freeSlots: 24, daysCount: 6 }
  return getClassScheduleStats(currentClass.value.id)
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
    <!-- 1. TOP HEADER & PRINT ACTION                              -->
    <!-- ========================================================= -->
    <div class="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 flex-wrap">
          <div class="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-xs">
            <CalendarDays class="w-5 h-5" />
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {{ isEnglish ? 'Academic Schedule Management' : 'ការគ្រប់គ្រងកាលវិភាគសិក្សា' }}
          </h1>
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono">
            {{ isEnglish ? 'Mon - Sat (2025-2026)' : 'ចន្ទ - សៅរ៍ (២០២៥-២០២៦)' }}
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          {{ isEnglish
            ? 'View and manage weekly timetable for both faculty members and student classes with free-period tracking.'
            : 'ពិនិត្យ និងតាមដានកាលវិភាគបង្រៀនរបស់គ្រូ និងកាលវិភាគតាមថ្នាក់រៀនរបស់សិស្ស ព្រមទាំងម៉ោងទំនេរ។'
          }}
        </p>
      </div>

      <button
        @click="printSchedule"
        type="button"
        class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs self-start sm:self-center cursor-pointer"
      >
        <Printer class="w-4 h-4 text-slate-500" />
        <span>{{ isEnglish ? 'Print Timetable' : 'បោះពុម្ពកាលវិភាគ' }}</span>
      </button>
    </div>

    <!-- ========================================================= -->
    <!-- 2. TWO MAIN TABS (Teacher Schedule vs. Student Schedule)  -->
    <!-- ========================================================= -->
    <div class="no-print flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
      <div class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold shadow-2xs">
        <!-- Tab 1: Teacher Schedule -->
        <button
          type="button"
          @click="activeTab = 'teacher'"
          :class="[
            'px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer',
            activeTab === 'teacher'
              ? 'bg-white text-indigo-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <GraduationCap class="w-4 h-4" />
          <span>{{ isEnglish ? 'Teacher Schedule (Faculty)' : 'កាលវិភាគសម្រាប់គ្រូបង្រៀន' }}</span>
        </button>

        <!-- Tab 2: Student Schedule -->
        <button
          type="button"
          @click="activeTab = 'class'"
          :class="[
            'px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer',
            activeTab === 'class'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <School class="w-4 h-4" />
          <span>{{ isEnglish ? 'Student Schedule (By Class)' : 'កាលវិភាគសម្រាប់សិស្សតាមថ្នាក់' }}</span>
        </button>
      </div>

      <!-- Optional Grid / Table Switcher (When in Class tab) -->
      <div v-if="activeTab === 'class'" class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
        <button
          type="button"
          @click="classViewMode = 'grid'"
          :class="[
            'px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold cursor-pointer',
            classViewMode === 'grid' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
          ]"
        >
          <LayoutGrid class="w-3.5 h-3.5" />
          <span>{{ isEnglish ? 'Cards View' : 'ទម្រង់កាត' }}</span>
        </button>
        <button
          type="button"
          @click="classViewMode = 'table'"
          :class="[
            'px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold cursor-pointer',
            classViewMode === 'table' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
          ]"
        >
          <Table class="w-3.5 h-3.5" />
          <span>{{ isEnglish ? 'Table Matrix' : 'ទម្រង់តារាង' }}</span>
        </button>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- TAB 1: TEACHER SCHEDULE VIEW                              -->
    <!-- ========================================================= -->
    <div v-if="activeTab === 'teacher'" class="space-y-6">
      <!-- Teacher Quick Selector Pills -->
      <div class="no-print bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div class="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
          <span class="flex items-center gap-1.5">
            <GraduationCap class="w-4 h-4 text-indigo-500" />
            {{ isEnglish ? 'Select Teacher to View Mon - Sat Schedule:' : 'ជ្រើសរើសគ្រូបង្រៀនដើម្បីមើលកាលវិភាគចន្ទ-សៅរ៍៖' }}
          </span>
          <span class="font-mono text-slate-400">({{ teachers.length }} {{ isEnglish ? 'Teachers' : 'គ្រូ' }})</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            v-for="t in teachers"
            :key="t.id"
            type="button"
            @click="selectedTeacherId = t.id"
            :class="[
              'p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer',
              selectedTeacherId === t.id
                ? 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-700'
            ]"
          >
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                  selectedTeacherId === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                ]"
              >
                {{ t.name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <div class="font-bold text-xs text-slate-900 truncate">
                  {{ formatTeacherName(t.name, isEnglish) }}
                </div>
                <div class="text-[10px] text-indigo-600 font-medium truncate">
                  {{ isEnglish ? t.specialtyEn : t.specialty }}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Teacher KPI & Profile Summary Strip -->
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
            <div class="text-xl font-bold font-mono text-indigo-700">{{ teacherStats.teachingSlots }}</div>
            <div class="text-[10px] font-bold text-indigo-600 uppercase">{{ isEnglish ? 'Teaching Hours' : 'ម៉ោងបង្រៀន' }}</div>
          </div>
          <div class="px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-center">
            <div class="text-xl font-bold font-mono text-amber-700">{{ teacherStats.freeSlots }}</div>
            <div class="text-[10px] font-bold text-amber-600 uppercase">{{ isEnglish ? 'Free Hours' : 'ម៉ោងទំនេរ' }}</div>
          </div>
          <div class="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div class="text-xl font-bold font-mono text-slate-800">{{ teacherStats.classesCount }}</div>
            <div class="text-[10px] font-bold text-slate-600 uppercase">{{ isEnglish ? 'Classes Taught' : 'ថ្នាក់ទទួលខុសត្រូវ' }}</div>
          </div>
        </div>
      </div>

      <!-- Monday to Saturday Teacher Schedule Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div
          v-for="d in teacherScheduleData"
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
              </div>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {{ d.slots.filter(s => !s.isFree).length }} / 4 {{ isEnglish ? 'Sessions' : 'ម៉ោង' }}
              </span>
            </div>

            <!-- Slots for the Day -->
            <div class="space-y-2.5">
              <div
                v-for="slot in d.slots"
                :key="slot.slotNumber"
                :class="[
                  'p-3 rounded-xl border transition flex flex-col justify-between gap-1.5',
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

                <!-- Content: Class & Subject OR Free Period -->
                <div v-if="!slot.isFree" class="mt-0.5">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-slate-900">
                      {{ formatClassName(slot.className, isEnglish) }}
                    </span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {{ isEnglish ? slot.subjectEn : slot.subjectKm }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <MapPin class="w-3 h-3 text-slate-400" />
                    <span>{{ formatRoom(slot.room || 'បន្ទប់ 301', isEnglish) }}</span>
                  </div>
                </div>

                <!-- Free Period Notice -->
                <div v-else class="flex items-center justify-between text-xs text-slate-400 py-1">
                  <span class="flex items-center gap-1.5 text-slate-400 italic font-medium">
                    <Coffee class="w-3.5 h-3.5 text-amber-500/70" />
                    {{ isEnglish ? 'Free / No Class' : 'ម៉ោងទំនេរ / គ្មានម៉ោងបង្រៀន' }}
                  </span>
                  <span class="text-[10px] font-mono text-slate-400">
                    {{ isEnglish ? 'Available' : 'ទំនេរ' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- TAB 2: STUDENT / CLASS SCHEDULE VIEW                      -->
    <!-- ========================================================= -->
    <div v-if="activeTab === 'class'" class="space-y-6">
      <!-- Class Selector (Select dropdown) -->
      <div class="no-print bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <School class="w-5 h-5" />
          </div>
          <div>
            <label for="admin-schedule-class-select" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {{ isEnglish ? 'Select Student Class (10A - 12B):' : 'ជ្រើសរើសថ្នាក់សិស្ស (10A - 12B) ដើម្បីមើលកាលវិភាគ៖' }}
            </label>
            <p class="text-[11px] text-slate-400 mt-0.5">
              {{ isEnglish ? 'Filter schedule by class' : 'ជ្រើសរើសថ្នាក់ដើម្បីមើលកាលវិភាគសិក្សា' }} ({{ classes.length }} {{ isEnglish ? 'Classes' : 'ថ្នាក់' }})
            </p>
          </div>
        </div>

        <div class="relative w-full sm:w-80">
          <select
            id="admin-schedule-class-select"
            v-model="selectedClassId"
            class="w-full appearance-none bg-slate-50 hover:bg-slate-100/90 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer shadow-2xs"
          >
            <option
              v-for="c in classes"
              :key="c.id"
              :value="c.id"
            >
              {{ formatClassName(c.name, isEnglish) }} — {{ formatRoom(c.room || 'បន្ទប់ 301', isEnglish) }}
            </option>
          </select>
          <ChevronDown class="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <!-- Class Profile & KPI Banner -->
      <div
        v-if="currentClass"
        class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-600/20 shrink-0">
            <School class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-lg font-bold text-slate-900">
                {{ formatClassName(currentClass.name, isEnglish) }}
              </h2>
              <span class="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {{ currentClass.academicYear || '2025-2026' }}
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
              <span>{{ isEnglish ? 'Homeroom Teacher:' : 'គ្រូបន្ទុកថ្នាក់៖' }} <strong class="text-slate-800">{{ formatTeacherName(currentClass.teacherName, isEnglish) }}</strong></span>
              <span>•</span>
              <span>{{ isEnglish ? 'Classroom:' : 'បន្ទប់រៀន៖' }} <strong class="text-slate-800">{{ formatRoom(currentClass.room || 'បន្ទប់ 301', isEnglish) }}</strong></span>
              <span>•</span>
              <span>{{ isEnglish ? 'Track:' : 'ផ្នែក៖' }} <strong class="text-slate-800 capitalize">{{ currentClass.track || 'science' }}</strong></span>
            </div>
          </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-3 gap-3 shrink-0">
          <div class="px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
            <div class="text-xl font-bold font-mono text-blue-700">{{ classStats.studySlots }}</div>
            <div class="text-[10px] font-bold text-blue-600 uppercase">{{ isEnglish ? 'Study Hours' : 'ម៉ោងសិក្សា' }}</div>
          </div>
          <div class="px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-center">
            <div class="text-xl font-bold font-mono text-amber-700">{{ classStats.freeSlots }}</div>
            <div class="text-[10px] font-bold text-amber-600 uppercase">{{ isEnglish ? 'Free Hours' : 'ម៉ោងទំនេរ' }}</div>
          </div>
          <div class="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div class="text-xl font-bold font-mono text-slate-800">6</div>
            <div class="text-[10px] font-bold text-slate-600 uppercase">{{ isEnglish ? 'Days / Wk' : 'ថ្ងៃក្នុង១សប្តាហ៍' }}</div>
          </div>
        </div>
      </div>

      <!-- 1. GRID CARDS VIEW (Monday to Saturday) -->
      <div v-if="classViewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div
          v-for="d in classScheduleData"
          :key="d.day"
          class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <!-- Day Header -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 class="font-bold text-sm text-slate-900">
                  {{ isEnglish ? d.labelEn : d.labelKm }}
                </h3>
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
                    {{ isEnglish ? 'Library research or individual self-study period.' : 'ម៉ោងស្រាវជ្រាវក្នុងបណ្ណាល័យ ឬស្វ័យសិក្សាផ្ទាល់ខ្លួន។' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. FULL MATRIX TABLE VIEW -->
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
                  class="p-3.5 border-r border-slate-200 text-center min-w-[150px]"
                >
                  {{ isEnglish ? d.labelEn : d.labelKm }}
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
                  class="p-3 border-r border-slate-200 align-top"
                >
                  <template v-for="entry in classScheduleData.find(x => x.day === d.key)?.slots.filter(s => s.slotNumber === slot.slotNumber)" :key="entry.id">
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
  </div>
</template>

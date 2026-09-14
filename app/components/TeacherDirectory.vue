<!-- components/TeacherDirectory.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  GraduationCap,
  Search,
  BookOpen,
  School,
  Phone,
  Mail,
  Award,
  Users,
  Eye,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Briefcase,
  CheckCircle2,
  Calendar
} from 'lucide-vue-next'
import type { TeacherProfile, SchoolClass } from '~/types'

const emit = defineEmits<{
  (e: 'open-gradebook', classId: string): void
}>()

const { teachers, classes, getClassStats } = useScore()
const { t, isEnglish } = useI18n()

// Search & Filter state
const searchQuery = ref('')
const selectedSubjectFilter = ref<string>('all')
const selectedTeacherForModal = ref<TeacherProfile | null>(null)
const showTeacherModal = ref(false)

// Distinct subjects list for filter dropdown
const subjectFilters = computed(() => {
  const set = new Set<string>()
  teachers.value.forEach((t) => set.add(t.specialtyEn))
  return Array.from(set)
})

// Filtered Teachers
const filteredTeachers = computed(() => {
  let list = [...teachers.value]

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.specialty.toLowerCase().includes(q) ||
        t.specialtyEn.toLowerCase().includes(q) ||
        t.homeroomClassName.toLowerCase().includes(q) ||
        (t.room && t.room.toLowerCase().includes(q))
    )
  }

  // Subject filter
  if (selectedSubjectFilter.value !== 'all') {
    list = list.filter((t) => t.specialtyEn === selectedSubjectFilter.value)
  }

  return list
})

// Open Modal to inspect teacher's teaching classes & profile
const openTeacherDetails = (teacher: TeacherProfile) => {
  selectedTeacherForModal.value = teacher
  showTeacherModal.value = true
}

// Get class object by class ID
const getClassById = (classId: string): SchoolClass | undefined => {
  return classes.value.find((c) => c.id === classId)
}

// Handle open gradebook for specific class
const handleOpenGradebook = (classId: string) => {
  showTeacherModal.value = false
  emit('open-gradebook', classId)
}
</script>

<template>
  <div class="space-y-6">
    <!-- ========================================================= -->
    <!-- 1. HEADER & KPI CARDS                                     -->
    <!-- ========================================================= -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 flex-wrap">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {{ isEnglish ? 'Faculty & Teachers Directory' : 'បញ្ជីគ្រូបង្រៀន និងបន្ទុកថ្នាក់' }}
          </h1>
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono">
            {{ teachers.length }} {{ isEnglish ? 'Faculty' : 'គ្រូ' }}
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          {{ isEnglish ? 'Comprehensive overview of teachers, homeroom responsibilities, and teaching assignments across Grades 10-12.' : 'ពិនិត្យមើលព័ត៌មានគ្រូ ថ្នាក់បន្ទុក និងមុខវិជ្ជាដែលត្រូវបង្រៀនចាប់ពីថ្នាក់ទី ១០ ដល់ទី ១២។' }}
        </p>
      </div>
    </div>

    <!-- 4-Grid KPI Counters -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- KPI 1: Total Faculty -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <GraduationCap class="w-5 h-5" />
        </div>
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {{ isEnglish ? 'Total Faculty' : 'គ្រូបង្រៀនសរុប' }}
          </div>
          <div class="text-xl font-bold text-slate-900 font-mono mt-0.5">
            {{ teachers.length }}
          </div>
        </div>
      </div>

      <!-- KPI 2: Active Classes Covered -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <School class="w-5 h-5" />
        </div>
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {{ isEnglish ? 'Assigned Classes' : 'ថ្នាក់មានគ្រូបន្ទុក' }}
          </div>
          <div class="text-xl font-bold text-purple-700 font-mono mt-0.5">
            {{ classes.length }} / {{ classes.length }}
          </div>
        </div>
      </div>

      <!-- KPI 3: Subjects Covered -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <BookOpen class="w-5 h-5" />
        </div>
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {{ isEnglish ? 'Key Subjects' : 'មុខវិជ្ជាឯកទេស' }}
          </div>
          <div class="text-xl font-bold text-emerald-700 font-mono mt-0.5">
            {{ subjectFilters.length }}
          </div>
        </div>
      </div>

      <!-- KPI 4: Average Experience -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Award class="w-5 h-5" />
        </div>
        <div>
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {{ isEnglish ? 'Avg Experience' : 'បទពិសោធន៍មធ្យម' }}
          </div>
          <div class="text-xl font-bold text-amber-700 font-mono mt-0.5">
            7.5 {{ isEnglish ? 'Years' : 'ឆ្នាំ' }}
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 2. SEARCH & FILTER TOOLBAR                                -->
    <!-- ========================================================= -->
    <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="isEnglish ? 'Search teacher name, ID, specialty, room...' : 'ស្វែងរកឈ្មោះគ្រូ អត្តលេខ មុខវិជ្ជា បន្ទប់...'"
          class="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
        />
      </div>

      <!-- Subject Filter -->
      <div class="flex items-center gap-2">
        <select
          v-model="selectedSubjectFilter"
          class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
        >
          <option value="all">{{ isEnglish ? 'All Subjects' : 'គ្រប់មុខវិជ្ជាទាំងអស់' }}</option>
          <option v-for="subj in subjectFilters" :key="subj" :value="subj">
            {{ subj }}
          </option>
        </select>
        <span class="text-xs text-slate-400 font-mono px-2">
          {{ filteredTeachers.length }} {{ isEnglish ? 'teachers' : 'នាក់' }}
        </span>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 3. TEACHERS DIRECTORY TABLE                               -->
    <!-- ========================================================= -->
    <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <th class="py-3 px-4 w-20">ID</th>
              <th class="py-3 px-4 min-w-[200px]">{{ isEnglish ? 'Teacher' : 'ឈ្មោះគ្រូ' }}</th>
              <th class="py-3 px-3">{{ isEnglish ? 'Specialty' : 'មុខវិជ្ជាឯកទេស' }}</th>
              <th class="py-3 px-3">{{ isEnglish ? 'Homeroom Class' : 'ថ្នាក់បន្ទុក' }}</th>
              <th class="py-3 px-3">{{ isEnglish ? 'Classes Taught' : 'ថ្នាក់ដែលបង្រៀន' }}</th>
              <th class="py-3 px-3">{{ isEnglish ? 'Contact / Room' : 'ទំនាក់ទំនង / បន្ទប់' }}</th>
              <th class="py-3 px-3 text-center">{{ isEnglish ? 'Status' : 'ស្ថានភាព' }}</th>
              <th class="py-3 px-4 text-center w-36">{{ isEnglish ? 'Actions' : 'សកម្មភាព' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr
              v-for="teacher in filteredTeachers"
              :key="teacher.id"
              class="hover:bg-slate-50/60 transition group"
            >
              <!-- ID -->
              <td class="py-3.5 px-4 font-mono font-bold text-slate-500">
                {{ teacher.id }}
              </td>

              <!-- Teacher Avatar & Name -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border"
                    :class="teacher.gender === 'F' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'"
                  >
                    {{ formatTeacherName(teacher.name, isEnglish).charAt(0) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{{ formatTeacherName(teacher.name, isEnglish) }}</span>
                      <span
                        class="px-1.5 py-0.2 rounded text-[9px] font-bold"
                        :class="teacher.gender === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'"
                      >
                        {{ teacher.gender === 'F' ? (isEnglish ? 'Female' : 'ស្រី') : (isEnglish ? 'Male' : 'ប្រុស') }}
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                      {{ teacher.experienceYears }} {{ isEnglish ? 'yrs experience' : 'ឆ្នាំបទពិសោធន៍' }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Specialty Subject -->
              <td class="py-3.5 px-3">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-xs">
                  <BookOpen class="w-3.5 h-3.5 text-indigo-500" />
                  <span>{{ isEnglish ? teacher.specialtyEn : teacher.specialty }}</span>
                </span>
              </td>

              <!-- Homeroom Class -->
              <td class="py-3.5 px-3">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold font-mono text-xs">
                  <School class="w-3.5 h-3.5 text-purple-600" />
                  <span>{{ formatClassName(teacher.homeroomClassName, isEnglish) }}</span>
                </span>
              </td>

              <!-- Classes Taught Pills -->
              <td class="py-3.5 px-3">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span
                    v-for="clsId in teacher.teachingClasses"
                    :key="clsId"
                    class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {{ clsId.replace('CLS-', '') }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-medium">
                    {{ isEnglish ? `(${teacher.teachingClasses.length} classes)` : `(${teacher.teachingClasses.length} ថ្នាក់)` }}
                  </span>
                </div>
              </td>

              <!-- Contact & Room -->
              <td class="py-3.5 px-3">
                <div class="space-y-0.5 text-[11px]">
                  <div class="font-mono text-slate-700 font-semibold flex items-center gap-1">
                    <Phone class="w-3 h-3 text-slate-400" />
                    <span>{{ teacher.phone }}</span>
                  </div>
                  <div class="text-slate-400 flex items-center gap-1">
                    <span>{{ formatRoom(teacher.room, isEnglish) }}</span>
                  </div>
                </div>
              </td>

              <!-- Status -->
              <td class="py-3.5 px-3 text-center">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{{ isEnglish ? 'Active' : 'កំពុងបង្រៀន' }}</span>
                </span>
              </td>

              <!-- Actions Button: View Classes & Info -->
              <td class="py-3.5 px-4 text-center">
                <button
                  @click="openTeacherDetails(teacher)"
                  type="button"
                  class="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs w-full"
                  :title="isEnglish ? 'View Classes & Teaching Load' : 'មើលថ្នាក់បង្រៀន និងព័ត៌មានគ្រូ'"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>{{ isEnglish ? 'View Classes' : 'មើលថ្នាក់បង្រៀន' }}</span>
                </button>
              </td>
            </tr>

            <!-- Empty Search Result -->
            <tr v-if="filteredTeachers.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-400">
                <GraduationCap class="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <div>{{ isEnglish ? 'No teacher found matching your criteria.' : 'មិនមានគ្រូបង្រៀនត្រូវនឹងការស្វែងរកឡើយ។' }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 4. MODAL: TEACHER CLASSES & TEACHING LOAD PROFILE         -->
    <!-- ========================================================= -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showTeacherModal && selectedTeacherForModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      >
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
          <!-- Modal Header -->
          <div class="flex items-start justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center gap-3.5">
              <div
                class="w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-lg border shadow-xs"
                :class="selectedTeacherForModal.gender === 'F' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'"
              >
                {{ formatTeacherName(selectedTeacherForModal.name, isEnglish).charAt(0) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base sm:text-lg font-bold text-slate-900">
                    {{ formatTeacherName(selectedTeacherForModal.name, isEnglish) }}
                  </h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {{ selectedTeacherForModal.id }}
                  </span>
                </div>
                <div class="text-xs text-indigo-700 font-semibold mt-0.5 flex items-center gap-1.5">
                  <BookOpen class="w-3.5 h-3.5" />
                  <span>{{ isEnglish ? 'Specialty:' : 'មុខវិជ្ជាឯកទេស:' }} {{ isEnglish ? selectedTeacherForModal.specialtyEn : selectedTeacherForModal.specialty }}</span>
                </div>
              </div>
            </div>

            <button
              @click="showTeacherModal = false"
              type="button"
              class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Quick Info Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div class="text-[10px] uppercase font-semibold text-slate-400">{{ isEnglish ? 'Homeroom' : 'ថ្នាក់បន្ទុក' }}</div>
              <div class="font-bold text-purple-700 mt-1 font-mono">
                {{ formatClassName(selectedTeacherForModal.homeroomClassName, isEnglish) }}
              </div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div class="text-[10px] uppercase font-semibold text-slate-400">{{ isEnglish ? 'Assigned Room' : 'បន្ទប់បង្រៀន' }}</div>
              <div class="font-bold text-slate-800 mt-1">
                {{ formatRoom(selectedTeacherForModal.room, isEnglish) }}
              </div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <div class="text-[10px] uppercase font-semibold text-slate-400">{{ isEnglish ? 'Experience' : 'បទពិសោធន៍' }}</div>
              <div class="font-bold text-slate-800 mt-1">
                {{ selectedTeacherForModal.experienceYears }} {{ isEnglish ? 'Years' : 'ឆ្នាំ' }}
              </div>
            </div>
          </div>

          <!-- Academic Education & Contact Details -->
          <div class="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-2">
            <div class="font-bold text-slate-800 text-xs border-b border-slate-200/60 pb-1.5">
              {{ isEnglish ? 'Credentials & Contact Details' : 'ព័ត៌មានអត្តសញ្ញាណ និងទំនាក់ទំនង' }}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div class="flex items-center gap-2">
                <Briefcase class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{{ isEnglish ? (selectedTeacherForModal.educationEn || selectedTeacherForModal.education) : selectedTeacherForModal.education }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Phone class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span class="font-mono font-semibold">{{ selectedTeacherForModal.phone }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Mail class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span class="font-mono">{{ selectedTeacherForModal.email }}</span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span class="text-emerald-700 font-semibold">{{ isEnglish ? 'Status: Active on Duty' : 'ស្ថានភាព៖ កំពុងបង្រៀនពេញម៉ោង' }}</span>
              </div>
            </div>
          </div>

          <!-- ========================================================= -->
          <!-- CLASSES TAUGHT LIST WITH DIRECT GRADEBOOK SHORTCUTS        -->
          <!-- ========================================================= -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {{ isEnglish ? 'Classes Taught by this Teacher' : 'ថ្នាក់រៀនដែលគ្រូម្នាក់នេះទទួលបន្ទុកបង្រៀន' }}
                </h4>
                <p class="text-[11px] text-slate-500">
                  {{ isEnglish ? 'Click on any class to directly inspect its gradebook and student list' : 'ចុចលើថ្នាក់ណាមួយដើម្បីចូលទៅមើលសៀវភៅពិន្ទុ និងបញ្ជីសិស្សនៃថ្នាក់នោះ' }}
                </p>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold text-xs">
                {{ selectedTeacherForModal.teachingClasses.length }} {{ isEnglish ? 'Classes' : 'ថ្នាក់' }}
              </span>
            </div>

            <!-- Class Cards List -->
            <div class="space-y-2">
              <div
                v-for="clsId in selectedTeacherForModal.teachingClasses"
                :key="clsId"
                class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-mono font-bold flex items-center justify-center text-xs border border-purple-200 shrink-0">
                    {{ clsId.replace('CLS-', '') }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-900 text-xs">
                        {{ formatClassName(getClassById(clsId)?.name || clsId, isEnglish) }}
                      </span>
                      <span
                        v-if="clsId === selectedTeacherForModal.homeroomClassId"
                        class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700"
                      >
                        {{ isEnglish ? 'Homeroom' : 'ថ្នាក់បន្ទុក' }}
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{{ formatRoom(getClassById(clsId)?.room, isEnglish) }}</span>
                      <span>•</span>
                      <span>{{ getClassStats(clsId).totalStudents }} {{ isEnglish ? 'Students' : 'សិស្ស' }}</span>
                      <span>•</span>
                      <span>{{ isEnglish ? 'Avg:' : 'មធ្យមភាគ:' }} <strong class="text-indigo-600 font-mono">{{ getClassStats(clsId).classAverage }}</strong></span>
                      <span>•</span>
                      <span>{{ isEnglish ? 'Pass:' : 'ជាប់:' }} <strong class="text-emerald-600 font-mono">{{ getClassStats(clsId).passRate }}%</strong></span>
                    </div>
                  </div>
                </div>

                <!-- Action Button to Open Gradebook for this class -->
                <button
                  @click="handleOpenGradebook(clsId)"
                  type="button"
                  class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-end sm:self-auto"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                  <span>{{ isEnglish ? 'Open Gradebook' : 'បើកសៀវភៅពិន្ទុ' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              @click="showTeacherModal = false"
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              {{ t('close') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

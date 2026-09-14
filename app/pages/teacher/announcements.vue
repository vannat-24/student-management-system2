<!-- pages/teacher/announcements.vue -->
<script setup lang="ts">
import {
  Megaphone,
  Search,
  Calendar,
  AlertCircle,
  Users,
  Bell,
  FileText,
  GraduationCap,
  ChevronRight,
  Pin,
  Clock,
  Building2
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { isEnglish } = useI18n()
const { announcements } = useScore()

const searchQuery = ref('')
const filterTarget = ref('all') // 'all' | 'teachers' | 'students' | 'urgent'
const selectedAnnouncement = ref<any | null>(null)

// Filtered Announcements for Teacher View (Read-Only)
const filteredAnnouncements = computed(() => {
  let list = announcements.value || []

  if (filterTarget.value === 'urgent') {
    list = list.filter((a: any) => a.priority === 'urgent' || a.priority === 'important')
  } else if (filterTarget.value === 'teachers') {
    list = list.filter((a: any) => a.target === 'teachers' || a.target === 'all' || !a.target)
  } else if (filterTarget.value === 'students') {
    list = list.filter((a: any) => a.target === 'students' || a.target === 'all')
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter((a: any) =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.content && a.content.toLowerCase().includes(q)) ||
      (a.author && a.author.toLowerCase().includes(q))
    )
  }

  return list
})

// Quick Stats for Teachers
const stats = computed(() => {
  const all = announcements.value || []
  const total = all.length
  const forFaculty = all.filter((a: any) => a.target === 'teachers' || a.target === 'all' || !a.target).length
  const forStudents = all.filter((a: any) => a.target === 'students' || a.target === 'all').length
  const urgent = all.filter((a: any) => a.priority === 'urgent' || a.priority === 'important').length
  return { total, forFaculty, forStudents, urgent }
})
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header Section (Read-Only Notice Board) -->
    <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
            <Megaphone class="w-5 h-5" />
          </div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {{ isEnglish ? 'Faculty Notices & Announcements' : 'សេចក្តីជូនដំណឹងសម្រាប់លោកគ្រូ-អ្នកគ្រូ' }}
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          {{ isEnglish
            ? 'Official directives, academic circulars, and institutional bulletins issued by school administration.'
            : 'សារណែនាំផ្លូវការ សារាចរអប់រំ និងសេចក្តីជូនដំណឹងទូទៅដែលចេញដោយគណៈគ្រប់គ្រងសាលា។'
          }}
        </p>
      </div>

      <!-- Administration Source Tag -->
      <div class="flex items-center gap-2 self-start md:self-center">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
          <Building2 class="w-3.5 h-3.5 text-indigo-600" />
          <span>{{ isEnglish ? 'Issued by Administration' : 'ចេញដោយគណៈគ្រប់គ្រង' }}</span>
        </div>
      </div>
    </div>

    <!-- 4 KPI Metrics -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Total -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Total Circulars' : 'សេចក្តីជូនដំណឹងសរុប' }}</span>
          <FileText class="w-4 h-4 text-indigo-500" />
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-slate-900 font-mono">{{ stats.total }}</div>
          <span class="text-[11px] text-slate-400">{{ isEnglish ? 'Official bulletins' : 'ដំណឹងសកម្មក្នុងប្រព័ន្ធ' }}</span>
        </div>
      </div>

      <!-- 2. For Faculty -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Faculty Notices' : 'សម្រាប់លោកគ្រូ-អ្នកគ្រូ' }}</span>
          <GraduationCap class="w-4 h-4 text-purple-500" />
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-purple-600 font-mono">{{ stats.forFaculty }}</div>
          <span class="text-[11px] text-purple-600 font-medium">{{ isEnglish ? 'Staff bulletins' : 'ដំណឹងសម្រាប់បុគ្គលិក' }}</span>
        </div>
      </div>

      <!-- 3. For Students -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Student Circulars' : 'សម្រាប់សិស្សានុសិស្ស' }}</span>
          <Users class="w-4 h-4 text-blue-500" />
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-blue-600 font-mono">{{ stats.forStudents }}</div>
          <span class="text-[11px] text-blue-600 font-medium">{{ isEnglish ? 'Class directives' : 'ដំណឹងដល់ថ្នាក់រៀន' }}</span>
        </div>
      </div>

      <!-- 4. Urgent -->
      <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">{{ isEnglish ? 'Urgent & Important' : 'បន្ទាន់ និងសំខាន់' }}</span>
          <AlertCircle class="w-4 h-4 text-rose-500" />
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-rose-600 font-mono">{{ stats.urgent }}</div>
          <span class="text-[11px] text-rose-600 font-medium">{{ isEnglish ? 'Action required' : 'អាទិភាពខ្ពស់' }}</span>
        </div>
      </div>
    </div>

    <!-- Filters and Search Toolbar -->
    <div class="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Target Tabs -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          @click="filterTarget = 'all'"
          :class="[
            'px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0',
            filterTarget === 'all'
              ? 'bg-white text-indigo-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          {{ isEnglish ? 'All Circulars' : 'ទាំងអស់' }}
        </button>
        <button
          type="button"
          @click="filterTarget = 'teachers'"
          :class="[
            'px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0',
            filterTarget === 'teachers'
              ? 'bg-white text-indigo-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          {{ isEnglish ? 'Faculty Notices' : 'សម្រាប់គ្រូ' }}
        </button>
        <button
          type="button"
          @click="filterTarget = 'students'"
          :class="[
            'px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0',
            filterTarget === 'students'
              ? 'bg-white text-indigo-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          {{ isEnglish ? 'Student Notices' : 'សម្រាប់សិស្ស' }}
        </button>
        <button
          type="button"
          @click="filterTarget = 'urgent'"
          :class="[
            'px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0',
            filterTarget === 'urgent'
              ? 'bg-white text-rose-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          {{ isEnglish ? 'Urgent' : 'បន្ទាន់' }}
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative min-w-[220px]">
        <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="isEnglish ? 'Search circulars...' : 'ស្វែងរកសេចក្តីជូនដំណឹង...'"
          class="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>
    </div>

    <!-- Announcements Feed (Read-Only) -->
    <div v-if="filteredAnnouncements.length > 0" class="space-y-4">
      <div
        v-for="item in filteredAnnouncements"
        :key="item.id"
        class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-indigo-200/80 transition space-y-3.5"
      >
        <!-- Top Bar: Tags & Date -->
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex flex-wrap items-center gap-2">
            <!-- Priority Badge -->
            <span
              :class="[
                'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                item.priority === 'urgent'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : item.priority === 'important'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              ]"
            >
              {{ item.priority || 'normal' }}
            </span>

            <!-- Target Audience Badge -->
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <span v-if="item.target === 'teachers'">{{ isEnglish ? 'Target: Faculty Only' : 'សម្រាប់៖ លោកគ្រូ-អ្នកគ្រូ' }}</span>
              <span v-else-if="item.target === 'students'">{{ isEnglish ? 'Target: Students' : 'សម្រាប់៖ សិស្សានុសិស្ស' }}</span>
              <span v-else>{{ isEnglish ? 'Target: Entire Institution' : 'សម្រាប់៖ សាលារៀនទូទៅ' }}</span>
            </span>
          </div>

          <!-- Date & Author -->
          <div class="flex items-center gap-3 text-xs text-slate-400">
            <div class="flex items-center gap-1">
              <Calendar class="w-3.5 h-3.5" />
              <span>{{ item.date || 'Today' }}</span>
            </div>
            <div class="text-[11px] text-slate-500 font-medium">
              {{ isEnglish ? 'By' : 'ដោយ៖' }} <span class="font-bold text-slate-700">{{ item.author || (isEnglish ? 'School Administration' : 'គណៈគ្រប់គ្រងសាលា') }}</span>
            </div>
          </div>
        </div>

        <!-- Title -->
        <h3 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
          {{ item.title }}
        </h3>

        <!-- Content Body -->
        <div class="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          {{ item.content }}
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-xs text-center space-y-3"
    >
      <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
        <Megaphone class="w-6 h-6" />
      </div>
      <h3 class="text-sm font-bold text-slate-800">
        {{ isEnglish ? 'No announcements found' : 'មិនមានសេចក្តីជូនដំណឹងទេ' }}
      </h3>
      <p class="text-xs text-slate-400 max-w-sm mx-auto">
        {{ isEnglish
          ? 'No circulars match your current filter or search criteria.'
          : 'មិនមានសេចក្តីជូនដំណឹងដែលត្រូវគ្នានឹងពាក្យគន្លឹះ ឬតម្រងដែលបានជ្រើសឡើយ។'
        }}
      </p>
    </div>
  </div>
</template>

<!-- pages/student/announcements.vue -->
<script setup lang="ts">
import {
  Megaphone,
  Calendar,
  Tag,
  Search,
  Pin,
  Clock,
  UserCheck,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Bell
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { announcements: realAnnouncements } = useScore()

interface Announcement {
  id: number | string
  title: string
  category: 'Academic' | 'Exams' | 'Schedule' | 'Campus' | 'Important' | string
  date: string
  relativeTime: string
  author: string
  content: string
  isPinned?: boolean
  isUnread?: boolean
  tagColor: string
}

const activeCategory = ref('All')
const searchQuery = ref('')
const selectedAnnouncement = ref<Announcement | null>(null)

const categories = ['All', 'Academic', 'Exams', 'Schedule', 'Campus', 'Important']

const announcements = computed<Announcement[]>(() => {
  if (realAnnouncements.value && realAnnouncements.value.length > 0) {
    return realAnnouncements.value.map((ann: any, idx: number) => ({
      id: ann.id || idx + 1,
      title: ann.title,
      category: ann.category || 'Academic',
      date: ann.date || 'March 15, 2026',
      relativeTime: ann.relativeTime || `${idx + 1} days ago`,
      author: ann.author || 'Academic Affairs',
      content: ann.content || '',
      isPinned: !!ann.isPinned,
      isUnread: ann.isUnread ?? (idx < 2),
      tagColor: ann.tagColor || (ann.category === 'Exams' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200')
    }))
  }
  return [
    {
      id: 1,
      title: 'Midterm Examination Schedule Released',
      category: 'Exams',
      date: 'March 15, 2026',
      relativeTime: '2 hours ago',
      author: 'Examination Committee',
      content: 'The official schedule for Midterm Examinations Semester 1 has been published. Exams commence on March 25, 2026. Please check your assigned rooms and ensure you bring your student ID card to every session. Contact Academic Affairs for any schedule conflicts.',
      isPinned: true,
      isUnread: true,
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 2,
      title: 'Lab Notice: Grade 12 Chemistry Experiment (CHEM-12)',
      category: 'Academic',
      date: 'March 14, 2026',
      relativeTime: 'Yesterday',
      author: 'អ្នកគ្រូ ចិន្តា (Ms. Chenda)',
      content: 'Grade 12A students will conduct chemical reaction and organic chemistry laboratory experiments next Tuesday at Chemistry Lab 1. Please ensure you wear lab coats and bring your notebooks.',
      isPinned: false,
      isUnread: true,
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 3,
      title: 'National High School Math Olympiad 2026 Registration',
      category: 'Competition',
      date: 'March 10, 2026',
      relativeTime: '5 days ago',
      author: 'MoEYS Examination Office',
      content: 'Registration for the National High School Mathematics Olympiad 2026 is officially open. Outstanding Grade 12 students in Mathematics are encouraged to register with Mr. Sovann by next Friday.',
      isPinned: true,
      isUnread: false,
      tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 4,
      title: 'Library Hours Extended for Study Week',
      category: 'Campus',
      date: 'March 08, 2026',
      relativeTime: '1 week ago',
      author: 'University Library',
      content: 'The central library will remain open until 10:00 PM on weekdays and 06:00 PM on Saturdays throughout the upcoming examination period.',
      isPinned: false,
      isUnread: false,
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 5,
      title: 'System Maintenance Notice: Student Portal',
      category: 'Important',
      date: 'March 01, 2026',
      relativeTime: '2 weeks ago',
      author: 'IT Operations',
      content: 'Scheduled maintenance will be performed on Sunday, March 8 from 02:00 AM to 05:00 AM. During this time, the student grading and schedule portal may be temporarily inaccessible. We apologize for any inconvenience.',
      isPinned: false,
      isUnread: false,
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  ]
})

const filteredAnnouncements = computed(() => {
  return announcements.value.filter(item => {
    const matchesCategory = activeCategory.value === 'All' || item.category === activeCategory.value
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesQuery
  })
})

const pinnedAnnouncements = computed(() => {
  return filteredAnnouncements.value.filter(a => a.isPinned)
})

const normalAnnouncements = computed(() => {
  return filteredAnnouncements.value.filter(a => !a.isPinned)
})
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
            Announcements & Notices
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Stay updated with academic bulletins, schedules, and campus activities
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Bell class="w-3.5 h-3.5" />
          {{ announcements.filter(a => a.isUnread).length }} Unread Notices
        </span>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search announcements, tags, authors..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
        />
      </div>

      <!-- Categories Filter -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat"
          type="button"
          :class="[
            'px-3 py-1.5 text-xs font-medium rounded-xl transition whitespace-nowrap',
            activeCategory === cat
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
          ]"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Pinned Announcements Section -->
    <div v-if="pinnedAnnouncements.length > 0" class="space-y-3">
      <div class="flex items-center gap-2 text-xs font-bold text-slate-700 tracking-wide uppercase">
        <Pin class="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        Pinned Notices
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in pinnedAnnouncements"
          :key="item.id"
          class="bg-gradient-to-br from-amber-50/40 via-white to-white rounded-xl border border-amber-200/70 p-5 shadow-xs hover:border-amber-300 transition group flex flex-col justify-between"
        >
          <div>
            <div class="flex items-start justify-between gap-3 mb-2.5">
              <span :class="['text-[11px] font-semibold px-2.5 py-0.5 rounded-full border', item.tagColor]">
                {{ item.category }}
              </span>
              <span class="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock class="w-3 h-3" />
                {{ item.relativeTime }}
              </span>
            </div>

            <h3 class="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition leading-snug">
              {{ item.title }}
            </h3>

            <p class="text-xs text-slate-600 mt-2 leading-relaxed">
              {{ item.content }}
            </p>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span class="font-medium text-slate-700 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {{ item.author }}
            </span>
            <span class="text-[11px] text-slate-400">
              {{ item.date }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Regular Announcements List -->
    <div class="space-y-3">
      <div class="flex items-center justify-between text-xs font-bold text-slate-700 tracking-wide uppercase">
        <span>Recent Notices</span>
        <span class="text-[11px] font-normal text-slate-400 lowercase">Showing {{ filteredAnnouncements.length }} items</span>
      </div>

      <div v-if="filteredAnnouncements.length === 0" class="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
        <Megaphone class="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p class="text-sm font-semibold text-slate-700">No announcements found</p>
        <p class="text-xs text-slate-400 mt-1">Try refining your search query or choosing another category</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in filteredAnnouncements"
          :key="item.id"
          class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-200/80 transition group"
        >
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <span :class="['text-[11px] font-semibold px-2.5 py-0.5 rounded-full border', item.tagColor]">
                {{ item.category }}
              </span>
              <span v-if="item.isPinned" class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Pin class="w-2.5 h-2.5 fill-amber-600" />
                Pinned
              </span>
              <span v-if="item.isUnread" class="w-2 h-2 rounded-full bg-blue-600"></span>
            </div>
            <div class="flex items-center gap-3 text-[11px] text-slate-400">
              <span class="flex items-center gap-1">
                <Calendar class="w-3 h-3" />
                {{ item.date }}
              </span>
              <span>•</span>
              <span>{{ item.relativeTime }}</span>
            </div>
          </div>

          <h3 class="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
            {{ item.title }}
          </h3>

          <p class="text-xs text-slate-600 mt-2 leading-relaxed">
            {{ item.content }}
          </p>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">
              Posted by <span class="text-slate-700 font-semibold">{{ item.author }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

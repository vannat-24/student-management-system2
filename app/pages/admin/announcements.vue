<!-- pages/admin/announcements.vue -->
<script setup lang="ts">
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Users,
  Bell,
  X,
  FileText,
  Sparkles
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { isEnglish } = useI18n()
const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useScore()

const searchQuery = ref('')
const filterTarget = ref('all')
const showModal = ref(false)
const editingId = ref<string | number | null>(null)

// Toast
const toastMessage = ref<string | null>(null)
const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = null
  }, 3500)
}

// Form state
const form = reactive({
  title: '',
  content: '',
  target: 'all', // 'all' | 'students' | 'teachers'
  priority: 'normal' // 'normal' | 'important' | 'urgent'
})

// Filtered Announcements
const filteredAnnouncements = computed(() => {
  let list = announcements.value || []
  if (filterTarget.value !== 'all') {
    list = list.filter((a: any) => a.target === filterTarget.value || !a.target || a.target === 'all')
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter((a: any) =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.content && a.content.toLowerCase().includes(q))
    )
  }
  return list
})

// Stats
const stats = computed(() => {
  const total = (announcements.value || []).length
  const urgent = (announcements.value || []).filter((a: any) => a.priority === 'urgent').length
  const forStudents = (announcements.value || []).filter((a: any) => a.target === 'students' || a.target === 'all').length
  return { total, urgent, forStudents }
})

const openCreateModal = () => {
  editingId.value = null
  form.title = ''
  form.content = ''
  form.target = 'all'
  form.priority = 'normal'
  showModal.value = true
}

const openEditModal = (ann: any) => {
  editingId.value = ann.id
  form.title = ann.title || ''
  form.content = ann.content || ''
  form.target = ann.target || 'all'
  form.priority = ann.priority || 'normal'
  showModal.value = true
}

const handleSave = () => {
  if (!form.title.trim() || !form.content.trim()) {
    showToast(isEnglish.value ? 'Please fill in both title and content!' : 'សូមបំពេញចំណងជើង និងខ្លឹមសារ!')
    return
  }

  if (editingId.value !== null) {
    updateAnnouncement(editingId.value, {
      title: form.title,
      content: form.content,
      target: form.target,
      priority: form.priority
    })
    showToast(isEnglish.value ? 'Announcement updated successfully!' : 'បានកែប្រែសេចក្តីជូនដំណឹងជោគជ័យ!')
  } else {
    addAnnouncement({
      title: form.title,
      content: form.content,
      target: form.target,
      priority: form.priority
    })
    showToast(isEnglish.value ? 'Announcement published successfully!' : 'បានបង្ហោះសេចក្តីជូនដំណឹងថ្មីជោគជ័យ!')
  }

  showModal.value = false
}

const handleDelete = (id: string | number) => {
  if (confirm(isEnglish.value ? 'Are you sure you want to delete this announcement?' : 'តើអ្នកប្រាកដជាចង់លុបសេចក្តីជូនដំណឹងនេះមែនទេ?')) {
    deleteAnnouncement(id)
    showToast(isEnglish.value ? 'Announcement deleted!' : 'បានលុបសេចក្តីជូនដំណឹងរួចរាល់!')
  }
}
</script>

<template>
  <div class="w-full space-y-6">
    <!-- Toast -->
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

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 flex-wrap">
          <div class="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-xs">
            <Megaphone class="w-5 h-5" />
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {{ isEnglish ? 'Announcement Management' : 'ការគ្រប់គ្រងសេចក្តីជូនដំណឹង' }}
          </h1>
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
            {{ isEnglish ? 'Notice Board' : 'ក្តារព័ត៌មានផ្លូវការ' }}
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          {{ isEnglish
            ? 'Publish official school notices, announcements, and schedules for teachers and students.'
            : 'បង្កើត កែសម្រួល និងបង្ហោះសេចក្តីជូនដំណឹងផ្លូវការទៅកាន់សិស្សានុសិស្ស និងលោកគ្រូអ្នកគ្រូ។'
          }}
        </p>
      </div>

      <button
        @click="openCreateModal"
        type="button"
        class="px-4 py-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer self-start sm:self-center"
      >
        <Plus class="w-4 h-4" />
        <span>{{ isEnglish ? 'New Announcement' : 'បង្កើតដំណឹងថ្មី' }}</span>
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span class="font-medium text-slate-500">{{ isEnglish ? 'Total Notices' : 'ដំណឹងសរុប' }}</span>
          <div class="text-2xl font-black text-slate-900 font-mono mt-1">{{ stats.total }}</div>
        </div>
        <div class="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <FileText class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span class="font-medium text-slate-500">{{ isEnglish ? 'High Priority / Urgent' : 'ដំណឹងបន្ទាន់' }}</span>
          <div class="text-2xl font-black text-rose-600 font-mono mt-1">{{ stats.urgent }}</div>
        </div>
        <div class="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span class="font-medium text-slate-500">{{ isEnglish ? 'Student Broadcasts' : 'ផ្សាយទៅសិស្ស' }}</span>
          <div class="text-2xl font-black text-indigo-600 font-mono mt-1">{{ stats.forStudents }}</div>
        </div>
        <div class="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Users class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Search and Target Filter Bar -->
    <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="isEnglish ? 'Search announcements...' : 'ស្វែងរកសេចក្តីជូនដំណឹង...'"
          class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        />
      </div>

      <!-- Filter Buttons -->
      <div class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start sm:self-auto">
        <button
          type="button"
          @click="filterTarget = 'all'"
          :class="[
            'px-3 py-1.5 rounded-lg transition cursor-pointer',
            filterTarget === 'all' ? 'bg-white text-purple-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          {{ isEnglish ? 'All Audiences' : 'ទាំងអស់' }}
        </button>
        <button
          type="button"
          @click="filterTarget = 'students'"
          :class="[
            'px-3 py-1.5 rounded-lg transition cursor-pointer',
            filterTarget === 'students' ? 'bg-white text-purple-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          {{ isEnglish ? 'Students' : 'សិស្សានុសិស្ស' }}
        </button>
        <button
          type="button"
          @click="filterTarget = 'teachers'"
          :class="[
            'px-3 py-1.5 rounded-lg transition cursor-pointer',
            filterTarget === 'teachers' ? 'bg-white text-purple-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          {{ isEnglish ? 'Faculty' : 'លោកគ្រូអ្នកគ្រូ' }}
        </button>
      </div>
    </div>

    <!-- Announcement Cards Grid -->
    <div class="space-y-4">
      <div
        v-for="ann in filteredAnnouncements"
        :key="ann.id"
        class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition flex flex-col justify-between gap-4"
      >
        <div class="space-y-2.5">
          <!-- Top Badges & Date -->
          <div class="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Priority Badge -->
              <span
                v-if="ann.priority === 'urgent'"
                class="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wide"
              >
                🚨 {{ isEnglish ? 'Urgent' : 'បន្ទាន់' }}
              </span>
              <span
                v-else-if="ann.priority === 'important'"
                class="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide"
              >
                ⭐ {{ isEnglish ? 'Important' : 'សំខាន់' }}
              </span>
              <span
                v-else
                class="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"
              >
                📌 {{ isEnglish ? 'Notice' : 'សេចក្តីជូនដំណឹង' }}
              </span>

              <!-- Target Audience Badge -->
              <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {{ ann.target === 'students' ? (isEnglish ? 'For Students' : 'សម្រាប់សិស្ស') : (ann.target === 'teachers' ? (isEnglish ? 'For Faculty' : 'សម្រាប់គ្រូ') : (isEnglish ? 'Public / All' : 'ទូទៅ')) }}
              </span>
            </div>

            <!-- Published Date -->
            <div class="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <Calendar class="w-3.5 h-3.5" />
              <span>{{ ann.date }}</span>
            </div>
          </div>

          <!-- Title -->
          <h2 class="text-base font-bold text-slate-900">
            {{ ann.title }}
          </h2>

          <!-- Content -->
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {{ ann.content }}
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-400 font-mono text-[11px]">
            ID: {{ ann.id }}
          </span>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="openEditModal(ann)"
              class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Edit class="w-3.5 h-3.5 text-slate-500" />
              <span>{{ isEnglish ? 'Edit' : 'កែសម្រួល' }}</span>
            </button>

            <button
              type="button"
              @click="handleDelete(ann.id)"
              class="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 class="w-3.5 h-3.5 text-rose-600" />
              <span>{{ isEnglish ? 'Delete' : 'លុប' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredAnnouncements.length === 0" class="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
        <Megaphone class="w-8 h-8 mx-auto text-slate-300" />
        <div class="font-bold text-slate-600 text-sm">
          {{ isEnglish ? 'No announcements found' : 'មិនមានសេចក្តីជូនដំណឹងឡើយ' }}
        </div>
        <p class="text-xs">
          {{ isEnglish ? 'Click "New Announcement" to publish your first notice.' : 'ចុចលើប៊ូតុង "បង្កើតដំណឹងថ្មី" ដើម្បីផ្សាយដំណឹងដំបូង។' }}
        </p>
      </div>
    </div>

    <!-- Create / Edit Announcement Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <!-- Modal Header -->
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Megaphone class="w-4 h-4" />
            </div>
            <h3 class="font-bold text-sm text-slate-900">
              {{ editingId !== null ? (isEnglish ? 'Edit Announcement' : 'កែសម្រួលសេចក្តីជូនដំណឹង') : (isEnglish ? 'Create Announcement' : 'បង្កើតសេចក្តីជូនដំណឹងថ្មី') }}
            </h3>
          </div>
          <button
            type="button"
            @click="showModal = false"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-5 space-y-4 text-xs">
          <!-- Title -->
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700">
              {{ isEnglish ? 'Announcement Title' : 'ចំណងជើងសេចក្តីជូនដំណឹង' }} *
            </label>
            <input
              v-model="form.title"
              type="text"
              :placeholder="isEnglish ? 'e.g., Midterm Exam Schedule Release' : 'ឧ. កាលវិភាគប្រឡងឆមាសទី១...'"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <!-- Target & Priority Row -->
          <div class="grid grid-cols-2 gap-3">
            <!-- Target Audience -->
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700">
                {{ isEnglish ? 'Target Audience' : 'ក្រុមគោលដៅ' }}
              </label>
              <select
                v-model="form.target"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="all">{{ isEnglish ? 'All School (Public)' : 'សាលាទាំងមូល (ទូទៅ)' }}</option>
                <option value="students">{{ isEnglish ? 'Students Only' : 'សិស្សានុសិស្សប៉ុណ្ណោះ' }}</option>
                <option value="teachers">{{ isEnglish ? 'Faculty Only' : 'លោកគ្រូអ្នកគ្រូប៉ុណ្ណោះ' }}</option>
              </select>
            </div>

            <!-- Priority -->
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700">
                {{ isEnglish ? 'Priority Level' : 'កម្រិតអាទិភាព' }}
              </label>
              <select
                v-model="form.priority"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="normal">{{ isEnglish ? 'Normal' : 'ធម្មតា' }}</option>
                <option value="important">{{ isEnglish ? 'Important (Star)' : 'សំខាន់ (Star)' }}</option>
                <option value="urgent">{{ isEnglish ? 'Urgent (Alert)' : 'បន្ទាន់ (Alert)' }}</option>
              </select>
            </div>
          </div>

          <!-- Content Textarea -->
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700">
              {{ isEnglish ? 'Notice Content / Description' : 'ខ្លឹមសារលម្អិត' }} *
            </label>
            <textarea
              v-model="form.content"
              rows="5"
              :placeholder="isEnglish ? 'Type your official notice here...' : 'សូមសរសេរខ្លឹមសារសេចក្តីជូនដំណឹងផ្លូវការនៅទីនេះ...'"
              class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 leading-relaxed"
            ></textarea>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            @click="showModal = false"
            class="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            {{ isEnglish ? 'Cancel' : 'បោះបង់' }}
          </button>
          <button
            type="button"
            @click="handleSave"
            class="px-5 py-2 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {{ editingId !== null ? (isEnglish ? 'Update Notice' : 'រក្សាទុកការកែប្រែ') : (isEnglish ? 'Publish Notice' : 'បង្ហោះដំណឹង') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- pages/admin/approvals.vue -->
<script setup lang="ts">
import type { User as StudentUser } from '~/types'
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  Trash2,
  RefreshCw,
  School,
  Calendar,
  AlertCircle,
  Filter,
  CheckCheck,
  ShieldCheck,
  ArrowRight
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { isEnglish, t } = useI18n()
const { classes, fetchInitialData } = useScore()
const {
  studentUsers,
  pendingStudents,
  approvedStudents,
  rejectedStudents,
  pendingCount,
  approvedCount,
  rejectedCount,
  isLoading,
  fetchApprovals,
  approveStudent,
  rejectStudent,
  deleteStudent,
  approveAll
} = useApprovals()

// Filters & State
const searchQuery = ref('')
const selectedStatusFilter = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending')
const selectedClassFilter = ref<string>('all')
const toastMessage = ref<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
const actionInProgressId = ref<string | null>(null)

const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
  toastMessage.value = { text, type }
  setTimeout(() => {
    toastMessage.value = null
  }, 3500)
}

// Initial fetch
onMounted(async () => {
  await fetchApprovals(true)
})

// Filtered student list
const filteredStudents = computed(() => {
  return studentUsers.value.filter((s) => {
    // 1. Status filter
    if (selectedStatusFilter.value === 'pending' && s.status !== 'pending') return false
    if (selectedStatusFilter.value === 'approved' && s.status !== 'approved' && !!s.status) return false
    if (selectedStatusFilter.value === 'rejected' && s.status !== 'rejected') return false

    // 2. Class filter
    if (selectedClassFilter.value !== 'all' && s.classId !== selectedClassFilter.value) return false

    // 3. Search filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const matchName = (s.name || '').toLowerCase().includes(q)
      const matchId = (s.id || '').toLowerCase().includes(q) || (s.studentId || '').toLowerCase().includes(q)
      const matchClass = (s.className || '').toLowerCase().includes(q)
      const matchEmail = (s.email || '').toLowerCase().includes(q)
      if (!matchName && !matchId && !matchClass && !matchEmail) return false
    }

    return true
  })
})

const handleApprove = async (student: StudentUser) => {
  actionInProgressId.value = student.id
  const res = await approveStudent(student.id)
  actionInProgressId.value = null

  if (res.success) {
    showToast(isEnglish.value ? `Approved student ${student.name}!` : `បានអនុញ្ញាតសិស្ស ${student.name} ជោគជ័យ!`, 'success')
    // Sync active classes roster in useScore
    await fetchInitialData(true)
  } else {
    showToast(res.message || 'Approval failed', 'error')
  }
}

const handleReject = async (student: StudentUser) => {
  if (!confirm(isEnglish.value ? `Reject registration for ${student.name}?` : `តើអ្នកចង់បដិសេធសំណើចុះឈ្មោះរបស់ ${student.name} មែនទេ?`)) {
    return
  }

  actionInProgressId.value = student.id
  const res = await rejectStudent(student.id)
  actionInProgressId.value = null

  if (res.success) {
    showToast(isEnglish.value ? `Rejected registration for ${student.name}` : `បានបដិសេធសំណើរបស់ ${student.name}`, 'info')
    await fetchInitialData(true)
  } else {
    showToast(res.message || 'Reject failed', 'error')
  }
}

const handleDelete = async (student: StudentUser) => {
  if (!confirm(isEnglish.value ? `Permanently delete account ${student.name} (${student.id})?` : `តើអ្នកប្រាកដជាចង់លុបគណនី ${student.name} (${student.id}) ជាអចិន្ត្រៃយ៍មែនទេ?`)) {
    return
  }

  actionInProgressId.value = student.id
  const res = await deleteStudent(student.id)
  actionInProgressId.value = null

  if (res.success) {
    showToast(isEnglish.value ? `Deleted account for ${student.name}` : `បានលុបគណនី ${student.name}`, 'info')
    await fetchInitialData(true)
  } else {
    showToast(res.message || 'Delete failed', 'error')
  }
}

const handleApproveAll = async () => {
  if (!confirm(isEnglish.value ? `Approve all ${pendingCount.value} pending student registrations?` : `តើអ្នកចង់អនុម័តសិស្សកំពុងរង់ចាំទាំងអស់ចំនួន ${pendingCount.value} នាក់មែនទេ?`)) {
    return
  }

  actionInProgressId.value = 'all'
  const res = await approveAll()
  actionInProgressId.value = null

  if (res.success) {
    showToast(isEnglish.value ? `All ${res.count || pendingCount.value} students approved!` : `បានអនុម័តសិស្សទាំងអស់ដោយជោគជ័យ!`, 'success')
    await fetchInitialData(true)
  } else {
    showToast(res.message || 'Bulk approval failed', 'error')
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString(isEnglish.value ? 'en-US' : 'km-KH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition ease-out duration-300 transform"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toastMessage"
        class="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2"
        :class="[
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          toastMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-slate-900 text-white border-slate-800'
        ]"
      >
        <CheckCircle2 v-if="toastMessage.type === 'success'" class="w-4 h-4 text-emerald-600 shrink-0" />
        <AlertCircle v-else-if="toastMessage.type === 'error'" class="w-4 h-4 text-rose-600 shrink-0" />
        <span>{{ toastMessage.text }}</span>
      </div>
    </Transition>

    <!-- Header Section -->
    <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
            <UserCheck class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-900 tracking-tight">
                {{ isEnglish ? 'Student Registration Approvals' : 'ការអនុម័តសិស្សចុះឈ្មោះ' }}
              </h1>
              <span
                v-if="pendingCount > 0"
                class="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
              >
                {{ pendingCount }} {{ isEnglish ? 'Pending' : 'រង់ចាំ' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              {{ isEnglish
                ? 'Review and approve newly registered student accounts before they can access the portal'
                : 'ពិនិត្យ និងអនុម័តគណនីសិស្សដែលទើបចុះឈ្មោះថ្មី មុនពេលពួកគេអាចចូលប្រើប្រាស់ប្រព័ន្ធ'
              }}
            </p>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex items-center gap-2">
          <button
            @click="fetchApprovals(true)"
            type="button"
            :disabled="isLoading"
            class="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            :title="isEnglish ? 'Refresh list' : 'ទាញយកទិន្នន័យឡើងវិញ'"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
            <span>{{ isEnglish ? 'Refresh' : 'ផ្ទុកឡើងវិញ' }}</span>
          </button>

          <button
            v-if="pendingCount > 0"
            @click="handleApproveAll"
            type="button"
            :disabled="actionInProgressId === 'all'"
            class="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCheck class="w-4 h-4" />
            <span>{{ isEnglish ? `Approve All (${pendingCount})` : `អនុម័តទាំងអស់ (${pendingCount})` }}</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards Strip -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5 pt-5 border-t border-slate-100">
        <!-- 1. Pending Approvals -->
        <div
          @click="selectedStatusFilter = 'pending'"
          class="p-4 rounded-xl border transition cursor-pointer flex items-center justify-between"
          :class="[
            selectedStatusFilter === 'pending'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-slate-50/60 border-slate-200 hover:bg-amber-50/40 hover:border-amber-200'
          ]"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock class="w-5 h-5" />
            </div>
            <div>
              <div class="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                {{ isEnglish ? 'Pending Approvals' : 'រង់ចាំការអនុម័ត' }}
              </div>
              <div class="text-2xl font-black text-slate-900 mt-0.5">
                {{ pendingCount }}
              </div>
            </div>
          </div>
          <span v-if="pendingCount > 0" class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
        </div>

        <!-- 2. Approved Students -->
        <div
          @click="selectedStatusFilter = 'approved'"
          class="p-4 rounded-xl border transition cursor-pointer flex items-center justify-between"
          :class="[
            selectedStatusFilter === 'approved'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
              : 'bg-slate-50/60 border-slate-200 hover:bg-emerald-50/40 hover:border-emerald-200'
          ]"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 class="w-5 h-5" />
            </div>
            <div>
              <div class="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                {{ isEnglish ? 'Approved Students' : 'បានអនុញ្ញាតរួច' }}
              </div>
              <div class="text-2xl font-black text-slate-900 mt-0.5">
                {{ approvedCount }}
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Rejected Requests -->
        <div
          @click="selectedStatusFilter = 'rejected'"
          class="p-4 rounded-xl border transition cursor-pointer flex items-center justify-between"
          :class="[
            selectedStatusFilter === 'rejected'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
              : 'bg-slate-50/60 border-slate-200 hover:bg-rose-50/40 hover:border-rose-200'
          ]"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <XCircle class="w-5 h-5" />
            </div>
            <div>
              <div class="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                {{ isEnglish ? 'Rejected Requests' : 'បានបដិសេធ' }}
              </div>
              <div class="text-2xl font-black text-slate-900 mt-0.5">
                {{ rejectedCount }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Control Toolbar -->
    <div class="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
      <!-- Status Pills -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto text-xs font-semibold">
        <button
          @click="selectedStatusFilter = 'pending'"
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5',
            selectedStatusFilter === 'pending'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <Clock class="w-3.5 h-3.5 text-amber-500" />
          <span>{{ isEnglish ? 'Pending' : 'រង់ចាំ' }} ({{ pendingCount }})</span>
        </button>

        <button
          @click="selectedStatusFilter = 'approved'"
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5',
            selectedStatusFilter === 'approved'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
          <span>{{ isEnglish ? 'Approved' : 'អនុម័ត' }} ({{ approvedCount }})</span>
        </button>

        <button
          @click="selectedStatusFilter = 'rejected'"
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5',
            selectedStatusFilter === 'rejected'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <XCircle class="w-3.5 h-3.5 text-rose-500" />
          <span>{{ isEnglish ? 'Rejected' : 'បដិសេធ' }} ({{ rejectedCount }})</span>
        </button>

        <button
          @click="selectedStatusFilter = 'all'"
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg transition cursor-pointer',
            selectedStatusFilter === 'all'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <span>{{ isEnglish ? 'All' : 'ទាំងអស់' }} ({{ studentUsers.length }})</span>
        </button>
      </div>

      <!-- Search & Class Filter -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <!-- Class Filter -->
        <select
          v-model="selectedClassFilter"
          class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
        >
          <option value="all">{{ isEnglish ? 'All Classes' : 'គ្រប់ថ្នាក់' }}</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>

        <!-- Search Input -->
        <div class="relative flex-1 sm:w-64">
          <Search class="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="isEnglish ? 'Search student name or ID...' : 'ស្វែងរកឈ្មោះ ឬអត្តលេខ...'"
            class="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-slate-800"
          />
        </div>
      </div>
    </div>

    <!-- Student Registration Requests Table / List -->
    <div class="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
      <!-- Empty State -->
      <div
        v-if="filteredStudents.length === 0"
        class="text-center py-16 px-4"
      >
        <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <UserCheck class="w-7 h-7" />
        </div>
        <h3 class="text-sm font-bold text-slate-800">
          {{ isEnglish ? 'No registration requests found' : 'មិនមានសំណើចុះឈ្មោះក្នុងបញ្ជីនេះទេ' }}
        </h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {{ selectedStatusFilter === 'pending'
            ? (isEnglish ? 'Great job! There are currently no pending student approvals.' : 'ល្អណាស់! បច្ចុប្បន្នគ្មានសិស្សរង់ចាំការអនុម័តឡើយ។')
            : (isEnglish ? 'Try clearing your search or changing the filters.' : 'សូមសាកល្បងផ្លាស់ប្តូរតម្រង ឬពាក្យស្វែងរក។')
          }}
        </p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th class="py-3 px-4">Student</th>
              <th class="py-3 px-4">Assigned Class</th>
              <th class="py-3 px-4">Gender & DOB</th>
              <th class="py-3 px-4">Registered Date</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="student in filteredStudents"
              :key="student.id"
              class="hover:bg-slate-50/70 transition"
              :class="{ 'bg-amber-50/30': student.status === 'pending' }"
            >
              <!-- Student Info -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
                    :class="[
                      student.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      student.status === 'rejected' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      'bg-purple-100 text-purple-700 border border-purple-200'
                    ]"
                  >
                    {{ (student.name || 'S').slice(0, 1) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{{ student.name }}</span>
                    </div>
                    <div class="font-mono text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>{{ student.id || student.studentId }}</span>
                      <span v-if="student.email" class="text-slate-300">•</span>
                      <span v-if="student.email" class="truncate max-w-[140px]">{{ student.email }}</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Class & Teacher -->
              <td class="py-3 px-4">
                <div class="font-semibold text-slate-800 text-xs">
                  {{ student.className || student.classId || 'ថ្នាក់ទី ១២A' }}
                </div>
                <div class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <School class="w-3 h-3 text-slate-400" />
                  <span>{{ student.teacherName || 'លោកគ្រូ សុវណ្ណ' }}</span>
                </div>
              </td>

              <!-- Gender & DOB -->
              <td class="py-3 px-4">
                <div class="font-medium text-slate-700">
                  <span
                    class="px-2 py-0.5 rounded text-[11px] font-bold"
                    :class="student.gender === 'F' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
                  >
                    {{ student.gender === 'F' ? 'Female' : 'Male' }}
                  </span>
                </div>
                <div class="font-mono text-[11px] text-slate-400 mt-1">
                  {{ student.dob || '2008-01-01' }}
                </div>
              </td>

              <!-- Registered Date -->
              <td class="py-3 px-4 font-mono text-[11px] text-slate-500">
                <div class="flex items-center gap-1.5">
                  <Calendar class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ formatDate(student.createdAt) }}</span>
                </div>
              </td>

              <!-- Status Badge -->
              <td class="py-3 px-4">
                <span
                  v-if="student.status === 'pending'"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>{{ isEnglish ? 'Pending Approval' : 'រង់ចាំអនុម័ត' }}</span>
                </span>

                <span
                  v-else-if="student.status === 'rejected'"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>{{ isEnglish ? 'Rejected' : 'បានបដិសេធ' }}</span>
                </span>

                <span
                  v-else
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{{ isEnglish ? 'Approved' : 'បានអនុញ្ញាត' }}</span>
                </span>
              </td>

              <!-- Action Buttons -->
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <!-- Approve Button -->
                  <button
                    v-if="student.status === 'pending' || student.status === 'rejected'"
                    @click="handleApprove(student)"
                    :disabled="actionInProgressId === student.id"
                    type="button"
                    class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    :title="isEnglish ? 'Approve registration' : 'អនុញ្ញាតការចុះឈ្មោះ'"
                  >
                    <Check class="w-3.5 h-3.5" />
                    <span>{{ isEnglish ? 'Approve' : 'អនុញ្ញាត' }}</span>
                  </button>

                  <!-- Reject Button -->
                  <button
                    v-if="student.status === 'pending'"
                    @click="handleReject(student)"
                    :disabled="actionInProgressId === student.id"
                    type="button"
                    class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    :title="isEnglish ? 'Reject registration' : 'បដិសេធសំណើ'"
                  >
                    <X class="w-3.5 h-3.5" />
                    <span>{{ isEnglish ? 'Reject' : 'បដិសេធ' }}</span>
                  </button>

                  <!-- Delete Button -->
                  <button
                    @click="handleDelete(student)"
                    :disabled="actionInProgressId === student.id"
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                    :title="isEnglish ? 'Delete account' : 'លុបគណនី'"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

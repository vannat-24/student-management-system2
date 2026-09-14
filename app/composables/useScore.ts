// composables/useScore.ts
import type {
  RawStudent,
  ComputedStudent,
  ClassInfo,
  SchoolClass,
  SubjectScores,
  SubjectKey,
  StudentsApiResponse,
  TeacherProfile
} from '~/types'
import {
  computeStudentsGrades,
  calculateTotalScore,
  calculateAverageScore,
  calculateGradeLetter,
  getGradeBadgeColor
} from '~/utils/gradeCalculation'

const STORAGE_KEY = 'class_data_v6'

const DEFAULT_CLASSES: SchoolClass[] = [
  {
    id: 'CLS-12A',
    name: 'ថ្នាក់ទី ១២A (Class 12A)',
    teacherId: 'TEA-001',
    teacherName: 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
    academicYear: '2025-2026',
    room: 'បន្ទប់ 301',
    isLocked: false,
    month: 'តុលា (October)',
    gradeLevel: '12',
    track: 'science',
    subjectConfigs: [
      { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', coefficient: 2, enabled: true },
      { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', coefficient: 1.5, enabled: true },
      { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', coefficient: 1.5, enabled: true },
      { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', coefficient: 1.5, enabled: true },
      { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', coefficient: 1.5, enabled: true },
      { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', coefficient: 1, enabled: true }
    ]
  },
  {
    id: 'CLS-12B',
    name: 'ថ្នាក់ទី ១២B (Class 12B)',
    teacherId: 'TEA-002',
    teacherName: 'អ្នកគ្រូ ចិន្តា (Ms. Chenda)',
    academicYear: '2025-2026',
    room: 'បន្ទប់ 302',
    isLocked: false,
    month: 'តុលា (October)',
    gradeLevel: '12',
    track: 'social',
    subjectConfigs: [
      { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', coefficient: 2, enabled: true },
      { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', coefficient: 1.5, enabled: true },
      { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', coefficient: 1.5, enabled: true },
      { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', coefficient: 1, enabled: true },
      { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', coefficient: 1, enabled: true },
      { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', coefficient: 1, enabled: true }
    ]
  },
  {
    id: 'CLS-11A',
    name: 'ថ្នាក់ទី ១១A (Class 11A)',
    teacherId: 'TEA-003',
    teacherName: 'លោកគ្រូ វិសាល (Mr. Visal)',
    academicYear: '2025-2026',
    room: 'បន្ទប់ 201',
    isLocked: false,
    month: 'តុលា (October)',
    gradeLevel: '11',
    track: 'science',
    subjectConfigs: [
      { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', coefficient: 2, enabled: true },
      { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', coefficient: 1.5, enabled: true },
      { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', coefficient: 1.5, enabled: true },
      { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', coefficient: 1.5, enabled: true },
      { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', coefficient: 1.5, enabled: true },
      { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', coefficient: 1, enabled: true }
    ]
  },
  {
    id: 'CLS-11B',
    name: 'ថ្នាក់ទី ១១B (Class 11B)',
    teacherId: 'TEA-004',
    teacherName: 'អ្នកគ្រូ សុធារី (Ms. Sotheary)',
    academicYear: '2025-2026',
    room: 'បន្ទប់ 202',
    isLocked: false,
    month: 'តុលា (October)',
    gradeLevel: '11',
    track: 'social',
    subjectConfigs: [
      { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', coefficient: 2, enabled: true },
      { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', coefficient: 1.5, enabled: true },
      { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', coefficient: 1.5, enabled: true },
      { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', coefficient: 1, enabled: true },
      { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', coefficient: 1, enabled: true },
      { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', coefficient: 1, enabled: true }
    ]
  },
  {
    id: 'CLS-10A',
    name: 'ថ្នាក់ទី ១០A (Class 10A)',
    teacherId: 'TEA-005',
    teacherName: 'លោកគ្រូ រតនា (Mr. Rattana)',
    academicYear: '2025-2026',
    room: 'បន្ទប់ 101',
    isLocked: false,
    month: 'តុលា (October)',
    gradeLevel: '10',
    track: 'general',
    subjectConfigs: [
      { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', coefficient: 2, enabled: true },
      { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', coefficient: 2, enabled: true },
      { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', coefficient: 1, enabled: true },
      { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', coefficient: 1, enabled: true },
      { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', coefficient: 1, enabled: true },
      { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', coefficient: 1, enabled: true }
    ]
  },
  {
    id: 'CLS-10B',
    name: 'ថ្នាក់ទី ១០B (Class 10B)',
    teacherId: 'TEA-006',
    teacherName: 'អ្នកគ្រូ គន្ធា (Ms. Kunthea)',
    academicYear: '2025-2026',
    room: 'បន្ទប់ 102',
    isLocked: false,
    month: 'តុលា (October)',
    gradeLevel: '10',
    track: 'general',
    subjectConfigs: [
      { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', coefficient: 2, enabled: true },
      { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', coefficient: 2, enabled: true },
      { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', coefficient: 1, enabled: true },
      { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', coefficient: 1, enabled: true },
      { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', coefficient: 1, enabled: true },
      { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', coefficient: 1, enabled: true }
    ]
  }
]

const DEFAULT_TEACHERS: TeacherProfile[] = [
  {
    id: 'TEA-001',
    name: 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
    gender: 'M',
    email: 'sovann.math@school.edu.kh',
    phone: '012 345 601',
    specialty: 'គណិតវិទ្យា',
    specialtyEn: 'Mathematics',
    experienceYears: 10,
    education: 'បរិញ្ញាបត្រជាន់ខ្ពស់គណិតវិទ្យា',
    educationEn: 'Master of Math Education (RUPP)',
    homeroomClassId: 'CLS-12A',
    homeroomClassName: 'ថ្នាក់ទី ១២A (Class 12A)',
    teachingClasses: ['CLS-12A', 'CLS-11A', 'CLS-10A'],
    status: 'Active',
    room: 'បន្ទប់ 301'
  },
  {
    id: 'TEA-002',
    name: 'អ្នកគ្រូ ធីតា (Ms. Thida)',
    gender: 'F',
    email: 'thida.khmer@school.edu.kh',
    phone: '012 345 602',
    specialty: 'ភាសាខ្មែរ',
    specialtyEn: 'Khmer Literature',
    experienceYears: 8,
    education: 'បរិញ្ញាបត្រអក្សរសាស្ត្រខ្មែរ',
    educationEn: 'BA Khmer Literature (RUPP)',
    homeroomClassId: 'CLS-12B',
    homeroomClassName: 'ថ្នាក់ទី ១២B (Class 12B)',
    teachingClasses: ['CLS-12B', 'CLS-11B', 'CLS-10B'],
    status: 'Active',
    room: 'បន្ទប់ 302'
  },
  {
    id: 'TEA-003',
    name: 'អ្នកគ្រូ សោភា (Mrs. Sophea)',
    gender: 'F',
    email: 'sophea.phys@school.edu.kh',
    phone: '012 345 603',
    specialty: 'រូបវិទ្យា',
    specialtyEn: 'Physics',
    experienceYears: 7,
    education: 'បរិញ្ញាបត្ររូបវិទ្យា',
    educationEn: 'B.Ed Physics (NIE)',
    homeroomClassId: 'CLS-11A',
    homeroomClassName: 'ថ្នាក់ទី ១១A (Class 11A)',
    teachingClasses: ['CLS-11A', 'CLS-12A', 'CLS-10A'],
    status: 'Active',
    room: 'បន្ទប់ 201'
  },
  {
    id: 'TEA-004',
    name: 'លោកគ្រូ ដារ៉ា (Mr. Dara)',
    gender: 'M',
    email: 'dara.chem@school.edu.kh',
    phone: '012 345 604',
    specialty: 'គីមីវិទ្យា',
    specialtyEn: 'Chemistry',
    experienceYears: 9,
    education: 'បរិញ្ញាបត្រគីមីវិទ្យា',
    educationEn: 'BA Chemistry (RUPP)',
    homeroomClassId: 'CLS-11B',
    homeroomClassName: 'ថ្នាក់ទី ១១B (Class 11B)',
    teachingClasses: ['CLS-11B', 'CLS-12B', 'CLS-10B'],
    status: 'Active',
    room: 'បន្ទប់ 202'
  },
  {
    id: 'TEA-005',
    name: 'អ្នកគ្រូ ចិន្តា (Ms. Chinda)',
    gender: 'F',
    email: 'chinda.bio@school.edu.kh',
    phone: '012 345 605',
    specialty: 'ជីវវិទ្យា',
    specialtyEn: 'Biology',
    experienceYears: 6,
    education: 'បរិញ្ញាបត្រជីវវិទ្យា',
    educationEn: 'B.Ed Biology (NIE)',
    homeroomClassId: 'CLS-10A',
    homeroomClassName: 'ថ្នាក់ទី ១០A (Class 10A)',
    teachingClasses: ['CLS-10A', 'CLS-11A', 'CLS-12A'],
    status: 'Active',
    room: 'បន្ទប់ 101'
  },
  {
    id: 'TEA-006',
    name: 'លោកគ្រូ វិសាល (Mr. Visal)',
    gender: 'M',
    email: 'visal.eng@school.edu.kh',
    phone: '012 345 606',
    specialty: 'ភាសាអង់គ្លេស',
    specialtyEn: 'English Language',
    experienceYears: 5,
    education: 'បរិញ្ញាបត្រអប់រំភាសាអង់គ្លេស',
    educationEn: 'B.Ed TEFL (IFL)',
    homeroomClassId: 'CLS-10B',
    homeroomClassName: 'ថ្នាក់ទី ១០B (Class 10B)',
    teachingClasses: ['CLS-10B', 'CLS-11B', 'CLS-12B'],
    status: 'Active',
    room: 'បន្ទប់ 102'
  }
]

export const useScore = () => {
  // Global shared state
  const classes = useState<SchoolClass[]>('score_classes', () => [...DEFAULT_CLASSES])
  const teachers = useState<TeacherProfile[]>('score_teachers', () => [...DEFAULT_TEACHERS])
  const activeClassId = useState<string>('score_active_class_id', () => 'CLS-12A')
  const students = useState<RawStudent[]>('score_raw_students', () => [])
  const subjects = useState<any[]>('score_subjects', () => [])
  const announcements = useState<any[]>('score_announcements', () => [])
  const schedule = useState<any[]>('score_schedule', () => [])
  const attendanceLogs = useState<any[]>('score_attendance_logs', () => [])
  const isLoading = useState<boolean>('score_loading', () => false)
  const isInitialized = useState<boolean>('score_initialized', () => false)
  const lastSavedTime = useState<string | null>('score_last_saved', () => null)
  const errorMessage = useState<string | null>('score_error_message', () => null)

  /**
   * Currently active class object
   */
  const activeClass = computed<SchoolClass>(() => {
    const found = classes.value.find((c) => c.id === activeClassId.value)
    return (
      found ||
      classes.value[0] || {
        id: 'CLS-12A',
        name: 'ថ្នាក់ទី ១២A (Class 12A)',
        teacherId: 'TEA-001',
        teacherName: 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
        academicYear: '2025-2026',
        room: 'បន្ទប់ 301',
        isLocked: false,
        month: 'តុលា (October)'
      }
    )
  })

  /**
   * Compatibility wrapper for single-class views
   */
  const classInfo = computed<ClassInfo>({
    get: () => ({
      className: activeClass.value.name,
      academicYear: activeClass.value.academicYear || '2025-2026',
      homeroomTeacher: activeClass.value.teacherName,
      isLocked: !!activeClass.value.isLocked,
      month: activeClass.value.month || 'តុលា (October)'
    }),
    set: (val: ClassInfo) => {
      const idx = classes.value.findIndex((c) => c.id === activeClassId.value)
      if (idx !== -1) {
        classes.value[idx].name = val.className
        classes.value[idx].academicYear = val.academicYear
        classes.value[idx].teacherName = val.homeroomTeacher
        classes.value[idx].isLocked = val.isLocked
        classes.value[idx].month = val.month
        saveToStorage()
      }
    }
  })

  /**
   * Save current state into browser localStorage
   */
  const saveToStorage = () => {
    if (process.client) {
      try {
        const payload = {
          classes: classes.value,
          activeClassId: activeClassId.value,
          students: students.value,
          subjects: subjects.value,
          announcements: announcements.value,
          schedule: schedule.value,
          attendanceLogs: attendanceLogs.value,
          savedAt: new Date().toISOString()
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        lastSavedTime.value = new Date().toLocaleTimeString('km-KH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (err) {
        console.error('Error saving scores to localStorage:', err)
      }
    }
  }

  /**
   * Fetch live data from /api/students
   */
  const fetchInitialData = async (forceRemote: boolean = false) => {
    if (process.client && !isInitialized.value && !forceRemote) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed.classes) && parsed.classes.length > 0) {
            classes.value = parsed.classes
          }
          if (parsed.activeClassId) {
            activeClassId.value = parsed.activeClassId
          }
          if (Array.isArray(parsed.subjects)) {
            subjects.value = parsed.subjects
          }
          if (Array.isArray(parsed.announcements)) {
            announcements.value = parsed.announcements
          }
          if (Array.isArray(parsed.schedule)) {
            schedule.value = parsed.schedule
          }
          if (Array.isArray(parsed.attendanceLogs)) {
            attendanceLogs.value = parsed.attendanceLogs
          }
          if (Array.isArray(parsed.students) && parsed.students.length > 0) {
            students.value = parsed.students
            isInitialized.value = true
            return
          }
        }
      } catch (err) {
        console.warn('Could not parse cached class data', err)
      }
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await $fetch<StudentsApiResponse>('/api/students')
      if (response && response.success && Array.isArray(response.students)) {
        if (Array.isArray(response.classes) && response.classes.length > 0) {
          classes.value = response.classes
        }
        if (Array.isArray(response.subjects)) {
          subjects.value = response.subjects
        }
        if (Array.isArray(response.announcements)) {
          announcements.value = response.announcements
        }
        if (Array.isArray(response.schedule)) {
          schedule.value = response.schedule
        }
        if (Array.isArray(response.attendanceLogs)) {
          attendanceLogs.value = response.attendanceLogs
        }
        students.value = response.students
        isInitialized.value = true
        saveToStorage()
      }
    } catch (err: any) {
      console.error('Failed to fetch students from /api/students:', err)
      errorMessage.value = 'មិនអាចទាញទិន្នន័យពី Server បានទេ។ សូមព្យាយាមម្តងទៀត។'
    } finally {
      isLoading.value = false
    }
  }

  if (process.client && !isInitialized.value) {
    fetchInitialData()
  }

  /**
   * All computed students in the school
   */
  const allComputedStudents = computed<ComputedStudent[]>(() => {
    return computeStudentsGrades(students.value)
  })

  /**
   * Computed students for currently active class
   */
  const computedStudents = computed<ComputedStudent[]>(() => {
    const list = students.value.filter(
      (s) => !s.classId || s.classId === activeClassId.value
    )
    return computeStudentsGrades(list, activeClass.value?.subjectConfigs)
  })

  /**
   * Get calculated student list for a specific class ID
   */
  const getStudentsForClass = (classId: string): ComputedStudent[] => {
    const cls = classes.value.find((c) => c.id === classId)
    const list = students.value.filter((s) => s.classId === classId)
    return computeStudentsGrades(list, cls?.subjectConfigs)
  }

  /**
   * Check if current active class is locked
   */
  const isLocked = computed(() => !!activeClass.value.isLocked)

  /**
   * Calculate detailed statistics for any specific class
   */
  const getClassStats = (classId: string) => {
    const list = getStudentsForClass(classId)
    const totalStudents = list.length

    if (totalStudents === 0) {
      return {
        totalStudents: 0,
        maleCount: 0,
        femaleCount: 0,
        classAverage: 0,
        highestScore: 0,
        lowestScore: 0,
        passedCount: 0,
        passRate: 0,
        topStudent: null as ComputedStudent | null,
        gradeCounts: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
      }
    }

    const maleCount = list.filter((s) => s.gender === 'M').length
    const femaleCount = list.filter((s) => s.gender === 'F').length
    const totalAverageSum = list.reduce((sum, s) => sum + s.average, 0)
    const classAverage = Number((totalAverageSum / totalStudents).toFixed(2))

    const averages = list.map((s) => s.average)
    const highestScore = Math.max(...averages)
    const lowestScore = Math.min(...averages)

    const passedCount = list.filter((s) => s.grade !== 'F').length
    const passRate = Number(((passedCount / totalStudents) * 100).toFixed(1))

    const topStudent = list.find((s) => s.rank === 1) || list[0] || null

    const gradeCounts = {
      A: list.filter((s) => s.grade === 'A').length,
      B: list.filter((s) => s.grade === 'B').length,
      C: list.filter((s) => s.grade === 'C').length,
      D: list.filter((s) => s.grade === 'D').length,
      E: list.filter((s) => s.grade === 'E').length,
      F: list.filter((s) => s.grade === 'F').length
    }

    return {
      totalStudents,
      maleCount,
      femaleCount,
      classAverage,
      highestScore,
      lowestScore,
      passedCount,
      passRate,
      topStudent,
      gradeCounts
    }
  }

  /**
   * General class stats for the active class
   */
  const classStats = computed(() => {
    return getClassStats(activeClassId.value)
  })

  /**
   * Overall school-wide KPI metrics across all classes
   */
  const overallStats = computed(() => {
    const totalClasses = classes.value.length
    const totalStudents = students.value.length
    const computedAll = computeStudentsGrades(students.value)

    if (totalStudents === 0) {
      return {
        totalClasses,
        totalStudents: 0,
        overallAverage: 0,
        passRate: 0,
        totalTeachers: 0,
        topClass: null as SchoolClass | null
      }
    }

    const totalAverageSum = computedAll.reduce((sum, s) => sum + s.average, 0)
    const overallAverage = Number((totalAverageSum / totalStudents).toFixed(2))
    const passedCount = computedAll.filter((s) => s.grade !== 'F').length
    const passRate = Number(((passedCount / totalStudents) * 100).toFixed(1))

    // Unique teacher count
    const uniqueTeachers = new Set(classes.value.map((c) => c.teacherName).filter(Boolean))

    // Find best performing class
    let bestClass: SchoolClass | null = null
    let maxAvg = -1

    for (const cls of classes.value) {
      const stats = getClassStats(cls.id)
      if (stats.totalStudents > 0 && stats.classAverage > maxAvg) {
        maxAvg = stats.classAverage
        bestClass = cls
      }
    }

    return {
      totalClasses,
      totalStudents,
      overallAverage,
      passRate,
      totalTeachers: uniqueTeachers.size,
      topClass: bestClass || classes.value[0] || null
    }
  })

  /**
   * Set active class
   */
  const setActiveClass = (classId: string) => {
    if (classes.value.some((c) => c.id === classId)) {
      activeClassId.value = classId
      saveToStorage()
    }
  }

  /**
   * Add a new class (Admin)
   */
  const addClass = (newClass: Partial<SchoolClass> & { name: string }): SchoolClass => {
    const nextId =
      newClass.id ||
      `CLS-${String(classes.value.length + 1).padStart(2, '0')}`

    const created: SchoolClass = {
      id: nextId,
      name: newClass.name.trim(),
      teacherId: newClass.teacherId || `TEA-${String(classes.value.length + 1).padStart(3, '0')}`,
      teacherName: newClass.teacherName || 'លោកគ្រូ/អ្នកគ្រូ ថ្មី',
      academicYear: newClass.academicYear || '2025-2026',
      room: newClass.room || `បន្ទប់ ${100 + classes.value.length + 1}`,
      isLocked: !!newClass.isLocked,
      month: newClass.month || 'តុលា (October)',
      gradeLevel: newClass.gradeLevel || '10',
      track: newClass.track || 'general',
      subjectConfigs: newClass.subjectConfigs || [
        { key: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', coefficient: 2, enabled: true },
        { key: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', coefficient: 2, enabled: true },
        { key: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', coefficient: 1, enabled: true },
        { key: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', coefficient: 1, enabled: true },
        { key: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', coefficient: 1, enabled: true },
        { key: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English Language', coefficient: 1, enabled: true }
      ]
    }

    classes.value.push(created)
    saveToStorage()
    return created
  }

  /**
   * Update existing class details
   */
  const updateClass = (updatedClass: SchoolClass) => {
    const idx = classes.value.findIndex((c) => c.id === updatedClass.id)
    if (idx !== -1) {
      classes.value[idx] = {
        ...classes.value[idx],
        ...updatedClass
      }

      // Also update student records with new class name if changed
      students.value.forEach((s) => {
        if (s.classId === updatedClass.id) {
          s.className = updatedClass.name
          s.teacherId = updatedClass.teacherId
          s.teacherName = updatedClass.teacherName
        }
      })

      saveToStorage()
      return true
    }
    return false
  }

  /**
   * Save daily attendance records for a class
   */
  const saveClassAttendance = (
    classId: string,
    date: string,
    records: Array<{ studentId: string; status: 'Present' | 'Late' | 'Excused' | 'Absent'; remarks?: string }>
  ) => {
    const cls = classes.value.find((c) => c.id === classId)
    const newLogs = records.map((r, idx) => {
      const st = students.value.find((s) => s.id === r.studentId)
      return {
        id: Date.now() + idx,
        date,
        classId,
        className: cls?.name || '',
        studentId: r.studentId,
        studentName: st?.name || '',
        subject: 'វត្តមានប្រចាំថ្ងៃ (Daily Attendance)',
        time: '07:00 - 11:30',
        status: r.status,
        remarks: r.remarks || ''
      }
    })

    attendanceLogs.value = [...newLogs, ...(attendanceLogs.value || [])]

    // Update each student's attendance statistics
    records.forEach((rec) => {
      const st = students.value.find((s) => s.id === rec.studentId)
      if (st) {
        if (!st.attendance) {
          st.attendance = { rate: 95, present: 48, absent: 1, late: 1, total: 50 }
        }
        st.attendance.total += 1
        if (rec.status === 'Present') {
          st.attendance.present += 1
        } else if (rec.status === 'Late') {
          st.attendance.late += 1
        } else if (rec.status === 'Absent' || rec.status === 'Excused') {
          st.attendance.absent += 1
        }
        st.attendance.rate = Number(
          (((st.attendance.present + st.attendance.late * 0.5) / st.attendance.total) * 100).toFixed(1)
        )
      }
    })

    saveToStorage()
    return true
  }

  /**
   * Delete a class and optionally its students
   */
  const deleteClass = (classId: string): boolean => {
    if (classes.value.length <= 1) {
      console.warn('Cannot delete the only remaining class.')
      return false
    }

    classes.value = classes.value.filter((c) => c.id !== classId)
    // Clean up or reassign students
    students.value = students.value.filter((s) => s.classId !== classId)

    if (activeClassId.value === classId) {
      activeClassId.value = classes.value[0]?.id || 'CLS-12A'
    }

    saveToStorage()
    return true
  }

  /**
   * Toggle lock state for a specific class
   */
  const toggleClassLock = (classId: string, forcedState?: boolean) => {
    const cls = classes.value.find((c) => c.id === classId)
    if (cls) {
      cls.isLocked = typeof forcedState === 'boolean' ? forcedState : !cls.isLocked
      saveToStorage()
      return cls.isLocked
    }
    return false
  }

  /**
   * Lock all classes in the system
   */
  const lockAllClasses = () => {
    classes.value.forEach((c) => {
      c.isLocked = true
    })
    saveToStorage()
  }

  /**
   * Unlock all classes in the system
   */
  const unlockAllClasses = () => {
    classes.value.forEach((c) => {
      c.isLocked = false
    })
    saveToStorage()
  }

  /**
   * Update student mark
   */
  const updateStudentScore = (
    studentId: string,
    subject: SubjectKey,
    rawScore: number | string
  ) => {
    const student = students.value.find((s) => s.id === studentId)
    if (!student) return false

    // Check lock state of student's class
    const cls = classes.value.find((c) => c.id === (student.classId || activeClassId.value))
    if (cls?.isLocked) {
      console.warn('Class scores are locked. Modifications are prohibited.')
      return false
    }

    const num = Math.min(100, Math.max(0, Number(rawScore) || 0))
    student.scores[subject] = num
    saveToStorage()
    return true
  }

  /**
   * Update student data
   */
  const updateStudent = (updatedStudent: Partial<RawStudent> & { id: string }) => {
    const index = students.value.findIndex((s) => s.id === updatedStudent.id)
    if (index !== -1) {
      const currentClassId = students.value[index].classId || activeClassId.value
      const cls = classes.value.find((c) => c.id === currentClassId)
      if (cls?.isLocked) {
        console.warn('Class scores are locked. Modifications are prohibited.')
        return false
      }

      students.value[index] = {
        ...students.value[index],
        ...updatedStudent,
        scores: {
          ...students.value[index].scores,
          ...(updatedStudent.scores || {})
        }
      }
      saveToStorage()
      return true
    }
    return false
  }

  /**
   * Batch update scores for a class
   */
  const batchUpdateScores = (roster: RawStudent[]) => {
    roster.forEach((incoming) => {
      const idx = students.value.findIndex((s) => s.id === incoming.id)
      if (idx !== -1) {
        students.value[idx].scores = {
          math: Math.min(100, Math.max(0, Number(incoming.scores.math) || 0)),
          physics: Math.min(100, Math.max(0, Number(incoming.scores.physics) || 0)),
          chemistry: Math.min(100, Math.max(0, Number(incoming.scores.chemistry) || 0)),
          biology: Math.min(100, Math.max(0, Number(incoming.scores.biology) || 0)),
          khmer: Math.min(100, Math.max(0, Number(incoming.scores.khmer) || 0)),
          english: Math.min(100, Math.max(0, Number(incoming.scores.english) || 0))
        }
      }
    })
    saveToStorage()
    return true
  }

  /**
   * Add a new student
   */
  const addStudent = (
    newStudent: Omit<RawStudent, 'id'> & { id?: string; targetClassId?: string }
  ): RawStudent => {
    const targetClassId = newStudent.targetClassId || newStudent.classId || activeClassId.value
    const targetClass = classes.value.find((c) => c.id === targetClassId) || activeClass.value

    const nextId =
      newStudent.id ||
      `STU-${String(students.value.length + 1).padStart(3, '0')}`

    const studentToAdd: RawStudent = {
      id: nextId,
      name: newStudent.name.trim(),
      gender: newStudent.gender || 'M',
      dob: newStudent.dob || '2008-01-01',
      classId: targetClass.id,
      className: targetClass.name,
      teacherId: targetClass.teacherId,
      teacherName: targetClass.teacherName,
      scores: {
        math: Number(newStudent.scores?.math) || 0,
        physics: Number(newStudent.scores?.physics) || 0,
        chemistry: Number(newStudent.scores?.chemistry) || 0,
        biology: Number(newStudent.scores?.biology) || 0,
        khmer: Number(newStudent.scores?.khmer) || 0,
        english: Number(newStudent.scores?.english) || 0
      },
      remarks: newStudent.remarks || 'សិស្សទើបចូលថ្មី'
    }

    students.value.push(studentToAdd)
    saveToStorage()
    return studentToAdd
  }

  /**
   * Remove a student from roster
   */
  const removeStudent = (studentId: string): boolean => {
    const initialLen = students.value.length
    students.value = students.value.filter((s) => s.id !== studentId)
    const removed = students.value.length < initialLen
    if (removed) {
      saveToStorage()
    }
    return removed
  }

  /**
   * Toggle lock for active class
   */
  const toggleLock = (forcedState?: boolean) => {
    return toggleClassLock(activeClassId.value, forcedState)
  }

  /**
   * Update active class metadata
   */
  const updateClassInfo = (info: Partial<ClassInfo>) => {
    const idx = classes.value.findIndex((c) => c.id === activeClassId.value)
    if (idx !== -1) {
      if (info.className) classes.value[idx].name = info.className
      if (info.academicYear) classes.value[idx].academicYear = info.academicYear
      if (info.homeroomTeacher) classes.value[idx].teacherName = info.homeroomTeacher
      if (info.month) classes.value[idx].month = info.month
      if (typeof info.isLocked === 'boolean') classes.value[idx].isLocked = info.isLocked
      saveToStorage()
    }
  }

  /**
   * Reset database back to default seed data
   */
  const resetToDefault = async () => {
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
    classes.value = [...DEFAULT_CLASSES]
    activeClassId.value = 'CLS-12A'
    await fetchInitialData(true)
  }

  /**
   * Get single computed student by ID
   */
  const getStudentById = (id: string): ComputedStudent | undefined => {
    return allComputedStudents.value.find((s) => s.id === id)
  }

  /**
   * Current student profile based on authenticated user or default Siv Vannat
   */
  const currentStudent = computed<RawStudent | null>(() => {
    const { user } = useAuth()
    if (user.value) {
      const match = students.value.find((s) => s.id === user.value?.id || s.id === user.value?.studentId)
      if (match) return match
    }
    const defaultStudent = students.value.find((s) => s.id === 'ST-2026-024')
    return defaultStudent || students.value[0] || null
  })

  /**
   * Teacher Helpers
   */
  const getTeacherById = (id: string): TeacherProfile | undefined => {
    return teachers.value.find((t) => t.id === id)
  }

  const getClassesForTeacher = (teacherId: string): SchoolClass[] => {
    const teacher = getTeacherById(teacherId)
    if (!teacher) {
      return classes.value.filter((c) => c.teacherId === teacherId)
    }
    return classes.value.filter(
      (c) =>
        c.teacherId === teacherId ||
        (teacher.teachingClasses && teacher.teachingClasses.includes(c.id))
    )
  }

  const getTeacherStats = (teacherId: string) => {
    const teacherClasses = getClassesForTeacher(teacherId)
    let totalStudents = 0
    let totalAverageSum = 0
    let totalPassed = 0

    teacherClasses.forEach((cls) => {
      const stats = getClassStats(cls.id)
      totalStudents += stats.totalStudents
      totalAverageSum += stats.classAverage * stats.totalStudents
      totalPassed += stats.passedCount
    })

    const overallAvg = totalStudents > 0 ? Number((totalAverageSum / totalStudents).toFixed(1)) : 0
    const overallPassRate = totalStudents > 0 ? Math.round((totalPassed / totalStudents) * 100) : 0

    return {
      classesCount: teacherClasses.length,
      classes: teacherClasses,
      totalStudents,
      overallAvg,
      overallPassRate
    }
  }

  const addAnnouncement = (data: { title: string; content: string; target?: string; priority?: string }) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    const dateStr = `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}, ${now.getFullYear()}`
    const newAnn = {
      id: Date.now(),
      title: data.title,
      content: data.content,
      target: data.target || 'all',
      priority: data.priority || 'normal',
      date: dateStr
    }
    announcements.value.unshift(newAnn)
    saveToStorage()
    return newAnn
  }

  const updateAnnouncement = (id: string | number, data: Partial<{ title: string; content: string; target?: string; priority?: string }>) => {
    const idx = announcements.value.findIndex((a) => String(a.id) === String(id))
    if (idx !== -1) {
      announcements.value[idx] = { ...announcements.value[idx], ...data }
      saveToStorage()
    }
  }

  const deleteAnnouncement = (id: string | number) => {
    announcements.value = announcements.value.filter((a) => String(a.id) !== String(id))
    saveToStorage()
  }

  return {
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    teachers,
    getTeacherById,
    getClassesForTeacher,
    getTeacherStats,
    classes,
    activeClassId,
    activeClass,
    classInfo,
    students,
    subjects,
    announcements,
    schedule,
    attendanceLogs,
    currentStudent,
    computedStudents,
    allComputedStudents,
    classStats,
    overallStats,
    isLocked,
    isLoading,
    isInitialized,
    lastSavedTime,
    errorMessage,
    fetchInitialData,
    saveToStorage,
    getStudentsForClass,
    getClassStats,
    setActiveClass,
    addClass,
    updateClass,
    deleteClass,
    toggleClassLock,
    lockAllClasses,
    unlockAllClasses,
    updateStudentScore,
    updateStudent,
    batchUpdateScores,
    addStudent,
    removeStudent,
    toggleLock,
    updateClassInfo,
    resetToDefault,
    saveClassAttendance,
    getStudentById,
    getGradeBadgeColor
  }
}
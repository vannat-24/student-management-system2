// composables/useSchedule.ts
import type { DayOfWeek, ScheduleSlot, TimetableEntry, TeacherProfile, SchoolClass } from '~/types'

export interface DayScheduleView {
  day: DayOfWeek
  labelKm: string
  labelEn: string
  shortKm: string
  shortEn: string
  slots: TimetableEntry[]
}

export interface TeacherDayScheduleView {
  day: DayOfWeek
  labelKm: string
  labelEn: string
  shortKm: string
  shortEn: string
  slots: Array<{
    slotNumber: number
    time: string
    periodNameKm: string
    periodNameEn: string
    isFree: boolean
    classId?: string
    className?: string
    subjectKm?: string
    subjectEn?: string
    room?: string
  }>
}

export const useSchedule = () => {
  const { classes, teachers } = useScore()

  // 1. សប្តាហ៍សិក្សាពីថ្ងៃចន្ទ ដល់ សៅរ៍ (Monday to Saturday)
  const weekDays: Array<{
    key: DayOfWeek
    labelKm: string
    labelEn: string
    shortKm: string
    shortEn: string
  }> = [
    { key: 'Monday', labelKm: 'ថ្ងៃចន្ទ', labelEn: 'Monday', shortKm: 'ចន្ទ', shortEn: 'Mon' },
    { key: 'Tuesday', labelKm: 'ថ្ងៃអង្គារ', labelEn: 'Tuesday', shortKm: 'អង្គារ', shortEn: 'Tue' },
    { key: 'Wednesday', labelKm: 'ថ្ងៃពុធ', labelEn: 'Wednesday', shortKm: 'ពុធ', shortEn: 'Wed' },
    { key: 'Thursday', labelKm: 'ថ្ងៃព្រហស្បតិ៍', labelEn: 'Thursday', shortKm: 'ព្រហស្បតិ៍', shortEn: 'Thu' },
    { key: 'Friday', labelKm: 'ថ្ងៃសុក្រ', labelEn: 'Friday', shortKm: 'សុក្រ', shortEn: 'Fri' },
    { key: 'Saturday', labelKm: 'ថ្ងៃសៅរ៍', labelEn: 'Saturday', shortKm: 'សៅរ៍', shortEn: 'Sat' }
  ]

  // 2. ម៉ោងសិក្សាស្តង់ដារ (Standard Time Slots - 4 ម៉ោងក្នុងមួយថ្ងៃ)
  const timeSlots: ScheduleSlot[] = [
    { slotNumber: 1, time: '07:00 - 08:30', periodNameKm: 'ម៉ោងទី ១', periodEn: 'Period 1' },
    { slotNumber: 2, time: '08:45 - 10:15', periodNameKm: 'ម៉ោងទី ២', periodEn: 'Period 2' },
    { slotNumber: 3, time: '10:30 - 12:00', periodNameKm: 'ម៉ោងទី ៣', periodEn: 'Period 3' },
    { slotNumber: 4, time: '13:30 - 15:00', periodNameKm: 'ម៉ោងទី ៤', periodEn: 'Period 4' }
  ]

  // 3. កាលវិភាគពេញលេញ (Complete Timetable Dataset)
  const rawTimetable = useState<TimetableEntry[]>('app_timetable_entries', () => [
    // ---------------- CLS-12A (ថ្នាក់ទី ១២A) ----------------
    // Monday
    { id: '12A-M-1', day: 'Monday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-M-2', day: 'Monday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-M-3', day: 'Monday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-M-4', day: 'Monday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 301', isFree: true },
    // Tuesday
    { id: '12A-T-1', day: 'Tuesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-T-2', day: 'Tuesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-T-3', day: 'Tuesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-T-4', day: 'Tuesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 301', isFree: false },
    // Wednesday
    { id: '12A-W-1', day: 'Wednesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-W-2', day: 'Wednesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-W-3', day: 'Wednesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 301', isFree: true },
    { id: '12A-W-4', day: 'Wednesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 301', isFree: true },
    // Thursday
    { id: '12A-TH-1', day: 'Thursday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-TH-2', day: 'Thursday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-TH-3', day: 'Thursday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-TH-4', day: 'Thursday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 301', isFree: true },
    // Friday
    { id: '12A-F-1', day: 'Friday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-F-2', day: 'Friday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-F-3', day: 'Friday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-F-4', day: 'Friday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 301', isFree: true },
    // Saturday
    { id: '12A-S-1', day: 'Saturday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-S-2', day: 'Saturday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 301', isFree: false },
    { id: '12A-S-3', day: 'Saturday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 301', isFree: true },
    { id: '12A-S-4', day: 'Saturday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12A', className: 'ថ្នាក់ទី ១២A (Class 12A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 301', isFree: true },

    // ---------------- CLS-12B (ថ្នាក់ទី ១២B) ----------------
    // Monday
    { id: '12B-M-1', day: 'Monday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-M-2', day: 'Monday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-M-3', day: 'Monday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-M-4', day: 'Monday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 302', isFree: true },
    // Tuesday
    { id: '12B-T-1', day: 'Tuesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-T-2', day: 'Tuesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-T-3', day: 'Tuesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-T-4', day: 'Tuesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 302', isFree: true },
    // Wednesday
    { id: '12B-W-1', day: 'Wednesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-W-2', day: 'Wednesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-W-3', day: 'Wednesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-W-4', day: 'Wednesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 302', isFree: true },
    // Thursday
    { id: '12B-TH-1', day: 'Thursday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-TH-2', day: 'Thursday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-TH-3', day: 'Thursday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 302', isFree: true },
    { id: '12B-TH-4', day: 'Thursday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 302', isFree: true },
    // Friday
    { id: '12B-F-1', day: 'Friday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-F-2', day: 'Friday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-F-3', day: 'Friday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-F-4', day: 'Friday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 302', isFree: true },
    // Saturday
    { id: '12B-S-1', day: 'Saturday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-S-2', day: 'Saturday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 302', isFree: false },
    { id: '12B-S-3', day: 'Saturday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 302', isFree: true },
    { id: '12B-S-4', day: 'Saturday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-12B', className: 'ថ្នាក់ទី ១២B (Class 12B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 302', isFree: true },

    // ---------------- CLS-11A (ថ្នាក់ទី ១១A) ----------------
    // Monday
    { id: '11A-M-1', day: 'Monday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-M-2', day: 'Monday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-M-3', day: 'Monday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-M-4', day: 'Monday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 201', isFree: true },
    // Tuesday
    { id: '11A-T-1', day: 'Tuesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-T-2', day: 'Tuesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-T-3', day: 'Tuesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-T-4', day: 'Tuesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 201', isFree: true },
    // Wednesday
    { id: '11A-W-1', day: 'Wednesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-W-2', day: 'Wednesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-W-3', day: 'Wednesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-W-4', day: 'Wednesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 201', isFree: true },
    // Thursday
    { id: '11A-TH-1', day: 'Thursday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-TH-2', day: 'Thursday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-TH-3', day: 'Thursday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-TH-4', day: 'Thursday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 201', isFree: true },
    // Friday
    { id: '11A-F-1', day: 'Friday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-F-2', day: 'Friday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 201', isFree: true },
    { id: '11A-F-3', day: 'Friday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-F-4', day: 'Friday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 201', isFree: true },
    // Saturday
    { id: '11A-S-1', day: 'Saturday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-S-2', day: 'Saturday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 201', isFree: false },
    { id: '11A-S-3', day: 'Saturday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 201', isFree: true },
    { id: '11A-S-4', day: 'Saturday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11A', className: 'ថ្នាក់ទី ១១A (Class 11A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 201', isFree: true },

    // ---------------- CLS-11B (ថ្នាក់ទី ១១B) ----------------
    // Monday
    { id: '11B-M-1', day: 'Monday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-M-2', day: 'Monday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-M-3', day: 'Monday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-M-4', day: 'Monday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 202', isFree: true },
    // Tuesday
    { id: '11B-T-1', day: 'Tuesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-T-2', day: 'Tuesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-T-3', day: 'Tuesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 202', isFree: true },
    { id: '11B-T-4', day: 'Tuesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 202', isFree: true },
    // Wednesday
    { id: '11B-W-1', day: 'Wednesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-W-2', day: 'Wednesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-W-3', day: 'Wednesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-W-4', day: 'Wednesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 202', isFree: true },
    // Thursday
    { id: '11B-TH-1', day: 'Thursday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-TH-2', day: 'Thursday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-TH-3', day: 'Thursday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-TH-4', day: 'Thursday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 202', isFree: true },
    // Friday
    { id: '11B-F-1', day: 'Friday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-F-2', day: 'Friday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-F-3', day: 'Friday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-F-4', day: 'Friday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 202', isFree: true },
    // Saturday
    { id: '11B-S-1', day: 'Saturday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 202', isFree: false },
    { id: '11B-S-2', day: 'Saturday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 202', isFree: true },
    { id: '11B-S-3', day: 'Saturday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 202', isFree: true },
    { id: '11B-S-4', day: 'Saturday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-11B', className: 'ថ្នាក់ទី ១១B (Class 11B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 202', isFree: true },

    // ---------------- CLS-10A (ថ្នាក់ទី ១០A) ----------------
    // Monday
    { id: '10A-M-1', day: 'Monday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-M-2', day: 'Monday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-M-3', day: 'Monday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 101', isFree: true },
    { id: '10A-M-4', day: 'Monday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 101', isFree: true },
    // Tuesday
    { id: '10A-T-1', day: 'Tuesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-T-2', day: 'Tuesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-T-3', day: 'Tuesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-T-4', day: 'Tuesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 101', isFree: true },
    // Wednesday
    { id: '10A-W-1', day: 'Wednesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-W-2', day: 'Wednesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-W-3', day: 'Wednesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-W-4', day: 'Wednesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 101', isFree: true },
    // Thursday
    { id: '10A-TH-1', day: 'Thursday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-TH-2', day: 'Thursday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-TH-3', day: 'Thursday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-TH-4', day: 'Thursday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 101', isFree: true },
    // Friday
    { id: '10A-F-1', day: 'Friday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-F-2', day: 'Friday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-F-3', day: 'Friday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 101', isFree: true },
    { id: '10A-F-4', day: 'Friday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 101', isFree: true },
    // Saturday
    { id: '10A-S-1', day: 'Saturday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-S-2', day: 'Saturday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 101', isFree: false },
    { id: '10A-S-3', day: 'Saturday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 101', isFree: true },
    { id: '10A-S-4', day: 'Saturday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10A', className: 'ថ្នាក់ទី ១០A (Class 10A)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 101', isFree: true },

    // ---------------- CLS-10B (ថ្នាក់ទី ១០B) ----------------
    // Monday
    { id: '10B-M-1', day: 'Monday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-M-2', day: 'Monday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-M-3', day: 'Monday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 102', isFree: true },
    { id: '10B-M-4', day: 'Monday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 102', isFree: true },
    // Tuesday
    { id: '10B-T-1', day: 'Tuesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-T-2', day: 'Tuesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-T-3', day: 'Tuesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-T-4', day: 'Tuesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 102', isFree: true },
    // Wednesday
    { id: '10B-W-1', day: 'Wednesday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-W-2', day: 'Wednesday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-W-3', day: 'Wednesday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-W-4', day: 'Wednesday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 102', isFree: true },
    // Thursday
    { id: '10B-TH-1', day: 'Thursday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-TH-2', day: 'Thursday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'chemistry', subjectKm: 'គីមីវិទ្យា', subjectEn: 'Chemistry', teacherId: 'TEA-004', teacherName: 'លោកគ្រូ ដារ៉ា', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-TH-3', day: 'Thursday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-TH-4', day: 'Thursday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 102', isFree: true },
    // Friday
    { id: '10B-F-1', day: 'Friday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'physics', subjectKm: 'រូបវិទ្យា', subjectEn: 'Physics', teacherId: 'TEA-003', teacherName: 'អ្នកគ្រូ សោភា', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-F-2', day: 'Friday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'math', subjectKm: 'គណិតវិទ្យា', subjectEn: 'Mathematics', teacherId: 'TEA-001', teacherName: 'លោកគ្រូ សុវណ្ណ', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-F-3', day: 'Friday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'biology', subjectKm: 'ជីវវិទ្យា', subjectEn: 'Biology', teacherId: 'TEA-005', teacherName: 'អ្នកគ្រូ ចិន្តា', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-F-4', day: 'Friday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 102', isFree: true },
    // Saturday
    { id: '10B-S-1', day: 'Saturday', slotNumber: 1, time: '07:00 - 08:30', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'khmer', subjectKm: 'ភាសាខ្មែរ', subjectEn: 'Khmer Literature', teacherId: 'TEA-002', teacherName: 'អ្នកគ្រូ ធីតា', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-S-2', day: 'Saturday', slotNumber: 2, time: '08:45 - 10:15', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'english', subjectKm: 'ភាសាអង់គ្លេស', subjectEn: 'English Language', teacherId: 'TEA-006', teacherName: 'លោកគ្រូ វិសាល', room: 'បន្ទប់ 102', isFree: false },
    { id: '10B-S-3', day: 'Saturday', slotNumber: 3, time: '10:30 - 12:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 102', isFree: true },
    { id: '10B-S-4', day: 'Saturday', slotNumber: 4, time: '13:30 - 15:00', classId: 'CLS-10B', className: 'ថ្នាក់ទី ១០B (Class 10B)', subjectKey: 'free', subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា', subjectEn: 'Free Period / Self-Study', room: 'បន្ទប់ 102', isFree: true }
  ])

  /**
   * 4. ទទួលបានកាលវិភាគពេញលេញនៃថ្នាក់មួយ (Class Schedule by Day)
   * ក្នុងនោះមាន ៦ ថ្ងៃ (ចន្ទ ដល់ សៅរ៍) ហើយថ្ងៃនីមួយៗមាន ៤ Slot (ទាំងម៉ោងរៀន និងម៉ោងទំនេរ)
   */
  const getClassSchedule = (classId: string): DayScheduleView[] => {
    return weekDays.map((wd) => {
      // រៀបចំគ្រប់ ៤ Slot សម្រាប់ថ្ងៃនេះ
      const daySlots: TimetableEntry[] = timeSlots.map((slot) => {
        const found = rawTimetable.value.find(
          (t) => t.classId === classId && t.day === wd.key && t.slotNumber === slot.slotNumber
        )
        if (found) return found

        // បើគ្មានទិន្នន័យ គឺជាម៉ោងទំនេរ (Free Period)
        return {
          id: `${classId}-${wd.key}-${slot.slotNumber}-free`,
          day: wd.key,
          slotNumber: slot.slotNumber,
          time: slot.time,
          classId: classId,
          subjectKey: 'free',
          subjectKm: 'ម៉ោងទំនេរ / ស្វ័យសិក្សា',
          subjectEn: 'Free Period / Self-Study',
          room: '-',
          isFree: true
        }
      })

      return {
        day: wd.key,
        labelKm: wd.labelKm,
        labelEn: wd.labelEn,
        shortKm: wd.shortKm,
        shortEn: wd.shortEn,
        slots: daySlots
      }
    })
  }

  /**
   * 5. ទទួលបានកាលវិភាគបង្រៀនរបស់គ្រូម្នាក់ (Teacher Schedule by Day)
   * បង្ហាញពីថ្ងៃចន្ទ ដល់ សៅរ៍ ថាតើគ្រូនោះត្រូវបង្រៀនថ្នាក់ណាខ្លះ ឬជាម៉ោងទំនេរ
   */
  const getTeacherSchedule = (teacherId: string): TeacherDayScheduleView[] => {
    return weekDays.map((wd) => {
      const slots = timeSlots.map((slot) => {
        const teachingEntry = rawTimetable.value.find(
          (t) => t.teacherId === teacherId && t.day === wd.key && t.slotNumber === slot.slotNumber && !t.isFree
        )

        if (teachingEntry) {
          return {
            slotNumber: slot.slotNumber,
            time: slot.time,
            periodNameKm: slot.periodNameKm,
            periodNameEn: slot.periodEn,
            isFree: false,
            classId: teachingEntry.classId,
            className: teachingEntry.className,
            subjectKm: teachingEntry.subjectKm,
            subjectEn: teachingEntry.subjectEn,
            room: teachingEntry.room
          }
        }

        return {
          slotNumber: slot.slotNumber,
          time: slot.time,
          periodNameKm: slot.periodNameKm,
          periodNameEn: slot.periodEn,
          isFree: true
        }
      })

      return {
        day: wd.key,
        labelKm: wd.labelKm,
        labelEn: wd.labelEn,
        shortKm: wd.shortKm,
        shortEn: wd.shortEn,
        slots
      }
    })
  }

  /**
   * 6. ស្ថិតិកាលវិភាគតាមថ្នាក់ (Class Schedule Stats)
   */
  const getClassScheduleStats = (classId: string) => {
    const all = getClassSchedule(classId)
    let studySlots = 0
    let freeSlots = 0

    all.forEach((d) => {
      d.slots.forEach((s) => {
        if (s.isFree) {
          freeSlots++
        } else {
          studySlots++
        }
      })
    })

    return {
      totalSlots: 24,
      studySlots,
      freeSlots,
      daysCount: 6
    }
  }

  /**
   * 7. ស្ថិតិកាលវិភាគតាមគ្រូ (Teacher Schedule Stats)
   */
  const getTeacherScheduleStats = (teacherId: string) => {
    const all = getTeacherSchedule(teacherId)
    let teachingSlots = 0
    let freeSlots = 0
    const classesTaught = new Set<string>()

    all.forEach((d) => {
      d.slots.forEach((s) => {
        if (s.isFree) {
          freeSlots++
        } else {
          teachingSlots++
          if (s.classId) classesTaught.add(s.classId)
        }
      })
    })

    return {
      totalSlots: 24,
      teachingSlots,
      freeSlots,
      classesCount: classesTaught.size
    }
  }

  return {
    weekDays,
    timeSlots,
    rawTimetable,
    getClassSchedule,
    getTeacherSchedule,
    getClassScheduleStats,
    getTeacherScheduleStats,
    classes,
    teachers
  }
}

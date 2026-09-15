// types/index.d.ts

// ១. ប្រភេទសិទ្ធិ និងអ្នកប្រើប្រាស់ (Auth Types)
export type UserRole = 'admin' | 'teacher' | 'student'

export interface User {
  id: string
  name: string
  role: UserRole
  email?: string
  studentId?: string
  primaryRole?: UserRole
  classId?: string
  className?: string
  teacherId?: string
  teacherName?: string
  avatar?: string
  status?: 'pending' | 'approved' | 'rejected'
  createdAt?: string
  gender?: 'M' | 'F'
  dob?: string
}

// ២. មុខវិជ្ជាទាំង ៦ និងពិន្ទុ (Subject Scores)
export interface SubjectScores {
  math: number
  physics: number
  chemistry: number
  biology: number
  khmer: number
  english: number
}

export type SubjectKey = keyof SubjectScores

// និទ្ទេស A ដល់ F
export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

// ៣. ប្រវត្តិរូប និងពិន្ទុសិស្ស (Student Data)
export interface RawStudent {
  id: string
  name: string
  gender: 'M' | 'F'
  dob: string
  status?: 'pending' | 'approved' | 'rejected'
  scores: SubjectScores
  remarks?: string
  classId?: string
  className?: string
  teacherId?: string
  teacherName?: string
  semester?: string
  avatar?: string
  email?: string
  phone?: string
  address?: string
  gpa?: number
  maxGpa?: number
  gpaStatus?: string
  academicStanding?: string
  creditsEarned?: number
  creditsRequired?: number
  attendance?: {
    rate: number
    present: number
    absent: number
    late: number
    total: number
  }
  subjectScores?: Array<{
    id: number
    name: string
    code: string
    score: number
    max: number
    credits: number
    grade: string
    gpa: number
    status: string
    gradeVariant: string
  }>
}

// សិស្សដែលមានបន្ថែមទិន្នន័យគណនាស្វ័យប្រវត្តិ
export interface ComputedStudent extends RawStudent {
  total: number
  average: number
  grade: GradeLetter
  rank: number
}

// ៤. ព័ត៌មានទូទៅនៃថ្នាក់រៀន (Class Metadata)
export interface ClassSubjectConfig {
  key: SubjectKey
  nameKm: string
  nameEn: string
  coefficient: number
  enabled: boolean
}

export interface ClassInfo {
  className: string
  academicYear: string
  homeroomTeacher: string
  isLocked: boolean
  month: string
}

export interface SchoolClass {
  id: string
  name: string
  teacherId: string
  teacherName: string
  academicYear?: string
  room?: string
  isLocked?: boolean
  month?: string
  gradeLevel?: '10' | '11' | '12'
  track?: 'science' | 'social' | 'general'
  subjectConfigs?: ClassSubjectConfig[]
}

// ៥. ប្រភេទវត្តមានសិស្ស (Attendance Types)
export type AttendanceStatus = 'Present' | 'Late' | 'Excused' | 'Absent'

export interface DailyAttendanceRecord {
  id?: string | number
  studentId: string
  studentName: string
  classId: string
  date: string
  status: AttendanceStatus
  remarks?: string
}

// ៦. ទម្រង់ Response ពី Server API (/api/students)
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

export interface StudentsApiResponse {
  success: boolean
  classInfo: ClassInfo
}

// ៧. ព័ត៌មានលម្អិតគ្រូបង្រៀន (Teacher Profile)
export interface TeacherProfile {
  id: string
  name: string
  gender: 'M' | 'F'
  email: string
  phone: string
  specialty: string
  specialtyEn: string
  experienceYears: number
  education: string
  educationEn?: string
  homeroomClassId: string
  homeroomClassName: string
  teachingClasses: string[]
  status: 'Active' | 'On Leave'
  room?: string
  avatar?: string
}

// ៨. កាលវិភាគសិក្សា និងបង្រៀន (Schedule & Timetable Types)
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

export interface ScheduleSlot {
  slotNumber: number
  time: string
  periodNameKm: string
  periodNameEn: string
}

export interface TimetableEntry {
  id: string
  day: DayOfWeek
  slotNumber: number
  time: string
  classId: string
  className?: string
  subjectKey?: SubjectKey | 'free'
  subjectKm: string
  subjectEn: string
  teacherId?: string
  teacherName?: string
  room: string
  isFree?: boolean
}

// server/api/students.get.ts
import type { StudentsApiResponse } from '~/types'

export default defineEventHandler(async (event): Promise<StudentsApiResponse> => {
  try {
    const db = getDatabase()
    if (db) {
      return {
        success: true,
        classInfo: db.classInfo || {
          className: 'ថ្នាក់ទី ១២A (Class 12A)',
          academicYear: '2025-2026',
          homeroomTeacher: 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
          isLocked: false,
          month: 'តុលា (October)'
        },
        students: Array.isArray(db.students) ? db.students : [],
        classes: Array.isArray(db.classes) ? db.classes : [],
        subjects: Array.isArray(db.subjects) ? db.subjects : [],
        announcements: Array.isArray(db.announcements) ? db.announcements : [],
        schedule: Array.isArray(db.schedule) ? db.schedule : [],
        attendanceLogs: Array.isArray(db.attendanceLogs) ? db.attendanceLogs : []
      }
    }
  } catch (err) {
    console.error('Error reading students from database:', err)
  }

  // Fallback default students if database fails
  return {
    success: true,
    classInfo: {
      className: 'ថ្នាក់ទី ១២A (Class 12A)',
      academicYear: '2025-2026',
      homeroomTeacher: 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
      isLocked: false,
      month: 'តុលា (October)'
    },
    students: [
      {
        id: 'STU-001',
        name: 'សុខ ហេង',
        gender: 'M',
        dob: '2008-05-12',
        scores: { math: 88, physics: 82, chemistry: 85, biology: 80, khmer: 92, english: 90 },
        remarks: 'រៀនពូកែ យកចិត្តទុកដាក់ និងមានវិន័យល្អណាស់'
      }
    ]
  }
})

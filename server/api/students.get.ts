// server/api/students.get.ts
import fs from 'node:fs'
import path from 'node:path'
import type { StudentsApiResponse } from '~/types'

export default defineEventHandler(async (event): Promise<StudentsApiResponse> => {
  try {
    const dbPath = path.resolve(process.cwd(), 'app/api/db.json')
    if (fs.existsSync(dbPath)) {
      const rawData = fs.readFileSync(dbPath, 'utf-8')
      const db = JSON.parse(rawData)
      return {
        success: true,
        classInfo: db.classInfo || {
          className: 'IT Engineering - Year 1',
          academicYear: '2025-2026',
          homeroomTeacher: 'Mr. Sok Dara',
          isLocked: false,
          month: 'Semester 1'
        },
        students: db.students || [],
        classes: db.classes || [],
        subjects: db.subjects || [],
        announcements: db.announcements || [],
        schedule: db.schedule || [],
        attendanceLogs: db.attendanceLogs || []
      }
    }
  } catch (err) {
    console.error('Error reading students from db.json:', err)
  }

  // Fallback default students if db.json is missing
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

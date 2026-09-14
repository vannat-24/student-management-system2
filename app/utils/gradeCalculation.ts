// utils/gradeCalculation.ts
import type { RawStudent, ComputedStudent, SubjectScores, GradeLetter, ClassSubjectConfig } from '~/types'

/**
 * ១. គណនាពិន្ទុសរុបពីមុខវិជ្ជា
 */
export const calculateTotalScore = (scores: SubjectScores, subjectConfigs?: ClassSubjectConfig[]): number => {
  if (subjectConfigs && subjectConfigs.length > 0) {
    const activeConfigs = subjectConfigs.filter(s => s.enabled)
    if (activeConfigs.length > 0) {
      return activeConfigs.reduce((sum, config) => {
        const score = Number(scores[config.key]) || 0
        return sum + score
      }, 0)
    }
  }
  const values = Object.values(scores)
  return values.reduce((sum, score) => sum + (Number(score) || 0), 0)
}

/**
 * ២. គណនាមធ្យមភាគដោយគិតមេគុណ (Weighted Average calculation)
 * Formula: sum(score * coefficient) / sum(coefficient)
 */
export const calculateAverageScore = (scores: SubjectScores, subjectConfigs?: ClassSubjectConfig[]): number => {
  if (subjectConfigs && subjectConfigs.length > 0) {
    const activeConfigs = subjectConfigs.filter(s => s.enabled)
    if (activeConfigs.length > 0) {
      const totalWeightedScore = activeConfigs.reduce((sum, config) => {
        const score = Number(scores[config.key]) || 0
        const coef = Number(config.coefficient) || 1
        return sum + (score * coef)
      }, 0)

      const totalCoefficients = activeConfigs.reduce((sum, config) => {
        return sum + (Number(config.coefficient) || 1)
      }, 0)

      if (totalCoefficients === 0) return 0
      return Number((totalWeightedScore / totalCoefficients).toFixed(2))
    }
  }

  const total = calculateTotalScore(scores)
  const subjectCount = Object.keys(scores).length
  if (subjectCount === 0) return 0

  const average = total / subjectCount
  return Number(average.toFixed(2))
}

/**
 * ៣. កំណត់និទ្ទេស (A - F) តាមស្ដង់ដារមធ្យមភាគ
 * A: >= 85 | B: >= 75 | C: >= 65 | D: >= 55 | E: >= 50 | F: < 50
 */
export const calculateGradeLetter = (average: number): GradeLetter => {
  if (average >= 85) return 'A'
  if (average >= 75) return 'B'
  if (average >= 65) return 'C'
  if (average >= 55) return 'D'
  if (average >= 50) return 'E'
  return 'F'
}

/**
 * ៤. គណនាទិន្នន័យសរុប និងតម្រៀបចំណាត់ថ្នាក់ (Rank) សម្រាប់បញ្ជីសិស្សទាំងអស់
 */
export const computeStudentsGrades = (
  students: RawStudent[],
  subjectConfigs?: ClassSubjectConfig[]
): ComputedStudent[] => {
  // ជំហានទី ១៖ គណនា Total, Average, Grade សម្រាប់សិស្សម្នាក់ៗ
  const calculatedList = students.map((student) => {
    const total = calculateTotalScore(student.scores, subjectConfigs)
    const average = calculateAverageScore(student.scores, subjectConfigs)
    const grade = calculateGradeLetter(average)

    return {
      ...student,
      total,
      average,
      grade,
      rank: 0
    }
  })

  // ជំហានទី ២៖ តម្រៀបតាមមធ្យមភាគពីខ្ពស់ទៅទាប (Descending Sort)
  const sorted = [...calculatedList].sort((a, b) => b.average - a.average)

  // ជំហានទី ៣៖ ផ្ដល់ចំណាត់ថ្នាក់ (Rank)
  return sorted.map((student, index) => ({
    ...student,
    rank: index + 1
  }))
}

/**
 * ៥. មុខងារជំនួយ៖ ពណ៌សម្គាល់សម្រាប់ Badge និទ្ទេសនីមួយៗ
 */
export const getGradeBadgeColor = (grade: GradeLetter): string => {
  switch (grade) {
    case 'A':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300'
    case 'B':
      return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'C':
      return 'bg-cyan-100 text-cyan-700 border-cyan-300'
    case 'D':
      return 'bg-amber-100 text-amber-700 border-amber-300'
    case 'E':
      return 'bg-orange-100 text-orange-700 border-orange-300'
    case 'F':
      return 'bg-rose-100 text-rose-700 border-rose-300'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300'
  }
}
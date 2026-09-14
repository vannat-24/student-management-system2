// utils/formatText.ts

/**
 * 1. Convert English numbers to Khmer numerals (0-9 -> ០-៩)
 */
export const toKhmerNumerals = (val?: string | number | null): string => {
  if (val === null || val === undefined) return ''
  const str = String(val)
  return str
    .replace(/0/g, '០')
    .replace(/1/g, '១')
    .replace(/2/g, '២')
    .replace(/3/g, '៣')
    .replace(/4/g, '៤')
    .replace(/5/g, '៥')
    .replace(/6/g, '៦')
    .replace(/7/g, '៧')
    .replace(/8/g, '៨')
    .replace(/9/g, '៩')
}

/**
 * 2. Convert Khmer numerals to English numbers (០-៩ -> 0-9)
 */
export const toEnglishNumerals = (val?: string | number | null): string => {
  if (val === null || val === undefined) return ''
  const str = String(val)
  return str
    .replace(/០/g, '0')
    .replace(/១/g, '1')
    .replace(/២/g, '2')
    .replace(/៣/g, '3')
    .replace(/៤/g, '4')
    .replace(/៥/g, '5')
    .replace(/៦/g, '6')
    .replace(/៧/g, '7')
    .replace(/៨/g, '8')
    .replace(/៩/g, '9')
}

/**
 * 3. Format Class Name: cleanses bilingual seed strings like "ថ្នាក់ទី ១២A (Class 12A)"
 * into pure Khmer "ថ្នាក់ទី ១២A" or pure English "Class 12A".
 */
export const formatClassName = (name?: string | null, isEnglish = false): string => {
  if (!name) return ''
  const trimmed = name.trim()

  // Match pattern: "ថ្នាក់ទី... (Class ...)"
  const match = trimmed.match(/^(.*?)\s*\((Class\s*[^)]*)\)$/i)
  if (match) {
    return isEnglish ? match[2].trim() : match[1].trim()
  }

  // If input is purely English like "Class 12A" and we want Khmer:
  if (!isEnglish && /^Class\s+(\d+[A-Z]?)$/i.test(trimmed)) {
    const raw = trimmed.replace(/^Class\s+/i, '')
    const kmNum = toKhmerNumerals(raw)
    return `ថ្នាក់ទី ${kmNum}`
  }

  // If input is purely Khmer like "ថ្នាក់ទី ១២A" and we want English:
  if (isEnglish && /^ថ្នាក់ទី\s*/.test(trimmed)) {
    const raw = trimmed.replace(/^ថ្នាក់ទី\s*/, '')
    const enNum = toEnglishNumerals(raw)
    return `Class ${enNum}`
  }

  // Remove any leftover parentheses
  return isEnglish
    ? trimmed.replace(/^.*?\(|\)/g, '').trim() || trimmed
    : trimmed.replace(/\s*\(.*?\)/g, '').trim()
}

/**
 * 4. Format Teacher Name: cleanses bilingual strings like "លោកគ្រូ សុវណ្ណ (Mr. Sovann)"
 * into pure Khmer "លោកគ្រូ សុវណ្ណ" or pure English "Mr. Sovann".
 */
export const formatTeacherName = (name?: string | null, isEnglish = false): string => {
  if (!name) return ''
  const trimmed = name.trim()

  // Match pattern: "លោកគ្រូ... (Mr. ...)" or "... (Ms. ...)" or "... (Teacher)"
  const match = trimmed.match(/^(.*?)\s*\((M[rs]\.?\s*[^)]*)\)$/i)
  if (match) {
    return isEnglish ? match[2].trim() : match[1].trim()
  }

  if (trimmed.includes('(Teacher)')) {
    const kmPart = trimmed.replace(/\s*\(Teacher\)/i, '').trim()
    return isEnglish ? (kmPart.includes('សុវណ្ណ') ? 'Mr. Sovann' : 'Teacher') : kmPart
  }

  return isEnglish
    ? trimmed.replace(/\s*\([^)]*\)/g, '').trim()
    : trimmed.replace(/\s*\([^)]*\)/g, '').trim()
}

/**
 * 5. Format User Name: cleanses strings like "គណៈគ្រប់គ្រង (Admin)"
 * into pure Khmer "គណៈគ្រប់គ្រង" or pure English "Administrator".
 */
export const formatUserName = (name?: string | null, isEnglish = false): string => {
  if (!name) return ''
  const trimmed = name.trim()

  if (trimmed.includes('គណៈគ្រប់គ្រង')) {
    return isEnglish ? 'Administrator' : 'គណៈគ្រប់គ្រង'
  }

  if (trimmed.includes('លោកគ្រូ') || trimmed.includes('អ្នកគ្រូ')) {
    return formatTeacherName(trimmed, isEnglish)
  }

  const match = trimmed.match(/^(.*?)\s*\(([^)]*)\)$/)
  if (match) {
    return isEnglish ? match[2].trim() : match[1].trim()
  }

  return trimmed
}

/**
 * 6. Format Room: converts "បន្ទប់ 301" / "Room 301"
 */
export const formatRoom = (room?: string | null, isEnglish = false): string => {
  if (!room) return isEnglish ? 'Room 301' : 'បន្ទប់ 301'
  const digits = room.match(/\d+/)
  const num = digits ? digits[0] : '301'
  return isEnglish ? `Room ${num}` : `បន្ទប់ ${num}`
}

/**
 * 7. Format Month: converts "តុលា (October)"
 */
export const formatMonth = (month?: string | null, isEnglish = false): string => {
  if (!month) return isEnglish ? 'October' : 'តុលា'
  if (month.includes('តុលា') || month.toLowerCase().includes('october')) {
    return isEnglish ? 'October' : 'តុលា'
  }
  return month.replace(/\s*\([^)]*\)/g, '').trim()
}

/**
 * 8. Format Attendance Status
 */
export const formatAttendanceStatus = (status?: string | null, isEnglish = false): string => {
  switch (status) {
    case 'Present':
      return isEnglish ? 'Present' : 'វត្តមាន'
    case 'Late':
      return isEnglish ? 'Late' : 'យឺត'
    case 'Excused':
      return isEnglish ? 'Excused' : 'ច្បាប់'
    case 'Absent':
      return isEnglish ? 'Absent' : 'អវត្តមាន'
    default:
      return status || ''
  }
}

/**
 * 9. Format Academic Rank: converts 1 -> "ចំណាត់ថ្នាក់លេខ ១" or "Rank 1st"
 */
export const formatRank = (rank?: number | string | null, isEnglish = false): string => {
  if (!rank) return ''
  const num = Number(rank)
  if (isEnglish) {
    const s = ['th', 'st', 'nd', 'rd']
    const v = num % 100
    const suffix = s[(v - 20) % 10] || s[v] || s[0]
    return `Rank ${num}${suffix}`
  }
  return `ចំណាត់ថ្នាក់លេខ ${toKhmerNumerals(num)}`
}

/**
 * 10. Format Khmer Date: converts "2026-09-14" -> "ថ្ងៃទី ១៤ ខែកញ្ញា ឆ្នាំ ២០២៦"
 */
export const formatKhmerDate = (dateInput?: string | Date | null, isEnglish = false): string => {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return String(dateInput)

  const day = d.getDate()
  const month = d.getMonth()
  const year = d.getFullYear()

  if (isEnglish) {
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthsEn[month]} ${day}, ${year}`
  }

  const monthsKm = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ]
  return `ថ្ងៃទី ${toKhmerNumerals(day)} ខែ${monthsKm[month]} ឆ្នាំ ${toKhmerNumerals(year)}`
}

/**
 * 11. Format Phone Number: converts "012345678" -> "012 345 678"
 */
export const formatPhoneNumber = (phone?: string | null): string => {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 9) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return phone
}

/**
 * 12. Format Currency: USD ($) or KHR (៛)
 */
export const formatCurrency = (amount: number, isDollar = true): string => {
  if (isDollar) {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${toKhmerNumerals(amount.toLocaleString('en-US'))} ៛`
}

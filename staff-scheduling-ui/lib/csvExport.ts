/**
 * CSV Export utilities
 */

export interface CSVExportData {
  headers: string[]
  rows: (string | number)[][]
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: CSVExportData): string {
  const { headers, rows } = data

  // Escape CSV values (handle quotes and commas)
  const escapeCSVValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) {
      return ''
    }
    const stringValue = String(value)
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  // Create CSV lines
  const lines: string[] = []
  
  // Headers
  lines.push(headers.map(escapeCSVValue).join(','))
  
  // Rows
  for (const row of rows) {
    lines.push(row.map(escapeCSVValue).join(','))
  }

  return lines.join('\n')
}

/**
 * Download CSV file
 */
export function downloadCSV(data: CSVExportData, filename: string): void {
  const csvContent = convertToCSV(data)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Format date for CSV
 */
export function formatDateForCSV(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format time for CSV (minutes to hours:minutes)
 */
export function formatMinutesForCSV(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}:${String(mins).padStart(2, '0')}`
}


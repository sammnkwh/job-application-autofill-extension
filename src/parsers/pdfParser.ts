// PDF parser using pdfjs-dist

import * as pdfjsLib from 'pdfjs-dist'

// Set worker path for PDF.js
// In a browser extension, we need to handle the worker differently
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export interface PdfParseResult {
  text: string
  pageCount: number
  pages: string[]
}

// Parse PDF from File object
export async function parsePdfFile(file: File): Promise<PdfParseResult> {
  const arrayBuffer = await file.arrayBuffer()
  return parsePdfBuffer(arrayBuffer)
}

// Parse PDF from ArrayBuffer
export async function parsePdfBuffer(buffer: ArrayBuffer): Promise<PdfParseResult> {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  const pages: string[] = []
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()

    // Extract text from text items, preserving line breaks
    const lines: string[] = []
    let currentLine = ''
    let lastY: number | null = null

    for (const item of textContent.items) {
      if ('str' in item && 'transform' in item) {
        const y = item.transform[5] // Y position
        const text = item.str

        // If Y position changed significantly, it's a new line
        if (lastY !== null && Math.abs(y - lastY) > 5) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim())
          }
          currentLine = text
        } else {
          // Same line - add space if needed
          if (currentLine && text && !currentLine.endsWith(' ') && !text.startsWith(' ')) {
            currentLine += ' '
          }
          currentLine += text
        }
        lastY = y
      } else if ('str' in item) {
        currentLine += item.str
      }
    }

    // Don't forget the last line
    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }

    const pageText = lines.join('\n')
    pages.push(pageText)
    fullText += (fullText ? '\n\n' : '') + pageText
  }

  return {
    text: fullText,
    pageCount: pdf.numPages,
    pages,
  }
}

// Check if a file is a PDF
export function isPdfFile(file: File): boolean {
  return (
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')
  )
}

// Helper to extract text with line breaks preserved
function extractTextWithLineBreaks(textContent: { items: unknown[] }): string {
  const lines: string[] = []
  let currentLine = ''
  let lastY: number | null = null

  for (const item of textContent.items) {
    if (typeof item === 'object' && item !== null && 'str' in item) {
      const textItem = item as { str: string; transform?: number[] }
      const y = textItem.transform ? textItem.transform[5] : null
      const text = textItem.str

      if (y !== null && lastY !== null && Math.abs(y - lastY) > 5) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim())
        }
        currentLine = text
      } else {
        if (currentLine && text && !currentLine.endsWith(' ') && !text.startsWith(' ')) {
          currentLine += ' '
        }
        currentLine += text
      }
      if (y !== null) lastY = y
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim())
  }

  return lines.join('\n')
}

// Parse PDF from URL (useful for testing)
export async function parsePdfUrl(url: string): Promise<PdfParseResult> {
  const pdf = await pdfjsLib.getDocument(url).promise

  const pages: string[] = []
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = extractTextWithLineBreaks(textContent)

    pages.push(pageText)
    fullText += (fullText ? '\n\n' : '') + pageText
  }

  return {
    text: fullText,
    pageCount: pdf.numPages,
    pages,
  }
}

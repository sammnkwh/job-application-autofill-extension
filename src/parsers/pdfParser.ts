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

    // Extract text from text items
    const pageText = textContent.items
      .map((item) => {
        if ('str' in item) {
          return item.str
        }
        return ''
      })
      .join(' ')

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

// Parse PDF from URL (useful for testing)
export async function parsePdfUrl(url: string): Promise<PdfParseResult> {
  const pdf = await pdfjsLib.getDocument(url).promise

  const pages: string[] = []
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()

    const pageText = textContent.items
      .map((item) => {
        if ('str' in item) {
          return item.str
        }
        return ''
      })
      .join(' ')

    pages.push(pageText)
    fullText += (fullText ? '\n\n' : '') + pageText
  }

  return {
    text: fullText,
    pageCount: pdf.numPages,
    pages,
  }
}

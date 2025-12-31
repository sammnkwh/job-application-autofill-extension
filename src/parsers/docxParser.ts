// DOCX parser using mammoth.js

import mammoth from 'mammoth'

export interface DocxParseResult {
  text: string
  html: string
  messages: string[]
}

// Parse DOCX from File object
export async function parseDocxFile(file: File): Promise<DocxParseResult> {
  const arrayBuffer = await file.arrayBuffer()
  return parseDocxBuffer(arrayBuffer)
}

// Parse DOCX from ArrayBuffer
export async function parseDocxBuffer(buffer: ArrayBuffer): Promise<DocxParseResult> {
  // Convert ArrayBuffer to Buffer-like for mammoth
  const uint8Array = new Uint8Array(buffer)

  // Extract raw text
  const textResult = await mammoth.extractRawText({ arrayBuffer: uint8Array.buffer })

  // Also extract HTML for structure if needed
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer: uint8Array.buffer })

  return {
    text: textResult.value,
    html: htmlResult.value,
    messages: [...textResult.messages.map(m => m.message), ...htmlResult.messages.map(m => m.message)],
  }
}

// Check if a file is a DOCX
export function isDocxFile(file: File): boolean {
  return (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')
  )
}

// Parse DOCX from URL (for testing)
export async function parseDocxUrl(url: string): Promise<DocxParseResult> {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return parseDocxBuffer(arrayBuffer)
}

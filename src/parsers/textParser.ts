// Plain text parser for .txt resume files

export interface ParsedText {
  text: string
  lines: string[]
  sections: TextSection[]
}

export interface TextSection {
  title: string
  content: string
  startLine: number
  endLine: number
}

// Common section headers in resumes
const SECTION_HEADERS = [
  'summary',
  'objective',
  'experience',
  'work experience',
  'employment',
  'employment history',
  'professional experience',
  'education',
  'academic background',
  'skills',
  'technical skills',
  'skills & qualifications',
  'certifications',
  'certificates',
  'languages',
  'projects',
  'awards',
  'honors',
  'publications',
  'references',
  'contact',
  'contact information',
]

// Parse text content from a .txt file
export function parseText(content: string): ParsedText {
  const lines = content.split('\n').map((line) => line.trim())
  const sections = extractSections(lines)

  return {
    text: content,
    lines,
    sections,
  }
}

// Parse text from a File object
export async function parseTextFile(file: File): Promise<ParsedText> {
  const content = await file.text()
  return parseText(content)
}

// Extract sections from lines
function extractSections(lines: string[]): TextSection[] {
  const sections: TextSection[] = []
  let currentSection: TextSection | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const normalizedLine = line.toLowerCase().replace(/[^a-z\s]/g, '').trim()

    // Check if this line is a section header
    if (isSectionHeader(normalizedLine)) {
      // Save previous section
      if (currentSection) {
        currentSection.endLine = i - 1
        sections.push(currentSection)
      }

      // Start new section
      currentSection = {
        title: normalizedLine,
        content: '',
        startLine: i,
        endLine: i,
      }
    } else if (currentSection && line) {
      // Add content to current section (skip empty lines)
      currentSection.content += (currentSection.content ? '\n' : '') + line
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.endLine = lines.length - 1
    sections.push(currentSection)
  }

  return sections
}

// Check if a line is a section header
function isSectionHeader(line: string): boolean {
  // Must be relatively short (headers are typically 1-3 words)
  if (line.length > 50 || line.length < 3) return false

  // Check against known headers
  return SECTION_HEADERS.some(
    (header) => line === header || line.startsWith(header + ' ') || line.endsWith(' ' + header)
  )
}

// Get a specific section by name
export function getSection(parsed: ParsedText, sectionName: string): TextSection | undefined {
  const normalized = sectionName.toLowerCase()
  return parsed.sections.find(
    (section) => section.title.includes(normalized) || normalized.includes(section.title)
  )
}

// Get text between two line numbers
export function getTextRange(parsed: ParsedText, startLine: number, endLine: number): string {
  return parsed.lines.slice(startLine, endLine + 1).join('\n')
}

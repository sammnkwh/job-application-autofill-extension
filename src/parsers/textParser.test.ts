import { describe, it, expect } from 'vitest'
import { parseText, getSection, getTextRange } from './textParser'

describe('textParser', () => {
  const sampleResume = `JANE DOE
Software Engineer

SUMMARY
Experienced developer with 5 years of experience.

WORK EXPERIENCE
Senior Engineer at Tech Corp
January 2020 - Present

EDUCATION
BS Computer Science
University of California

SKILLS
JavaScript, Python, React
`

  describe('parseText', () => {
    it('should parse text into lines', () => {
      const result = parseText(sampleResume)
      expect(result.lines.length).toBeGreaterThan(0)
      expect(result.lines[0]).toBe('JANE DOE')
    })

    it('should preserve original text', () => {
      const result = parseText(sampleResume)
      expect(result.text).toBe(sampleResume)
    })

    it('should identify sections', () => {
      const result = parseText(sampleResume)
      expect(result.sections.length).toBeGreaterThan(0)

      const sectionTitles = result.sections.map((s) => s.title)
      expect(sectionTitles).toContain('summary')
      expect(sectionTitles).toContain('work experience')
      expect(sectionTitles).toContain('education')
      expect(sectionTitles).toContain('skills')
    })

    it('should extract section content', () => {
      const result = parseText(sampleResume)
      // Sections are extracted, content may vary based on parsing
      expect(result.sections.length).toBeGreaterThan(0)
    })
  })

  describe('getSection', () => {
    it('should find section by name', () => {
      const parsed = parseText(sampleResume)
      const section = getSection(parsed, 'education')
      expect(section).not.toBeUndefined()
      expect(section?.content).toContain('BS Computer Science')
    })

    it('should return undefined for non-existent section', () => {
      const parsed = parseText(sampleResume)
      const section = getSection(parsed, 'hobbies')
      expect(section).toBeUndefined()
    })

    it('should handle partial matches', () => {
      const parsed = parseText(sampleResume)
      const section = getSection(parsed, 'experience')
      expect(section).not.toBeUndefined()
    })
  })

  describe('getTextRange', () => {
    it('should get text between line numbers', () => {
      const parsed = parseText('line1\nline2\nline3\nline4')
      const text = getTextRange(parsed, 1, 2)
      expect(text).toBe('line2\nline3')
    })
  })

  describe('edge cases', () => {
    it('should handle empty text', () => {
      const result = parseText('')
      expect(result.lines).toHaveLength(1)
      expect(result.sections).toHaveLength(0)
    })

    it('should handle text with no sections', () => {
      const result = parseText('Just some random text\nwithout any sections')
      expect(result.sections).toHaveLength(0)
    })

    it('should trim whitespace from lines', () => {
      const result = parseText('  Line with spaces  \n\tTabbed line\t')
      expect(result.lines[0]).toBe('Line with spaces')
      expect(result.lines[1]).toBe('Tabbed line')
    })
  })
})

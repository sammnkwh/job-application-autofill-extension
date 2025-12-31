import { describe, it, expect } from 'vitest'
import {
  extractEmail,
  extractAllEmails,
  extractPhone,
  extractName,
  extractLinkedIn,
  extractGitHub,
  extractWebsiteUrl,
  extractLocation,
  extractWorkExperience,
  extractEducation,
  extractSkills,
  extractCertifications,
  extractLanguages,
} from './extractors'

describe('extractors', () => {
  describe('extractEmail', () => {
    it('should extract a valid email', () => {
      const result = extractEmail('Contact me at john.doe@example.com for inquiries')
      expect(result).not.toBeNull()
      expect(result?.value).toBe('john.doe@example.com')
      expect(result?.confidence).toBe('high')
    })

    it('should handle multiple emails and return the first', () => {
      const result = extractEmail('john@example.com or jane@example.com')
      expect(result?.value).toBe('john@example.com')
    })

    it('should return null for no email', () => {
      const result = extractEmail('No email here')
      expect(result).toBeNull()
    })

    it('should handle various email formats', () => {
      expect(extractEmail('test+tag@domain.co.uk')?.value).toBe('test+tag@domain.co.uk')
      expect(extractEmail('user.name@subdomain.domain.org')?.value).toBe('user.name@subdomain.domain.org')
    })
  })

  describe('extractAllEmails', () => {
    it('should extract all unique emails', () => {
      const result = extractAllEmails('john@a.com, jane@b.com, john@a.com')
      expect(result).toHaveLength(2)
      expect(result).toContain('john@a.com')
      expect(result).toContain('jane@b.com')
    })
  })

  describe('extractPhone', () => {
    it('should extract US phone number with parentheses', () => {
      const result = extractPhone('Phone: (555) 123-4567')
      expect(result).not.toBeNull()
      expect(result?.value).toBe('(555) 123-4567')
    })

    it('should extract phone number with dashes', () => {
      const result = extractPhone('Call 555-123-4567')
      expect(result?.value).toBe('(555) 123-4567')
    })

    it('should extract phone number with dots', () => {
      const result = extractPhone('555.123.4567')
      expect(result?.value).toBe('(555) 123-4567')
    })

    it('should return null for no phone', () => {
      const result = extractPhone('No phone here')
      expect(result).toBeNull()
    })
  })

  describe('extractName', () => {
    it('should extract name from first line', () => {
      const result = extractName('John Doe\nSoftware Engineer')
      expect(result).not.toBeNull()
      expect(result?.value.firstName).toBe('John')
      expect(result?.value.lastName).toBe('Doe')
    })

    it('should handle middle names', () => {
      const result = extractName('Jane Marie Smith\nDesigner')
      expect(result?.value.firstName).toBe('Jane')
      expect(result?.value.lastName).toBe('Smith')
    })

    it('should skip email-like first lines', () => {
      const result = extractName('john@example.com\nJohn Doe')
      expect(result).toBeNull()
    })

    it('should skip URL-like first lines', () => {
      const result = extractName('https://example.com\nJohn Doe')
      expect(result).toBeNull()
    })

    it('should return null for single word', () => {
      const result = extractName('John')
      expect(result).toBeNull()
    })
  })

  describe('extractLinkedIn', () => {
    it('should extract LinkedIn URL', () => {
      const result = extractLinkedIn('LinkedIn: linkedin.com/in/johndoe')
      expect(result).not.toBeNull()
      expect(result?.value).toContain('linkedin.com/in/johndoe')
    })

    it('should handle full URL with https', () => {
      const result = extractLinkedIn('https://www.linkedin.com/in/jane-doe')
      expect(result?.value).toBe('https://www.linkedin.com/in/jane-doe')
    })

    it('should return null when no LinkedIn', () => {
      const result = extractLinkedIn('No LinkedIn here')
      expect(result).toBeNull()
    })
  })

  describe('extractGitHub', () => {
    it('should extract GitHub URL', () => {
      const result = extractGitHub('GitHub: github.com/johndoe')
      expect(result).not.toBeNull()
      expect(result?.value).toContain('github.com/johndoe')
    })

    it('should handle full URL', () => {
      const result = extractGitHub('https://github.com/jane-doe')
      expect(result?.value).toBe('https://github.com/jane-doe')
    })
  })

  describe('extractWebsiteUrl', () => {
    it('should extract portfolio URL', () => {
      const result = extractWebsiteUrl('Portfolio: https://johndoe.dev')
      expect(result).not.toBeNull()
      expect(result?.value).toBe('https://johndoe.dev')
    })

    it('should ignore LinkedIn and GitHub URLs', () => {
      const result = extractWebsiteUrl('https://linkedin.com/in/john https://github.com/john https://mysite.com')
      expect(result?.value).toBe('https://mysite.com')
    })
  })

  describe('extractLocation', () => {
    it('should extract city and state', () => {
      const result = extractLocation('San Francisco, CA 94102')
      expect(result).not.toBeNull()
      expect(result?.value).toContain('San Francisco')
      expect(result?.value).toContain('CA')
    })

    it('should extract city, state without zip', () => {
      const result = extractLocation('Located in New York, NY')
      expect(result?.value).toContain('New York')
    })
  })

  describe('extractWorkExperience', () => {
    it('should extract work experience entries', () => {
      const text = `
WORK EXPERIENCE

Senior Engineer
January 2020 - Present
- Led team of 5 engineers
- Built scalable systems

Software Engineer
June 2018 - December 2019
- Developed features
- Fixed bugs

EDUCATION
      `
      const result = extractWorkExperience(text)
      expect(result).not.toBeNull()
      expect(result?.value.length).toBeGreaterThanOrEqual(1)
    })

    it('should return null for no experience section', () => {
      const result = extractWorkExperience('Just some random text')
      expect(result).toBeNull()
    })
  })

  describe('extractEducation', () => {
    it('should extract education entries', () => {
      const text = `
EDUCATION

Bachelor of Science in Computer Science
University of California, Berkeley
Graduated: May 2020
GPA: 3.8
Honors: Dean's List

SKILLS
      `
      const result = extractEducation(text)
      expect(result).not.toBeNull()
      expect(result?.value.length).toBeGreaterThanOrEqual(1)
      // Find the entry with Berkeley
      const berkeleyEntry = result?.value.find(e => e.institution.includes('Berkeley'))
      expect(berkeleyEntry).toBeDefined()
    })

    it('should extract GPA', () => {
      const text = `
EDUCATION

B.S. Computer Science
MIT
GPA: 3.9

SKILLS
      `
      const result = extractEducation(text)
      expect(result?.value[0].gpa).toBe('3.9')
    })
  })

  describe('extractSkills', () => {
    it('should extract skills list', () => {
      const text = `
SKILLS

Programming: JavaScript, Python, Java
Frameworks: React, Node.js, Django
Tools: Git, Docker, AWS

CERTIFICATIONS
      `
      const result = extractSkills(text)
      expect(result).not.toBeNull()
      expect(result?.value).toContain('JavaScript')
      expect(result?.value).toContain('React')
      expect(result?.value).toContain('Docker')
    })

    it('should handle comma-separated skills', () => {
      const text = `
SKILLS
JavaScript, Python, React, Node.js
      `
      const result = extractSkills(text)
      expect(result?.value).toContain('JavaScript')
      expect(result?.value).toContain('Python')
    })
  })

  describe('extractCertifications', () => {
    it('should extract certifications', () => {
      const text = `
CERTIFICATIONS

AWS Solutions Architect (2022)
Google Cloud Professional (2021)

LANGUAGES
      `
      const result = extractCertifications(text)
      expect(result).not.toBeNull()
      expect(result?.value).toHaveLength(2)
      expect(result?.value[0].name).toContain('AWS')
      expect(result?.value[0].dateObtained).toBe('2022')
    })
  })

  describe('extractLanguages', () => {
    it('should extract languages with proficiency', () => {
      const text = `
LANGUAGES

English (Native)
Spanish (Professional)
Mandarin (Conversational)
      `
      const result = extractLanguages(text)
      expect(result).not.toBeNull()
      expect(result?.value).toHaveLength(3)
      expect(result?.value[0].language).toBe('English')
      expect(result?.value[0].proficiency).toBe('native')
      expect(result?.value[1].proficiency).toBe('professional')
      expect(result?.value[2].proficiency).toBe('conversational')
    })
  })
})

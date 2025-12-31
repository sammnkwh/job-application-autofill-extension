import { describe, it, expect } from 'vitest'
import {
  detectFromUrl,
  detectFromDom,
  detectPlatform,
  isSupported,
  getPlatformName,
} from './detector'
import { JSDOM } from 'jsdom'

describe('detector', () => {
  describe('detectFromUrl', () => {
    describe('Workday URLs', () => {
      it('should detect myworkdayjobs.com', () => {
        const result = detectFromUrl('https://company.myworkdayjobs.com/en-US/External')
        expect(result.platform).toBe('workday')
        expect(result.matched).toBe(true)
      })

      it('should detect workday.com job pages', () => {
        const result = detectFromUrl('https://company.workday.com/en-US/d/jobs/12345')
        expect(result.platform).toBe('workday')
        expect(result.matched).toBe(true)
      })

      it('should detect wd5.myworkdaysite.com', () => {
        const result = detectFromUrl('https://company.wd5.myworkdaysite.com/recruiting')
        expect(result.platform).toBe('workday')
        expect(result.matched).toBe(true)
      })

      it('should handle various workday URL formats', () => {
        const urls = [
          'https://acme.myworkdayjobs.com/External',
          'https://careers.myworkdayjobs.com/global',
          'https://ibm.wd1.myworkdaysite.com/recruiting',
        ]
        for (const url of urls) {
          const result = detectFromUrl(url)
          expect(result.platform).toBe('workday')
        }
      })
    })

    describe('Greenhouse URLs', () => {
      it('should detect boards.greenhouse.io', () => {
        const result = detectFromUrl('https://boards.greenhouse.io/company/jobs/12345')
        expect(result.platform).toBe('greenhouse')
        expect(result.matched).toBe(true)
      })

      it('should detect greenhouse.io job pages', () => {
        const result = detectFromUrl('https://company.greenhouse.io/us/jobs/12345')
        expect(result.platform).toBe('greenhouse')
        expect(result.matched).toBe(true)
      })

      it('should handle various greenhouse URL formats', () => {
        const urls = [
          'https://boards.greenhouse.io/acme',
          'https://boards.greenhouse.io/acme/jobs/123',
          'https://job-boards.greenhouse.io/company',
        ]
        for (const url of urls) {
          const result = detectFromUrl(url)
          expect(result.platform).toBe('greenhouse')
        }
      })
    })

    describe('Unknown URLs', () => {
      it('should return unknown for non-ATS sites', () => {
        const result = detectFromUrl('https://google.com')
        expect(result.platform).toBe('unknown')
        expect(result.matched).toBe(false)
      })

      it('should return unknown for company career pages', () => {
        const result = detectFromUrl('https://company.com/careers')
        expect(result.platform).toBe('unknown')
      })

      it('should return unknown for LinkedIn', () => {
        const result = detectFromUrl('https://linkedin.com/jobs/view/12345')
        expect(result.platform).toBe('unknown')
      })
    })
  })

  describe('detectFromDom', () => {
    function createDocument(html: string): Document {
      const dom = new JSDOM(html)
      return dom.window.document
    }

    describe('Workday DOM', () => {
      it('should detect data-automation-id attribute', () => {
        const doc = createDocument('<div data-automation-id="jobTitle">Engineer</div>')
        const result = detectFromDom(doc)
        expect(result.platform).toBe('workday')
        expect(result.matched).toBe(true)
      })

      it('should detect data-uxi-widget-type attribute', () => {
        const doc = createDocument('<div data-uxi-widget-type="panel"></div>')
        const result = detectFromDom(doc)
        expect(result.platform).toBe('workday')
      })

      it('should detect WDNC class', () => {
        const doc = createDocument('<div class="WDNC-container"></div>')
        const result = detectFromDom(doc)
        expect(result.platform).toBe('workday')
      })
    })

    describe('Greenhouse DOM', () => {
      it('should detect greenhouse-jobboard id', () => {
        const doc = createDocument('<div id="greenhouse-jobboard"></div>')
        const result = detectFromDom(doc)
        expect(result.platform).toBe('greenhouse')
        expect(result.matched).toBe(true)
      })

      it('should detect grnhse_app id', () => {
        const doc = createDocument('<div id="grnhse_app"></div>')
        const result = detectFromDom(doc)
        expect(result.platform).toBe('greenhouse')
      })

      it('should detect data-greenhouse attribute', () => {
        const doc = createDocument('<div data-greenhouse="true"></div>')
        const result = detectFromDom(doc)
        expect(result.platform).toBe('greenhouse')
      })

      it('should detect app_submit button', () => {
        const doc = createDocument('<button id="app_submit">Submit</button>')
        const result = detectFromDom(doc)
        expect(result.platform).toBe('greenhouse')
      })
    })

    describe('Unknown DOM', () => {
      it('should return unknown for generic HTML', () => {
        const doc = createDocument('<html><body><h1>Job Application</h1></body></html>')
        const result = detectFromDom(doc)
        expect(result.platform).toBe('unknown')
        expect(result.matched).toBe(false)
      })
    })
  })

  describe('detectPlatform', () => {
    function createDocument(html: string): Document {
      const dom = new JSDOM(html)
      return dom.window.document
    }

    it('should return high confidence when URL and DOM match', () => {
      const url = 'https://company.myworkdayjobs.com/External'
      const doc = createDocument('<div data-automation-id="test"></div>')
      const result = detectPlatform(url, doc)

      expect(result.platform).toBe('workday')
      expect(result.confidence).toBe('high')
      expect(result.detectionMethod).toBe('both')
    })

    it('should return medium confidence for URL only match', () => {
      const url = 'https://company.myworkdayjobs.com/External'
      const doc = createDocument('<div>Generic content</div>')
      const result = detectPlatform(url, doc)

      expect(result.platform).toBe('workday')
      expect(result.confidence).toBe('medium')
      expect(result.detectionMethod).toBe('url')
    })

    it('should return medium confidence for DOM only match', () => {
      const url = 'https://company.com/careers'
      const doc = createDocument('<div id="greenhouse-jobboard"></div>')
      const result = detectPlatform(url, doc)

      expect(result.platform).toBe('greenhouse')
      expect(result.confidence).toBe('medium')
      expect(result.detectionMethod).toBe('dom')
    })

    it('should return unknown with low confidence for no match', () => {
      const url = 'https://google.com'
      const doc = createDocument('<div>Hello World</div>')
      const result = detectPlatform(url, doc)

      expect(result.platform).toBe('unknown')
      expect(result.confidence).toBe('low')
    })

    it('should work without document parameter', () => {
      const result = detectPlatform('https://boards.greenhouse.io/company')
      expect(result.platform).toBe('greenhouse')
    })
  })

  describe('isSupported', () => {
    it('should return true for workday', () => {
      expect(isSupported({ platform: 'workday', confidence: 'high', url: '', detectionMethod: 'url' })).toBe(true)
    })

    it('should return true for greenhouse', () => {
      expect(isSupported({ platform: 'greenhouse', confidence: 'high', url: '', detectionMethod: 'url' })).toBe(true)
    })

    it('should return false for unknown', () => {
      expect(isSupported({ platform: 'unknown', confidence: 'low', url: '', detectionMethod: 'url' })).toBe(false)
    })
  })

  describe('getPlatformName', () => {
    it('should return Workday for workday', () => {
      expect(getPlatformName('workday')).toBe('Workday')
    })

    it('should return Greenhouse for greenhouse', () => {
      expect(getPlatformName('greenhouse')).toBe('Greenhouse')
    })

    it('should return Unknown for unknown', () => {
      expect(getPlatformName('unknown')).toBe('Unknown')
    })
  })
})

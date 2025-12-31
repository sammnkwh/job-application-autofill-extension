// Workday ATS Field Mappings
// Based on Workday's data-automation-id attributes and common field patterns

import type { PlatformMappingConfig, FieldMapping } from './types'

// Common Workday field selectors using data-automation-id
const workdayMappings: FieldMapping[] = [
  // ========== Personal Information ==========
  {
    profileField: 'personalInfo.firstName',
    fieldType: 'text',
    selectors: [
      {
        selector: '[data-automation-id="legalNameSection_firstName"]',
        labelPatterns: ['first name', 'given name'],
      },
      {
        selector: '[data-automation-id="firstName"]',
      },
      {
        selector: 'input[name*="firstName" i]',
        fallbacks: [
          'input[id*="firstName" i]',
          'input[aria-label*="first name" i]',
        ],
      },
    ],
    priority: 100,
    required: true,
  },
  {
    profileField: 'personalInfo.lastName',
    fieldType: 'text',
    selectors: [
      {
        selector: '[data-automation-id="legalNameSection_lastName"]',
        labelPatterns: ['last name', 'family name', 'surname'],
      },
      {
        selector: '[data-automation-id="lastName"]',
      },
      {
        selector: 'input[name*="lastName" i]',
        fallbacks: [
          'input[id*="lastName" i]',
          'input[aria-label*="last name" i]',
        ],
      },
    ],
    priority: 99,
    required: true,
  },
  {
    profileField: 'personalInfo.email',
    fieldType: 'email',
    selectors: [
      {
        selector: '[data-automation-id="email"]',
        labelPatterns: ['email', 'e-mail'],
      },
      {
        selector: '[data-automation-id="emailAddress"]',
      },
      {
        selector: 'input[type="email"]',
        fallbacks: [
          'input[name*="email" i]',
          'input[id*="email" i]',
        ],
      },
    ],
    priority: 98,
    required: true,
  },
  {
    profileField: 'personalInfo.phone',
    fieldType: 'tel',
    selectors: [
      {
        selector: '[data-automation-id="phone-number"]',
        labelPatterns: ['phone', 'telephone', 'mobile', 'cell'],
      },
      {
        selector: '[data-automation-id="phoneNumber"]',
      },
      {
        selector: 'input[type="tel"]',
        fallbacks: [
          'input[name*="phone" i]',
          'input[id*="phone" i]',
        ],
      },
    ],
    priority: 97,
    required: true,
  },

  // ========== Address Fields ==========
  {
    profileField: 'personalInfo.address.street',
    fieldType: 'text',
    selectors: [
      {
        selector: '[data-automation-id="addressSection_addressLine1"]',
        labelPatterns: ['street', 'address line 1', 'address'],
      },
      {
        selector: '[data-automation-id="address1"]',
      },
      {
        selector: 'input[name*="addressLine1" i]',
        fallbacks: [
          'input[name*="street" i]',
          'input[id*="address" i]',
        ],
      },
    ],
    priority: 90,
  },
  {
    profileField: 'personalInfo.address.city',
    fieldType: 'text',
    selectors: [
      {
        selector: '[data-automation-id="addressSection_city"]',
        labelPatterns: ['city', 'town'],
      },
      {
        selector: '[data-automation-id="city"]',
      },
      {
        selector: 'input[name*="city" i]',
        fallbacks: ['input[id*="city" i]'],
      },
    ],
    priority: 89,
  },
  {
    profileField: 'personalInfo.address.state',
    fieldType: 'select',
    selectors: [
      {
        selector: '[data-automation-id="addressSection_countryRegion"]',
        labelPatterns: ['state', 'province', 'region'],
      },
      {
        selector: '[data-automation-id="state"]',
      },
      {
        selector: 'select[name*="state" i]',
        fallbacks: [
          'select[id*="state" i]',
          '[data-automation-id*="state" i]',
        ],
      },
    ],
    priority: 88,
  },
  {
    profileField: 'personalInfo.address.zipCode',
    fieldType: 'text',
    selectors: [
      {
        selector: '[data-automation-id="addressSection_postalCode"]',
        labelPatterns: ['zip', 'postal code', 'postcode'],
      },
      {
        selector: '[data-automation-id="postalCode"]',
      },
      {
        selector: 'input[name*="postal" i]',
        fallbacks: [
          'input[name*="zip" i]',
          'input[id*="zip" i]',
        ],
      },
    ],
    priority: 87,
  },
  {
    profileField: 'personalInfo.address.country',
    fieldType: 'select',
    selectors: [
      {
        selector: '[data-automation-id="addressSection_country"]',
        labelPatterns: ['country'],
      },
      {
        selector: '[data-automation-id="country"]',
      },
      {
        selector: 'select[name*="country" i]',
        fallbacks: ['select[id*="country" i]'],
      },
    ],
    priority: 86,
  },

  // ========== Professional Links ==========
  {
    profileField: 'professionalLinks.linkedin',
    fieldType: 'text',
    selectors: [
      {
        selector: '[data-automation-id="linkedinQuestion"]',
        labelPatterns: ['linkedin', 'linked in'],
      },
      {
        selector: 'input[name*="linkedin" i]',
        fallbacks: [
          'input[id*="linkedin" i]',
          'input[placeholder*="linkedin" i]',
        ],
      },
    ],
    priority: 80,
  },
  {
    profileField: 'professionalLinks.github',
    fieldType: 'text',
    selectors: [
      {
        selector: 'input[name*="github" i]',
        labelPatterns: ['github'],
        fallbacks: [
          'input[id*="github" i]',
          'input[placeholder*="github" i]',
        ],
      },
    ],
    priority: 79,
  },
  {
    profileField: 'professionalLinks.portfolio',
    fieldType: 'text',
    selectors: [
      {
        selector: 'input[name*="portfolio" i]',
        labelPatterns: ['portfolio', 'website', 'personal site'],
        fallbacks: [
          'input[id*="portfolio" i]',
          'input[name*="website" i]',
        ],
      },
    ],
    priority: 78,
  },

  // ========== Work Authorization ==========
  {
    profileField: 'workAuthorization.authorized',
    fieldType: 'radio',
    selectors: [
      {
        selector: '[data-automation-id="workAuthorizationQuestion"]',
        labelPatterns: [
          'authorized to work',
          'legally authorized',
          'work authorization',
          'eligible to work',
        ],
      },
      {
        selector: 'input[type="radio"][name*="authorized" i]',
        fallbacks: [
          'input[type="radio"][name*="authorization" i]',
          'input[type="radio"][name*="eligible" i]',
        ],
      },
    ],
    priority: 70,
    transform: (value: unknown) => (value === true ? 'Yes' : 'No'),
  },
  {
    profileField: 'workAuthorization.sponsorship',
    fieldType: 'radio',
    selectors: [
      {
        selector: '[data-automation-id="sponsorshipQuestion"]',
        labelPatterns: [
          'sponsorship',
          'require sponsorship',
          'visa sponsorship',
          'work visa',
        ],
      },
      {
        selector: 'input[type="radio"][name*="sponsorship" i]',
        fallbacks: [
          'input[type="radio"][name*="visa" i]',
        ],
      },
    ],
    priority: 69,
    transform: (value: unknown) => (value === true ? 'Yes' : 'No'),
  },

  // ========== Self Identification (EEO) ==========
  {
    profileField: 'selfIdentification.gender',
    fieldType: 'select',
    selectors: [
      {
        selector: '[data-automation-id="genderDropdown"]',
        labelPatterns: ['gender', 'sex'],
      },
      {
        selector: 'select[name*="gender" i]',
        fallbacks: [
          'select[id*="gender" i]',
          '[data-automation-id*="gender" i]',
        ],
      },
    ],
    priority: 50,
  },
  {
    profileField: 'selfIdentification.ethnicity',
    fieldType: 'select',
    selectors: [
      {
        selector: '[data-automation-id="ethnicityDropdown"]',
        labelPatterns: ['ethnicity', 'race', 'ethnic background'],
      },
      {
        selector: 'select[name*="ethnicity" i]',
        fallbacks: [
          'select[id*="ethnicity" i]',
          'select[name*="race" i]',
        ],
      },
    ],
    priority: 49,
  },
  {
    profileField: 'selfIdentification.veteran',
    fieldType: 'select',
    selectors: [
      {
        selector: '[data-automation-id="veteranStatusDropdown"]',
        labelPatterns: ['veteran', 'military', 'armed forces'],
      },
      {
        selector: 'select[name*="veteran" i]',
        fallbacks: [
          'select[id*="veteran" i]',
          '[data-automation-id*="veteran" i]',
        ],
      },
    ],
    priority: 48,
  },
  {
    profileField: 'selfIdentification.disability',
    fieldType: 'select',
    selectors: [
      {
        selector: '[data-automation-id="disabilityStatusDropdown"]',
        labelPatterns: ['disability', 'disabled'],
      },
      {
        selector: 'select[name*="disability" i]',
        fallbacks: [
          'select[id*="disability" i]',
          '[data-automation-id*="disability" i]',
        ],
      },
    ],
    priority: 47,
  },
]

// Workday platform configuration
export const workdayConfig: PlatformMappingConfig = {
  platform: 'workday',
  version: '1.0.0',
  mappings: workdayMappings,
  globalSelectors: {
    formContainer: '[data-automation-id="jobApplicationContainer"]',
    submitButton: '[data-automation-id="bottom-navigation-next-button"]',
    nextButton: '[data-automation-id="bottom-navigation-next-button"]',
    errorContainer: '[data-automation-id="errorMessage"]',
  },
}

export default workdayConfig

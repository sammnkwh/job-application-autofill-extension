// Greenhouse ATS Field Mappings
// Based on Greenhouse's common field patterns and naming conventions

import type { PlatformMappingConfig, FieldMapping } from './types'

// Greenhouse field selectors
const greenhouseMappings: FieldMapping[] = [
  // ========== Personal Information ==========
  {
    profileField: 'personalInfo.firstName',
    fieldType: 'text',
    selectors: [
      {
        selector: '#first_name',
        labelPatterns: ['first name', 'given name'],
      },
      {
        selector: 'input[name="job_application[first_name]"]',
      },
      {
        selector: 'input[autocomplete="given-name"]',
        fallbacks: [
          'input[name*="first_name" i]',
          'input[id*="first_name" i]',
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
        selector: '#last_name',
        labelPatterns: ['last name', 'family name', 'surname'],
      },
      {
        selector: 'input[name="job_application[last_name]"]',
      },
      {
        selector: 'input[autocomplete="family-name"]',
        fallbacks: [
          'input[name*="last_name" i]',
          'input[id*="last_name" i]',
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
        selector: '#email',
        labelPatterns: ['email', 'e-mail'],
      },
      {
        selector: 'input[name="job_application[email]"]',
      },
      {
        selector: 'input[type="email"]',
        fallbacks: [
          'input[name*="email" i]',
          'input[autocomplete="email"]',
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
        selector: '#phone',
        labelPatterns: ['phone', 'telephone', 'mobile'],
      },
      {
        selector: 'input[name="job_application[phone]"]',
      },
      {
        selector: 'input[type="tel"]',
        fallbacks: [
          'input[name*="phone" i]',
          'input[autocomplete="tel"]',
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
        selector: 'input[name*="address" i][name*="street" i]',
        labelPatterns: ['street', 'address'],
      },
      {
        selector: 'input[autocomplete="street-address"]',
        fallbacks: [
          'input[id*="street" i]',
          'input[name*="address_line" i]',
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
        selector: 'input[name*="city" i]',
        labelPatterns: ['city', 'town'],
      },
      {
        selector: 'input[autocomplete="address-level2"]',
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
        selector: 'select[name*="state" i]',
        labelPatterns: ['state', 'province', 'region'],
      },
      {
        selector: 'select[autocomplete="address-level1"]',
        fallbacks: [
          'select[id*="state" i]',
          'input[name*="state" i]',
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
        selector: 'input[name*="zip" i]',
        labelPatterns: ['zip', 'postal code', 'postcode'],
      },
      {
        selector: 'input[autocomplete="postal-code"]',
        fallbacks: [
          'input[name*="postal" i]',
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
        selector: 'select[name*="country" i]',
        labelPatterns: ['country'],
      },
      {
        selector: 'select[autocomplete="country"]',
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
        selector: 'input[name*="linkedin" i]',
        labelPatterns: ['linkedin', 'linked in', 'linkedin profile'],
      },
      {
        selector: 'input[id*="linkedin" i]',
        fallbacks: [
          'input[placeholder*="linkedin" i]',
          'input[data-field*="linkedin" i]',
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
        labelPatterns: ['github', 'github profile'],
      },
      {
        selector: 'input[id*="github" i]',
        fallbacks: ['input[placeholder*="github" i]'],
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
        labelPatterns: ['portfolio', 'website', 'personal site', 'personal website'],
      },
      {
        selector: 'input[name*="website" i]',
        fallbacks: [
          'input[id*="portfolio" i]',
          'input[id*="website" i]',
        ],
      },
    ],
    priority: 78,
  },

  // ========== Work Authorization ==========
  {
    profileField: 'workAuthorization.authorized',
    fieldType: 'select',
    selectors: [
      {
        selector: 'select[name*="authorized" i]',
        labelPatterns: [
          'authorized to work',
          'legally authorized',
          'eligible to work',
        ],
      },
      {
        selector: 'select[id*="authorized" i]',
        fallbacks: ['select[name*="work_authorization" i]'],
      },
    ],
    priority: 70,
    transform: (value: unknown) => (value === true ? 'Yes' : 'No'),
  },
  {
    profileField: 'workAuthorization.sponsorship',
    fieldType: 'select',
    selectors: [
      {
        selector: 'select[name*="sponsorship" i]',
        labelPatterns: [
          'sponsorship',
          'require sponsorship',
          'visa sponsorship',
        ],
      },
      {
        selector: 'select[id*="sponsorship" i]',
        fallbacks: ['select[name*="visa" i]'],
      },
    ],
    priority: 69,
    transform: (value: unknown) => (value === true ? 'Yes' : 'No'),
  },

  // ========== Self Identification (EEO/EEOC) ==========
  {
    profileField: 'selfIdentification.gender',
    fieldType: 'select',
    selectors: [
      {
        selector: '#job_application_gender',
        labelPatterns: ['gender', 'sex'],
      },
      {
        selector: 'select[name*="gender" i]',
        fallbacks: [
          'select[id*="gender" i]',
          'input[type="radio"][name*="gender" i]',
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
        selector: '#job_application_race',
        labelPatterns: ['ethnicity', 'race', 'ethnic'],
      },
      {
        selector: 'select[name*="race" i]',
        fallbacks: [
          'select[name*="ethnicity" i]',
          'select[id*="ethnicity" i]',
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
        selector: '#job_application_veteran_status',
        labelPatterns: ['veteran', 'military service'],
      },
      {
        selector: 'select[name*="veteran" i]',
        fallbacks: ['select[id*="veteran" i]'],
      },
    ],
    priority: 48,
  },
  {
    profileField: 'selfIdentification.disability',
    fieldType: 'select',
    selectors: [
      {
        selector: '#job_application_disability_status',
        labelPatterns: ['disability'],
      },
      {
        selector: 'select[name*="disability" i]',
        fallbacks: ['select[id*="disability" i]'],
      },
    ],
    priority: 47,
  },

  // ========== Cover Letter ==========
  {
    profileField: 'experience',
    fieldType: 'textarea',
    selectors: [
      {
        selector: '#cover_letter',
        labelPatterns: ['cover letter'],
      },
      {
        selector: 'textarea[name*="cover_letter" i]',
        fallbacks: ['textarea[id*="cover" i]'],
      },
    ],
    priority: 60,
  },
]

// Greenhouse platform configuration
export const greenhouseConfig: PlatformMappingConfig = {
  platform: 'greenhouse',
  version: '1.0.0',
  mappings: greenhouseMappings,
  globalSelectors: {
    formContainer: '#application_form',
    submitButton: '#submit_app',
    nextButton: 'button[type="submit"]',
    errorContainer: '.field-error-msg',
  },
}

export default greenhouseConfig

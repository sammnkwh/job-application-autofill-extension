
# Job Application Autofill Extension - Implementation Tasks

## Relevant Files

### Project Structure
- `manifest.json` - Chrome extension manifest (Manifest V3)
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Vitest test configuration
- `playwright.config.ts` - Playwright E2E test configuration

### Source Files
- `src/background/index.ts` - Background service worker
- `src/content/index.ts` - Content script for Workday/Greenhouse pages
- `src/content/detector.ts` - ATS platform detection logic
- `src/content/detector.test.ts` - Tests for platform detection
- `src/content/autofill.ts` - Auto-fill execution logic
- `src/content/autofill.test.ts` - Tests for auto-fill
- `src/popup/App.tsx` - Extension popup main component
- `src/popup/main.tsx` - Popup entry point
- `src/options/App.tsx` - Options/settings page
- `src/options/main.tsx` - Options entry point
- `src/pages/ProfileForm.tsx` - Profile data collection form
- `src/pages/Welcome.tsx` - First-time setup welcome page

### Core Modules
- `src/utils/storage.ts` - Chrome storage wrapper with encryption
- `src/utils/storage.test.ts` - Tests for storage module
- `src/utils/encryption.ts` - AES-256-GCM encryption utilities
- `src/utils/encryption.test.ts` - Tests for encryption
- `src/utils/validation.ts` - Form validation utilities
- `src/utils/validation.test.ts` - Tests for validation
- `src/utils/migration.ts` - Schema version migration
- `src/utils/migration.test.ts` - Tests for migration

### Parsers
- `src/parsers/resumeParser.ts` - Main resume parsing orchestrator
- `src/parsers/resumeParser.test.ts` - Tests for resume parser
- `src/parsers/pdfParser.ts` - PDF parsing with pdfjs-dist
- `src/parsers/pdfParser.test.ts` - Tests for PDF parser
- `src/parsers/docxParser.ts` - DOCX parsing with mammoth.js
- `src/parsers/docxParser.test.ts` - Tests for DOCX parser
- `src/parsers/textParser.ts` - Plain text parsing
- `src/parsers/textParser.test.ts` - Tests for text parser
- `src/parsers/extractors.ts` - Data extraction (name, email, phone, etc.)
- `src/parsers/extractors.test.ts` - Tests for extractors

### Field Mapping
- `src/mapping/fieldMapper.ts` - Main field mapping engine
- `src/mapping/fieldMapper.test.ts` - Tests for field mapper
- `src/mapping/labelDictionary.ts` - Label-to-field mapping dictionaries
- `src/mapping/labelDictionary.test.ts` - Tests for label dictionary
- `src/mapping/fuzzyMatch.ts` - Fuzzy string matching (Levenshtein)
- `src/mapping/fuzzyMatch.test.ts` - Tests for fuzzy matching
- `src/mapping/workdayMapper.ts` - Workday-specific field mappings
- `src/mapping/greenhouseMapper.ts` - Greenhouse-specific field mappings

### UI Components (shadcn/ui)
- `src/components/ui/button.tsx` - Button component
- `src/components/ui/input.tsx` - Input component
- `src/components/ui/label.tsx` - Label component
- `src/components/ui/card.tsx` - Card component
- `src/components/ui/badge.tsx` - Badge component
- `src/components/ui/alert.tsx` - Alert component
- `src/components/ui/select.tsx` - Select/dropdown component
- `src/components/ui/textarea.tsx` - Textarea component
- `src/components/ui/checkbox.tsx` - Checkbox component
- `src/components/ui/calendar.tsx` - Date picker component
- `src/components/ui/dialog.tsx` - Dialog/modal component
- `src/components/ui/tabs.tsx` - Tabs component
- `src/components/ui/progress.tsx` - Progress bar component
- `src/components/ui/switch.tsx` - Toggle switch component

### Types & Schema
- `src/types/profile.ts` - Profile data TypeScript types
- `src/types/schema.ts` - JSON schema definition with version

### Test Fixtures
- `tests/fixtures/mock-workday.html` - Mock Workday form for E2E tests
- `tests/fixtures/mock-greenhouse.html` - Mock Greenhouse form for E2E tests
- `tests/fixtures/sample-resume.pdf` - Sample PDF resume for testing
- `tests/fixtures/sample-resume.docx` - Sample DOCX resume for testing
- `tests/fixtures/sample-resume.txt` - Sample TXT resume for testing

### Assets
- `public/icons/icon-16.png` - Extension icon 16x16
- `public/icons/icon-48.png` - Extension icon 48x48
- `public/icons/icon-128.png` - Extension icon 128x128
- `public/icons/icon-16-active.png` - Green icon 16x16 (platform detected)
- `public/icons/icon-48-active.png` - Green icon 48x48
- `public/icons/icon-128-active.png` - Green icon 128x128

### Notes

- Unit tests placed alongside source files (e.g., `validation.ts` and `validation.test.ts`)
- Use `npm run test` to run all tests
- Use `npm run test -- --watch` for watch mode during development
- Use `npm run build` to build the extension
- Load unpacked extension from `dist/` folder in Chrome for testing
- Each task follows: implement → write tests → run tests → verify pass

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, check it off by changing `- [ ]` to `- [x]`. Update after completing each sub-task, not just parent tasks.

Example:
- `- [ ] 1.1 Set up Vite project` → `- [x] 1.1 Set up Vite project` (after completing)

---

## Tasks

### 0.0 Create Feature Branch
- [x] 0.1 Create and checkout a new branch: `git checkout -b feature/autofill-extension`
- [x] 0.2 Push branch to remote: `git push -u origin feature/autofill-extension`

---

### 1.0 Project Setup & Infrastructure
Set up Chrome extension project with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, and testing infrastructure.

- [ ] 1.1 Initialize Vite project with React and TypeScript template
- [ ] 1.2 Install and configure Tailwind CSS
- [ ] 1.3 Initialize shadcn/ui and install core components (button, input, label, card, badge, alert)
- [ ] 1.4 Create Chrome extension manifest.json (Manifest V3)
- [ ] 1.5 Configure Vite for Chrome extension build (multiple entry points: popup, options, content, background)
- [ ] 1.6 Set up project folder structure (src/popup, src/content, src/background, src/options, src/utils, src/components, src/parsers, src/mapping)
- [ ] 1.7 Create TypeScript types for profile data (src/types/profile.ts)
- [ ] 1.8 Install and configure Vitest for unit/integration testing
- [ ] 1.9 Install and configure Playwright for E2E testing
- [ ] 1.10 Create placeholder entry files for popup, content script, background worker, and options page
- [ ] 1.11 Add npm scripts: dev, build, test, test:watch, test:e2e
- [ ] 1.12 Test that extension loads in Chrome (load unpacked from dist/)
- [ ] 1.13 Run initial test suite to verify testing setup works
- [ ] 1.14 Commit: "Set up project infrastructure"

---

### 2.0 Core Data Layer
Implement profile JSON schema, Chrome storage integration, AES-256-GCM encryption, and schema versioning/migration system.

- [ ] 2.1 Define JSON schema for profile data with schemaVersion field (src/types/schema.ts)
- [ ] 2.2 Implement encryption module using Web Crypto API (AES-256-GCM)
- [ ] 2.3 Write unit tests for encryption (encrypt/decrypt roundtrip, error handling)
- [ ] 2.4 Run encryption tests and verify they pass
- [ ] 2.5 Implement Chrome storage wrapper (save, get, delete, clear)
- [ ] 2.6 Integrate encryption into storage wrapper (encrypt on save, decrypt on load)
- [ ] 2.7 Write unit tests for storage module (save/load profile, handle missing data)
- [ ] 2.8 Run storage tests and verify they pass
- [ ] 2.9 Implement schema migration system (detect version, run migrations)
- [ ] 2.10 Write unit tests for migration (v1.0 data transforms correctly)
- [ ] 2.11 Run migration tests and verify they pass
- [ ] 2.12 Implement storage quota check (warn at 4MB usage)
- [ ] 2.13 Write integration test: full save → load → verify cycle with encryption
- [ ] 2.14 Run all data layer tests and verify they pass
- [ ] 2.15 Commit: "Add core data layer with encryption and storage"

---

### 3.0 Resume Parsing Module
Build resume parser supporting PDF, DOCX, and TXT formats. Extract personal info, work history, education, skills.

- [ ] 3.1 Install pdfjs-dist and mammoth.js dependencies
- [ ] 3.2 Create sample test resume files (PDF, DOCX, TXT) in tests/fixtures/
- [ ] 3.3 Implement PDF text extraction using pdfjs-dist
- [ ] 3.4 Write unit tests for PDF parser (extract text from sample PDF)
- [ ] 3.5 Run PDF parser tests and verify they pass
- [ ] 3.6 Implement DOCX text extraction using mammoth.js
- [ ] 3.7 Write unit tests for DOCX parser (extract text from sample DOCX)
- [ ] 3.8 Run DOCX parser tests and verify they pass
- [ ] 3.9 Implement plain text parser (handle .txt files)
- [ ] 3.10 Write unit tests for text parser
- [ ] 3.11 Run text parser tests and verify they pass
- [ ] 3.12 Implement data extractors: name extraction (regex patterns)
- [ ] 3.13 Implement data extractors: email extraction
- [ ] 3.14 Implement data extractors: phone number extraction
- [ ] 3.15 Implement data extractors: LinkedIn/GitHub URL extraction
- [ ] 3.16 Implement data extractors: work experience extraction (job titles, companies, dates)
- [ ] 3.17 Implement data extractors: education extraction (schools, degrees, dates)
- [ ] 3.18 Implement data extractors: skills extraction
- [ ] 3.19 Write unit tests for each extractor function
- [ ] 3.20 Run extractor tests and verify they pass
- [ ] 3.21 Create main resumeParser orchestrator (detect file type, parse, extract all data)
- [ ] 3.22 Add confidence scores to extracted data (high/medium/low)
- [ ] 3.23 Write integration tests for full resume parsing flow
- [ ] 3.24 Run all parser tests and verify they pass
- [ ] 3.25 Commit: "Add resume parsing module"

---

### 4.0 Profile Management UI
Create profile data collection form with 8 sections using shadcn/ui components. Build extension popup and profile dashboard.

- [ ] 4.1 Install additional shadcn/ui components (select, textarea, checkbox, calendar, form, dialog, tabs, progress, separator, scroll-area)
- [ ] 4.2 Create form validation utilities (email, phone, URL formats)
- [ ] 4.3 Write unit tests for validation utilities
- [ ] 4.4 Run validation tests and verify they pass
- [ ] 4.5 Build Section 1: Personal Information form (first name, last name, email, phone, address)
- [ ] 4.6 Build Section 2: Professional Links form (LinkedIn, GitHub, portfolio)
- [ ] 4.7 Build Section 3: Work Experience form (dynamic add/remove entries)
- [ ] 4.8 Build Section 4: Education form (dynamic add/remove entries)
- [ ] 4.9 Build Section 5: Skills & Qualifications form (skills tags, certifications, languages)
- [ ] 4.10 Build Section 6: Documents section (resume upload with drag-drop)
- [ ] 4.11 Build Section 7: Work Authorization form (visa status, sponsorship)
- [ ] 4.12 Build Section 8: Voluntary Self-Identification form (EEO demographics with disclaimers)
- [ ] 4.13 Integrate resume parser: upload resume → parse → auto-populate form fields
- [ ] 4.14 Add profile completeness indicator (percentage complete)
- [ ] 4.15 Implement form save functionality (validate → encrypt → store)
- [ ] 4.16 Build Welcome page for first-time setup flow
- [ ] 4.17 Build extension popup UI with context-aware content
- [ ] 4.18 Add "Edit Profile" button to popup
- [ ] 4.19 Add "Last Updated" timestamp display to popup
- [ ] 4.20 Add profile completeness badge to popup
- [ ] 4.21 Write integration tests for form save/load cycle
- [ ] 4.22 Run all UI tests and verify they pass
- [ ] 4.23 Manual test: complete full profile setup flow in browser
- [ ] 4.24 Commit: "Add profile management UI"

---

### 5.0 ATS Platform Detection
Detect Workday and Greenhouse platforms via URL patterns and DOM inspection. Update extension icon color.

- [ ] 5.1 Define URL patterns for Workday (*.myworkdayjobs.com, *.workday.com)
- [ ] 5.2 Define URL patterns for Greenhouse (*.greenhouse.io, boards.greenhouse.io)
- [ ] 5.3 Implement URL pattern matching function
- [ ] 5.4 Write unit tests for URL pattern matching
- [ ] 5.5 Run URL pattern tests and verify they pass
- [ ] 5.6 Implement Workday DOM detection (look for data-automation-id attributes)
- [ ] 5.7 Implement Greenhouse DOM detection (look for specific class names/IDs)
- [ ] 5.8 Write unit tests for DOM detection (using mock HTML)
- [ ] 5.9 Run DOM detection tests and verify they pass
- [ ] 5.10 Create detector module that combines URL + DOM detection
- [ ] 5.11 Create extension icons (gray default, green active) - all sizes
- [ ] 5.12 Implement background service worker to receive detection messages
- [ ] 5.13 Implement icon color change based on detection result
- [ ] 5.14 Implement content script that runs detection on page load
- [ ] 5.15 Write integration test: load mock page → verify detection → verify icon change
- [ ] 5.16 Run all detection tests and verify they pass
- [ ] 5.17 Manual test: navigate to real Workday page, verify green icon
- [ ] 5.18 Manual test: navigate to real Greenhouse page, verify green icon
- [ ] 5.19 Manual test: navigate to unsupported page, verify gray icon
- [ ] 5.20 Commit: "Add ATS platform detection"

---

### 6.0 Field Mapping Engine
Implement multi-layer field matching: label matching, field type detection, context analysis, fuzzy matching with confidence scores.

- [ ] 6.1 Create label dictionary for common field variations (firstName maps to ["first name", "given name", "fname", etc.])
- [ ] 6.2 Write unit tests for label dictionary lookups
- [ ] 6.3 Run label dictionary tests and verify they pass
- [ ] 6.4 Implement Levenshtein distance function for fuzzy matching
- [ ] 6.5 Write unit tests for fuzzy matching
- [ ] 6.6 Run fuzzy matching tests and verify they pass
- [ ] 6.7 Implement field type detection (text input, dropdown, checkbox, date picker, textarea)
- [ ] 6.8 Write unit tests for field type detection
- [ ] 6.9 Run field type detection tests and verify they pass
- [ ] 6.10 Implement context analysis (check section headers, placeholder text, nearby labels)
- [ ] 6.11 Write unit tests for context analysis
- [ ] 6.12 Run context analysis tests and verify they pass
- [ ] 6.13 Implement confidence scoring algorithm (combine all layers, output 0-100 score)
- [ ] 6.14 Write unit tests for confidence scoring
- [ ] 6.15 Run confidence scoring tests and verify they pass
- [ ] 6.16 Create Workday-specific field mappings (handle Workday's unique field structures)
- [ ] 6.17 Create Greenhouse-specific field mappings
- [ ] 6.18 Build main fieldMapper module that orchestrates all layers
- [ ] 6.19 Write integration tests: mock form HTML → detect fields → map to profile data → verify matches
- [ ] 6.20 Run all field mapping tests and verify they pass
- [ ] 6.21 Commit: "Add field mapping engine"

---

### 7.0 Auto-Fill Functionality
Build form filling logic for different field types. Show summary of filled/unfilled fields.

- [ ] 7.1 Implement text input filling (set value, trigger change event)
- [ ] 7.2 Implement dropdown/select filling (match option text, select)
- [ ] 7.3 Implement checkbox filling (check/uncheck based on boolean)
- [ ] 7.4 Implement date picker filling (parse date format, populate)
- [ ] 7.5 Implement textarea filling
- [ ] 7.6 Write unit tests for each field type filler
- [ ] 7.7 Run field filler tests and verify they pass
- [ ] 7.8 Implement "supplement not override" logic (skip fields with existing values)
- [ ] 7.9 Write unit tests for supplement logic
- [ ] 7.10 Run supplement logic tests and verify they pass
- [ ] 7.11 Build autofill orchestrator: get profile → detect fields → map → fill high-confidence matches
- [ ] 7.12 Implement progress indicator during fill operation
- [ ] 7.13 Implement unfilled field highlighting (yellow/orange border)
- [ ] 7.14 Build summary panel UI: "X fields filled, Y fields need attention"
- [ ] 7.15 Add list of unfilled fields with field names in summary
- [ ] 7.16 Implement "Autofill This Page" button in popup (visible when on supported platform)
- [ ] 7.17 Implement "Not available" message in popup (visible when on unsupported platform)
- [ ] 7.18 Wire up popup button to trigger autofill via message to content script
- [ ] 7.19 Write integration tests using mock Workday HTML fixture
- [ ] 7.20 Write integration tests using mock Greenhouse HTML fixture
- [ ] 7.21 Run all autofill tests and verify they pass
- [ ] 7.22 Commit: "Add auto-fill functionality"

---

### 8.0 Export/Import & Settings
Implement profile export to JSON file, import with validation, and settings panel.

- [ ] 8.1 Implement profile export (generate JSON, trigger download as job-profile-YYYY-MM-DD.json)
- [ ] 8.2 Write unit tests for export (verify JSON structure, filename format)
- [ ] 8.3 Run export tests and verify they pass
- [ ] 8.4 Implement JSON validation for import (check schema version, required fields)
- [ ] 8.5 Write unit tests for import validation (valid JSON, invalid JSON, wrong version)
- [ ] 8.6 Run import validation tests and verify they pass
- [ ] 8.7 Implement profile import (file picker, validate, confirm overwrite dialog, load)
- [ ] 8.8 Add "Export Profile" button to popup
- [ ] 8.9 Add "Import Profile" button to popup
- [ ] 8.10 Build settings/options page UI
- [ ] 8.11 Add confidence threshold setting (slider 70-95%, default 80%)
- [ ] 8.12 Add "Clear All Data" option with confirmation dialog
- [ ] 8.13 Add "Report Issue" button (sanitize logs, copy to clipboard)
- [ ] 8.14 Implement log sanitization (remove PII from console logs)
- [ ] 8.15 Write unit tests for log sanitization
- [ ] 8.16 Run sanitization tests and verify they pass
- [ ] 8.17 Add extension version display in settings
- [ ] 8.18 Write integration test: export → import on fresh install → verify data restored
- [ ] 8.19 Run all export/import tests and verify they pass
- [ ] 8.20 Commit: "Add export/import and settings"

---

### 9.0 Integration Testing & Polish
E2E tests with Playwright, manual testing on real sites, bug fixes, and final polish.

- [ ] 9.1 Create mock Workday HTML fixture (realistic form structure)
- [ ] 9.2 Create mock Greenhouse HTML fixture (realistic form structure)
- [ ] 9.3 Write Playwright E2E test: first-time setup flow (install → welcome → upload resume → save profile)
- [ ] 9.4 Write Playwright E2E test: popup opens and shows correct state
- [ ] 9.5 Write Playwright E2E test: autofill on mock Workday page
- [ ] 9.6 Write Playwright E2E test: autofill on mock Greenhouse page
- [ ] 9.7 Write Playwright E2E test: export and import profile
- [ ] 9.8 Run all E2E tests and verify they pass
- [ ] 9.9 Manual test checklist: Workday multi-page application (do not submit)
- [ ] 9.10 Manual test checklist: Greenhouse single-page application (do not submit)
- [ ] 9.11 Manual test: Workday with pre-filled fields (verify supplement behavior)
- [ ] 9.12 Manual test: various resume formats (PDF, DOCX, TXT)
- [ ] 9.13 Manual test: export profile, delete extension data, import profile
- [ ] 9.14 Fix any bugs discovered during testing
- [ ] 9.15 Run full test suite (unit + integration + E2E)
- [ ] 9.16 Verify all tests pass
- [ ] 9.17 Code cleanup and final review
- [ ] 9.18 Update README with installation and usage instructions
- [ ] 9.19 Commit: "Final polish and documentation"
- [ ] 9.20 Merge feature branch to main: `git checkout main && git merge feature/autofill-extension`
- [ ] 9.21 Push to GitHub: `git push`
- [ ] 9.22 Tag release: `git tag v1.0.0 && git push --tags`

---

### 10.0 Phone Country Code Feature
Add country code dropdown with emoji flags to the phone number field.

- [x] 10.1 Create country code data file with common and all countries (`src/data/countryCodes.ts`)
- [x] 10.2 Write unit tests for country code data and helper functions
- [x] 10.3 Run country code data tests and verify they pass
- [x] 10.4 Create CountryCodeSelect component with emoji flags (`src/components/ui/country-code-select.tsx`)
- [x] 10.5 Write unit tests for CountryCodeSelect component
- [x] 10.6 Run CountryCodeSelect tests and verify they pass
- [x] 10.7 Update PersonalInfoSection to use country code dropdown with phone input
- [x] 10.8 Write integration tests for phone field with country code
- [x] 10.9 Run PersonalInfoSection tests and verify they pass
- [x] 10.10 Run full test suite and verify all tests pass
- [x] 10.11 Commit: "Add country code dropdown with flags to phone field"

---

## Summary

| Task | Sub-tasks | Focus |
|------|-----------|-------|
| 0.0 | 2 | Git setup |
| 1.0 | 14 | Project infrastructure |
| 2.0 | 15 | Data layer & encryption |
| 3.0 | 25 | Resume parsing |
| 4.0 | 24 | Profile UI |
| 5.0 | 20 | ATS detection |
| 6.0 | 21 | Field mapping |
| 7.0 | 22 | Auto-fill |
| 8.0 | 20 | Export/Import/Settings |
| 9.0 | 22 | Testing & polish |
| 10.0 | 11 | Phone country code |

**Total: 196 sub-tasks**

---

*Generated: December 30, 2024*
*Based on PRD v1.0*

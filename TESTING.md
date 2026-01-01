# Manual Testing Checklist

This document provides comprehensive testing checklists for the Job Application Autofill extension.

## Pre-Testing Setup

1. Build the extension: `npm run build`
2. Load the extension in Brave/Edge:
   - Go to `brave://extensions` or `edge://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

---

## Test Suite 1: First-Time Setup Flow

### 1.1 Initial State
- [ ] Click extension icon - popup shows "Welcome!" message
- [ ] Badge shows "Setup Needed"
- [ ] "Set Up Profile" button is visible
- [ ] Security message about encryption is visible

### 1.2 Profile Setup
- [ ] Click "Set Up Profile" - opens options page
- [ ] Profile tab is active by default
- [ ] All form sections are visible:
  - [ ] Personal Information
  - [ ] Professional Links
  - [ ] Work Experience
  - [ ] Education
  - [ ] Skills & Qualifications
  - [ ] Documents
  - [ ] Work Authorization
  - [ ] Voluntary Self-Identification

### 1.3 Fill Profile
- [ ] Fill in First Name, Last Name, Email, Phone
- [ ] Fill in address fields
- [ ] Add LinkedIn URL
- [ ] Set work authorization to "Yes"
- [ ] Set sponsorship to "No"
- [ ] Click "Save Profile"
- [ ] Success message appears
- [ ] Profile completeness shows 100% (or appropriate %)

### 1.4 Verify Popup Updates
- [ ] Click extension icon
- [ ] Badge now shows "Ready"
- [ ] Profile completeness bar is visible
- [ ] "Edit Profile" button is visible
- [ ] "Last updated" timestamp is shown

---

## Test Suite 2: Workday Autofill

### 2.1 Navigate to Workday Job Application
- [ ] Go to any Workday job application page (e.g., `*.myworkdayjobs.com`)
- [ ] Extension icon changes to green
- [ ] Badge shows "WD"
- [ ] Floating indicator appears (green pulsing button)

### 2.2 Trigger Autofill via Floating Indicator
- [ ] Click the floating indicator button
- [ ] Progress indicator appears ("Filling form fields...")
- [ ] Summary panel shows results (filled/skipped/failed counts)
- [ ] Fields are highlighted if unfilled

### 2.3 Verify Filled Fields
- [ ] First Name is filled correctly
- [ ] Last Name is filled correctly
- [ ] Email is filled correctly
- [ ] Phone is filled correctly
- [ ] Address fields are filled (if visible)
- [ ] LinkedIn URL is filled (if field exists)

### 2.4 Trigger Autofill via Popup
- [ ] Click extension icon
- [ ] "Workday Detected" card is visible (green background)
- [ ] Preview shows "X fields ready to fill"
- [ ] Click "Autofill This Page" button
- [ ] Autofill executes successfully

### 2.5 Supplement Not Override
- [ ] Pre-fill some fields manually
- [ ] Trigger autofill
- [ ] Pre-filled fields are NOT overwritten
- [ ] Only empty fields are filled

---

## Test Suite 3: Greenhouse Autofill

### 3.1 Navigate to Greenhouse Job Application
- [ ] Go to any Greenhouse job application page (e.g., `boards.greenhouse.io/*`)
- [ ] Extension icon changes to green
- [ ] Badge shows "GH"
- [ ] Floating indicator appears

### 3.2 Trigger Autofill
- [ ] Click floating indicator OR popup button
- [ ] Fields are filled correctly
- [ ] Summary shows results

### 3.3 Verify Filled Fields
- [ ] First Name is filled correctly
- [ ] Last Name is filled correctly
- [ ] Email is filled correctly
- [ ] Phone is filled correctly
- [ ] LinkedIn is filled (if field exists)
- [ ] GitHub is filled (if field exists)

---

## Test Suite 4: Export/Import

### 4.1 Export Profile
- [ ] Go to Settings tab in options page
- [ ] Click "Export Profile" button
- [ ] JSON file downloads with correct name format: `job-profile-YYYY-MM-DD.json`
- [ ] Open file - verify it contains profile data

### 4.2 Export from Popup
- [ ] Click extension icon
- [ ] Click "Export" button
- [ ] File downloads correctly

### 4.3 Import Profile
- [ ] Clear all data (Settings > Clear All Data)
- [ ] Verify popup shows "Welcome!" (no profile)
- [ ] Go to Settings tab
- [ ] Click "Import Profile"
- [ ] Select the exported JSON file
- [ ] Success message appears
- [ ] Page reloads with profile data

### 4.4 Import from Popup
- [ ] Click extension icon
- [ ] Click "Import" button
- [ ] Select file
- [ ] Profile is imported successfully

### 4.5 Import Validation
- [ ] Try importing invalid JSON - error message appears
- [ ] Try importing file without profile field - error message
- [ ] Try importing file with missing schemaVersion - error message

---

## Test Suite 5: Settings

### 5.1 Confidence Threshold
- [ ] Go to Settings tab
- [ ] Change confidence threshold to 70%
- [ ] Change to 95%
- [ ] Settings are saved (check for message)

### 5.2 Clear All Data
- [ ] Click "Clear All Data" button
- [ ] Confirmation dialog appears
- [ ] Click "Cancel" - dialog closes, data intact
- [ ] Click "Clear All Data" again
- [ ] Click "Clear All Data" in dialog
- [ ] Page reloads
- [ ] All data is cleared (popup shows Welcome)

### 5.3 Debug Info
- [ ] Click "Copy Debug Info" button
- [ ] Success message appears
- [ ] Paste clipboard contents - verify sanitized report format
- [ ] Verify no PII is visible (emails/phones redacted)

---

## Test Suite 6: Resume Parsing

### 6.1 PDF Resume
- [ ] Go to Documents section in profile
- [ ] Upload a PDF resume
- [ ] Fields auto-populate from resume:
  - [ ] Name extracted correctly
  - [ ] Email extracted correctly
  - [ ] Phone extracted correctly

### 6.2 DOCX Resume
- [ ] Upload a DOCX resume
- [ ] Fields auto-populate correctly

### 6.3 TXT Resume
- [ ] Upload a TXT resume
- [ ] Fields auto-populate correctly

---

## Test Suite 7: Edge Cases

### 7.1 Unsupported Sites
- [ ] Navigate to non-job site (e.g., google.com)
- [ ] Extension icon is gray
- [ ] Badge is empty
- [ ] No floating indicator
- [ ] Popup shows "Navigate to a supported job application"

### 7.2 No Profile
- [ ] Clear all data
- [ ] Navigate to Workday/Greenhouse
- [ ] Click floating indicator
- [ ] Error message: "No profile found. Please set up your profile first."

### 7.3 Rapid Navigation
- [ ] Navigate between multiple pages quickly
- [ ] Floating indicator updates correctly
- [ ] No console errors

### 7.4 SPA Navigation
- [ ] On Workday/Greenhouse, navigate between pages without full reload
- [ ] Detection re-runs on URL change
- [ ] Floating indicator persists

---

## Test Suite 8: Browser Compatibility

### 8.1 Brave Browser
- [ ] All tests pass in Brave

### 8.2 Microsoft Edge
- [ ] All tests pass in Edge

### 8.3 Google Chrome (if possible)
- [ ] All tests pass in Chrome
- [ ] Note: May not work on managed Chrome

---

## Regression Checklist

Run after any significant changes:

- [ ] Profile save/load works
- [ ] Encryption/decryption works
- [ ] Autofill works on Workday
- [ ] Autofill works on Greenhouse
- [ ] Export creates valid file
- [ ] Import restores profile
- [ ] All unit tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)

---

## Bug Report Template

When reporting issues, include:

1. Browser and version
2. Extension version
3. Steps to reproduce
4. Expected behavior
5. Actual behavior
6. Console errors (if any)
7. Debug info (use "Copy Debug Info" button)

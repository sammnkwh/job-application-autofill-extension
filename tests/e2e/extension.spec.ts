/**
 * E2E Tests for Job Application Autofill Extension
 *
 * Note: These tests run against the Vite dev server which serves
 * the popup and options pages. Testing actual extension injection
 * requires a different approach with a real browser extension context.
 */

import { test, expect } from '@playwright/test'

// Test the popup page
test.describe('Popup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/popup.html')
  })

  test('shows welcome message when no profile exists', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Welcome', { timeout: 5000 })

    // Should show welcome message
    await expect(page.getByText('Welcome!')).toBeVisible()
    await expect(page.getByText('Set up your profile')).toBeVisible()

    // Should have setup button
    await expect(page.getByRole('button', { name: /Set Up Profile/i })).toBeVisible()
  })

  test('has correct title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Job Autofill' })).toBeVisible()
  })

  test('shows "Setup Needed" badge initially', async ({ page }) => {
    await page.waitForTimeout(500) // Wait for state to load
    await expect(page.getByText('Setup Needed')).toBeVisible()
  })

  test('shows footer with security message', async ({ page }) => {
    await expect(page.getByText(/encrypted and stored locally/i)).toBeVisible()
  })
})

// Test the options/settings page
test.describe('Options Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/options.html')
  })

  test('shows main title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Job Application Autofill' })).toBeVisible()
  })

  test('has Profile and Settings tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Profile' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible()
  })

  test('Profile tab is active by default', async ({ page }) => {
    const profileTab = page.getByRole('tab', { name: 'Profile' })
    await expect(profileTab).toHaveAttribute('data-state', 'active')
  })

  test('can switch to Settings tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Settings' }).click()

    // Should show settings content
    await expect(page.getByText('Autofill Settings')).toBeVisible()
    await expect(page.getByText('Confidence Threshold')).toBeVisible()
  })

  test('Settings tab has confidence threshold selector', async ({ page }) => {
    await page.getByRole('tab', { name: 'Settings' }).click()

    // Should have the threshold selector
    await expect(page.getByText('Confidence Threshold')).toBeVisible()

    // Should have description text
    await expect(page.getByText(/Only fill fields when the match confidence/i)).toBeVisible()
  })

  test('Settings tab has Data Management section', async ({ page }) => {
    await page.getByRole('tab', { name: 'Settings' }).click()

    await expect(page.getByText('Data Management')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Export Profile' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Import Profile' })).toBeVisible()
  })

  test('Settings tab has Clear All Data with confirmation', async ({ page }) => {
    await page.getByRole('tab', { name: 'Settings' }).click()

    await expect(page.getByText('Danger Zone')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Clear All Data' })).toBeVisible()
  })

  test('Clear All Data opens confirmation dialog', async ({ page }) => {
    await page.getByRole('tab', { name: 'Settings' }).click()
    await page.getByRole('button', { name: 'Clear All Data' }).click()

    // Dialog should appear
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await expect(page.getByText('Clear all data?')).toBeVisible()
    await expect(page.getByText(/permanently delete/i)).toBeVisible()

    // Should have cancel and confirm buttons
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('Cancel button closes Clear All Data dialog', async ({ page }) => {
    await page.getByRole('tab', { name: 'Settings' }).click()
    await page.getByRole('button', { name: 'Clear All Data' }).click()

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Dialog should be closed
    await expect(page.getByRole('alertdialog')).toBeHidden()
  })

  test('Settings tab has Support section', async ({ page }) => {
    await page.getByRole('tab', { name: 'Settings' }).click()

    await expect(page.getByText('Support')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy Debug Info' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Report Issue on GitHub' })).toBeVisible()
  })

  test('Settings tab shows version', async ({ page }) => {
    await page.getByRole('tab', { name: 'Settings' }).click()

    await expect(page.getByText('About')).toBeVisible()
    await expect(page.getByText('Version:')).toBeVisible()
  })
})

// Test the profile form
test.describe('Profile Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/options.html')
    // Wait for page to load
    await page.waitForSelector('text=Profile')
  })

  test('shows Personal Information section', async ({ page }) => {
    await expect(page.getByText('Personal Information')).toBeVisible()
  })

  test('has required personal info fields', async ({ page }) => {
    // Check for input fields by their labels
    await expect(page.getByLabel(/First Name/i)).toBeVisible()
    await expect(page.getByLabel(/Last Name/i)).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
  })

  test('can fill personal info fields', async ({ page }) => {
    const firstNameInput = page.getByLabel(/First Name/i)
    const lastNameInput = page.getByLabel(/Last Name/i)
    const emailInput = page.getByLabel(/Email/i).first()

    await firstNameInput.fill('John')
    await lastNameInput.fill('Doe')
    await emailInput.fill('john.doe@example.com')

    await expect(firstNameInput).toHaveValue('John')
    await expect(lastNameInput).toHaveValue('Doe')
    await expect(emailInput).toHaveValue('john.doe@example.com')
  })
})

// Test mock fixtures load correctly
test.describe('Mock Fixtures', () => {
  test('Workday mock page loads', async ({ page }) => {
    await page.goto('/tests/fixtures/mock-workday.html')

    await expect(page.getByRole('heading', { name: /Job Application/i })).toBeVisible()
    await expect(page.getByLabel(/First Name/i)).toBeVisible()
    await expect(page.getByLabel(/Last Name/i)).toBeVisible()
    await expect(page.getByLabel(/Email Address/i)).toBeVisible()
  })

  test('Workday mock has all expected fields', async ({ page }) => {
    await page.goto('/tests/fixtures/mock-workday.html')

    // Personal Info
    await expect(page.locator('[data-automation-id="legalNameSection_firstName"]')).toBeVisible()
    await expect(page.locator('[data-automation-id="legalNameSection_lastName"]')).toBeVisible()
    await expect(page.locator('[data-automation-id="email"]')).toBeVisible()
    await expect(page.locator('[data-automation-id="phone-number"]')).toBeVisible()

    // Address
    await expect(page.locator('[data-automation-id="addressSection_addressLine1"]')).toBeVisible()
    await expect(page.locator('[data-automation-id="addressSection_city"]')).toBeVisible()

    // EEO
    await expect(page.locator('[data-automation-id="genderDropdown"]')).toBeVisible()
  })

  test('Greenhouse mock page loads', async ({ page }) => {
    await page.goto('/tests/fixtures/mock-greenhouse.html')

    await expect(page.getByRole('heading', { name: 'Software Engineer' })).toBeVisible()
    await expect(page.locator('#first_name')).toBeVisible()
    await expect(page.locator('#last_name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
  })

  test('Greenhouse mock has all expected fields', async ({ page }) => {
    await page.goto('/tests/fixtures/mock-greenhouse.html')

    // Basic Info
    await expect(page.locator('#first_name')).toBeVisible()
    await expect(page.locator('#last_name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#phone')).toBeVisible()

    // Links
    await expect(page.locator('#linkedin_profile')).toBeVisible()
    await expect(page.locator('#github_profile')).toBeVisible()

    // EEO
    await expect(page.locator('#job_application_gender')).toBeVisible()
    await expect(page.locator('#job_application_race')).toBeVisible()
  })

  test('Workday mock fields can be filled', async ({ page }) => {
    await page.goto('/tests/fixtures/mock-workday.html')

    await page.fill('[data-automation-id="legalNameSection_firstName"]', 'Jane')
    await page.fill('[data-automation-id="legalNameSection_lastName"]', 'Smith')
    await page.fill('[data-automation-id="email"]', 'jane@example.com')
    await page.fill('[data-automation-id="phone-number"]', '555-123-4567')

    await expect(page.locator('[data-automation-id="legalNameSection_firstName"]')).toHaveValue('Jane')
    await expect(page.locator('[data-automation-id="legalNameSection_lastName"]')).toHaveValue('Smith')
  })

  test('Greenhouse mock fields can be filled', async ({ page }) => {
    await page.goto('/tests/fixtures/mock-greenhouse.html')

    await page.fill('#first_name', 'Jane')
    await page.fill('#last_name', 'Smith')
    await page.fill('#email', 'jane@example.com')
    await page.fill('#phone', '555-123-4567')

    await expect(page.locator('#first_name')).toHaveValue('Jane')
    await expect(page.locator('#last_name')).toHaveValue('Smith')
  })

  test('Workday mock select fields work', async ({ page }) => {
    await page.goto('/tests/fixtures/mock-workday.html')

    await page.selectOption('[data-automation-id="addressSection_countryRegion"]', 'CA')
    await page.selectOption('[data-automation-id="genderDropdown"]', 'Male')

    await expect(page.locator('[data-automation-id="addressSection_countryRegion"]')).toHaveValue('CA')
    await expect(page.locator('[data-automation-id="genderDropdown"]')).toHaveValue('Male')
  })

  test('Greenhouse mock select fields work', async ({ page }) => {
    await page.goto('/tests/fixtures/mock-greenhouse.html')

    await page.selectOption('#state', 'CA')
    await page.selectOption('#job_application_gender', 'Female')

    await expect(page.locator('#state')).toHaveValue('CA')
    await expect(page.locator('#job_application_gender')).toHaveValue('Female')
  })
})

// Accessibility tests
test.describe('Accessibility', () => {
  test('popup has no accessibility violations for buttons', async ({ page }) => {
    await page.goto('/popup.html')
    await page.waitForTimeout(500)

    // Check that buttons are accessible
    const buttons = await page.getByRole('button').all()
    for (const button of buttons) {
      await expect(button).toBeVisible()
      // Buttons should have accessible names
      const name = await button.getAttribute('aria-label') || await button.textContent()
      expect(name).toBeTruthy()
    }
  })

  test('options page form labels are properly associated', async ({ page }) => {
    await page.goto('/options.html')

    // Check that inputs have associated labels
    const firstNameInput = page.getByLabel(/First Name/i)
    await expect(firstNameInput).toBeVisible()
  })
})

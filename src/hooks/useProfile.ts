// Hook for managing profile state

import { useState, useEffect, useCallback } from 'react'
import type { Profile } from '../types/profile'
import { createEmptyProfile } from '../types/profile'
import { saveProfile, loadProfile, hasProfile } from '../utils/storage'
import { calculateSectionCompleteness } from '../utils/fieldCompleteness'

export interface UseProfileReturn {
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
  updateProfile: (updates: Partial<Profile>) => void
  updatePersonalInfo: (updates: Partial<Profile['personalInfo']>) => void
  updateProfessionalLinks: (updates: Partial<Profile['professionalLinks']>) => void
  updateWorkAuthorization: (updates: Partial<Profile['workAuthorization']>) => void
  updateVoluntarySelfId: (updates: Partial<Profile['voluntarySelfIdentification']>) => void
  updateSkills: (updates: Partial<Profile['skillsAndQualifications']>) => void
  addWorkExperience: (experience: Profile['workExperience'][0]) => void
  updateWorkExperience: (id: string, updates: Partial<Profile['workExperience'][0]>) => void
  removeWorkExperience: (id: string) => void
  addEducation: (education: Profile['education'][0]) => void
  updateEducation: (id: string, updates: Partial<Profile['education'][0]>) => void
  removeEducation: (id: string) => void
  save: () => Promise<{ success: boolean; error?: string }>
  load: () => Promise<void>
  isLoading: boolean
  isSaving: boolean
  hasExistingProfile: boolean
  error: string | null
  completeness: number
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile>(createEmptyProfile())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load profile on mount
  useEffect(() => {
    load()
  }, [])

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const exists = await hasProfile()
      setHasExistingProfile(exists)

      if (exists) {
        const result = await loadProfile()
        if (result.success && result.data) {
          setProfile(result.data)
        } else {
          setError(result.error || 'Failed to load profile')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const save = useCallback(async () => {
    setIsSaving(true)
    setError(null)
    try {
      const result = await saveProfile(profile)
      if (result.success) {
        setHasExistingProfile(true)
      } else {
        setError(result.error || 'Failed to save profile')
      }
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsSaving(false)
    }
  }, [profile])

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }, [])

  const updatePersonalInfo = useCallback((updates: Partial<Profile['personalInfo']>) => {
    setProfile((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...updates },
    }))
  }, [])

  const updateProfessionalLinks = useCallback((updates: Partial<Profile['professionalLinks']>) => {
    setProfile((prev) => ({
      ...prev,
      professionalLinks: { ...prev.professionalLinks, ...updates },
    }))
  }, [])

  const updateWorkAuthorization = useCallback((updates: Partial<Profile['workAuthorization']>) => {
    setProfile((prev) => ({
      ...prev,
      workAuthorization: { ...prev.workAuthorization, ...updates },
    }))
  }, [])

  const updateVoluntarySelfId = useCallback((updates: Partial<Profile['voluntarySelfIdentification']>) => {
    setProfile((prev) => ({
      ...prev,
      voluntarySelfIdentification: { ...prev.voluntarySelfIdentification, ...updates },
    }))
  }, [])

  const updateSkills = useCallback((updates: Partial<Profile['skillsAndQualifications']>) => {
    setProfile((prev) => ({
      ...prev,
      skillsAndQualifications: { ...prev.skillsAndQualifications, ...updates },
    }))
  }, [])

  const addWorkExperience = useCallback((experience: Profile['workExperience'][0]) => {
    setProfile((prev) => ({
      ...prev,
      workExperience: [...prev.workExperience, experience],
    }))
  }, [])

  const updateWorkExperience = useCallback((id: string, updates: Partial<Profile['workExperience'][0]>) => {
    setProfile((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    }))
  }, [])

  const removeWorkExperience = useCallback((id: string) => {
    setProfile((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((exp) => exp.id !== id),
    }))
  }, [])

  const addEducation = useCallback((education: Profile['education'][0]) => {
    setProfile((prev) => ({
      ...prev,
      education: [...prev.education, education],
    }))
  }, [])

  const updateEducation = useCallback((id: string, updates: Partial<Profile['education'][0]>) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
    }))
  }, [])

  const removeEducation = useCallback((id: string) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }))
  }, [])

  // Calculate profile completeness
  const completeness = calculateCompleteness(profile)

  return {
    profile,
    setProfile,
    updateProfile,
    updatePersonalInfo,
    updateProfessionalLinks,
    updateWorkAuthorization,
    updateVoluntarySelfId,
    updateSkills,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    addEducation,
    updateEducation,
    removeEducation,
    save,
    load,
    isLoading,
    isSaving,
    hasExistingProfile,
    error,
    completeness,
  }
}

// Calculate profile completeness percentage based on 23 required fields:
// - Personal Info: 10 (firstName, lastName, email, countryCode, phoneNumber, street, city, state, zipCode, country)
// - Professional Links: 1 (at least one of linkedin, github, portfolio)
// - Work Experience: 4 (one complete entry: jobTitle, company, startDate, endDate/isCurrent)
// - Education: 5 (one complete entry: institution, degree, fieldOfStudy, startDate, endDate/isCurrent)
// - Skills: 1 (at least one skill, certification, or language)
// - Work Authorization: 2 (one checkbox + visa status)
function calculateCompleteness(profile: Profile): number {
  const sections = calculateSectionCompleteness(profile)

  // Total required fields across all sections
  const TOTAL_REQUIRED = 23

  // Sum up all missing fields
  const totalMissing = sections.reduce((sum, section) => sum + section.missingCount, 0)

  const filled = TOTAL_REQUIRED - totalMissing
  return Math.round((filled / TOTAL_REQUIRED) * 100)
}

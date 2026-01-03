// Main Profile Form component

import { useCallback, useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Alert, AlertDescription } from '../ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { PersonalInfoSection } from './PersonalInfoSection'
import { ProfessionalLinksSection } from './ProfessionalLinksSection'
import { WorkExperienceSection } from './WorkExperienceSection'
import { EducationSection } from './EducationSection'
import { SkillsSection } from './SkillsSection'
import { DocumentsSection } from './DocumentsSection'
import { WorkAuthorizationSection } from './WorkAuthorizationSection'
import { SelfIdentificationSection } from './SelfIdentificationSection'
import { useProfile } from '../../hooks/useProfile'
import type { Profile } from '../../types/profile'

interface ProfileFormProps {
  onSaveSuccess?: () => void
}

export function ProfileForm({ onSaveSuccess }: ProfileFormProps) {
  const {
    profile,
    setProfile,
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
    isLoading,
    isSaving,
    hasExistingProfile,
    error,
    completeness,
  } = useProfile()

  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [welcomeModalShown, setWelcomeModalShown] = useState(false)

  // Show welcome modal on first visit (no existing profile)
  useEffect(() => {
    if (!isLoading && !hasExistingProfile && !welcomeModalShown) {
      setShowWelcomeModal(true)
      setWelcomeModalShown(true)
    }
  }, [isLoading, hasExistingProfile, welcomeModalShown])

  const handleSave = useCallback(async () => {
    const result = await save()
    if (result.success && onSaveSuccess) {
      onSaveSuccess()
    }
  }, [save, onSaveSuccess])

  const handleResumeImport = useCallback((importedData: Partial<Profile>) => {
    setProfile((prev) => {
      // Merge imported data with existing profile
      // Don't overwrite existing non-empty fields
      const merged = { ...prev }

      // Personal info
      if (importedData.personalInfo) {
        const pi = importedData.personalInfo
        if (pi.firstName && !prev.personalInfo.firstName) merged.personalInfo.firstName = pi.firstName
        if (pi.lastName && !prev.personalInfo.lastName) merged.personalInfo.lastName = pi.lastName
        if (pi.email && !prev.personalInfo.email) merged.personalInfo.email = pi.email
        if (pi.phone && !prev.personalInfo.phone) merged.personalInfo.phone = pi.phone
        if (pi.address) {
          if (pi.address.street && !prev.personalInfo.address.street) merged.personalInfo.address.street = pi.address.street
          if (pi.address.city && !prev.personalInfo.address.city) merged.personalInfo.address.city = pi.address.city
          if (pi.address.state && !prev.personalInfo.address.state) merged.personalInfo.address.state = pi.address.state
          if (pi.address.zipCode && !prev.personalInfo.address.zipCode) merged.personalInfo.address.zipCode = pi.address.zipCode
          if (pi.address.country && !prev.personalInfo.address.country) merged.personalInfo.address.country = pi.address.country
        }
      }

      // Professional links
      if (importedData.professionalLinks) {
        const pl = importedData.professionalLinks
        if (pl.linkedin && !prev.professionalLinks.linkedin) merged.professionalLinks.linkedin = pl.linkedin
        if (pl.github && !prev.professionalLinks.github) merged.professionalLinks.github = pl.github
        if (pl.portfolio && !prev.professionalLinks.portfolio) merged.professionalLinks.portfolio = pl.portfolio
      }

      // Work experience - replace with imported data if it has more/better entries
      if (importedData.workExperience && importedData.workExperience.length > 0) {
        // Replace if imported has more entries or existing entries lack dates
        const existingHasDates = prev.workExperience.some(exp => exp.startDate)
        const importedHasDates = importedData.workExperience.some(exp => exp.startDate)
        if (prev.workExperience.length === 0 || (!existingHasDates && importedHasDates) || importedData.workExperience.length > prev.workExperience.length) {
          merged.workExperience = importedData.workExperience
        }
      }

      // Education - replace with imported data if it has more/better entries
      if (importedData.education && importedData.education.length > 0) {
        const existingHasDates = prev.education.some(edu => edu.startDate)
        const importedHasDates = importedData.education.some(edu => edu.startDate)
        if (prev.education.length === 0 || (!existingHasDates && importedHasDates) || importedData.education.length > prev.education.length) {
          merged.education = importedData.education
        }
      }

      // Skills - merge
      if (importedData.skillsAndQualifications) {
        const skills = importedData.skillsAndQualifications
        if (skills.skills && skills.skills.length > 0) {
          const existingSkills = new Set(prev.skillsAndQualifications.skills)
          const newSkills = skills.skills.filter((s) => !existingSkills.has(s))
          merged.skillsAndQualifications.skills = [...prev.skillsAndQualifications.skills, ...newSkills]
        }
        if (skills.certifications && skills.certifications.length > 0 && prev.skillsAndQualifications.certifications.length === 0) {
          merged.skillsAndQualifications.certifications = skills.certifications
        }
        if (skills.languages && skills.languages.length > 0 && prev.skillsAndQualifications.languages.length === 0) {
          merged.skillsAndQualifications.languages = skills.languages
        }
      }

      return merged
    })
  }, [setProfile])

  // Calculate section completeness for tab badges
  const sectionStatus = {
    personal: Boolean(
      profile.personalInfo.firstName &&
      profile.personalInfo.lastName &&
      profile.personalInfo.email &&
      profile.personalInfo.phone
    ),
    experience: profile.workExperience.length > 0 && profile.education.length > 0,
    skills: profile.skillsAndQualifications.skills.length >= 3,
    other: true, // Additional info is optional
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Profile Completeness */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Profile Completeness</span>
          <span className="font-medium">{completeness}%</span>
        </div>
        <Progress value={completeness} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Required field legend */}
      <p className="text-xs text-[#878787]">
        <span className="text-[#606060]">*</span> Required field
      </p>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList>
          <TabsTrigger value="personal" className="relative">
            Personal
            {!sectionStatus.personal && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" title="Incomplete" />
            )}
          </TabsTrigger>
          <TabsTrigger value="experience" className="relative">
            Experience
            {!sectionStatus.experience && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" title="Incomplete" />
            )}
          </TabsTrigger>
          <TabsTrigger value="skills" className="relative">
            Skills
            {!sectionStatus.skills && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" title="Incomplete" />
            )}
          </TabsTrigger>
          <TabsTrigger value="other">Additional</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[500px]">
          <TabsContent value="personal" className="space-y-4">
            <DocumentsSection onResumeImport={handleResumeImport} />
            <PersonalInfoSection
              personalInfo={profile.personalInfo}
              onChange={updatePersonalInfo}
            />
            <ProfessionalLinksSection
              links={profile.professionalLinks}
              onChange={updateProfessionalLinks}
            />
          </TabsContent>

          <TabsContent value="experience" className="space-y-4">
            <WorkExperienceSection
              experiences={profile.workExperience}
              onAdd={addWorkExperience}
              onUpdate={updateWorkExperience}
              onRemove={removeWorkExperience}
            />
            <EducationSection
              education={profile.education}
              onAdd={addEducation}
              onUpdate={updateEducation}
              onRemove={removeEducation}
            />
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <SkillsSection
              skills={profile.skillsAndQualifications}
              onChange={updateSkills}
            />
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            <WorkAuthorizationSection
              authorization={profile.workAuthorization}
              onChange={updateWorkAuthorization}
            />
            <SelfIdentificationSection
              selfId={profile.voluntarySelfIdentification}
              onChange={updateVoluntarySelfId}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-4 mt-2 border-t border-[#DCDAD2]">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      {/* Welcome Modal for First-Time Users */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-md" style={{ borderRadius: 0 }}>
          <DialogHeader>
            <DialogTitle>Welcome to Job Autofill</DialogTitle>
            <DialogDescription>
              Get started quickly by uploading your resume. We'll extract your information automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <DocumentsSection
              onResumeImport={(data) => {
                handleResumeImport(data)
                setShowWelcomeModal(false)
              }}
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowWelcomeModal(false)}
              className="w-full sm:w-auto"
            >
              Skip for now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Main Profile Form component

import { useCallback, useState } from 'react'
import { Button } from '../ui/button'
import { SegmentedProgress } from '../ui/segmented-progress'
import { SectionBadge } from '../ui/section-badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { PersonalInfoSection } from './PersonalInfoSection'
import { ProfessionalLinksSection } from './ProfessionalLinksSection'
import { WorkExperienceSection } from './WorkExperienceSection'
import { EducationSection } from './EducationSection'
import { SkillsSection } from './SkillsSection'
import { DocumentsSection } from './DocumentsSection'
import { WorkAuthorizationSection } from './WorkAuthorizationSection'
import { SelfIdentificationSection } from './SelfIdentificationSection'
import { useProfile } from '../../hooks/useProfile'
import {
  calculateSectionCompleteness,
  getMissingSectionsForTooltip,
  getPersonalInfoCompleteness,
  hasProfessionalLink,
  getSelfIdentificationCompleteness,
} from '../../utils/fieldCompleteness'
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
    error,
    completeness,
  } = useProfile()

  // Show incomplete field hints after resume import
  const [showIncompleteHints, setShowIncompleteHints] = useState(false)

  // Calculate section-level completeness
  const sectionCompleteness = calculateSectionCompleteness(profile)
  const missingSections = getMissingSectionsForTooltip(profile)
  const personalInfoComplete = getPersonalInfoCompleteness(profile)
  const hasLinks = hasProfessionalLink(profile)
  const selfIdCompleteness = getSelfIdentificationCompleteness(profile)

  // Helper to get section completeness by name
  const getSectionStatus = (name: string) => {
    const section = sectionCompleteness.find(s => s.name === name)
    return section || { complete: true, missingCount: 0 }
  }


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
    // Show incomplete hints after resume import
    setShowIncompleteHints(true)
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
      <SegmentedProgress
        value={completeness}
        missingSections={missingSections}
        showLabel={true}
      />

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
          <TabsTrigger value="other">Additional Info</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          {/* Import from Resume - shown separately, not in accordion */}
          <div className="mb-6">
            <DocumentsSection onResumeImport={handleResumeImport} />
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="personal-info">
              <AccordionTrigger>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-semibold text-[#111827]">Personal Information</span>
                  <SectionBadge
                    complete={getSectionStatus('Personal Information').complete}
                    missingCount={getSectionStatus('Personal Information').missingCount}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <PersonalInfoSection
                  personalInfo={profile.personalInfo}
                  onChange={updatePersonalInfo}
                  showErrors={showIncompleteHints}
                  fieldCompleteness={personalInfoComplete}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="professional-links">
              <AccordionTrigger>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-semibold text-[#111827]">Professional Links</span>
                  <SectionBadge
                    complete={getSectionStatus('Professional Links').complete}
                    missingCount={getSectionStatus('Professional Links').missingCount}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ProfessionalLinksSection
                  links={profile.professionalLinks}
                  onChange={updateProfessionalLinks}
                  showIncompleteHints={showIncompleteHints && !hasLinks}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="experience" className="mt-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="work-experience">
              <AccordionTrigger>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-semibold text-[#111827]">Work Experience</span>
                  <SectionBadge
                    complete={getSectionStatus('Work Experience').complete}
                    missingCount={getSectionStatus('Work Experience').missingCount}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <WorkExperienceSection
                  experiences={profile.workExperience}
                  onAdd={addWorkExperience}
                  onUpdate={updateWorkExperience}
                  onRemove={removeWorkExperience}
                  showIncompleteHints={showIncompleteHints && profile.workExperience.length === 0}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="education">
              <AccordionTrigger>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-semibold text-[#111827]">Education</span>
                  <SectionBadge
                    complete={getSectionStatus('Education').complete}
                    missingCount={getSectionStatus('Education').missingCount}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <EducationSection
                  education={profile.education}
                  onAdd={addEducation}
                  onUpdate={updateEducation}
                  onRemove={removeEducation}
                  showIncompleteHints={showIncompleteHints && profile.education.length === 0}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="skills">
              <AccordionTrigger>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-semibold text-[#111827]">Skills</span>
                  <SectionBadge
                    complete={getSectionStatus('Skills').complete}
                    missingCount={getSectionStatus('Skills').missingCount}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <SkillsSection
                  skills={profile.skillsAndQualifications}
                  onChange={updateSkills}
                  showIncompleteHints={showIncompleteHints && profile.skillsAndQualifications.skills.length < 3}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="other" className="mt-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="work-authorization">
              <AccordionTrigger>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-semibold text-[#111827]">Work Authorization</span>
                  <SectionBadge
                    complete={getSectionStatus('Work Authorization').complete}
                    missingCount={getSectionStatus('Work Authorization').missingCount}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <WorkAuthorizationSection
                  authorization={profile.workAuthorization}
                  onChange={updateWorkAuthorization}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="self-identification">
              <AccordionTrigger>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-semibold text-[#111827]">Self Identification</span>
                  <SectionBadge complete={selfIdCompleteness.complete} missingCount={selfIdCompleteness.missingCount} />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <SelfIdentificationSection
                  selfId={profile.voluntarySelfIdentification}
                  onChange={updateVoluntarySelfId}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

    </div>
  )
}

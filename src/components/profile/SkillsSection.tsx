// Skills & Qualifications form section - Midday style

import { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { FormField } from '../ui/form-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import type { Profile } from '../../types/profile'

interface SkillsSectionProps {
  skills: Profile['skillsAndQualifications']
  onChange: (updates: Partial<Profile['skillsAndQualifications']>) => void
}

export function SkillsSection({ skills, onChange }: SkillsSectionProps) {
  const [newSkill, setNewSkill] = useState('')
  const [newCertName, setNewCertName] = useState('')
  const [newCertIssuer, setNewCertIssuer] = useState('')
  const [newLangName, setNewLangName] = useState('')
  const [newLangProf, setNewLangProf] = useState<'basic' | 'conversational' | 'professional' | 'native'>('conversational')

  const addSkill = () => {
    if (newSkill.trim() && !skills.skills.includes(newSkill.trim())) {
      onChange({ skills: [...skills.skills, newSkill.trim()] })
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    onChange({ skills: skills.skills.filter((s) => s !== skill) })
  }

  const addCertification = () => {
    if (newCertName.trim()) {
      onChange({
        certifications: [
          ...skills.certifications,
          { name: newCertName.trim(), issuer: newCertIssuer.trim() },
        ],
      })
      setNewCertName('')
      setNewCertIssuer('')
    }
  }

  const removeCertification = (index: number) => {
    onChange({
      certifications: skills.certifications.filter((_, i) => i !== index),
    })
  }

  const addLanguage = () => {
    if (newLangName.trim()) {
      onChange({
        languages: [
          ...skills.languages,
          { language: newLangName.trim(), proficiency: newLangProf },
        ],
      })
      setNewLangName('')
    }
  }

  const removeLanguage = (index: number) => {
    onChange({
      languages: skills.languages.filter((_, i) => i !== index),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Qualifications</CardTitle>
        <CardDescription>
          Add your technical skills, certifications, and language proficiencies.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Skills */}
        <div className="space-y-4">
          <FormField
            label="Skills"
          >
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g., JavaScript, Python, React"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                + Add
              </Button>
            </div>
          </FormField>
          {skills.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100 hover:text-red-600 transition-colors px-3 py-1"
                  onClick={() => removeSkill(skill)}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#878787]">No skills added yet. Start typing to add your first skill.</p>
          )}
        </div>

        {/* Certifications */}
        <div className="space-y-4">
          <FormField
            label="Certifications"
          >
            <div className="flex gap-2">
              <Input
                value={newCertName}
                onChange={(e) => setNewCertName(e.target.value)}
                placeholder="Certification name"
                className="flex-1"
              />
              <Input
                value={newCertIssuer}
                onChange={(e) => setNewCertIssuer(e.target.value)}
                placeholder="Issuing organization"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addCertification}>
                + Add
              </Button>
            </div>
          </FormField>
          {skills.certifications.length > 0 ? (
            <div className="space-y-2">
              {skills.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between border border-[#e5e5e5] p-3 rounded">
                  <span className="text-sm">
                    <span className="font-medium text-[#121212]">{cert.name}</span>
                    {cert.issuer && <span className="text-[#606060]"> — {cert.issuer}</span>}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(index)}
                    className="text-[#606060] hover:text-red-600"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#878787]">No certifications added yet.</p>
          )}
        </div>

        {/* Languages */}
        <div className="space-y-4">
          <FormField
            label="Languages"
          >
            <div className="flex gap-2">
              <Input
                value={newLangName}
                onChange={(e) => setNewLangName(e.target.value)}
                placeholder="Language"
                className="flex-1"
              />
              <Select value={newLangProf} onValueChange={(v) => setNewLangProf(v as typeof newLangProf)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="native">Native</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={addLanguage}>
                + Add
              </Button>
            </div>
          </FormField>
          {skills.languages.length > 0 ? (
            <div className="space-y-2">
              {skills.languages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between border border-[#e5e5e5] p-3 rounded">
                  <span className="text-sm">
                    <span className="font-medium text-[#121212]">{lang.language}</span>
                    <span className="text-[#606060]"> — {lang.proficiency}</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(index)}
                    className="text-[#606060] hover:text-red-600"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#878787]">No languages added yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

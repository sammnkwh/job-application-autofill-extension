// Skills & Qualifications form section

import { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
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
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills */}
        <div className="space-y-3">
          <Label>Skills</Label>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill (e.g., JavaScript)"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" variant="outline" onClick={addSkill}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                {skill} ×
              </Badge>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-3">
          <Label>Certifications</Label>
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
              placeholder="Issuer"
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addCertification}>
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {skills.certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                <span>
                  {cert.name}
                  {cert.issuer && <span className="text-muted-foreground"> - {cert.issuer}</span>}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeCertification(index)}>
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label>Languages</Label>
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
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {skills.languages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                <span>
                  {lang.language} <span className="text-muted-foreground">({lang.proficiency})</span>
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeLanguage(index)}>
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

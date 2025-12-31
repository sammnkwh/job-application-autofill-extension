// Education form section with dynamic add/remove

import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import type { Profile, Education } from '../../types/profile'

interface EducationSectionProps {
  education: Profile['education']
  onAdd: (education: Education) => void
  onUpdate: (id: string, updates: Partial<Education>) => void
  onRemove: (id: string) => void
}

export function EducationSection({
  education,
  onAdd,
  onUpdate,
  onRemove,
}: EducationSectionProps) {
  const handleAddNew = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: undefined,
      gpa: undefined,
      honors: [],
    }
    onAdd(newEdu)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Education</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={handleAddNew}>
          + Add Education
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {education.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No education added yet. Click "Add Education" to start.
          </p>
        ) : (
          education.map((edu, index) => (
            <EducationEntry
              key={edu.id}
              education={edu}
              index={index}
              onUpdate={(updates) => onUpdate(edu.id, updates)}
              onRemove={() => onRemove(edu.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

interface EducationEntryProps {
  education: Education
  index: number
  onUpdate: (updates: Partial<Education>) => void
  onRemove: () => void
}

function EducationEntry({ education, index, onUpdate, onRemove }: EducationEntryProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Education {index + 1}</h4>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Institution *</Label>
        <Input
          value={education.institution}
          onChange={(e) => onUpdate({ institution: e.target.value })}
          placeholder="University of California, Berkeley"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Degree *</Label>
          <Input
            value={education.degree}
            onChange={(e) => onUpdate({ degree: e.target.value })}
            placeholder="Bachelor of Science"
          />
        </div>
        <div className="space-y-2">
          <Label>Field of Study</Label>
          <Input
            value={education.fieldOfStudy}
            onChange={(e) => onUpdate({ fieldOfStudy: e.target.value })}
            placeholder="Computer Science"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="month"
            value={education.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="month"
            value={education.endDate || ''}
            onChange={(e) => onUpdate({ endDate: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label>GPA</Label>
          <Input
            value={education.gpa || ''}
            onChange={(e) => onUpdate({ gpa: e.target.value || undefined })}
            placeholder="3.8"
          />
        </div>
      </div>
    </div>
  )
}

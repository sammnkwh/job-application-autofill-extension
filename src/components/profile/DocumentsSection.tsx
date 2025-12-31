// Documents section with resume upload

import { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'
import { parseResume, extractedDataToProfile } from '../../parsers/resumeParser'
import type { Profile } from '../../types/profile'

interface DocumentsSectionProps {
  onResumeImport: (profile: Partial<Profile>) => void
}

export function DocumentsSection({ onResumeImport }: DocumentsSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setSuccess(null)
    setIsProcessing(true)
    setProgress(20)

    try {
      // Parse the resume
      setProgress(40)
      const result = await parseResume(file)
      setProgress(70)

      if (result.parseErrors.length > 0 && !result.rawText) {
        setError(`Failed to parse resume: ${result.parseErrors.join(', ')}`)
        return
      }

      // Convert to profile format
      const profileData = extractedDataToProfile(result.extractedData)
      setProgress(90)

      // Notify parent
      onResumeImport(profileData)
      setProgress(100)

      const fieldsExtracted = Object.keys(result.extractedData).length
      setSuccess(`Resume parsed! Extracted ${fieldsExtracted} fields with ${result.overallConfidence} confidence.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume')
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }, [onResumeImport])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    e.target.value = '' // Reset input
  }, [handleFile])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from Resume</CardTitle>
        <CardDescription>
          Upload your resume to auto-fill your profile. Supports PDF, DOCX, and TXT files.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary/50'}
          `}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
            className="hidden"
            id="resume-upload"
            disabled={isProcessing}
          />
          <label htmlFor="resume-upload" className="cursor-pointer">
            <div className="space-y-2">
              <div className="text-4xl">📄</div>
              <p className="font-medium">
                {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, or TXT (max 5MB)
              </p>
            </div>
          </label>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              Processing resume...
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-muted-foreground">
          Your resume is processed locally and never sent to any server.
          Only extracted data is stored in your browser.
        </p>
      </CardContent>
    </Card>
  )
}

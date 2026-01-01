// Documents section with resume upload - Midday style

import { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { parseResume, extractedDataToProfile } from '../../parsers/resumeParser'
import { parseResumeWithLLM, isLLMParsingAvailable } from '../../parsers/llmParser'
import type { Profile } from '../../types/profile'

interface DocumentsSectionProps {
  onResumeImport: (profile: Partial<Profile>) => void
}

export function DocumentsSection({ onResumeImport }: DocumentsSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [lastResumeText, setLastResumeText] = useState<string | null>(null)
  const [showAIOption, setShowAIOption] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setSuccess(null)
    setIsProcessing(true)
    setProgress(20)
    setShowAIOption(false)

    try {
      // Parse the resume
      setProgress(40)
      const result = await parseResume(file)
      setProgress(70)

      if (result.parseErrors.length > 0 && !result.rawText) {
        setError(`Failed to parse resume: ${result.parseErrors.join(', ')}`)
        return
      }

      // Store the raw text for AI parsing
      setLastResumeText(result.rawText)

      // Convert to profile format
      const profileData = extractedDataToProfile(result.extractedData)
      setProgress(90)

      // Notify parent
      onResumeImport(profileData)
      setProgress(100)

      const fieldsExtracted = Object.keys(result.extractedData).length
      const aiAvailable = isLLMParsingAvailable()

      setSuccess(
        `Resume parsed! Extracted ${fieldsExtracted} fields with ${result.overallConfidence} confidence.` +
        (aiAvailable ? ' Click "Enhance with AI" for better work experience and education extraction.' : '')
      )

      // Show AI option if available
      if (aiAvailable) {
        setShowAIOption(true)
      }
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

  const handleAIParsing = useCallback(async () => {
    if (!lastResumeText) return

    setError(null)
    setIsAIProcessing(true)

    try {
      const result = await parseResumeWithLLM(lastResumeText)

      if (result.success && result.profile) {
        onResumeImport(result.profile)
        setSuccess('AI enhanced your profile! Work experience and education have been extracted.')
        setShowAIOption(false)
      } else if (result.isRateLimited) {
        setError('AI service is busy. Please try again in a few minutes.')
      } else {
        setError(result.error || 'AI parsing failed. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI parsing failed')
    } finally {
      setIsAIProcessing(false)
    }
  }, [lastResumeText, onResumeImport])

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
            border-2 border-dashed rounded-lg p-10 text-center transition-all
            ${isDragging ? 'border-[#121212] bg-[#fafafa]' : 'border-[#e5e5e5]'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-[#878787] hover:bg-[#fafafa]'}
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
            <div className="space-y-3">
              <p className="font-medium text-[#121212]">
                {isDragging ? 'Drop your resume here' : 'Drop your files here, or'}
                {!isDragging && <span className="underline ml-1">click to browse.</span>}
              </p>
              <p className="text-sm text-[#878787]">
                3MB file limit. PDF, DOCX, or TXT.
              </p>
            </div>
          </label>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-[#606060]">
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
          <Alert className="border-[#e5e5e5] bg-[#fafafa]">
            <AlertDescription className="text-[#121212]">{success}</AlertDescription>
          </Alert>
        )}

        {showAIOption && (
          <div className="flex items-center gap-4 p-4 border border-[#e5e5e5] rounded-lg bg-[#fafafa]">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#121212]">Want better extraction?</p>
              <p className="text-sm text-[#606060]">
                AI can extract work experience and education more accurately.
              </p>
            </div>
            <Button
              onClick={handleAIParsing}
              disabled={isAIProcessing}
            >
              {isAIProcessing ? 'Processing...' : 'Enhance with AI'}
            </Button>
          </div>
        )}

        {isAIProcessing && (
          <div className="space-y-2">
            <Progress value={undefined} className="animate-pulse" />
            <p className="text-sm text-center text-[#606060]">
              AI is analyzing your resume...
            </p>
          </div>
        )}

        <p className="text-sm text-[#878787]">
          {showAIOption
            ? 'Initial parsing is local. AI enhancement uses Google Gemini to improve extraction.'
            : 'Your resume is processed locally and never sent to any server. Only extracted data is stored in your browser.'}
        </p>
      </CardContent>
    </Card>
  )
}

import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Separator } from '../components/ui/separator'
import { Alert, AlertDescription } from '../components/ui/alert'
import { hasProfile, loadProfile } from '../utils/storage'

interface PlatformInfo {
  platform: 'workday' | 'greenhouse' | 'unknown'
  supported: boolean
  platformName: string
}

interface AutofillPreview {
  canFill: number
  alreadyFilled: number
  missingInProfile: number
  total: number
}

interface PopupState {
  hasProfile: boolean
  profileCompleteness: number
  lastUpdated: string | null
  isLoading: boolean
  platformInfo: PlatformInfo | null
  preview: AutofillPreview | null
  isAutofilling: boolean
  autofillResult: { filled: number; total: number } | null
  error: string | null
}

function App() {
  const [state, setState] = useState<PopupState>({
    hasProfile: false,
    profileCompleteness: 0,
    lastUpdated: null,
    isLoading: true,
    platformInfo: null,
    preview: null,
    isAutofilling: false,
    autofillResult: null,
    error: null,
  })

  useEffect(() => {
    async function loadState() {
      // Load profile state
      const profileExists = await hasProfile()
      let profileCompleteness = 0
      let lastUpdated: string | null = null

      if (profileExists) {
        const result = await loadProfile()
        if (result.success && result.data) {
          profileCompleteness = calculateCompleteness(result.data)
          lastUpdated = result.data.lastUpdated
        }
      }

      // Get current tab and check platform
      let platformInfo: PlatformInfo | null = null
      let preview: AutofillPreview | null = null

      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

        if (tab?.id && tab.url && !tab.url.startsWith('chrome://')) {
          // Get detection result from content script
          try {
            const detectionResponse = await chrome.tabs.sendMessage(tab.id, {
              type: 'GET_DETECTION_RESULT'
            })

            if (detectionResponse?.result) {
              platformInfo = {
                platform: detectionResponse.result.platform,
                supported: detectionResponse.supported,
                platformName: getPlatformName(detectionResponse.result.platform),
              }

              // Get autofill preview if on supported platform
              if (detectionResponse.supported && profileExists) {
                const previewResponse = await chrome.tabs.sendMessage(tab.id, {
                  type: 'GET_AUTOFILL_PREVIEW'
                })
                if (previewResponse && !('error' in previewResponse)) {
                  preview = previewResponse
                }
              }
            }
          } catch {
            // Content script not loaded or not responding
            platformInfo = { platform: 'unknown', supported: false, platformName: 'Unknown' }
          }
        }
      } catch (error) {
        console.error('Error checking platform:', error)
      }

      setState({
        hasProfile: profileExists,
        profileCompleteness,
        lastUpdated,
        isLoading: false,
        platformInfo,
        preview,
        isAutofilling: false,
        autofillResult: null,
        error: null,
      })
    }

    loadState()
  }, [])

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  const triggerAutofill = async () => {
    setState(prev => ({ ...prev, isAutofilling: true, error: null, autofillResult: null }))

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (!tab?.id) {
        throw new Error('No active tab')
      }

      const response = await chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_AUTOFILL' })

      if (response && 'error' in response) {
        setState(prev => ({
          ...prev,
          isAutofilling: false,
          error: response.error
        }))
      } else if (response) {
        setState(prev => ({
          ...prev,
          isAutofilling: false,
          autofillResult: {
            filled: response.filledFields || 0,
            total: response.totalFields || 0,
          }
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isAutofilling: false,
        error: 'Failed to trigger autofill. Please refresh the page and try again.'
      }))
    }
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (state.isLoading) {
    return (
      <div className="w-80 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    )
  }

  const isOnSupportedPlatform = state.platformInfo?.supported

  return (
    <div className="w-80 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Job Autofill</h1>
        <Badge variant={state.hasProfile ? 'default' : 'secondary'}>
          {state.hasProfile ? 'Ready' : 'Setup Needed'}
        </Badge>
      </div>

      {state.hasProfile ? (
        <>
          {/* Platform Detection Status */}
          {isOnSupportedPlatform && state.platformInfo && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium text-green-700">
                    {state.platformInfo.platformName} Detected
                  </span>
                </div>

                {state.preview && (
                  <p className="text-sm text-green-600">
                    {state.preview.canFill} fields ready to fill
                    {state.preview.alreadyFilled > 0 && ` (${state.preview.alreadyFilled} already filled)`}
                  </p>
                )}

                <Button
                  className="w-full mt-3 bg-green-600 hover:bg-green-700"
                  onClick={triggerAutofill}
                  disabled={state.isAutofilling}
                >
                  {state.isAutofilling ? (
                    <>
                      <span className="animate-spin mr-2">&#8635;</span>
                      Filling...
                    </>
                  ) : (
                    'Autofill This Page'
                  )}
                </Button>

                {state.autofillResult && (
                  <p className="text-sm text-green-600 mt-2 text-center">
                    Filled {state.autofillResult.filled} of {state.autofillResult.total} fields
                  </p>
                )}

                {state.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription className="text-xs">
                      {state.error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Not on supported platform */}
          {!isOnSupportedPlatform && (
            <Card className="border-gray-200">
              <CardContent className="pt-4 text-center">
                <div className="text-2xl mb-2">&#128269;</div>
                <p className="text-sm text-muted-foreground">
                  Navigate to a supported job application to use autofill.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported: Workday, Greenhouse
                </p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Profile Summary */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Profile Completeness</span>
                  <span className="font-medium">{state.profileCompleteness}%</span>
                </div>
                <Progress value={state.profileCompleteness} className="h-2" />
              </div>

              {state.lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {formatDate(state.lastUpdated)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={openOptions}>
              Edit Profile
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Welcome for new users */}
          <Card>
            <CardContent className="pt-4 text-center space-y-3">
              <div className="text-4xl">&#128075;</div>
              <div>
                <h2 className="font-medium">Welcome!</h2>
                <p className="text-sm text-muted-foreground">
                  Set up your profile to start auto-filling job applications.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={openOptions}>
            Set Up Profile
          </Button>
        </>
      )}

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground">
        Your data is encrypted and stored locally.
      </p>
    </div>
  )
}

// Calculate profile completeness (simplified version)
function calculateCompleteness(profile: { personalInfo: { firstName: string; lastName: string; email: string; phone: string } }): number {
  let filled = 0
  let total = 4

  if (profile.personalInfo.firstName) filled++
  if (profile.personalInfo.lastName) filled++
  if (profile.personalInfo.email) filled++
  if (profile.personalInfo.phone) filled++

  return Math.round((filled / total) * 100)
}

// Get platform display name
function getPlatformName(platform: string): string {
  const names: Record<string, string> = {
    workday: 'Workday',
    greenhouse: 'Greenhouse',
    unknown: 'Unknown',
  }
  return names[platform] || 'Unknown'
}

export default App

import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Separator } from '../components/ui/separator'
import { hasProfile, loadProfile } from '../utils/storage'

interface PopupState {
  hasProfile: boolean
  profileCompleteness: number
  lastUpdated: string | null
  isLoading: boolean
}

function App() {
  const [state, setState] = useState<PopupState>({
    hasProfile: false,
    profileCompleteness: 0,
    lastUpdated: null,
    isLoading: true,
  })

  useEffect(() => {
    async function loadState() {
      const profileExists = await hasProfile()

      if (profileExists) {
        const result = await loadProfile()
        if (result.success && result.data) {
          const completeness = calculateCompleteness(result.data)
          setState({
            hasProfile: true,
            profileCompleteness: completeness,
            lastUpdated: result.data.lastUpdated,
            isLoading: false,
          })
          return
        }
      }

      setState({
        hasProfile: false,
        profileCompleteness: 0,
        lastUpdated: null,
        isLoading: false,
      })
    }

    loadState()
  }, [])

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
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

          <Separator />

          {/* Status */}
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Navigate to a supported job application site to use autofill.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported: Workday, Greenhouse
            </p>
          </div>

          <Separator />

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
              <div className="text-4xl">👋</div>
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

export default App

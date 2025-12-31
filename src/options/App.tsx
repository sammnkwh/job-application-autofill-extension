import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Separator } from '../components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import { ProfileForm } from '../components/profile'
import { clearAllData, exportProfile, importProfile, loadSettings, saveSettings } from '../utils/storage'
import { validateImportData, openFilePicker } from '../utils/exportImport'
import { createSanitizedErrorReport, copyReportToClipboard, getExtensionVersion } from '../utils/logSanitizer'
import type { Settings } from '../types/schema'

function App() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [showClearDialog, setShowClearDialog] = useState(false)

  // Load settings on mount
  useState(() => {
    loadSettings().then((result) => {
      if (result.success && result.data) {
        setSettings(result.data)
      }
    })
  })

  const handleConfidenceChange = async (value: string) => {
    const threshold = parseInt(value)
    setSettings((prev) => prev ? { ...prev, confidenceThreshold: threshold } : null)
    await saveSettings({ confidenceThreshold: threshold })
    setSaveMessage('Settings saved')
    setTimeout(() => setSaveMessage(null), 2000)
  }

  const handleExport = async () => {
    const result = await exportProfile()
    if (result.success && result.data) {
      const blob = new Blob([result.data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `job-profile-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      setSaveMessage('Error: ' + (result.error || 'Failed to export'))
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const handleImport = async () => {
    const text = await openFilePicker()
    if (!text) return

    // Validate the import data
    const validation = validateImportData(text)

    if (!validation.valid) {
      setSaveMessage('Error: ' + validation.errors.join(' '))
      setTimeout(() => setSaveMessage(null), 5000)
      return
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Import warnings:', validation.warnings)
    }

    // Import the profile
    const result = await importProfile(text)
    if (result.success) {
      setSaveMessage('Profile imported successfully!' +
        (validation.warnings.length > 0 ? ` (${validation.warnings.length} warnings)` : ''))
      setTimeout(() => window.location.reload(), 1500)
    } else {
      setSaveMessage('Error: ' + (result.error || 'Failed to import'))
    }
    setTimeout(() => setSaveMessage(null), 5000)
  }

  const handleReportIssue = async () => {
    const report = createSanitizedErrorReport(
      new Error('User-initiated bug report'),
      {
        settingsLoaded: settings !== null,
        confidenceThreshold: settings?.confidenceThreshold,
      }
    )

    const success = await copyReportToClipboard(report)
    if (success) {
      setSaveMessage('Debug info copied to clipboard. Paste it in your bug report.')
    } else {
      setSaveMessage('Could not copy to clipboard. Please try again.')
    }
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleClearData = async () => {
    await clearAllData()
    setShowClearDialog(false)
    window.location.reload()
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold">Job Application Autofill</h1>
        <p className="text-muted-foreground">
          Manage your profile and settings
        </p>
      </div>

      {saveMessage && (
        <Alert className="mb-4">
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm onSaveSuccess={() => {
            setSaveMessage('Profile saved successfully!')
            setTimeout(() => setSaveMessage(null), 2000)
          }} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autofill Settings</CardTitle>
              <CardDescription>
                Configure how the extension fills in your applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Confidence Threshold</Label>
                <Select
                  value={settings?.confidenceThreshold?.toString() || '80'}
                  onValueChange={handleConfidenceChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="70">70% (More fields filled)</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="80">80% (Recommended)</SelectItem>
                    <SelectItem value="85">85%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="95">95% (Fewer fields filled)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Only fill fields when the match confidence is above this threshold
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export, import, or clear your profile data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport}>
                  Export Profile
                </Button>
                <Button variant="outline" onClick={handleImport}>
                  Import Profile
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-destructive">Danger Zone</Label>
                <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Clear All Data</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear all data?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete your profile, settings, and all stored data.
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleClearData}>
                        Clear All Data
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
              <CardDescription>
                Get help or report issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" onClick={handleReportIssue}>
                  Copy Debug Info
                </Button>
                <p className="text-sm text-muted-foreground">
                  Copies sanitized debug information to clipboard. Paste this in your bug report.
                  Personal information is automatically removed.
                </p>
              </div>
              <Separator />
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => window.open('https://github.com/anthropics/claude-code/issues', '_blank')}
              >
                Report Issue on GitHub
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>Version:</strong> {getExtensionVersion()}
              </p>
              <p className="text-sm text-muted-foreground">
                Your data is stored locally and encrypted. It is never sent to any server.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App

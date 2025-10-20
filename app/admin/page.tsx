'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Lock, Loader2 } from 'lucide-react'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  const handleAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/export?password=${password}&format=all`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setAuthenticated(true)
      } else {
        alert('Invalid password')
      }
    } catch (error) {
      alert('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format: string) => {
    const url = `/api/admin/export?password=${password}&format=${format}`
    window.open(url, '_blank')
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <CardTitle className="text-center">Admin Access</CardTitle>
            <CardDescription className="text-center">
              Enter the admin password to access data exports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="Admin password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button onClick={handleAuth} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Access Admin Panel'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Data export and monitoring for the Focus Timer Study
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Participants</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.total_participants}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.total_sessions}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Session Ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.total_ratings}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Study Completions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.total_post_treatment_surveys}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>
              Download experiment data in CSV format for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                onClick={() => handleDownload('sessions')}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Sessions Data
              </Button>

              <Button
                onClick={() => handleDownload('baseline')}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Baseline Surveys
              </Button>

              <Button
                onClick={() => handleDownload('ratings')}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Post-Session Ratings
              </Button>

              <Button
                onClick={() => handleDownload('post-treatment')}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Post-Treatment Surveys
              </Button>
            </div>

            <Button
              onClick={() => handleDownload('all')}
              className="w-full"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All Data (JSON)
            </Button>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Data Analysis Tips</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <ul className="text-sm space-y-2">
              <li>
                <strong>Primary analysis:</strong> Compare actual_duration_seconds across
                conditions (COUNTDOWN vs HOURGLASS) using paired t-test
              </li>
              <li>
                <strong>Secondary outcomes:</strong> Perceived stress, ease of following, and
                completion rates
              </li>
              <li>
                <strong>Moderator analysis:</strong> Test if time_anxiety_score from baseline
                moderates the treatment effect
              </li>
              <li>
                <strong>Check for order effects:</strong> Include session_number as a covariate
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

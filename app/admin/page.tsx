'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Lock, Loader2, RefreshCw, AlertTriangle, Mail } from 'lucide-react'

interface ParticipantData {
  accessCodeLast4: string
  sessionsCompleted: number
  totalSessions: number
  lastActiveAt: string | null
  daysSinceRegistration: number
  hasPacingWarning: boolean
  createdAt: string
}

interface StatsData {
  overview: {
    totalParticipants: number
    totalSessions: number
    completedSessions: number
    averageSessionsPerParticipant: number
    avgCountdownDuration: number
    avgHourglassDuration: number
  }
  participationRate: {
    '0': number
    '1': number
    '2': number
  }
  participants: ParticipantData[]
  lastUpdated: string
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true) // Loading state for auto-auth check
  const [stats, setStats] = useState<StatsData | null>(null)

  // Check for stored password on mount
  useEffect(() => {
    const storedPassword = sessionStorage.getItem('adminPassword')
    if (storedPassword) {
      setPassword(storedPassword)
      // Auto-authenticate with stored password
      fetch(`/api/admin/stats?password=${encodeURIComponent(storedPassword)}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          setStats(data)
          setAuthenticated(true)
        })
        .catch(() => {
          // Invalid stored password, clear it
          sessionStorage.removeItem('adminPassword')
        })
        .finally(() => {
          setLoadingAuth(false)
        })
    } else {
      // No stored password
      setLoadingAuth(false)
    }
  }, [])

  const handleAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/stats?password=${encodeURIComponent(password)}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setAuthenticated(true)
        // Store password in sessionStorage
        sessionStorage.setItem('adminPassword', password)
      } else {
        alert('Invalid password')
      }
    } catch (error) {
      alert('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (password && authenticated) {
      handleAuth()
    }
  }

  const handleDownload = async (format: string) => {
    const url = `/api/admin/export?password=${password}&format=${format}`
    window.open(url, '_blank')
  }

  // Show loading spinner while checking for stored auth
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
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
                className="w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent dark:border-gray-600"
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

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const participationData = [
    { label: '0 sessions', count: stats.participationRate['0'], color: 'bg-red-500' },
    { label: '1 session', count: stats.participationRate['1'], color: 'bg-yellow-500' },
    { label: '2 sessions', count: stats.participationRate['2'], color: 'bg-green-500' },
  ]

  const maxCount = Math.max(...participationData.map(d => d.count), 1)

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time monitoring - Focus Timer Experiment
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => window.location.href = '/admin/reminders'} variant="default">
              <Mail className="w-4 h-4 mr-2" />
              Manage Reminders
            </Button>
            <Button onClick={handleRefresh} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Participants</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.overview.totalParticipants}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.overview.totalSessions}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.overview.completedSessions} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Sessions/Participant</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.overview.averageSessionsPerParticipant}</p>
            </CardContent>
          </Card>
        </div>

        {/* Participation Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Participation Rate</CardTitle>
            <CardDescription>Distribution of session completion across participants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {participationData.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-28 text-sm font-medium text-right shrink-0">{item.label}</div>

                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-8 relative min-w-0">
                    <div
                      className={`${item.color} h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all`}
                      style={{ width: `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 8 : 0)}%` }}
                    >
                      {item.count > 0 && item.count}
                    </div>
                  </div>

                  <div className="w-16 text-sm text-muted-foreground shrink-0">
                    {stats.overview.totalParticipants > 0
                      ? `${Math.round((item.count / stats.overview.totalParticipants) * 100)}%`
                      : '0%'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Average Session Duration */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Countdown Timer</CardTitle>
              <CardDescription>Average session duration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {Math.floor(stats.overview.avgCountdownDuration / 60)}m {stats.overview.avgCountdownDuration % 60}s
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Hourglass Timer</CardTitle>
              <CardDescription>Average session duration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {Math.floor(stats.overview.avgHourglassDuration / 60)}m {stats.overview.avgHourglassDuration % 60}s
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Participant Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle>Participant Activity</CardTitle>
            <CardDescription>Real-time session tracking with pacing warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-sm">Code</th>
                    <th className="pb-3 font-medium text-sm">Progress</th>
                    <th className="pb-3 font-medium text-sm">Last Active</th>
                    <th className="pb-3 font-medium text-sm">Days Enrolled</th>
                    <th className="pb-3 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.participants.map((participant, index) => {
                    const lastActive = participant.lastActiveAt
                      ? new Date(participant.lastActiveAt).toLocaleDateString()
                      : 'Never'

                    return (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-mono text-sm">...{participant.accessCodeLast4}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {participant.sessionsCompleted}/{participant.totalSessions}
                            </span>
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${(participant.sessionsCompleted / participant.totalSessions) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-sm">{lastActive}</td>
                        <td className="py-3 text-sm">{participant.daysSinceRegistration}</td>
                        <td className="py-3">
                          {participant.hasPacingWarning && (
                            <div className="flex items-center gap-1 text-orange-600 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              <span>High pace</span>
                            </div>
                          )}
                          {participant.sessionsCompleted === 2 && !participant.hasPacingWarning && (
                            <span className="text-green-600 text-sm font-medium">Complete</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {stats.participants.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No participants yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  )
}

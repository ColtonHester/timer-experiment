'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Loader2, RefreshCw, Mail, Send, AlertCircle, CheckCircle2, Filter } from 'lucide-react'

interface ReminderParticipant {
  id: string
  participantId: string
  email: string
  accessCode: string
  sessionsCompleted: number
  daysSinceRegistration: number
  daysSinceLastReminder: number | null
  recommendedReminder: 'DAY_3' | 'DAY_7' | 'DAY_14' | 'COMPLETE' | 'WITHDRAWN' | 'UNSUBSCRIBED' | 'NONE'
  lastReminderSent: string | null
  reminderCount: number
}

type FilterType = 'all' | 'DAY_3' | 'DAY_7' | 'DAY_14'

export default function RemindersPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [participants, setParticipants] = useState<ReminderParticipant[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    try {
      // Test auth by fetching participants
      const response = await fetch(`/api/admin/reminders/list?password=${encodeURIComponent(password)}`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants || [])
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

  const handleRefresh = () => {
    if (authenticated && password) {
      handleAuth()
    }
  }

  const handleSendReminder = async (participantId: string, reminderType: string) => {
    setSending(true)
    try {
      const response = await fetch('/api/recruitment/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({ participantId, reminderType }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Reminder sent successfully!`)
        handleRefresh()
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to send reminder')
    } finally {
      setSending(false)
    }
  }

  const handleBulkSend = async () => {
    if (selectedIds.size === 0) {
      alert('No participants selected')
      return
    }

    const reminderType = filter === 'all' ? 'day3' : filter.toLowerCase()

    if (!confirm(`Send ${reminderType} reminder to ${selectedIds.size} participants?`)) {
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/recruitment/send-reminder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({
          participantIds: Array.from(selectedIds),
          reminderType,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Sent ${data.results.sent} of ${data.results.total} reminders`)
        setSelectedIds(new Set())
        handleRefresh()
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to send bulk reminders')
    } finally {
      setSending(false)
    }
  }

  const filteredParticipants = participants.filter(p => {
    if (filter === 'all') return p.recommendedReminder !== 'COMPLETE' && p.recommendedReminder !== 'WITHDRAWN'
    return p.recommendedReminder === filter
  })

  const reminderCounts = {
    DAY_3: participants.filter(p => p.recommendedReminder === 'DAY_3').length,
    DAY_7: participants.filter(p => p.recommendedReminder === 'DAY_7').length,
    DAY_14: participants.filter(p => p.recommendedReminder === 'DAY_14').length,
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <CardTitle className="text-center">Reminder Management</CardTitle>
            <CardDescription className="text-center">
              Enter admin password to manage participant reminders
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
                  'Access Reminder Management'
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Reminder Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Send reminder emails to participants
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => window.location.href = '/admin'} variant="outline">
              ← Back to Dashboard
            </Button>
            <Button onClick={handleRefresh} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
              >
                All Active ({filteredParticipants.length})
              </Button>
              <Button
                onClick={() => setFilter('DAY_3')}
                variant={filter === 'DAY_3' ? 'default' : 'outline'}
                className={filter === 'DAY_3' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Day 3 Reminder ({reminderCounts.DAY_3})
              </Button>
              <Button
                onClick={() => setFilter('DAY_7')}
                variant={filter === 'DAY_7' ? 'default' : 'outline'}
                className={filter === 'DAY_7' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                Day 7 Reminder ({reminderCounts.DAY_7})
              </Button>
              <Button
                onClick={() => setFilter('DAY_14')}
                variant={filter === 'DAY_14' ? 'default' : 'outline'}
                className={filter === 'DAY_14' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
              >
                Day 14 Reminder ({reminderCounts.DAY_14})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <Card className="border-2 border-primary">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {selectedIds.size} participant{selectedIds.size !== 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setSelectedIds(new Set())} variant="outline" size="sm">
                    Clear Selection
                  </Button>
                  <Button onClick={handleBulkSend} disabled={sending} size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Send Bulk Reminders
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>
              {filteredParticipants.length} participant{filteredParticipants.length !== 1 ? 's' : ''} shown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-sm">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredParticipants.length && filteredParticipants.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(filteredParticipants.map(p => p.participantId)))
                          } else {
                            setSelectedIds(new Set())
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="pb-3 font-medium text-sm">Email</th>
                    <th className="pb-3 font-medium text-sm">Access Code</th>
                    <th className="pb-3 font-medium text-sm">Sessions</th>
                    <th className="pb-3 font-medium text-sm">Days Enrolled</th>
                    <th className="pb-3 font-medium text-sm">Last Reminder</th>
                    <th className="pb-3 font-medium text-sm">Recommended</th>
                    <th className="pb-3 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(participant.participantId)}
                          onChange={(e) => {
                            const newSet = new Set(selectedIds)
                            if (e.target.checked) {
                              newSet.add(participant.participantId)
                            } else {
                              newSet.delete(participant.participantId)
                            }
                            setSelectedIds(newSet)
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="py-3 text-sm font-mono">
                        {participant.email.split('@')[0].substring(0, 3)}***@{participant.email.split('@')[1]}
                      </td>
                      <td className="py-3 text-sm font-mono">{participant.accessCode}</td>
                      <td className="py-3 text-sm">{participant.sessionsCompleted}/8</td>
                      <td className="py-3 text-sm">{participant.daysSinceRegistration} days</td>
                      <td className="py-3 text-sm">
                        {participant.lastReminderSent
                          ? `${participant.daysSinceLastReminder} days ago`
                          : 'Never'}
                      </td>
                      <td className="py-3">
                        {participant.recommendedReminder === 'DAY_3' && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                            Day 3
                          </span>
                        )}
                        {participant.recommendedReminder === 'DAY_7' && (
                          <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded">
                            Day 7
                          </span>
                        )}
                        {participant.recommendedReminder === 'DAY_14' && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                            Day 14
                          </span>
                        )}
                        {participant.recommendedReminder === 'NONE' && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded">
                            None
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {participant.recommendedReminder !== 'NONE' && (
                          <Button
                            onClick={() => handleSendReminder(participant.participantId, participant.recommendedReminder.toLowerCase())}
                            disabled={sending}
                            size="sm"
                            variant="outline"
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Send
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredParticipants.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No participants match the current filter
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Reminder Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <ul className="text-sm space-y-2">
              <li>
                <strong>Day 3 Reminder:</strong> Sent to participants with &lt;2 sessions completed, 3+ days enrolled
              </li>
              <li>
                <strong>Day 7 Reminder:</strong> Sent to participants with &lt;4 sessions completed, 7+ days enrolled
              </li>
              <li>
                <strong>Day 14 Reminder:</strong> Sent to participants with &lt;6 sessions completed, 14+ days enrolled
              </li>
              <li>
                Reminders are automatically spaced out (won't send if last reminder was &lt;2-4 days ago)
              </li>
              <li>
                Participants who have unsubscribed or withdrawn are automatically excluded
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

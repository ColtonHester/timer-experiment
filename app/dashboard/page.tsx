'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { Clock, CheckCircle2, Circle, ArrowRight, Trophy } from 'lucide-react'

interface Session {
  id: string
  sessionNumber: number
  condition: 'COUNTDOWN' | 'HOURGLASS'
  completedFullSession: boolean
  actualDuration: number | null
  createdAt: string
}

interface DashboardData {
  participantId: string
  totalSessions: number
  completedSessions: number
  nextSessionNumber: number
  nextCondition: 'COUNTDOWN' | 'HOURGLASS' | null
  sessions: Session[]
  isComplete: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const participantId = localStorage.getItem('participantId')
    if (!participantId) {
      router.push('/')
      return
    }

    fetchDashboardData(participantId)
  }, [router])

  const fetchDashboardData = async (participantId: string) => {
    try {
      const response = await fetch(`/api/participants/${participantId}/dashboard`)
      if (!response.ok) throw new Error('Failed to fetch dashboard data')

      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      alert('Failed to load dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = () => {
    if (!data?.nextCondition) return

    const condition = data.nextCondition.toLowerCase()
    router.push(`/session/${condition}?sessionNumber=${data.nextSessionNumber}`)
  }

  const handleViewPostSurvey = () => {
    router.push('/post-survey')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
            <CardDescription>
              We couldn't load your participant data. Please try starting over.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progressPercentage = (data.completedSessions / data.totalSessions) * 100

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Your Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your progress through the focus timer study
          </p>
        </motion.div>

        {/* Progress Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Progress</span>
                <span className="text-primary">
                  {data.completedSessions} / {data.totalSessions}
                </span>
              </CardTitle>
              <CardDescription>
                {data.isComplete
                  ? "Congratulations! You've completed all sessions!"
                  : `${data.totalSessions - data.completedSessions} sessions remaining`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progressPercentage} max={100} className="h-3" />

              {!data.isComplete && data.nextCondition && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                        Next Session: #{data.nextSessionNumber}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Timer Type: {data.nextCondition === 'COUNTDOWN' ? 'Countdown Timer' : 'Hourglass Visualization'}
                      </p>
                    </div>
                    <Button onClick={handleStartSession} size="lg">
                      Start Session <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {data.isComplete && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">
                          All Sessions Complete!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Please complete the final survey to finish the study
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleViewPostSurvey} size="lg" variant="default">
                      Final Survey <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Session History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                Your completed and upcoming focus sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: data.totalSessions }, (_, i) => i + 1).map((sessionNum) => {
                  const session = data.sessions.find((s) => s.sessionNumber === sessionNum)
                  const isCompleted = !!session
                  const isNext = sessionNum === data.nextSessionNumber && !data.isComplete

                  // Get condition from completed session or from sequence
                  let condition: 'COUNTDOWN' | 'HOURGLASS' | null = null
                  if (session) {
                    condition = session.condition
                  } else if (isNext && data.nextCondition) {
                    condition = data.nextCondition
                  }

                  return (
                    <div
                      key={sessionNum}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        isNext
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : isCompleted
                          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : isNext ? (
                          <Circle className="w-6 h-6 text-primary flex-shrink-0 animate-pulse" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                        )}

                        <div>
                          <p className="font-semibold text-sm">
                            Session #{sessionNum}
                            {isNext && (
                              <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                Next
                              </span>
                            )}
                          </p>
                          {condition && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              {condition === 'COUNTDOWN' ? 'Countdown Timer' : 'Hourglass Visualization'}
                            </p>
                          )}
                        </div>
                      </div>

                      {session && session.actualDuration && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="text-sm font-semibold">
                            {Math.floor(session.actualDuration / 60)} min
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Study Tips Card */}
        {!data.isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Complete at least 2 sessions per day for best results</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Use the timer for actual study/work tasks to get the most benefit</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Complete the brief rating after each session while it's fresh in your mind</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Try to minimize distractions during your focus sessions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

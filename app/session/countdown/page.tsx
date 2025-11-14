'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CountdownTimer from '@/components/timers/CountdownTimer'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Loader2, XCircle, Pause, Play } from 'lucide-react'
import { useBeforeUnload } from '@/hooks/useBeforeUnload'

function CountdownSessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [currentPauseId, setCurrentPauseId] = useState<string | null>(null)

  const sessionNumber = searchParams.get('sessionNumber')
  const participantId = typeof window !== 'undefined' ? localStorage.getItem('participantId') : null

  // Warn user before closing tab during active session
  useBeforeUnload(!!sessionId && !loading, 'Your session is in progress. Are you sure you want to leave?')

  // Prevent browser back button during active session
  useEffect(() => {
    if (!sessionId || loading) return

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault()
      const confirmLeave = window.confirm(
        'Your session is in progress. Going back will end your session. Are you sure you want to leave?'
      )
      if (!confirmLeave) {
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.pathname + window.location.search)
      }
    }

    // Push initial state to enable popstate detection
    window.history.pushState(null, '', window.location.pathname + window.location.search)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [sessionId, loading])

  useEffect(() => {
    if (!participantId || !sessionNumber) {
      router.push('/dashboard')
      return
    }

    startSession()
  }, [participantId, sessionNumber, router])

  const startSession = async () => {
    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          sessionNumber: parseInt(sessionNumber!),
          condition: 'COUNTDOWN',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start session')
      }

      const data = await response.json()
      setSessionId(data.sessionId)
      setStartTime(new Date(data.startTime))
      setLoading(false)
    } catch (err) {
      console.error('Error starting session:', err)
      setError('Failed to start session. Please try again.')
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!sessionId) return

    try {
      const response = await fetch('/api/sessions/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to end session')
      }

      // Navigate to rating page
      router.push(`/rating?sessionId=${sessionId}`)
    } catch (err) {
      console.error('Error ending session:', err)
      alert('Failed to save session. Please try again.')
    }
  }

  const handleEarlyStop = async () => {
    if (!sessionId) return

    const confirmed = confirm(
      'Are you sure you want to stop early? Your progress will still be saved.'
    )

    if (confirmed) {
      try {
        const response = await fetch('/api/sessions/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (!response.ok) {
          throw new Error('Failed to end session')
        }

        router.push(`/rating?sessionId=${sessionId}`)
      } catch (err) {
        console.error('Error ending session:', err)
        alert('Failed to save session. Please try again.')
      }
    }
  }

  const handlePause = async () => {
    if (!sessionId || isPaused) return

    try {
      const response = await fetch('/api/sessions/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to pause session')
      }

      const data = await response.json()
      setCurrentPauseId(data.pauseId)
      setIsPaused(true)
    } catch (err) {
      console.error('Error pausing session:', err)
      alert('Failed to pause session. Please try again.')
    }
  }

  const handleResume = async () => {
    if (!sessionId || !currentPauseId || !isPaused) return

    try {
      const response = await fetch('/api/sessions/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, pauseId: currentPauseId }),
      })

      if (!response.ok) {
        throw new Error('Failed to resume session')
      }

      setCurrentPauseId(null)
      setIsPaused(false)
    } catch (err) {
      console.error('Error resuming session:', err)
      alert('Failed to resume session. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-gray-600 dark:text-gray-400">Starting your session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Session Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Focus Session #{sessionNumber}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Countdown Timer
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleEarlyStop}>
            Stop Early
          </Button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl flex flex-col items-center"
        >
          <CountdownTimer
            durationSeconds={1500} // 25 minutes
            onComplete={handleComplete}
            isPaused={isPaused}
          />

          {/* Pause/Play Button - positioned between timer and instructions */}
          <div className="mt-6">
            <Button
              onClick={isPaused ? handleResume : handlePause}
              variant={isPaused ? 'default' : 'outline'}
              size="lg"
              className="w-14 h-14 rounded-full p-0"
            >
              {isPaused ? (
                <Play className="w-6 h-6" />
              ) : (
                <Pause className="w-6 h-6" />
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Footer hint */}
      <div className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isPaused
              ? 'Take a break - resume when you\'re ready'
              : 'Focus on your work - you can pause anytime if needed'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CountdownSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <CountdownSessionContent />
    </Suspense>
  )
}

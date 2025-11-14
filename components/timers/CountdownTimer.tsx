'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Pause, Play } from 'lucide-react'

interface CountdownTimerProps {
  durationSeconds: number
  onComplete: () => void
  onTick?: (remainingSeconds: number) => void
  isPaused?: boolean
  onPause?: () => void
  onResume?: () => void
}

export default function CountdownTimer({
  durationSeconds,
  onComplete,
  onTick,
  isPaused = false,
  onPause,
  onResume,
}: CountdownTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)
  const [isRunning, setIsRunning] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const pausedTimeRef = useRef<number>(0) // Track total paused time
  const pauseStartRef = useRef<number | null>(null) // Track when current pause started

  // Handle pause state changes
  useEffect(() => {
    if (isPaused) {
      // Timer just paused
      if (pauseStartRef.current === null) {
        pauseStartRef.current = Date.now()
      }
    } else {
      // Timer just resumed
      if (pauseStartRef.current !== null) {
        const pauseDuration = Date.now() - pauseStartRef.current
        pausedTimeRef.current += pauseDuration
        pauseStartRef.current = null
      }
    }
  }, [isPaused])

  useEffect(() => {
    if (!isRunning || isPaused) return

    // Use timestamp-based timing to handle inactive tabs
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const totalElapsed = Math.floor((now - startTimeRef.current) / 1000)
      const pausedSeconds = Math.floor(pausedTimeRef.current / 1000)
      const activeElapsed = totalElapsed - pausedSeconds
      const remaining = Math.max(0, durationSeconds - activeElapsed)

      setRemainingSeconds(remaining)

      // Call onTick callback
      if (onTick) {
        onTick(remaining)
      }

      // Check if timer is complete
      if (remaining <= 0) {
        setIsRunning(false)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        onComplete()
      }
    }, 100) // Check every 100ms for smoother updates

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, onComplete, onTick, durationSeconds])

  // Calculate progress for the ring - ring depletes as time runs out
  const circumference = 2 * Math.PI * 120 // radius = 120
  const progress = (remainingSeconds / durationSeconds) * 100 // percentage remaining
  // strokeDashoffset: 0 = full ring, circumference = empty ring
  // As time depletes (remainingSeconds decreases), offset should INCREASE
  const strokeDashoffset = circumference * (1 - remainingSeconds / durationSeconds)

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      {/* Circular Progress Ring with Time Display */}
      <div className="relative">
        {/* SVG Progress Ring */}
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="150"
            cy="150"
            r="120"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Progress circle */}
          <motion.circle
            cx="150"
            cy="150"
            r="120"
            stroke="#3b82f6"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>

        {/* Time Display - Centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="text-7xl font-bold text-gray-900 dark:text-white tabular-nums">
              {formatTime(remainingSeconds)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              remaining
            </p>
          </motion.div>
        </div>
      </div>

      {/* Pause/Play Button - positioned directly below timer */}
      {onPause && onResume && (
        <div className="flex justify-center">
          <Button
            onClick={isPaused ? onResume : onPause}
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full p-0"
            aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
          >
            {isPaused ? (
              <Play className="w-6 h-6" />
            ) : (
              <Pause className="w-6 h-6" />
            )}
          </Button>
        </div>
      )}

      {/* Progress Info */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          {isPaused ? 'Timer paused - resume when ready' : 'Keep focusing on your task'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {Math.floor(((100 - progress) / 100) * 25)} of 25 minutes complete
        </p>
      </div>

      {/* Visual indicator when nearly done */}
      {remainingSeconds <= 60 && remainingSeconds > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            Almost there! Last minute.
          </p>
        </motion.div>
      )}
    </div>
  )
}

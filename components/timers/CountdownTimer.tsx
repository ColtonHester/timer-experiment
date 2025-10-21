'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { formatTime } from '@/lib/utils'

interface CountdownTimerProps {
  durationSeconds: number
  onComplete: () => void
  onTick?: (remainingSeconds: number) => void
}

export default function CountdownTimer({
  durationSeconds,
  onComplete,
  onTick,
}: CountdownTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)
  const [isRunning, setIsRunning] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1

        // Call onTick callback
        if (onTick) {
          onTick(next)
        }

        // Check if timer is complete
        if (next <= 0) {
          setIsRunning(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          onComplete()
          return 0
        }

        return next
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, onComplete, onTick])

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

      {/* Progress Info */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Keep focusing on your task
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

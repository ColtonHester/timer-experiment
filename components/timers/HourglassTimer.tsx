'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface HourglassTimerProps {
  durationSeconds: number
  onComplete: () => void
  onTick?: (remainingSeconds: number) => void
  isPaused?: boolean
  onPause?: () => void
  onResume?: () => void
}

export default function HourglassTimer({
  durationSeconds,
  onComplete,
  onTick,
  isPaused = false,
  onPause,
  onResume,
}: HourglassTimerProps) {
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

  // Calculate progress (0 = full, 100 = empty)
  const progress = ((durationSeconds - remainingSeconds) / durationSeconds) * 100

  // Calculate sand levels
  const topSandHeight = 100 - progress // Top bulb empties
  const bottomSandHeight = progress // Bottom bulb fills

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      {/* Hourglass SVG Visualization */}
      <div className="relative">
        <svg
          width="280"
          height="400"
          viewBox="0 0 280 400"
          className="drop-shadow-lg"
        >
          {/* Hourglass Glass Container */}
          <defs>
            {/* Gradient for glass effect */}
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.3" />
            </linearGradient>

            {/* Gradient for sand */}
            <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Clip path for top bulb */}
            <clipPath id="topBulb">
              <path d="M 70 20 Q 70 20, 70 80 Q 70 140, 140 160 Q 210 140, 210 80 Q 210 20, 210 20 Z" />
            </clipPath>

            {/* Clip path for bottom bulb */}
            <clipPath id="bottomBulb">
              <path d="M 70 380 Q 70 380, 70 320 Q 70 260, 140 240 Q 210 260, 210 320 Q 210 380, 210 380 Z" />
            </clipPath>
          </defs>

          {/* Glass outline - Top bulb */}
          <path
            d="M 70 20 Q 70 20, 70 80 Q 70 140, 140 160 Q 210 140, 210 80 Q 210 20, 210 20 Z"
            fill="url(#glassGradient)"
            stroke="currentColor"
            strokeWidth="3"
            className="text-gray-400 dark:text-gray-600"
          />

          {/* Glass outline - Bottom bulb */}
          <path
            d="M 70 380 Q 70 380, 70 320 Q 70 260, 140 240 Q 210 260, 210 320 Q 210 380, 210 380 Z"
            fill="url(#glassGradient)"
            stroke="currentColor"
            strokeWidth="3"
            className="text-gray-400 dark:text-gray-600"
          />

          {/* Neck */}
          <rect
            x="135"
            y="160"
            width="10"
            height="80"
            fill="currentColor"
            className="text-gray-300 dark:text-gray-700"
          />

          {/* Top sand (draining) - starts full at y=20 */}
          <g clipPath="url(#topBulb)">
            <motion.rect
              x="70"
              width="140"
              fill="url(#sandGradient)"
              initial={false}
              animate={{
                y: 20 + ((100 - topSandHeight) / 100) * 140,
                height: (topSandHeight / 100) * 140
              }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </g>

          {/* Animated sand particles falling through neck - only when running AND not paused */}
          {isRunning && !isPaused && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.circle
                  key={i}
                  r="2"
                  fill="#f59e0b"
                  initial={{ cx: 140, cy: 160 }}
                  animate={{
                    cy: [160, 240],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'linear',
                  }}
                />
              ))}
            </>
          )}

          {/* Bottom sand (filling) - anchored at bottom (y=380) */}
          <g clipPath="url(#bottomBulb)">
            <motion.rect
              x="70"
              width="140"
              fill="url(#sandGradient)"
              initial={false}
              animate={{
                y: 380 - (bottomSandHeight / 100) * 140,
                height: (bottomSandHeight / 100) * 140
              }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </g>

          {/* Decorative stand */}
          <rect
            x="60"
            y="5"
            width="160"
            height="10"
            rx="5"
            fill="currentColor"
            className="text-gray-600 dark:text-gray-500"
          />
          <rect
            x="60"
            y="385"
            width="160"
            height="10"
            rx="5"
            fill="currentColor"
            className="text-gray-600 dark:text-gray-500"
          />
        </svg>
      </div>

      {/* Paused indicator with fixed height to prevent layout shift */}
      <div className="h-8 flex items-center justify-center">
        {isPaused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-xl font-bold text-amber-600 dark:text-amber-400"
          >
            PAUSED
          </motion.div>
        )}
      </div>

      {/* Motivational Text (NO TIME DISPLAY) */}
      <div className="text-center space-y-3 max-w-md">
        <motion.p
          className="text-lg font-medium text-gray-700 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isPaused ? 'Timer paused - resume when ready' : 'Stay focused on your task'}
        </motion.p>

        <motion.p
          className="text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {isPaused ? 'Take your time' : 'Work at your natural pace'}
        </motion.p>
      </div>

      {/* Subtle progress indicator (no numbers) */}
      {progress > 75 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            Your session is nearly complete
          </p>
        </motion.div>
      )}
    </div>
  )
}

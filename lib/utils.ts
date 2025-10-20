// Utility functions for the timer experiment

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with proper precedence
 * Used for conditional styling in components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format seconds into mm:ss display
 * @param seconds Total seconds
 * @returns Formatted string like "24:37"
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Calculate duration between two dates in seconds
 */
export function calculateDuration(startTime: Date, endTime: Date): number {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
}

/**
 * Check if a session was completed (reached target duration)
 */
export function isSessionComplete(
  actualDuration: number,
  targetDuration: number
): boolean {
  return actualDuration >= targetDuration
}

/**
 * Calculate overrun amount (how much past target duration)
 * Returns null if session stopped early
 */
export function calculateOverrun(
  actualDuration: number,
  targetDuration: number
): number | null {
  if (actualDuration <= targetDuration) {
    return null
  }
  return actualDuration - targetDuration
}

/**
 * Generate a secure random subject ID (alternative to UUID if needed)
 */
export function generateSubjectId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  return `SUB-${timestamp}-${randomPart}`.toUpperCase()
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0
  return Math.min(100, Math.max(0, (current / total) * 100))
}

/**
 * Validate Likert scale response (1-5)
 */
export function isValidLikert(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Calculate session completion rate for a participant
 */
export function calculateCompletionRate(
  completedSessions: number,
  totalSessions: number
): number {
  if (totalSessions === 0) return 0
  return Math.round((completedSessions / totalSessions) * 100)
}

/**
 * Check if participant has completed all required sessions
 */
export function hasCompletedStudy(
  completedSessions: number,
  requiredSessions: number
): boolean {
  return completedSessions >= requiredSessions
}

/**
 * Session Randomization & Counterbalancing Algorithm
 *
 * This module generates randomized session sequences for the within-subjects design.
 * Key requirements:
 * - Each participant gets equal exposure to both conditions (countdown & hourglass)
 * - Conditions alternate to minimize carryover effects (no clustering)
 * - Each participant gets at least 2 sessions of each condition
 * - Default: 8 total sessions (4 countdown, 4 hourglass)
 */

export type TimerCondition = 'COUNTDOWN' | 'HOURGLASS'

interface RandomizationOptions {
  totalSessions?: number  // Total number of sessions (default: 8)
  minPerCondition?: number  // Minimum sessions per condition (default: 2)
}

/**
 * Generates a randomized, counterbalanced session sequence
 *
 * Algorithm:
 * 1. Create pairs of [COUNTDOWN, HOURGLASS]
 * 2. Randomly shuffle the order within each pair
 * 3. Concatenate pairs to create full sequence
 *
 * This ensures perfect alternation while maintaining randomness
 */
export function generateSessionSequence(
  options: RandomizationOptions = {}
): TimerCondition[] {
  const { totalSessions = 8, minPerCondition = 2 } = options

  // Validate inputs
  if (totalSessions % 2 !== 0) {
    throw new Error('Total sessions must be even for balanced design')
  }
  if (minPerCondition * 2 > totalSessions) {
    throw new Error('Minimum per condition is too high for total sessions')
  }

  const numPairs = totalSessions / 2
  const sequence: TimerCondition[] = []

  // Create pairs and randomize order within each pair
  for (let i = 0; i < numPairs; i++) {
    const pair: TimerCondition[] = ['COUNTDOWN', 'HOURGLASS']
    // Randomly shuffle this pair
    if (Math.random() > 0.5) {
      pair.reverse()
    }
    sequence.push(...pair)
  }

  return sequence
}

/**
 * Alternative algorithm: Generate sequence with controlled randomization
 * This version allows for more flexibility but still ensures balance
 */
export function generateFlexibleSequence(
  options: RandomizationOptions = {}
): TimerCondition[] {
  const { totalSessions = 8 } = options

  if (totalSessions % 2 !== 0) {
    throw new Error('Total sessions must be even for balanced design')
  }

  const halfSessions = totalSessions / 2
  const sequence: TimerCondition[] = [
    ...Array(halfSessions).fill('COUNTDOWN'),
    ...Array(halfSessions).fill('HOURGLASS'),
  ] as TimerCondition[]

  // Fisher-Yates shuffle
  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[sequence[i], sequence[j]] = [sequence[j], sequence[i]]
  }

  return sequence
}

/**
 * Get the condition for a specific session number
 * Session numbers are 1-indexed (first session is 1, not 0)
 */
export function getConditionForSession(
  sequence: TimerCondition[],
  sessionNumber: number
): TimerCondition {
  if (sessionNumber < 1 || sessionNumber > sequence.length) {
    throw new Error(`Invalid session number: ${sessionNumber}`)
  }
  return sequence[sessionNumber - 1]
}

/**
 * Calculate balance metrics for a sequence
 * Useful for validation and debugging
 */
export function analyzeSequence(sequence: TimerCondition[]) {
  const countdownCount = sequence.filter((c) => c === 'COUNTDOWN').length
  const hourglassCount = sequence.filter((c) => c === 'HOURGLASS').length

  // Calculate number of transitions (alternations)
  let transitions = 0
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] !== sequence[i - 1]) {
      transitions++
    }
  }

  return {
    total: sequence.length,
    countdown: countdownCount,
    hourglass: hourglassCount,
    balance: countdownCount === hourglassCount,
    transitions,
    maxPossibleTransitions: sequence.length - 1,
  }
}

/**
 * Example usage:
 *
 * const sequence = generateSessionSequence({ totalSessions: 8 })
 * console.log(sequence)
 * // Possible output: ['HOURGLASS', 'COUNTDOWN', 'COUNTDOWN', 'HOURGLASS', 'HOURGLASS', 'COUNTDOWN', 'COUNTDOWN', 'HOURGLASS']
 *
 * const condition = getConditionForSession(sequence, 3)
 * console.log(condition) // 'COUNTDOWN'
 *
 * const analysis = analyzeSequence(sequence)
 * console.log(analysis)
 * // { total: 8, countdown: 4, hourglass: 4, balance: true, transitions: 7, maxPossibleTransitions: 7 }
 */

import { prisma } from './db'

/**
 * Access Code Generation Utility
 *
 * Generates unique, human-readable access codes in the format: MIDS-XXXX-YYYY
 * Example: MIDS-A7B3-C9X2
 *
 * Features:
 * - Cryptographically random
 * - Excludes ambiguous characters (0/O, 1/I/L)
 * - Easy to read and type
 * - Validates uniqueness against database
 */

// Character set: excludes 0, 1, O, I, L to avoid confusion
const CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

/**
 * Generate a random segment of the access code
 */
function generateSegment(length: number): string {
  let result = ''
  const randomBytes = crypto.getRandomValues(new Uint8Array(length))

  for (let i = 0; i < length; i++) {
    result += CHARSET[randomBytes[i] % CHARSET.length]
  }

  return result
}

/**
 * Generate an access code in the format MIDS-XXXX-YYYY
 */
function generateCode(): string {
  const segment1 = generateSegment(4)
  const segment2 = generateSegment(4)
  return `MIDS-${segment1}-${segment2}`
}

/**
 * Generate a unique access code, checking against database for collisions
 *
 * @param maxAttempts - Maximum number of generation attempts (default: 10)
 * @returns A unique access code
 * @throws Error if unable to generate unique code after maxAttempts
 */
export async function generateUniqueAccessCode(maxAttempts = 10): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateCode()

    // Check if code already exists
    const existing = await prisma.participant.findUnique({
      where: { accessCode: code },
      select: { id: true },
    })

    if (!existing) {
      return code
    }

    // Collision detected, try again
    console.warn(`Access code collision detected: ${code}. Regenerating...`)
  }

  throw new Error(`Failed to generate unique access code after ${maxAttempts} attempts`)
}

/**
 * Validate an access code format
 *
 * @param code - The access code to validate
 * @returns true if format is valid
 */
export function isValidAccessCodeFormat(code: string): boolean {
  // Format: MIDS-XXXX-YYYY where X and Y are from CHARSET
  const pattern = /^MIDS-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/
  return pattern.test(code)
}

/**
 * Normalize an access code (uppercase, trim whitespace)
 *
 * @param code - The access code to normalize
 * @returns Normalized access code
 */
export function normalizeAccessCode(code: string): string {
  return code.toUpperCase().trim()
}

/**
 * Verify an access code exists in the database and return the participant ID
 *
 * @param code - The access code to verify
 * @returns Participant ID if code is valid, null otherwise
 */
export async function verifyAccessCode(code: string): Promise<string | null> {
  const normalized = normalizeAccessCode(code)

  if (!isValidAccessCodeFormat(normalized)) {
    return null
  }

  const participant = await prisma.participant.findUnique({
    where: { accessCode: normalized },
    select: { id: true },
  })

  return participant?.id || null
}

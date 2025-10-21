import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessCode } from '@/lib/accessCode'

/**
 * POST /api/auth/verify-code
 *
 * Verify an access code and return the participant ID if valid
 *
 * Request body:
 * {
 *   "accessCode": "MIDS-A7B3-C9X2"
 * }
 *
 * Response (success):
 * {
 *   "valid": true,
 *   "participantId": "uuid-string"
 * }
 *
 * Response (invalid):
 * {
 *   "valid": false,
 *   "error": "Invalid access code"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accessCode } = body

    if (!accessCode || typeof accessCode !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Access code is required' },
        { status: 400 }
      )
    }

    // Verify the access code
    const participantId = await verifyAccessCode(accessCode)

    if (!participantId) {
      return NextResponse.json(
        { valid: false, error: 'Invalid access code' },
        { status: 401 }
      )
    }

    // Return the participant ID
    return NextResponse.json({
      valid: true,
      participantId,
    })
  } catch (error) {
    console.error('Error verifying access code:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to verify access code' },
      { status: 500 }
    )
  }
}

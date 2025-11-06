import { NextRequest, NextResponse } from 'next/server'
import { createRecruitmentRecord } from '@/lib/supabase-recruitment'

/**
 * Sync participant email to recruitment database
 * Called automatically after baseline survey completion (if email provided)
 *
 * This endpoint syncs data to a SEPARATE Supabase project for IRB compliance:
 * - Experiment database: Anonymous research data (NO PII)
 * - Recruitment database: Email addresses for reminders (CONTAINS PII)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { participantId, email, accessCode } = body

    // Validate required fields
    if (!participantId || !email || !accessCode) {
      return NextResponse.json(
        { error: 'Missing required fields: participantId, email, accessCode' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create recruitment record in Supabase
    const record = await createRecruitmentRecord({
      participantId,
      email: email.toLowerCase().trim(),
      accessCode,
    })

    return NextResponse.json({
      success: true,
      recordId: record.id,
      message: 'Email synced to recruitment database',
    })
  } catch (error) {
    console.error('Error syncing to recruitment database:', error)

    // Check if this is a duplicate email error
    if (error instanceof Error && error.message.includes('DUPLICATE_EMAIL')) {
      return NextResponse.json(
        {
          success: false,
          error: 'DUPLICATE_EMAIL',
          message: error.message.replace('DUPLICATE_EMAIL: ', ''),
        },
        { status: 409 } // 409 Conflict for duplicate
      )
    }

    // For other errors, don't fail the entire baseline submission
    // Just log the error and return a warning
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync email to recruitment database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

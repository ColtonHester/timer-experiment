import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeFromReminders, withdrawFromStudy, getRecruitmentRecord } from '@/lib/supabase-recruitment'

/**
 * Handle unsubscribe requests from email links
 *
 * Two types of unsubscribe:
 * 1. "reminders" - Stop receiving emails but can still complete sessions
 * 2. "withdraw" - Withdraw from study completely (and stop emails)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, type } = body

    // Validate inputs
    if (!participantId) {
      return NextResponse.json(
        { error: 'Missing participantId' },
        { status: 400 }
      )
    }

    if (!type || !['reminders', 'withdraw'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: reminders or withdraw' },
        { status: 400 }
      )
    }

    // Verify participant exists
    const record = await getRecruitmentRecord(participantId)

    if (!record) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Process unsubscribe based on type
    if (type === 'reminders') {
      // Just stop reminders, participant can still complete study
      await unsubscribeFromReminders(participantId)

      return NextResponse.json({
        success: true,
        type: 'reminders',
        message: 'You have been unsubscribed from reminder emails. You can still complete your sessions using your access code.',
      })
    } else if (type === 'withdraw') {
      // Withdraw from study completely
      await withdrawFromStudy(participantId)

      return NextResponse.json({
        success: true,
        type: 'withdraw',
        message: 'You have been withdrawn from the study. Thank you for your participation so far.',
      })
    }

    return NextResponse.json(
      { error: 'Invalid unsubscribe type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing unsubscribe:', error)
    return NextResponse.json(
      {
        error: 'Failed to process unsubscribe request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to verify unsubscribe status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const participantId = searchParams.get('participantId')

    if (!participantId) {
      return NextResponse.json(
        { error: 'Missing participantId' },
        { status: 400 }
      )
    }

    const record = await getRecruitmentRecord(participantId)

    if (!record) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      participantId: record.participantId,
      unsubscribedFromReminders: record.unsubscribedFromReminders,
      withdrawnAt: record.withdrawnAt,
      canResume: !record.withdrawnAt, // Can still access study if not withdrawn
    })
  } catch (error) {
    console.error('Error checking unsubscribe status:', error)
    return NextResponse.json(
      {
        error: 'Failed to check status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

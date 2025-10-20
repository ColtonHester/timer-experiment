import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSessionSequence } from '@/lib/randomization'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      timeAnxietyScore,
      typicalFocusDuration,
      unitsEnrolled,
      usesTimerCurrently,
      preferredTimerType,
    } = body

    // Validate required fields
    if (
      !timeAnxietyScore ||
      timeAnxietyScore < 1 ||
      timeAnxietyScore > 5 ||
      !typicalFocusDuration
    ) {
      return NextResponse.json(
        { error: 'Invalid survey data' },
        { status: 400 }
      )
    }

    // Generate randomized session sequence (8 sessions by default)
    const sequence = generateSessionSequence({ totalSessions: 8 })

    // Create participant and baseline survey in a transaction
    const participant = await prisma.participant.create({
      data: {
        conditionSequence: sequence, // Store as JSON array
        cohort: 'MIDS_Fall2025',
        baselineSurvey: {
          create: {
            timeAnxietyScore,
            typicalFocusDuration,
            unitsEnrolled: unitsEnrolled || null,
            usesTimerCurrently: usesTimerCurrently || null,
            preferredTimerType: preferredTimerType || null,
          },
        },
      },
      include: {
        baselineSurvey: true,
      },
    })

    return NextResponse.json({
      participantId: participant.id,
      sessionCount: sequence.length,
      message: 'Baseline survey submitted successfully',
    })
  } catch (error) {
    console.error('Error creating participant:', error)
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    )
  }
}

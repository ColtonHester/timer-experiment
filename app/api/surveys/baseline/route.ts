import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSessionSequence } from '@/lib/randomization'
import { generateUniqueAccessCode } from '@/lib/accessCode'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      timeAnxietyScore,
      typicalFocusDuration,
      unitsEnrolled,
      usesTimerCurrently,
      preferredTimerType,
      email, // Optional email for recruitment tracking
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

    // Generate unique access code for participant persistence
    const accessCode = await generateUniqueAccessCode()

    // Create participant and baseline survey in a transaction
    const participant = await prisma.participant.create({
      data: {
        accessCode, // Unique access code for resuming sessions
        conditionSequence: sequence, // Store as JSON array
        cohort: 'MIDS_Fall2025',
        emailCollectedAt: email ? new Date() : null, // Track if email was provided
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
      accessCode: participant.accessCode, // Return access code to user
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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      participantId,
      preferredTimer,
      qualitativeFeedback,
      wouldUseAgain,
      recommendToOthers,
    } = body

    // Validate required fields
    if (!participantId || !preferredTimer || !qualitativeFeedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate preferredTimer enum
    if (!['COUNTDOWN', 'HOURGLASS', 'NO_PREFERENCE'].includes(preferredTimer)) {
      return NextResponse.json(
        { error: 'Invalid timer preference' },
        { status: 400 }
      )
    }

    // Check if participant exists
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Check if post-treatment survey already exists
    const existingSurvey = await prisma.postTreatmentSurvey.findUnique({
      where: { participantId },
    })

    if (existingSurvey) {
      return NextResponse.json(
        { error: 'Post-treatment survey already submitted' },
        { status: 400 }
      )
    }

    // Create post-treatment survey
    const survey = await prisma.postTreatmentSurvey.create({
      data: {
        participantId,
        preferredTimer,
        qualitativeFeedback,
        wouldUseAgain: wouldUseAgain !== undefined ? wouldUseAgain : null,
        recommendToOthers: recommendToOthers !== undefined ? recommendToOthers : null,
      },
    })

    return NextResponse.json({
      surveyId: survey.id,
      message: 'Post-treatment survey submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting post-treatment survey:', error)
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    )
  }
}

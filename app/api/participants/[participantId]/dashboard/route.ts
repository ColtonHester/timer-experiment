import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getConditionForSession, TimerCondition } from '@/lib/randomization'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ participantId: string }> }
) {
  try {
    const { participantId } = await params

    // Fetch participant with all their sessions
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        sessions: {
          orderBy: { sessionNumber: 'asc' },
        },
        postTreatmentSurvey: true,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Get the condition sequence (stored as JSON array)
    const sequence = participant.conditionSequence as TimerCondition[]
    const totalSessions = sequence.length

    // Calculate completed sessions
    const completedSessions = participant.sessions.length

    // Determine next session
    const nextSessionNumber = completedSessions + 1
    const isComplete = completedSessions >= totalSessions || !!participant.postTreatmentSurvey

    // Get next condition from sequence
    let nextCondition: TimerCondition | null = null
    if (nextSessionNumber <= totalSessions && !isComplete) {
      nextCondition = getConditionForSession(sequence, nextSessionNumber)
    }

    return NextResponse.json({
      participantId: participant.id,
      totalSessions,
      completedSessions,
      nextSessionNumber: isComplete ? null : nextSessionNumber,
      nextCondition,
      sessions: participant.sessions,
      isComplete,
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

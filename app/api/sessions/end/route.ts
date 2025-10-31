import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateDuration, isSessionComplete, calculateOverrun } from '@/lib/utils'
import { updateSessionCount } from '@/lib/supabase-recruitment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Fetch the session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.endTime) {
      return NextResponse.json(
        { error: 'Session already ended' },
        { status: 400 }
      )
    }

    // Calculate duration and completion status
    const endTime = new Date()
    const actualDuration = calculateDuration(session.startTime, endTime)
    const completedFullSession = isSessionComplete(actualDuration, session.targetDuration)
    const overrunAmount = calculateOverrun(actualDuration, session.targetDuration)

    // Update session with end time and calculations
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        endTime,
        actualDuration,
        completedFullSession,
        overrunAmount,
      },
    })

    // Sync session count to recruitment database (non-blocking)
    try {
      const totalSessions = await prisma.session.count({
        where: { participantId: session.participantId },
      })
      await updateSessionCount(session.participantId, totalSessions)
    } catch (syncError) {
      console.error('Warning: Failed to sync session count to recruitment DB:', syncError)
      // Continue - main session data is saved
    }

    return NextResponse.json({
      sessionId: updatedSession.id,
      actualDuration: updatedSession.actualDuration,
      completedFullSession: updatedSession.completedFullSession,
      overrunAmount: updatedSession.overrunAmount,
    })
  } catch (error) {
    console.error('Error ending session:', error)
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    )
  }
}

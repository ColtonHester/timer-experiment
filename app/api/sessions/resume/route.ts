import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateDuration } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, pauseId } = body

    if (!sessionId || !pauseId) {
      return NextResponse.json(
        { error: 'Session ID and Pause ID are required' },
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
        { error: 'Cannot resume an ended session' },
        { status: 400 }
      )
    }

    // Fetch the pause event
    const pauseEvent = await prisma.sessionPause.findUnique({
      where: { id: pauseId },
    })

    if (!pauseEvent) {
      return NextResponse.json(
        { error: 'Pause event not found' },
        { status: 404 }
      )
    }

    if (pauseEvent.sessionId !== sessionId) {
      return NextResponse.json(
        { error: 'Pause event does not belong to this session' },
        { status: 400 }
      )
    }

    if (pauseEvent.resumedAt) {
      return NextResponse.json(
        { error: 'Pause event already resumed' },
        { status: 400 }
      )
    }

    // Update pause event with resume time
    const resumedAt = new Date()
    const pauseDuration = calculateDuration(pauseEvent.pausedAt, resumedAt)

    const updatedPause = await prisma.sessionPause.update({
      where: { id: pauseId },
      data: {
        resumedAt,
        pauseDuration,
      },
    })

    // Update session's pause count and total paused time
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        pauseCount: { increment: 1 },
        totalPausedTime: { increment: pauseDuration },
      },
    })

    return NextResponse.json({
      pauseId: updatedPause.id,
      resumedAt: updatedPause.resumedAt,
      pauseDuration: updatedPause.pauseDuration,
      totalPausedTime: updatedSession.totalPausedTime,
      pauseCount: updatedSession.pauseCount,
      message: 'Session resumed successfully',
    })
  } catch (error) {
    console.error('Error resuming session:', error)
    return NextResponse.json(
      { error: 'Failed to resume session' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
        { error: 'Cannot pause an ended session' },
        { status: 400 }
      )
    }

    // Check if there's already an active pause (not resumed)
    const activePause = await prisma.sessionPause.findFirst({
      where: {
        sessionId,
        resumedAt: null,
      },
      orderBy: {
        pausedAt: 'desc',
      },
    })

    if (activePause) {
      return NextResponse.json(
        { error: 'Session is already paused' },
        { status: 400 }
      )
    }

    // Create new pause event
    const pauseEvent = await prisma.sessionPause.create({
      data: {
        sessionId,
        pausedAt: new Date(),
      },
    })

    return NextResponse.json({
      pauseId: pauseEvent.id,
      pausedAt: pauseEvent.pausedAt,
      message: 'Session paused successfully',
    })
  } catch (error) {
    console.error('Error pausing session:', error)
    return NextResponse.json(
      { error: 'Failed to pause session' },
      { status: 500 }
    )
  }
}

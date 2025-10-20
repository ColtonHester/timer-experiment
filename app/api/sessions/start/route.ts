import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, sessionNumber, condition } = body

    // Validate inputs
    if (!participantId || !sessionNumber || !condition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (condition !== 'COUNTDOWN' && condition !== 'HOURGLASS') {
      return NextResponse.json(
        { error: 'Invalid condition' },
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

    // Check if session already exists
    const existingSession = await prisma.session.findUnique({
      where: {
        participantId_sessionNumber: {
          participantId,
          sessionNumber,
        },
      },
    })

    if (existingSession) {
      // If session exists but hasn't ended, return it so user can continue
      if (!existingSession.endTime) {
        return NextResponse.json({
          sessionId: existingSession.id,
          startTime: existingSession.startTime,
          targetDuration: existingSession.targetDuration,
          condition: existingSession.condition,
        })
      }
      // If session already completed, return error
      return NextResponse.json(
        { error: 'Session already completed' },
        { status: 400 }
      )
    }

    // Create new session
    try {
      const session = await prisma.session.create({
        data: {
          participantId,
          sessionNumber,
          condition,
          targetDuration: 1500, // 25 minutes in seconds
          startTime: new Date(),
        },
      })

      return NextResponse.json({
        sessionId: session.id,
        startTime: session.startTime,
        targetDuration: session.targetDuration,
        condition: session.condition,
      })
    } catch (createError: any) {
      // If race condition created duplicate, fetch and return the existing session
      if (createError?.code === 'P2002') {
        const existingSession = await prisma.session.findUnique({
          where: {
            participantId_sessionNumber: {
              participantId,
              sessionNumber,
            },
          },
        })

        if (existingSession && !existingSession.endTime) {
          return NextResponse.json({
            sessionId: existingSession.id,
            startTime: existingSession.startTime,
            targetDuration: existingSession.targetDuration,
            condition: existingSession.condition,
          })
        }
      }
      throw createError
    }
  } catch (error) {
    console.error('Error starting session:', error)
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    )
  }
}

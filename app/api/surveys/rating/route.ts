import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isValidLikert } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sessionId,
      perceivedStress,
      easeOfFollowing,
      subjectiveFocusQuality,
      comments,
    } = body

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    if (!isValidLikert(perceivedStress) || !isValidLikert(easeOfFollowing)) {
      return NextResponse.json(
        { error: 'Invalid rating values (must be 1-5)' },
        { status: 400 }
      )
    }

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if rating already exists
    const existingRating = await prisma.postSessionRating.findUnique({
      where: { sessionId },
    })

    if (existingRating) {
      return NextResponse.json(
        { error: 'Rating already submitted for this session' },
        { status: 400 }
      )
    }

    // Create rating
    const rating = await prisma.postSessionRating.create({
      data: {
        sessionId,
        perceivedStress,
        easeOfFollowing,
        subjectiveFocusQuality: subjectiveFocusQuality || null,
        comments: comments || null,
      },
    })

    return NextResponse.json({
      ratingId: rating.id,
      message: 'Rating submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}

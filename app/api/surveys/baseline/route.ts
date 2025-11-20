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
      classesEnrolled,
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

    // Generate randomized session sequence (2 sessions by default)
    const sequence = generateSessionSequence({ totalSessions: 2 })

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
            classesEnrolled: classesEnrolled || null,
            usesTimerCurrently: usesTimerCurrently || null,
            preferredTimerType: preferredTimerType || null,
          },
        },
      },
      include: {
        baselineSurvey: true,
      },
    })

    // Sync email to recruitment database and send welcome email
    if (email) {
      try {
        // Validate environment variable
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        if (!appUrl) {
          console.error('CRITICAL: NEXT_PUBLIC_APP_URL environment variable is not set!')
          throw new Error('Server configuration error: NEXT_PUBLIC_APP_URL not configured')
        }

        console.log(`Syncing email to recruitment database for participant ${participant.id}`)

        // Sync email to recruitment database
        const syncResponse = await fetch(`${appUrl}/api/recruitment/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantId: participant.id,
            email,
            accessCode: participant.accessCode,
          }),
        })

        // Check if email sync failed due to duplicate
        if (syncResponse.status === 409) {
          const errorData = await syncResponse.json()
          // Delete the participant we just created since email is duplicate
          await prisma.participant.delete({
            where: { id: participant.id }
          })
          return NextResponse.json(
            {
              error: 'DUPLICATE_EMAIL',
              message: errorData.message || 'This email address has already been used for this study.'
            },
            { status: 409 }
          )
        }

        // Send welcome email with access code (non-blocking - don't fail if this errors)
        try {
          console.log(`Attempting to send welcome email to ${email} with access code ${participant.accessCode}`)

          const welcomeResponse = await fetch(`${appUrl}/api/recruitment/send-welcome`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              participantId: participant.id,
              email,
              accessCode: participant.accessCode,
            }),
          })

          if (!welcomeResponse.ok) {
            const errorData = await welcomeResponse.json()
            console.error('Warning: Welcome email endpoint returned error:', {
              status: welcomeResponse.status,
              error: errorData
            })
          } else {
            const successData = await welcomeResponse.json()
            console.log('Welcome email sent successfully:', successData)
          }
        } catch (emailError) {
          // Don't fail baseline if welcome email fails
          console.error('Warning: Failed to send welcome email (network/fetch error):', emailError)
        }
      } catch (syncError) {
        // Don't fail the baseline submission if sync has network errors
        console.error('Warning: Failed to sync email:', syncError)
        // Continue - participant can still complete study
      }
    }

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

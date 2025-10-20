import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check for admin password
    const password = request.nextUrl.searchParams.get('password')
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme'

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid password' },
        { status: 401 }
      )
    }

    const format = request.nextUrl.searchParams.get('format') || 'sessions'

    switch (format) {
      case 'sessions':
        return await exportSessions()
      case 'baseline':
        return await exportBaseline()
      case 'ratings':
        return await exportRatings()
      case 'post-treatment':
        return await exportPostTreatment()
      case 'all':
        return await exportAll()
      default:
        return NextResponse.json(
          { error: 'Invalid format. Use: sessions, baseline, ratings, post-treatment, or all' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

async function exportSessions() {
  const sessions = await prisma.session.findMany({
    include: {
      participant: {
        select: {
          id: true,
          conditionSequence: true,
          createdAt: true,
        },
      },
    },
    orderBy: [{ participantId: 'asc' }, { sessionNumber: 'asc' }],
  })

  const csv = convertToCSV(
    sessions.map((s) => ({
      session_id: s.id,
      participant_id: s.participantId,
      session_number: s.sessionNumber,
      condition: s.condition,
      target_duration_seconds: s.targetDuration,
      actual_duration_seconds: s.actualDuration,
      completed_full_session: s.completedFullSession,
      overrun_seconds: s.overrunAmount,
      start_time: s.startTime.toISOString(),
      end_time: s.endTime?.toISOString() || '',
      created_at: s.createdAt.toISOString(),
    }))
  )

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="sessions.csv"',
    },
  })
}

async function exportBaseline() {
  const surveys = await prisma.baselineSurvey.findMany({
    include: {
      participant: {
        select: {
          id: true,
          conditionSequence: true,
          createdAt: true,
        },
      },
    },
    orderBy: { completedAt: 'asc' },
  })

  const csv = convertToCSV(
    surveys.map((s) => ({
      participant_id: s.participantId,
      time_anxiety_score: s.timeAnxietyScore,
      typical_focus_duration_minutes: s.typicalFocusDuration,
      units_enrolled: s.unitsEnrolled,
      uses_timer_currently: s.usesTimerCurrently,
      preferred_timer_type: s.preferredTimerType,
      completed_at: s.completedAt.toISOString(),
    }))
  )

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="baseline_surveys.csv"',
    },
  })
}

async function exportRatings() {
  const ratings = await prisma.postSessionRating.findMany({
    include: {
      session: {
        select: {
          id: true,
          participantId: true,
          sessionNumber: true,
          condition: true,
        },
      },
    },
    orderBy: { completedAt: 'asc' },
  })

  const csv = convertToCSV(
    ratings.map((r) => ({
      rating_id: r.id,
      session_id: r.sessionId,
      participant_id: r.session.participantId,
      session_number: r.session.sessionNumber,
      condition: r.session.condition,
      perceived_stress: r.perceivedStress,
      ease_of_following: r.easeOfFollowing,
      subjective_focus_quality: r.subjectiveFocusQuality,
      comments: r.comments || '',
      completed_at: r.completedAt.toISOString(),
    }))
  )

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="post_session_ratings.csv"',
    },
  })
}

async function exportPostTreatment() {
  const surveys = await prisma.postTreatmentSurvey.findMany({
    include: {
      participant: {
        select: {
          id: true,
          conditionSequence: true,
        },
      },
    },
    orderBy: { completedAt: 'asc' },
  })

  const csv = convertToCSV(
    surveys.map((s) => ({
      participant_id: s.participantId,
      preferred_timer: s.preferredTimer,
      would_use_again: s.wouldUseAgain,
      recommend_to_others: s.recommendToOthers,
      qualitative_feedback: s.qualitativeFeedback,
      completed_at: s.completedAt.toISOString(),
    }))
  )

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="post_treatment_surveys.csv"',
    },
  })
}

async function exportAll() {
  const [sessions, baseline, ratings, postTreatment] = await Promise.all([
    prisma.session.findMany({ include: { participant: true } }),
    prisma.baselineSurvey.findMany({ include: { participant: true } }),
    prisma.postSessionRating.findMany({ include: { session: true } }),
    prisma.postTreatmentSurvey.findMany({ include: { participant: true } }),
  ])

  const data = {
    export_date: new Date().toISOString(),
    total_participants: await prisma.participant.count(),
    total_sessions: sessions.length,
    total_ratings: ratings.length,
    total_post_treatment_surveys: postTreatment.length,
    sessions,
    baseline,
    ratings,
    postTreatment,
  }

  return NextResponse.json(data, {
    headers: {
      'Content-Disposition': 'attachment; filename="all_data.json"',
    },
  })
}

// Helper function to convert array of objects to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers.map((header) => {
      const value = row[header]
      // Escape quotes and wrap in quotes if contains comma or newline
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
  )

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

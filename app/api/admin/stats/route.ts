import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRecruitmentStats } from '@/lib/supabase-recruitment'

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

    // Get all participants with their sessions
    const participants = await prisma.participant.findMany({
      include: {
        sessions: {
          orderBy: { startTime: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate participation rate buckets
    const participationBuckets = {
      '0': 0,
      '1': 0,
      '2': 0,
    }

    // Build participant list with session pacing warnings
    const participantList = participants.map((p) => {
      const sessionCount = p.sessions.length
      const lastSession = p.sessions[0] // Most recent (ordered desc)
      const daysSinceRegistration = Math.floor(
        (Date.now() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Update participation buckets
      if (sessionCount === 0) participationBuckets['0']++
      else if (sessionCount === 1) participationBuckets['1']++
      else participationBuckets['2']++

      // Check for session pacing warning (>2 sessions in last 24 hours)
      const last24Hours = Date.now() - 24 * 60 * 60 * 1000
      const recentSessions = p.sessions.filter(
        (s) => s.startTime.getTime() > last24Hours
      )
      const hasPacingWarning = recentSessions.length > 2

      return {
        accessCodeLast4: p.accessCode.slice(-4), // Only last 4 chars for privacy
        sessionsCompleted: sessionCount,
        totalSessions: 2,
        lastActiveAt: lastSession?.startTime.toISOString() || null,
        daysSinceRegistration,
        hasPacingWarning,
        createdAt: p.createdAt.toISOString(),
      }
    })

    // Calculate overall stats
    const totalParticipants = participants.length
    const totalSessions = await prisma.session.count()
    const completedSessions = await prisma.session.count({
      where: { completedFullSession: true },
    })
    const averageSessionsPerParticipant =
      totalParticipants > 0 ? totalSessions / totalParticipants : 0

    // Calculate average session duration by condition
    const countdownSessions = await prisma.session.findMany({
      where: {
        condition: 'COUNTDOWN',
        actualDuration: { not: null }
      },
      select: { actualDuration: true },
    })
    const hourglassSessions = await prisma.session.findMany({
      where: {
        condition: 'HOURGLASS',
        actualDuration: { not: null }
      },
      select: { actualDuration: true },
    })

    const avgCountdownDuration = countdownSessions.length > 0
      ? countdownSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0) / countdownSessions.length
      : 0

    const avgHourglassDuration = hourglassSessions.length > 0
      ? hourglassSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0) / hourglassSessions.length
      : 0

    // Get recruitment database statistics (non-blocking)
    let recruitmentStats = null
    try {
      recruitmentStats = await getRecruitmentStats()
    } catch (error) {
      console.error('Warning: Failed to fetch recruitment stats:', error)
      // Continue without recruitment stats if database is not configured
    }

    return NextResponse.json({
      overview: {
        totalParticipants,
        totalSessions,
        completedSessions,
        averageSessionsPerParticipant: parseFloat(averageSessionsPerParticipant.toFixed(2)),
        avgCountdownDuration: Math.round(avgCountdownDuration),
        avgHourglassDuration: Math.round(avgHourglassDuration),
      },
      participationRate: participationBuckets,
      participants: participantList,
      recruitment: recruitmentStats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

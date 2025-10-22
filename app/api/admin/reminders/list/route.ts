import { NextRequest, NextResponse } from 'next/server'
import { getReminderEligibility } from '@/lib/supabase-recruitment'

/**
 * Get list of participants for reminder management
 * Admin-only endpoint (password protected)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin password
    const password = request.nextUrl.searchParams.get('password')
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme'

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid password' },
        { status: 401 }
      )
    }

    // Get reminder eligibility for all participants
    const participants = await getReminderEligibility({
      excludeWithdrawn: true, // Don't show withdrawn participants
    })

    return NextResponse.json({
      participants,
      total: participants.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching reminder list:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch reminder list',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

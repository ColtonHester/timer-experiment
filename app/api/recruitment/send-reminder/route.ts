import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getRecruitmentRecord, markReminderSent } from '@/lib/supabase-recruitment'
import { getEmailTemplate, ReminderType } from '@/lib/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send reminder email to participant
 * Admin-only endpoint (password protected)
 *
 * Sends personalized reminder emails based on participant progress
 * and updates reminder tracking in recruitment database
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin password
    const authHeader = request.headers.get('authorization')
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme'

    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin password' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { participantId, reminderType } = body

    // Validate inputs
    if (!participantId || !reminderType) {
      return NextResponse.json(
        { error: 'Missing required fields: participantId, reminderType' },
        { status: 400 }
      )
    }

    if (!['day3', 'day7', 'day14'].includes(reminderType)) {
      return NextResponse.json(
        { error: 'Invalid reminderType. Must be: day3, day7, or day14' },
        { status: 400 }
      )
    }

    // Get recruitment record
    const record = await getRecruitmentRecord(participantId)

    if (!record) {
      return NextResponse.json(
        { error: 'Participant not found in recruitment database' },
        { status: 404 }
      )
    }

    // Check if participant has withdrawn or unsubscribed
    if (record.withdrawnAt) {
      return NextResponse.json(
        { error: 'Participant has withdrawn from study' },
        { status: 400 }
      )
    }

    if (record.unsubscribedFromReminders) {
      return NextResponse.json(
        { error: 'Participant has unsubscribed from reminders' },
        { status: 400 }
      )
    }

    // Calculate days since registration
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(record.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Get email template
    const emailData = {
      email: record.email,
      accessCode: record.accessCode,
      sessionsCompleted: record.sessionsCompleted,
      daysSinceRegistration,
      participantId: record.participantId,
    }

    const { html, text, subject } = getEmailTemplate(reminderType as ReminderType, emailData)

    // Send email via Resend
    const fromEmail = process.env.RECRUITMENT_FROM_EMAIL || 'noreply@resend.dev'
    const fromName = process.env.RECRUITMENT_FROM_NAME || 'DATASCI 241 Research Team'

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [record.email],
      subject,
      html,
      text,
      tags: [
        { name: 'study', value: 'focus-timer' },
        { name: 'reminder_type', value: reminderType },
        { name: 'participant_id', value: participantId },
      ],
    })

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }

    // Update reminder tracking in database
    await markReminderSent(participantId)

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      message: `${reminderType} reminder sent to ${record.email}`,
      reminderType,
      recipientEmail: record.email,
    })
  } catch (error) {
    console.error('Error sending reminder:', error)
    return NextResponse.json(
      {
        error: 'Failed to send reminder',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Send bulk reminders to multiple participants
 * Used by admin reminder management page for batch sending
 */
export async function PUT(request: NextRequest) {
  try {
    // Check admin password
    const authHeader = request.headers.get('authorization')
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme'

    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin password' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { participantIds, reminderType } = body

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid participantIds array' },
        { status: 400 }
      )
    }

    if (!['day3', 'day7', 'day14'].includes(reminderType)) {
      return NextResponse.json(
        { error: 'Invalid reminderType. Must be: day3, day7, or day14' },
        { status: 400 }
      )
    }

    const results = {
      total: participantIds.length,
      sent: 0,
      failed: 0,
      errors: [] as { participantId: string; error: string }[],
    }

    // Send emails sequentially to avoid rate limiting
    for (const participantId of participantIds) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/recruitment/send-reminder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({ participantId, reminderType }),
        })

        if (response.ok) {
          results.sent++
        } else {
          const error = await response.json()
          results.failed++
          results.errors.push({
            participantId,
            error: error.error || 'Unknown error',
          })
        }

        // Rate limiting: wait 100ms between sends
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        results.failed++
        results.errors.push({
          participantId,
          error: error instanceof Error ? error.message : 'Network error',
        })
      }
    }

    return NextResponse.json({
      success: results.sent > 0,
      results,
      message: `Sent ${results.sent} of ${results.total} reminders`,
    })
  } catch (error) {
    console.error('Error sending bulk reminders:', error)
    return NextResponse.json(
      {
        error: 'Failed to send bulk reminders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

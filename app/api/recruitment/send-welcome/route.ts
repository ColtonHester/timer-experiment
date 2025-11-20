import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getWelcomeEmail } from '@/lib/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send welcome email to new participant
 * Called automatically after baseline survey completion
 *
 * This endpoint sends a welcome email with:
 * - Access code for resuming sessions
 * - Study overview (2 sessions, 25 minutes each)
 * - Link to start first session
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('CRITICAL: RESEND_API_KEY environment variable is not set!')
      return NextResponse.json(
        { error: 'Server configuration error: Email service not configured' },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('CRITICAL: NEXT_PUBLIC_APP_URL environment variable is not set!')
      return NextResponse.json(
        { error: 'Server configuration error: Application URL not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, accessCode, participantId } = body

    console.log(`[send-welcome] Received request for ${email}, access code: ${accessCode}`)

    // Validate required fields
    if (!email || !accessCode || !participantId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, accessCode, participantId' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get welcome email template
    const emailData = {
      email,
      accessCode,
      sessionsCompleted: 0, // New participant, no sessions yet
      daysSinceRegistration: 0, // Just registered
      participantId,
    }

    const { html, text, subject } = getWelcomeEmail(emailData)

    // Send email via Resend
    const fromEmail = process.env.RECRUITMENT_FROM_EMAIL || 'noreply@resend.dev'
    const fromName = process.env.RECRUITMENT_FROM_NAME || 'DATASCI 241 Research Team'
    const replyToEmail = process.env.RECRUITMENT_REPLY_TO_EMAIL || fromEmail

    console.log(`[send-welcome] Sending email to ${email} from ${fromName} <${fromEmail}>`)
    console.log(`[send-welcome] Subject: ${subject}`)

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      replyTo: replyToEmail,
      subject,
      html,
      text,
      tags: [
        { name: 'study', value: 'focus-timer' },
        { name: 'email_type', value: 'welcome' },
        { name: 'participant_id', value: participantId },
      ],
    })

    if (error) {
      console.error('[send-welcome] Error from Resend API:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to send welcome email', details: error },
        { status: 500 }
      )
    }

    console.log(`[send-welcome] ✅ Email sent successfully! Email ID: ${data?.id}`)

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      message: `Welcome email sent to ${email}`,
      recipientEmail: email,
    })
  } catch (error) {
    console.error('Error in send-welcome endpoint:', error)
    return NextResponse.json(
      {
        error: 'Failed to send welcome email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

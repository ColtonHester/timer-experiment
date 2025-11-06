// Email Templates for Focus Timer Study
// UC Berkeley DATASCI 241 - Participant Reminder Emails

export type ReminderType = 'welcome' | 'day2' | 'day5'

interface EmailData {
  email: string
  accessCode: string
  sessionsCompleted: number
  daysSinceRegistration: number
  participantId: string
}

// UC Berkeley Brand Colors
const COLORS = {
  berkeleyBlue: '#003262',
  californiaGold: '#FDB515',
  foundersRock: '#3B7EA1',
  medalist: '#C4820E',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  darkGray: '#333333',
}

/**
 * Base HTML template with responsive design and UC Berkeley branding
 */
function getBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Focus Timer Study Reminder</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: ${COLORS.darkGray};
      background-color: ${COLORS.lightGray};
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${COLORS.white};
    }
    .header {
      background: linear-gradient(135deg, ${COLORS.berkeleyBlue} 0%, ${COLORS.foundersRock} 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header-title {
      color: ${COLORS.white};
      font-size: 28px;
      font-weight: bold;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .header-subtitle {
      color: ${COLORS.californiaGold};
      font-size: 14px;
      margin: 10px 0 0 0;
      font-weight: 600;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      font-size: 16px;
      margin: 0 0 16px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 16px 32px;
      background-color: ${COLORS.californiaGold};
      color: ${COLORS.berkeleyBlue};
      text-decoration: none;
      font-weight: bold;
      font-size: 18px;
      border-radius: 8px;
      margin: 24px 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: background-color 0.3s ease;
    }
    .cta-button:hover {
      background-color: ${COLORS.medalist};
    }
    .access-code-box {
      background-color: ${COLORS.lightGray};
      border-left: 4px solid ${COLORS.berkeleyBlue};
      padding: 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .access-code {
      font-family: 'Courier New', monospace;
      font-size: 24px;
      font-weight: bold;
      color: ${COLORS.berkeleyBlue};
      letter-spacing: 2px;
    }
    .progress-bar {
      background-color: ${COLORS.lightGray};
      height: 24px;
      border-radius: 12px;
      overflow: hidden;
      margin: 16px 0;
    }
    .progress-fill {
      background: linear-gradient(90deg, ${COLORS.californiaGold} 0%, ${COLORS.medalist} 100%);
      height: 100%;
      border-radius: 12px;
      transition: width 0.3s ease;
    }
    .footer {
      background-color: ${COLORS.berkeleyBlue};
      color: ${COLORS.white};
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer a {
      color: ${COLORS.californiaGold};
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .unsubscribe-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.2);
      font-size: 12px;
      color: rgba(255,255,255,0.8);
    }
    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .header-title {
        font-size: 24px;
      }
      .content {
        padding: 30px 20px;
      }
      .cta-button {
        display: block;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    ${content}
  </div>
</body>
</html>
  `.trim()
}

/**
 * Welcome Email - Sent immediately after baseline survey
 * Confirms registration and provides access code
 */
export function getWelcomeEmail(data: EmailData): { html: string; text: string; subject: string } {
  const resumeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/resume?code=${data.accessCode}`
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?participantId=${data.participantId}`

  const html = getBaseTemplate(`
    <div class="header">
      <h1 class="header-title">Welcome to the Study! 🎓</h1>
      <p class="header-subtitle">UC BERKELEY · DATASCI 241 · FOCUS TIMER STUDY</p>
    </div>

    <div class="content">
      <p>Hi there,</p>

      <p style="font-size: 18px; color: ${COLORS.berkeleyBlue}; font-weight: 600;">
        Thank you for joining our focus timer visualization study! 🎉
      </p>

      <p>Your registration is complete. You're all set to begin your 2 focus sessions. Each session is a 25-minute focused work period using one of two different timer visualizations.</p>

      <div style="background-color: #E6F7FF; border-left: 4px solid ${COLORS.foundersRock}; padding: 20px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: ${COLORS.berkeleyBlue}; font-weight: 600;">
          📋 What to Expect
        </p>
        <p style="margin: 12px 0 0 0; font-size: 14px;">
          • <strong>2 sessions total</strong> - Each 25 minutes long<br>
          • <strong>Different timer visualizations</strong> - You'll experience both styles<br>
          • <strong>Brief surveys</strong> - Quick feedback after each session<br>
          • <strong>Flexible timing</strong> - Complete sessions when it works for you
        </p>
      </div>

      <div class="access-code-box">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.darkGray};">
          <strong>🔑 Your Access Code (Save This!):</strong>
        </p>
        <div class="access-code">${data.accessCode}</div>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #666;">
          Use this code to resume your sessions on any device. We recommend bookmarking the link below!
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resumeUrl}" class="cta-button">Start My First Session →</a>
      </div>

      <div style="background-color: ${COLORS.lightGray}; padding: 20px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0 0 12px 0; font-size: 14px; color: ${COLORS.berkeleyBlue}; font-weight: 600;">
          💡 Quick Tips
        </p>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #666;">
          <li>Find a quiet space for your focus sessions</li>
          <li>Have a task ready to work on (studying, coding, writing, etc.)</li>
          <li>Complete both sessions when you have time</li>
          <li>Your access code works on any device - mobile or desktop</li>
        </ul>
      </div>

      <p style="margin-top: 32px;">Your participation helps us understand how timer design affects focus and productivity. Thank you for contributing to this research! 🙏</p>

      <p style="margin-top: 24px; font-size: 14px; color: #666;">
        Questions? Feel free to reach out.<br><br>
        Best regards,<br>
        <strong>DATASCI 241 Research Team</strong><br>
        UC Berkeley School of Information
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>UC Berkeley MIDS · DATASCI 241</strong><br>
        Focus Timer Visualization Study
      </p>

      <div class="unsubscribe-section">
        <p style="margin: 0 0 10px 0;">
          <a href="${unsubscribeUrl}">Manage email preferences</a>
        </p>
        <p style="margin: 0; font-size: 11px;">
          This email was sent to ${data.email} as part of your participation in the focus timer study.
        </p>
      </div>
    </div>
  `)

  const text = `
UC Berkeley DATASCI 241 - Focus Timer Study

Welcome to the Study!

Hi there,

Thank you for joining our focus timer visualization study!

Your registration is complete. You're all set to begin your 2 focus sessions. Each session is a 25-minute focused work period using one of two different timer visualizations.

WHAT TO EXPECT:
• 2 sessions total - Each 25 minutes long
• Different timer visualizations - You'll experience both styles
• Brief surveys - Quick feedback after each session
• Flexible timing - Complete sessions when it works for you

YOUR ACCESS CODE (Save This!):
${data.accessCode}

Use this code to resume your sessions on any device.

Start your first session: ${resumeUrl}

QUICK TIPS:
• Find a quiet space for your focus sessions
• Have a task ready to work on (studying, coding, writing, etc.)
• Complete both sessions when you have time
• Your access code works on any device - mobile or desktop

Your participation helps us understand how timer design affects focus and productivity. Thank you for contributing to this research!

Questions? Feel free to reach out.

Best regards,
DATASCI 241 Research Team
UC Berkeley School of Information

---
Manage email preferences: ${unsubscribeUrl}
  `.trim()

  return {
    html,
    text,
    subject: 'Welcome to the Focus Timer Study - Your Access Code Inside! 🎓',
  }
}

/**
 * Day 3 Reminder - Getting Started
 * For participants with <2 sessions completed, 3+ days enrolled
 */
export function getDay3Email(data: EmailData): { html: string; text: string; subject: string } {
  const progressPercent = (data.sessionsCompleted / 2) * 100
  const resumeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/resume?code=${data.accessCode}`
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?participantId=${data.participantId}`

  const html = getBaseTemplate(`
    <div class="header">
      <h1 class="header-title">Ready to Continue?</h1>
      <p class="header-subtitle">UC BERKELEY · DATASCI 241 · FOCUS TIMER STUDY</p>
    </div>

    <div class="content">
      <p>Hi there,</p>

      <p>Thank you for joining our focus timer study! We noticed you signed up ${data.daysSinceRegistration} ${data.daysSinceRegistration === 1 ? 'day' : 'days'} ago and wanted to check in.</p>

      <p>You're off to a great start with <strong>${data.sessionsCompleted} of 2 sessions</strong> completed! We'd love to see you continue your participation when you have time.</p>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%;"></div>
      </div>

      <p style="font-size: 18px; color: ${COLORS.berkeleyBlue}; font-weight: 600; margin-top: 32px;">
        ⏱️ Each session takes just 25 minutes
      </p>

      <p>Your contribution helps us understand how different timer visualizations affect focus and productivity. Every session brings valuable data to our research!</p>

      <div style="text-align: center;">
        <a href="${resumeUrl}" class="cta-button">Resume My Sessions →</a>
      </div>

      <div class="access-code-box">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.darkGray};">
          <strong>Your Access Code:</strong>
        </p>
        <div class="access-code">${data.accessCode}</div>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #666;">
          Use this code to resume your sessions on any device
        </p>
      </div>

      <p style="margin-top: 32px;">Thank you for being part of this research! 🙏</p>

      <p style="margin-top: 24px; font-size: 14px; color: #666;">
        Best regards,<br>
        <strong>DATASCI 241 Research Team</strong><br>
        UC Berkeley School of Information
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>UC Berkeley MIDS · DATASCI 241</strong><br>
        Focus Timer Visualization Study
      </p>

      <div class="unsubscribe-section">
        <p style="margin: 0 0 10px 0;">
          <a href="${unsubscribeUrl}">Manage email preferences</a>
        </p>
        <p style="margin: 0; font-size: 11px;">
          This email was sent to ${data.email} as part of your participation in the focus timer study.
        </p>
      </div>
    </div>
  `)

  const text = `
UC Berkeley DATASCI 241 - Focus Timer Study

Ready to Continue?

Hi there,

Thank you for joining our focus timer study! We noticed you signed up ${data.daysSinceRegistration} ${data.daysSinceRegistration === 1 ? 'day' : 'days'} ago and wanted to check in.

You're off to a great start with ${data.sessionsCompleted} of 2 sessions completed! We'd love to see you continue your participation when you have time.

Each session takes just 25 minutes. Your contribution helps us understand how different timer visualizations affect focus and productivity.

Resume your sessions: ${resumeUrl}

Your Access Code: ${data.accessCode}

Thank you for being part of this research!

Best regards,
DATASCI 241 Research Team
UC Berkeley School of Information

---
Manage email preferences: ${unsubscribeUrl}
  `.trim()

  return {
    html,
    text,
    subject: 'Ready to continue your focus timer sessions?',
  }
}

/**
 * Day 7 Reminder - Midpoint Check-in
 * For participants with <4 sessions completed, 7+ days enrolled
 */
export function getDay7Email(data: EmailData): { html: string; text: string; subject: string } {
  const progressPercent = (data.sessionsCompleted / 2) * 100
  const remainingSessions = 2 - data.sessionsCompleted
  const resumeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/resume?code=${data.accessCode}`
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?participantId=${data.participantId}`

  const html = getBaseTemplate(`
    <div class="header">
      <h1 class="header-title">You're Halfway There! 🎯</h1>
      <p class="header-subtitle">UC BERKELEY · DATASCI 241 · FOCUS TIMER STUDY</p>
    </div>

    <div class="content">
      <p>Hi there,</p>

      <p style="font-size: 18px; color: ${COLORS.berkeleyBlue}; font-weight: 600;">
        Great progress! You've completed ${data.sessionsCompleted} of 2 sessions! 🎉
      </p>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%;"></div>
      </div>

      <p>You're ${progressPercent.toFixed(0)}% of the way through the study. Just ${remainingSessions} more ${remainingSessions === 1 ? 'session' : 'sessions'} to go!</p>

      <p>Your data is providing valuable insights into how timer visualizations impact focus. Every additional session you complete strengthens our research findings.</p>

      <div style="background-color: #FFF9E6; border-left: 4px solid ${COLORS.californiaGold}; padding: 20px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: ${COLORS.berkeleyBlue}; font-weight: 600;">
          ⚡ Quick Reminder
        </p>
        <p style="margin: 12px 0 0 0; font-size: 14px;">
          We recommend completing 2 sessions per week to maintain momentum. Each session is only 25 minutes!
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${resumeUrl}" class="cta-button">Continue to Next Session →</a>
      </div>

      <div class="access-code-box">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.darkGray};">
          <strong>Your Access Code:</strong>
        </p>
        <div class="access-code">${data.accessCode}</div>
      </div>

      <p style="margin-top: 32px;">Thank you for your continued participation! Your contribution to this research is invaluable. 🙏</p>

      <p style="margin-top: 24px; font-size: 14px; color: #666;">
        Best regards,<br>
        <strong>DATASCI 241 Research Team</strong><br>
        UC Berkeley School of Information
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>UC Berkeley MIDS · DATASCI 241</strong><br>
        Focus Timer Visualization Study
      </p>

      <div class="unsubscribe-section">
        <p style="margin: 0 0 10px 0;">
          <a href="${unsubscribeUrl}">Manage email preferences</a>
        </p>
        <p style="margin: 0; font-size: 11px;">
          This email was sent to ${data.email} as part of your participation in the focus timer study.
        </p>
      </div>
    </div>
  `)

  const text = `
UC Berkeley DATASCI 241 - Focus Timer Study

You're Halfway There!

Hi there,

Great progress! You've completed ${data.sessionsCompleted} of 2 sessions!

You're ${progressPercent.toFixed(0)}% of the way through the study. Just ${remainingSessions} more ${remainingSessions === 1 ? 'session' : 'sessions'} to go!

Your data is providing valuable insights into how timer visualizations impact focus. Every additional session you complete strengthens our research findings.

Quick Reminder: We recommend completing 2 sessions per week to maintain momentum. Each session is only 25 minutes!

Continue your sessions: ${resumeUrl}

Your Access Code: ${data.accessCode}

Thank you for your continued participation!

Best regards,
DATASCI 241 Research Team
UC Berkeley School of Information

---
Manage email preferences: ${unsubscribeUrl}
  `.trim()

  return {
    html,
    text,
    subject: "You're halfway there - keep up the great work!",
  }
}

/**
 * Day 14 Reminder - Final Push
 * For participants with <6 sessions completed, 14+ days enrolled
 */
export function getDay14Email(data: EmailData): { html: string; text: string; subject: string } {
  const progressPercent = (data.sessionsCompleted / 2) * 100
  const remainingSessions = 2 - data.sessionsCompleted
  const resumeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/resume?code=${data.accessCode}`
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?participantId=${data.participantId}`

  const html = getBaseTemplate(`
    <div class="header">
      <h1 class="header-title">Almost There! 🏁</h1>
      <p class="header-subtitle">UC BERKELEY · DATASCI 241 · FOCUS TIMER STUDY</p>
    </div>

    <div class="content">
      <p>Hi there,</p>

      <p style="font-size: 18px; color: ${COLORS.berkeleyBlue}; font-weight: 600;">
        You're in the home stretch! Just ${remainingSessions} more ${remainingSessions === 1 ? 'session' : 'sessions'} to complete the study! 🎯
      </p>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%;"></div>
      </div>

      <p>You've already completed <strong>${data.sessionsCompleted} of 2 sessions</strong> - that's ${progressPercent.toFixed(0)}% complete! Your participation has been incredibly valuable to our research.</p>

      <div style="background-color: #E6F7FF; border-left: 4px solid ${COLORS.foundersRock}; padding: 20px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: ${COLORS.berkeleyBlue}; font-weight: 600;">
          🎓 Your Impact
        </p>
        <p style="margin: 12px 0 0 0; font-size: 14px;">
          Completing all 2 sessions ensures we have complete data for statistical analysis. Your full participation directly contributes to understanding how interface design affects human focus and productivity.
        </p>
      </div>

      <p style="font-size: 16px; color: ${COLORS.berkeleyBlue}; font-weight: 600; margin-top: 24px;">
        ⏰ Finish strong - it only takes ${remainingSessions * 25} more minutes total!
      </p>

      <div style="text-align: center;">
        <a href="${resumeUrl}" class="cta-button">Complete My Final Sessions →</a>
      </div>

      <div class="access-code-box">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.darkGray};">
          <strong>Your Access Code:</strong>
        </p>
        <div class="access-code">${data.accessCode}</div>
      </div>

      <p style="margin-top: 32px;">Thank you so much for your dedication to this research. We truly appreciate your time and effort! 🙏</p>

      <p style="margin-top: 24px; font-size: 14px; color: #666;">
        Best regards,<br>
        <strong>DATASCI 241 Research Team</strong><br>
        UC Berkeley School of Information
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>UC Berkeley MIDS · DATASCI 241</strong><br>
        Focus Timer Visualization Study
      </p>

      <div class="unsubscribe-section">
        <p style="margin: 0 0 10px 0;">
          <a href="${unsubscribeUrl}">Manage email preferences</a>
        </p>
        <p style="margin: 0; font-size: 11px;">
          This email was sent to ${data.email} as part of your participation in the focus timer study.
        </p>
      </div>
    </div>
  `)

  const text = `
UC Berkeley DATASCI 241 - Focus Timer Study

Almost There!

Hi there,

You're in the home stretch! Just ${remainingSessions} more ${remainingSessions === 1 ? 'session' : 'sessions'} to complete the study!

You've already completed ${data.sessionsCompleted} of 2 sessions - that's ${progressPercent.toFixed(0)}% complete! Your participation has been incredibly valuable to our research.

Your Impact:
Completing all 2 sessions ensures we have complete data for statistical analysis. Your full participation directly contributes to understanding how interface design affects human focus and productivity.

Finish strong - it only takes ${remainingSessions * 25} more minutes total!

Complete your sessions: ${resumeUrl}

Your Access Code: ${data.accessCode}

Thank you so much for your dedication to this research!

Best regards,
DATASCI 241 Research Team
UC Berkeley School of Information

---
Manage email preferences: ${unsubscribeUrl}
  `.trim()

  return {
    html,
    text,
    subject: 'Almost there - complete your focus timer study!',
  }
}

/**
 * Get email template based on reminder type
 */
export function getEmailTemplate(reminderType: ReminderType, data: EmailData) {
  switch (reminderType) {
    case 'welcome':
      return getWelcomeEmail(data)
    case 'day3':
      return getDay3Email(data)
    case 'day7':
      return getDay7Email(data)
    case 'day14':
      return getDay14Email(data)
    default:
      throw new Error(`Unknown reminder type: ${reminderType}`)
  }
}

# Recruitment & Reminder Management Guide

Complete workflow guide for managing participants and sending reminder emails.

## Overview

This guide covers the day-to-day operations of running the Focus Timer Study, including:
- Recruiting participants
- Monitoring progress
- Sending reminder emails
- Handling unsubscribes and withdrawals

---

## Recruitment Workflow

### Step 1: Invite Participants

**Target**: ~40 UC Berkeley MIDS students

**Recruitment Channels**:
1. **Slack**: Post in MIDS cohort channels
2. **Email**: Send to class mailing lists
3. **In-person**: Announce in DATASCI 241 class

**Sample Recruitment Message**:

```
📊 Research Participants Needed! 📊

UC Berkeley DATASCI 241 students: We're conducting a study on focus and time perception.

What you'll do:
• Complete 8 short focus sessions (25 min each)
• Use our web app to track your sessions
• Complete brief surveys about your experience

Time commitment: ~4 hours total over 2-4 weeks
Incentive: Entry into $50 Amazon gift card raffle

👉 Get started: https://your-app-url.com

Questions? Contact us at datasci241@berkeley.edu
```

### Step 2: Participant Onboarding

When participants visit your app:

1. **Landing Page** → Participant clicks "Begin Study"
2. **Consent Form** → Participant reviews and accepts IRB consent
3. **Baseline Survey** → Participant completes survey + provides email (optional)
4. **Access Code Displayed** → Participant sees `MIDS-XXXX-YYYY` code
5. **Email Confirmation** → Participant receives welcome email (optional feature)

### Step 3: Track Enrollment

Monitor enrollment via Admin Dashboard:

```
http://your-app-url.com/admin
```

**Key Metrics**:
- Total participants enrolled
- Completion rate (sessions completed / total sessions)
- Average sessions per participant
- Participants by completion bucket (0, 1-2, 3-4, 5-6, 7-8 sessions)

---

## Reminder Management Workflow

### When to Send Reminders

**Recommended Cadence**:

| Reminder Type | Criteria | Timing | Goal |
|---------------|----------|--------|------|
| **Day 3** | <2 sessions completed | 3+ days after registration | Get started |
| **Day 7** | <4 sessions completed | 7+ days after registration | Reach midpoint |
| **Day 14** | <6 sessions completed | 14+ days after registration | Final push |

**Spacing Rules** (built into the system):
- Won't send if last reminder was <48 hours ago
- Won't send to participants who unsubscribed
- Won't send to participants who withdrew

### How to Send Reminders

#### Option A: Manual Sending (Recommended)

1. **Access Reminder Dashboard**:
   ```
   http://your-app-url.com/admin/reminders
   ```

2. **Enter Admin Password** (from `.env` file)

3. **Filter Participants**:
   - Click **"Day 3 Reminder"** to see participants needing Day 3 reminder
   - Click **"Day 7 Reminder"** to see participants needing Day 7 reminder
   - Click **"Day 14 Reminder"** to see participants needing Day 14 reminder
   - Click **"All Active"** to see all active participants

4. **Send Reminders**:

   **Individual Send**:
   - Find participant in table
   - Click **"Send"** button next to their name
   - Confirm in popup
   - Check for success message

   **Bulk Send**:
   - Check boxes next to participants you want to send to
   - Click **"Send Bulk Reminders"** button at top
   - Confirm in popup (shows count)
   - Wait for success message

5. **Refresh** to see updated reminder counts

#### Option B: API-Based Sending (Advanced)

For automated scripts or integrations:

```bash
# Send individual reminder
curl -X POST https://your-app-url.com/api/recruitment/send-reminder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_PASSWORD" \
  -d '{
    "participantId": "PARTICIPANT_UUID",
    "reminderType": "day3"
  }'

# Send bulk reminders
curl -X PUT https://your-app-url.com/api/recruitment/send-reminder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_PASSWORD" \
  -d '{
    "participantIds": ["UUID1", "UUID2", "UUID3"],
    "reminderType": "day7"
  }'
```

### Reminder Schedule Example

**Week 1** (Days 1-7):
- Day 1: Participant enrolls
- Day 3: Send Day 3 reminder (if <2 sessions)
- Day 7: Send Day 7 reminder (if <4 sessions)

**Week 2** (Days 8-14):
- Day 14: Send Day 14 reminder (if <6 sessions)

**Week 3+**:
- Monitor completion
- Optional: Send custom follow-up for participants near completion

---

## Participant Table Guide

### Table Columns

| Column | Description |
|--------|-------------|
| **Checkbox** | Select for bulk actions |
| **Email** | Partially masked (e.g., `abc***@berkeley.edu`) |
| **Access Code** | Full access code for participant lookup |
| **Sessions** | Format: `X/8` (e.g., `3/8` = 3 of 8 complete) |
| **Days Enrolled** | Days since baseline survey completion |
| **Last Reminder** | Days since last reminder sent (or "Never") |
| **Recommended** | System-recommended reminder type |
| **Actions** | Send button (if reminder recommended) |

### Status Badges

**Recommended Reminder**:
- 🔴 **Day 3**: Red badge - urgent, participant hasn't started
- 🟠 **Day 7**: Orange badge - behind schedule
- 🟡 **Day 14**: Yellow badge - final push needed
- ⚪ **None**: Gray badge - on track or complete

### Email Masking

Emails are partially masked for privacy:
- Shows: First 3 characters + domain
- Example: `joh***@berkeley.edu`
- Full email only visible in Supabase recruitment database

---

## Handling Unsubscribes

### Unsubscribe Options

Participants can click "Unsubscribe" links in emails, which takes them to:
```
http://your-app-url.com/unsubscribe?participantId=UUID
```

**Two options provided**:

1. **Stop Reminder Emails Only** (recommended option)
   - Green card, emphasized as recommended
   - Stops emails but allows study continuation
   - Participant can still use access code
   - Database: Sets `unsubscribedFromReminders = true`

2. **Withdraw from Study** (destructive option)
   - Red card, shown as serious action
   - Stops emails AND prevents future sessions
   - Partial data retained for research
   - Database: Sets `withdrawnAt = NOW()`

### Viewing Unsubscribes

**Admin Dashboard**:
- Reminder dashboard filters out unsubscribed/withdrawn automatically
- Check Supabase recruitment database for full list:
  ```sql
  SELECT * FROM "RecruitmentRecord"
  WHERE "unsubscribedFromReminders" = TRUE
     OR "withdrawnAt" IS NOT NULL;
  ```

### Re-engaging Unsubscribers

**Unsubscribed from reminders**:
- ✅ Can manually reach out via email
- ✅ Can still complete sessions if they have access code
- ❌ Won't appear in reminder dashboard

**Withdrawn from study**:
- ❌ Should not contact unless they reach out
- ❌ Cannot complete more sessions (access code disabled)
- ✅ Data already collected is retained

---

## Data Privacy & IRB Compliance

### Dual-Database Architecture

```
┌─────────────────────────┐         ┌──────────────────────┐
│  Experiment Database    │         │ Recruitment Database │
│  (Anonymous)            │         │ (PII)                │
├─────────────────────────┤         ├──────────────────────┤
│ ✓ Participant UUID      │         │ ✓ Email addresses    │
│ ✓ Access codes          │         │ ✓ Reminder history   │
│ ✓ Session data          │         │ ✓ Unsubscribe status │
│ ✓ Survey responses      │         │ ✓ Withdrawal dates   │
│ ✗ NO EMAILS             │         │ ✗ NO SESSION DATA    │
└─────────────────────────┘         └──────────────────────┘
```

**Benefits**:
- Research data remains fully anonymous
- Email data can be deleted after study
- Clear IRB compliance story
- Easy data sharing (just export experiment DB)

### Viewing Participant Data

**Admin Dashboard** (`/admin`):
- Shows anonymous data only
- Access codes visible (not PII)
- No emails displayed
- Session counts, progress, timestamps

**Reminder Dashboard** (`/admin/reminders`):
- Shows masked emails (first 3 chars only)
- Full access codes for lookup
- Reminder history
- No session data

**Supabase Recruitment DB**:
- Full emails visible (use with caution!)
- Only access for sending reminders
- Should be deleted after study complete

**Exporting Data**:
```bash
# Export anonymous research data (safe to share)
http://your-app-url.com/api/admin/export?password=XXX&format=all

# Export with recruitment data (contains PII!)
# Not implemented - manual Supabase export if needed
```

---

## Common Scenarios

### Scenario 1: Participant Lost Access Code

**Problem**: Participant emails saying they lost their access code

**Solution**:
1. Go to `/admin/reminders`
2. Search for participant's email (masked)
3. Find their access code in the table
4. Reply to participant with their code

**Alternative**: Query Supabase recruitment database directly

### Scenario 2: Email Not Arriving

**Problem**: Participant says they didn't receive reminder

**Possible Causes**:
1. **Spam folder**: Ask participant to check spam/junk
2. **Wrong email**: Check Supabase recruitment DB for typos
3. **Unsubscribed**: Check if participant unsubscribed
4. **Email not collected**: Some early participants may not have provided email

**Solution**:
1. Check Resend dashboard for delivery status
2. Verify email address in recruitment DB
3. Resend manually if needed
4. Add sender to participant's contacts/safe senders

### Scenario 3: Participant Wants to Withdraw

**Problem**: Participant emails requesting withdrawal

**Solution**:
1. Send them unsubscribe link:
   ```
   http://your-app-url.com/unsubscribe?participantId=UUID
   ```
2. Or manually update Supabase:
   ```sql
   UPDATE "RecruitmentRecord"
   SET "withdrawnAt" = NOW()
   WHERE "participantId" = 'UUID';
   ```
3. Confirm withdrawal via email
4. Thank them for their participation

### Scenario 4: Bulk Reminder Send Fails Partway

**Problem**: Bulk send succeeds for 10/15 participants

**What Happens**:
- Successful sends are logged in database
- Failed sends return error details
- You'll see: "Sent 10 of 15 reminders"

**Solution**:
1. Check error message for reason (rate limit, invalid email, etc.)
2. Fix underlying issue
3. Select failed participants only
4. Resend to failed participants

### Scenario 5: Too Many Reminders Sent

**Problem**: Accidentally sent Day 7 reminder to everyone

**Impact**:
- `reminderCount` incremented for all recipients
- `lastReminderSent` updated to now
- System won't send duplicate for 48 hours minimum

**Solution**:
- No way to "unsend" emails
- Wait 48+ hours before sending correct reminder
- Or manually adjust `lastReminderSent` in Supabase to allow immediate resend

---

## Monitoring Progress

### Daily Checks (5 minutes)

1. **Check enrollment**: How many new participants today?
2. **Check completion**: Any participants finishing 8 sessions?
3. **Check reminder eligibility**: Who needs reminders today?

### Weekly Checks (15 minutes)

1. **Send reminders**: Batch send Day 3, 7, and 14 reminders
2. **Review bounce rates**: Check Resend dashboard for failed emails
3. **Update team**: Share progress with research team
4. **Check unsubscribes**: Monitor withdrawal rate

### Data Exports (End of Study)

1. **Export experiment data**:
   ```
   http://your-app-url.com/api/admin/export?password=XXX&format=all
   ```

2. **Export recruitment data** (if needed for IRB):
   - Go to Supabase recruitment project
   - Table Editor → RecruitmentRecord
   - Export as CSV

3. **Delete recruitment database** (after study complete):
   - IRB requirement: Delete PII after study
   - Keep experiment database indefinitely (anonymous)

---

## Tips for Successful Recruitment

### Maximize Enrollment

1. **Make it easy**: One-click start, no account creation
2. **Clear value prop**: Emphasize contribution to research + raffle
3. **Multiple touchpoints**: Post in Slack, email, announce in class
4. **Peer recruiting**: Ask enrolled participants to share with classmates

### Maximize Completion

1. **Early engagement**: Send Day 3 reminder promptly
2. **Positive framing**: "You're doing great!" not "You're behind"
3. **Show progress**: Emails include progress bars (built-in)
4. **Low friction**: One-click resume via bookmark URL
5. **Timely reminders**: Don't wait too long between reminders

### Minimize Attrition

1. **Set expectations**: Baseline survey explains 8 sessions, 2-4 weeks
2. **Flexible pacing**: Allow participants to complete at own pace
3. **Reminder spacing**: Don't spam (48 hour minimum between reminders)
4. **Easy unsubscribe**: Make it clear they can stop emails but continue study
5. **Support channel**: Provide email for questions/issues

---

## Reminder Email Content

### Day 3 Email

**Subject**: "Ready to continue your focus timer sessions?"

**Key Points**:
- Friendly, encouraging tone
- Reminds them of access code
- Shows progress (0-2 sessions complete)
- One-click resume button
- Emphasizes flexibility (complete at own pace)

### Day 7 Email

**Subject**: "You're halfway there! 🎯"

**Key Points**:
- Midpoint milestone framing
- Progress bar visualization
- Reminder of study goal (8 sessions)
- Access code prominently displayed
- Unsubscribe link at bottom

### Day 14 Email

**Subject**: "Final push: Complete your focus timer study! 🏁"

**Key Points**:
- Urgency (but not pressure)
- Appreciation for participation so far
- Raffle reminder (if applicable)
- Clear call-to-action
- Last chance framing

---

## Troubleshooting

### Reminder Dashboard Not Loading

**Check**:
1. Admin password correct?
2. Supabase recruitment database set up?
3. Environment variables in `.env`?
4. Dev server restarted after `.env` changes?

### Participants Not Showing Up

**Check**:
1. Did they provide email in baseline survey?
2. Email sync succeeded (check logs)?
3. Are they filtered out (withdrawn, unsubscribed)?
4. Check Supabase recruitment DB directly

### Emails Sending But Not Arriving

**Check**:
1. Resend dashboard shows "Delivered"?
2. Participant checking spam folder?
3. Email address correct (no typos)?
4. Domain reputation good (check Resend)?

### "Rate Limit Exceeded" Error

**Cause**: Exceeded Resend free tier (100/day, 3000/month)

**Solutions**:
1. Wait until tomorrow (daily limit reset)
2. Wait until next month (monthly limit reset)
3. Upgrade Resend to paid plan ($20/month)
4. Spread reminder sends across multiple days

---

## Best Practices

### DO:
- ✅ Send reminders consistently (same day each week)
- ✅ Monitor Resend dashboard for bounces/issues
- ✅ Check admin dashboard daily during active recruitment
- ✅ Thank participants for completing study
- ✅ Honor unsubscribe requests immediately
- ✅ Keep admin password secure
- ✅ Test email sending before big batches

### DON'T:
- ❌ Send more than 1 reminder per participant per week
- ❌ Email participants after they've unsubscribed
- ❌ Share participant emails outside research team
- ❌ Use recruitment data for non-study purposes
- ❌ Keep recruitment database after study complete
- ❌ Ignore bounce/spam reports
- ❌ Send reminders to completed participants

---

## Deployment Checklist

Before deploying to production:

- [ ] Supabase experiment database created & schema applied
- [ ] Supabase recruitment database created & schema applied
- [ ] Resend API key generated & tested
- [ ] Environment variables set in Vercel
- [ ] Admin password changed from default
- [ ] Test participant flow end-to-end
- [ ] Test reminder sending with your own email
- [ ] Test unsubscribe links work
- [ ] Verify data separation (experiment vs recruitment DBs)
- [ ] Share app URL with research team

---

## Support & Resources

**Documentation**:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database setup
- [RESEND_SETUP.md](./RESEND_SETUP.md) - Email service setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [CLAUDE.md](./CLAUDE.md) - Technical architecture reference

**External Resources**:
- Supabase: https://supabase.com/docs
- Resend: https://resend.com/docs
- UC Berkeley IRB: https://cphs.berkeley.edu/

**Team Contact**:
- Email: datasci241@berkeley.edu
- Slack: #datasci241-focus-study (or your team channel)

---

## Quick Reference Commands

```bash
# Start dev server
npm run dev

# Access admin dashboard
http://localhost:3000/admin

# Access reminder management
http://localhost:3000/admin/reminders

# Export data (CSV)
http://localhost:3000/api/admin/export?password=XXX&format=all

# View database (experiment)
npm run db:studio

# View database (recruitment)
# → Go to Supabase dashboard → Table Editor
```

---

**Remember**: This is a research study. Data quality and participant experience are paramount. Be responsive, professional, and ethical in all participant interactions. Good luck with your study! 🎯

# Testing Checklist

Use this checklist to verify everything works before deploying to production.

## 🔧 Setup (One-Time)

- [ ] Database created (Supabase, local PostgreSQL, or RDS)
- [ ] `.env` file created with `DATABASE_URL` and `ADMIN_PASSWORD`
- [ ] Dependencies installed: `npm install`
- [ ] Database schema pushed: `npm run db:push`
- [ ] Dev server starts: `npm run dev`

## 🧪 Core User Flow

### Landing & Consent
- [ ] Landing page loads at http://localhost:3000
- [ ] "Get Started" button works
- [ ] Consent form displays all sections
- [ ] Cannot proceed without checking consent checkbox
- [ ] "Continue to Survey" button works

### Baseline Survey
- [ ] All Likert scale questions render
- [ ] Cannot submit without required fields (time anxiety, focus duration)
- [ ] Form validation works (numbers only for duration)
- [ ] Optional fields work (units enrolled, timer usage)
- [ ] Submit button shows loading state
- [ ] Redirects to dashboard on success
- [ ] Data appears in database (check Prisma Studio: `npm run db:studio`)

### Dashboard
- [ ] Progress bar shows 0/8 sessions
- [ ] "Next Session" card displays correct session number (#1)
- [ ] Timer type is shown (Countdown or Hourglass)
- [ ] "Start Session" button works
- [ ] Session history shows all 8 sessions (grayed out for future)
- [ ] Tips card displays

### Countdown Timer Session
- [ ] Timer starts at 25:00 (or 24:59)
- [ ] Countdown decreases every second
- [ ] Circular progress ring animates correctly
- [ ] Time display is large and readable
- [ ] "Almost there!" message appears at 1 minute
- [ ] Timer reaches 00:00
- [ ] Auto-redirects to rating page
- [ ] "Stop Early" button works (with confirmation)

### Hourglass Timer Session
- [ ] Hourglass SVG renders correctly
- [ ] Sand animation starts immediately
- [ ] Sand particles fall through neck
- [ ] Top bulb empties, bottom bulb fills
- [ ] **NO NUMBERS** displayed anywhere
- [ ] Motivational text shows
- [ ] "Nearly complete" message at ~75% progress
- [ ] Timer completes and redirects to rating
- [ ] "Stop Early" button works

### Post-Session Rating
- [ ] Session ID in URL parameter
- [ ] All three Likert scales render
- [ ] Radio buttons work (1-5 for each question)
- [ ] Visual feedback on selection (button highlights)
- [ ] Optional comments field works
- [ ] Cannot submit until all required fields filled
- [ ] Submit shows loading state
- [ ] Redirects to dashboard on success
- [ ] Data saved in database

### Dashboard (After Session)
- [ ] Progress bar updates (1/8 sessions)
- [ ] Completed session shows green checkmark
- [ ] Next session (#2) is highlighted
- [ ] Correct timer type shown for session #2
- [ ] Session history shows duration for completed session

### Repeat Sessions
- [ ] Complete sessions 2-7, alternating between timer types
- [ ] Each session saves correctly
- [ ] Progress bar updates after each
- [ ] Session numbers increment correctly
- [ ] Conditions match expected randomization sequence

### Post-Treatment Survey (After Session 8)
- [ ] Dashboard shows "All Sessions Complete!" message
- [ ] "Final Survey" button appears
- [ ] Post-survey page loads
- [ ] Timer preference question (3 options) works
- [ ] Qualitative feedback textarea works (required)
- [ ] Optional yes/no questions work
- [ ] Cannot submit without required fields
- [ ] Submit shows loading state
- [ ] Redirects to thank you page
- [ ] Data saved in database

### Thank You Page
- [ ] Completion checkmark animation plays
- [ ] All sections display correctly
- [ ] Email link works (opens mail client)
- [ ] Team member names displayed

## 🔐 Admin Panel

- [ ] Admin page loads at http://localhost:3000/admin
- [ ] Password prompt displays
- [ ] Wrong password shows error
- [ ] Correct password grants access
- [ ] Statistics cards display correct counts:
  - [ ] Total Participants
  - [ ] Total Sessions
  - [ ] Session Ratings
  - [ ] Study Completions
- [ ] "Download Sessions Data" button works (CSV downloads)
- [ ] "Download Baseline Surveys" button works
- [ ] "Download Post-Session Ratings" button works
- [ ] "Download Post-Treatment Surveys" button works
- [ ] "Download All Data (JSON)" button works
- [ ] CSV files open correctly in Excel/Google Sheets
- [ ] Data is properly formatted (no encoding issues)

## 📊 Data Integrity

Open Prisma Studio: `npm run db:studio`

- [ ] Participant table has 1 row
- [ ] `conditionSequence` is a JSON array of 8 items
- [ ] BaselineSurvey table has matching participant ID
- [ ] Session table has 8 rows for this participant
- [ ] Session conditions match `conditionSequence`
- [ ] Session durations are calculated correctly
- [ ] `completedFullSession` is true if duration >= 1500 seconds
- [ ] `overrunAmount` is null if stopped early, positive if overran
- [ ] PostSessionRating table has 8 rows
- [ ] All ratings are 1-5 (Likert scale)
- [ ] PostTreatmentSurvey table has 1 row
- [ ] `preferredTimer` is one of: COUNTDOWN, HOURGLASS, NO_PREFERENCE

## 📱 Responsive Design

- [ ] Mobile (375px width): All pages render correctly
- [ ] Tablet (768px width): Layout adjusts properly
- [ ] Desktop (1440px width): Content centered, not too wide
- [ ] Touch targets are large enough on mobile (44x44px minimum)
- [ ] Text is readable at all sizes (minimum 14px)

## ♿ Accessibility

- [ ] All buttons have descriptive text
- [ ] Form inputs have labels
- [ ] Focus indicators visible (keyboard navigation)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Images have alt text (if any added)
- [ ] Page titles are descriptive

## 🐛 Edge Cases

- [ ] Refresh during timer session (should continue or allow restart)
- [ ] Browser back button doesn't break flow
- [ ] Multiple tabs open (localStorage syncs)
- [ ] Very long text in comments field (doesn't break layout)
- [ ] Participant tries to access admin without password (blocked)
- [ ] Participant tries to start session 9 (blocked or handled gracefully)
- [ ] Database connection fails (user-friendly error message)

## 🚀 Performance

- [ ] Landing page loads in <2 seconds
- [ ] Timer updates are smooth (no jank)
- [ ] Page transitions are smooth
- [ ] No console errors in browser DevTools
- [ ] No 404 errors in Network tab
- [ ] API responses are <500ms

## 🔍 Code Quality

- [ ] TypeScript compiles with no errors: `npm run build`
- [ ] ESLint passes: `npm run lint`
- [ ] No unused imports or variables
- [ ] All environment variables in `.env.example`

## 📦 Build & Deployment

- [ ] Production build succeeds: `npm run build`
- [ ] Production server starts: `npm run start`
- [ ] App works in production mode (test locally)
- [ ] Environment variables work in production
- [ ] Database connection works in production

## ✅ Pre-Launch Checklist

Before recruiting participants:

- [ ] Test with 2-3 pilot users (friends/family)
- [ ] Verify data export works and is analysis-ready
- [ ] Admin password is strong (20+ characters, not "changeme")
- [ ] Database is backed up
- [ ] Monitoring is set up (Vercel Analytics, Sentry, etc.)
- [ ] Team has access to admin panel
- [ ] IRB approval obtained (if required)
- [ ] Recruitment email/message drafted
- [ ] Support email monitored (mids.timer.study@gmail.com)

---

## 🎯 Quick Test Script

For rapid testing, run through this 5-minute flow:

1. Open incognito window
2. Complete consent + baseline survey
3. Start Session 1 (countdown), let it run for 30 seconds, stop early
4. Submit rating
5. Start Session 2 (hourglass), let it run for 30 seconds, stop early
6. Submit rating
7. Check Prisma Studio - verify 2 sessions exist
8. Open admin panel - download sessions.csv
9. Open CSV in Excel - verify 2 rows

If all these work, the app is functional! 🎉

---

**Pro Tip**: Keep a browser tab open with Prisma Studio during testing. Refresh after each action to see data updates in real-time.

**Debugging**: If something breaks:
1. Check browser console for errors
2. Check terminal (where `npm run dev` is running) for API errors
3. Check Network tab in DevTools for failed requests
4. Check database in Prisma Studio for missing/incorrect data

Good luck! 🍀

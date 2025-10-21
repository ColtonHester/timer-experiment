# Timer Experiment Webapp - Claude Context Guide

## Project Overview

This is a web application for conducting a causal inference experiment for DATASCI 241 (Fall 2025, Section 3, Group 4).

**Research Question**: Does the visualization of time (precise countdown vs. approximate hourglass) influence how long individuals sustain focused work?

**Experiment Design**: Within-subjects design where each participant experiences both conditions:
- **Control**: Precise countdown timer (mm:ss format)
- **Treatment**: Hourglass visualization (no numbers)

**Target**: ~40 participants from UC Berkeley MIDS program
**Duration**: 4-week study with 2+ sessions per week (8 sessions total)
**Session Length**: 25-minute focus bouts (Pomodoro-style)

## 🆕 Recent Major Updates (October 2025)

### Access Code System (Sprint 1 - COMPLETED)
**Problem Solved**: Participants can now resume their progress across browser sessions.

**Implementation**:
- Unique access codes generated in format: `MIDS-XXXX-YYYY` (e.g., `MIDS-A7B3-C9X2`)
- Participants receive code after completing baseline survey
- Can login via `/login` page or bookmark URL `/resume?code=MIDS-XXXX-YYYY`
- Email collection added (optional but recommended) for recruitment tracking

**Key Files**:
- `lib/accessCode.ts` - Code generation & validation
- `app/api/auth/verify-code/route.ts` - Verification endpoint
- `app/login/page.tsx` - Manual login page
- `app/resume/page.tsx` - URL-based auto-login
- `app/baseline/page.tsx` - Updated to show access code & collect email

### Timer Visualizations (FIXED)
- **Countdown timer**: Ring now depletes correctly, progress text fixed
  - Fixed `strokeDashoffset` calculation: `circumference * (1 - progress / 100)`
  - Added `initial={false}` to prevent startup animation
  - Fixed progress text to show elapsed time instead of remaining time
- **Hourglass timer**: Bottom chamber now fills with sand as expected
  - Fixed top sand height calculation: changed 120px to actual 140px
  - Fixed bottom sand y-position: anchored at y=380
  - Added `initial={false}` to both sand rectangles

## Implementation Roadmap

### ✅ Sprint 1: Access Code System (COMPLETED)
- [x] Access code generation (`lib/accessCode.ts`)
- [x] Database schema updates (added `accessCode`, `emailCollectedAt`)
- [x] Verification API endpoint (`/api/auth/verify-code`)
- [x] Login page (`/login`)
- [x] Resume via URL (`/resume?code=...`)
- [x] Updated baseline survey to collect email & show access code
- [x] Timer visualization bugs fixed

### 📋 Sprint 2: Admin Dashboard (Next - Due Thursday)
**Must-Have**:
- [ ] Real-time participation rate chart
- [ ] Participant list table (without emails for privacy)
- [ ] CSV export button integration
- [ ] Session pacing warnings (>2/day indicator)

**Nice-to-Have**:
- [ ] "Send Reminder" button (manual email trigger)
- [ ] Session completion timeline/heatmap
- [ ] Average session duration metrics

### 📋 Sprint 3: Email Tracking & Reminders
- [ ] Set up Supabase recruitment database (separate from experiment data)
- [ ] Create recruitment sync API endpoints
- [ ] Build reminder management page
- [ ] Implement automated reminder cadence:
  - Day 3: If <2 sessions completed
  - Day 7: If <4 sessions completed
  - Day 14: If <6 sessions completed

### 📋 Sprint 4: Deployment
- [ ] Write DEPLOYMENT.md guide
- [ ] Write RECRUITMENT.md workflow guide
- [ ] Deploy to Vercel
- [ ] Set up production PostgreSQL (Supabase)
- [ ] Test in production environment

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **UI**: Framer Motion for animations, shadcn/ui components
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel (recommended) or AWS Amplify

## Architecture

```
timer-experiment/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page (has "Resume" link)
│   ├── consent/           # Consent form
│   ├── baseline/          # Baseline survey (generates access code)
│   ├── login/             # 🆕 Access code login page
│   ├── resume/            # 🆕 URL-based auto-login
│   ├── dashboard/         # Participant dashboard
│   ├── session/           # Timer session pages
│   │   ├── countdown/     # Countdown timer (FIXED)
│   │   └── hourglass/     # Hourglass timer (FIXED)
│   ├── rating/            # Post-session ratings
│   ├── post-survey/       # Post-treatment survey
│   └── api/               # API endpoints
│       ├── auth/          # 🆕 Authentication endpoints
│       │   └── verify-code/ # Access code verification
│       ├── participants/  # Participant creation & management
│       ├── sessions/      # Session logging
│       ├── surveys/       # Survey submissions (updated for email)
│       └── admin/         # Admin endpoints (export)
├── components/            # React components
│   ├── timers/           # Timer visualizations
│   └── ui/               # Reusable UI components
├── lib/
│   ├── db.ts             # Prisma client singleton
│   ├── accessCode.ts     # 🆕 Access code generation & validation
│   ├── randomization.ts  # Session sequence algorithm
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── types/                # TypeScript type definitions
```

## Database Schema

### Core Models

1. **Participant**: Anonymous subject with UUID, stores randomized condition sequence
   - `id` (String, UUID): Primary key, anonymous subject ID
   - `accessCode` (String, unique): Format `MIDS-XXXX-YYYY` for session resumption
   - `emailCollectedAt` (DateTime, nullable): Timestamp when email was provided
   - `conditionSequence` (JSON): Pre-randomized array like `["COUNTDOWN", "HOURGLASS", ...]`
   - `recruitmentBatch` (String, optional): e.g., "week1", "pilot"
   - `cohort` (String, optional): e.g., "MIDS_Fall2025"

2. **BaselineSurvey**: Pre-experiment survey (time anxiety, typical focus duration)
   - `participantId` (String, unique): Links to Participant
   - `timeAnxietyScore` (Int): 1-5 Likert scale
   - `typicalFocusDuration` (Int): Self-reported minutes
   - `unitsEnrolled` (Int, optional): Course load
   - `usesTimerCurrently` (Boolean, optional)
   - `preferredTimerType` (String, optional)

3. **Session**: Each 25-minute focus session with automated timing data
   - `participantId` (String): Links to Participant
   - `condition` (TimerCondition): COUNTDOWN or HOURGLASS
   - `sessionNumber` (Int): Sequential 1-8
   - `targetDuration` (Int): Seconds, default 1500 (25 min)
   - `startTime` (DateTime): Auto-logged
   - `endTime` (DateTime, nullable): Auto-logged
   - `actualDuration` (Int, nullable): Calculated (endTime - startTime)
   - `completedFullSession` (Boolean): Did they reach target?
   - `overrunAmount` (Int, nullable): Seconds past target if any

4. **PostSessionRating**: Brief ratings after each session (stress, ease of following)
   - `sessionId` (String, unique): Links to Session
   - `perceivedStress` (Int): 1-5 Likert (1=low, 5=high)
   - `easeOfFollowing` (Int): 1-5 Likert (1=difficult, 5=easy)
   - `subjectiveFocusQuality` (Int, optional): 1-5 Likert
   - `comments` (String, optional): Qualitative feedback

5. **PostTreatmentSurvey**: Final qualitative feedback
   - `participantId` (String, unique): Links to Participant
   - `preferredTimer` (TimerPreference): COUNTDOWN, HOURGLASS, or NO_PREFERENCE
   - `qualitativeFeedback` (String): Open-ended response
   - `wouldUseAgain` (Boolean, optional)
   - `recommendToOthers` (Boolean, optional)

### Key Fields & Calculations

- `conditionSequence` (JSON): Pre-randomized session order for each participant
- `startTime` / `endTime`: Automated timestamps for calculating actual duration
- `actualDuration`: Calculated in seconds (endTime - startTime)
- `completedFullSession`: Boolean - did they reach 25 minutes?
- `overrunAmount`: How many seconds past target (null if stopped early)
- `accessCode`: Unique identifier in format `MIDS-XXXX-YYYY`, excludes ambiguous chars (0/O, 1/I/L)

## Randomization Algorithm

Located in `lib/randomization.ts`

**Algorithm**: Pair-wise alternation with randomization
1. Create pairs of [COUNTDOWN, HOURGLASS]
2. Randomly shuffle order within each pair
3. Concatenate pairs to create full sequence

**Example sequence**: `['H', 'C', 'C', 'H', 'H', 'C', 'C', 'H']`

**Benefits**:
- Perfect balance (50/50 split)
- Maximum alternation (minimizes carryover effects)
- No clustering of same condition

## User Flow

### First-Time Participants
1. **Landing Page** (`/`) → Click "Begin Study"
2. **Consent Form** (`/consent`) → Review and accept
3. **Baseline Survey** (`/baseline`) → Complete survey + provide email (optional)
4. **Access Code Screen** → Large display of `MIDS-XXXX-YYYY` + copy button
5. **Dashboard** (`/dashboard`) → View progress, start first session
6. **Session** (`/session/countdown` or `/session/hourglass`) → 25-minute timer
7. **Post-Session Rating** (`/rating`) → Quick 3-question survey
8. **Repeat steps 5-7** until all 8 sessions complete
9. **Post-Treatment Survey** (`/post-survey`) → Final qualitative feedback
10. **Thank You** → Study complete, raffle confirmation

### Returning Participants
**Option A**: Bookmark URL (`/resume?code=MIDS-XXXX-YYYY`)
- Auto-verifies code and redirects to dashboard
- Fastest method, recommended to all participants

**Option B**: Manual login (`/login`)
- Enter access code manually
- Verifies code via `/api/auth/verify-code`
- Redirects to dashboard on success

**Option C**: Landing page link
- Click "Already started? Resume with your access code →"
- Redirects to `/login`

## Key Features

### 1. Countdown Timer (Control)
- Large centered `mm:ss` display
- Circular progress ring (depleting clockwise)
- Precise numeric feedback
- Visual: Clean, minimal, precise

### 2. Hourglass Timer (Treatment)
- Animated SVG hourglass with draining sand
- NO numbers displayed anywhere
- Smooth, organic animation
- Visual: Calming, approximate

### 3. Compliance Mechanisms
- Progress tracking: "6/8 sessions complete"
- Completion streaks
- Clear "next session" prompting
- One-click start (frictionless)
- Mobile-responsive design

### 4. Data Collection
- **Automated**: All timestamps captured automatically
- **Calculated**: Durations computed server-side
- **Reliable**: Local storage backup + sync
- **Anonymous**: No PII collected (UUID only)

## API Endpoints

### 🆕 `/api/auth/verify-code`
- `POST`: Verify access code and return participant ID
  - **Input**: `{ accessCode: string }`
  - **Output**: `{ valid: boolean, participantId?: string, error?: string }`
  - **Status**: 200 (valid), 401 (invalid)
  - **Used by**: `/login` and `/resume` pages

### `/api/surveys/baseline`
- `POST`: Submit baseline survey and create participant
  - **Input**:
    ```typescript
    {
      email?: string,
      timeAnxietyScore: number,
      typicalFocusDuration: number,
      unitsEnrolled?: number,
      usesTimerCurrently?: boolean,
      preferredTimerType?: string
    }
    ```
  - **Process**:
    1. Generates unique access code (`MIDS-XXXX-YYYY`)
    2. Creates randomized session sequence (8 sessions, 4 countdown + 4 hourglass)
    3. Creates Participant record
    4. Creates BaselineSurvey record
  - **Output**:
    ```typescript
    {
      participantId: string,
      accessCode: string,  // 🆕 Now returned to user
      sessionCount: number
    }
    ```

### `/api/participants`
- `POST`: Create new participant (legacy endpoint, prefer `/api/surveys/baseline`)
  - Generates UUID
  - Creates randomized sequence
  - Returns `subject_id`

### `/api/sessions`
- `POST /start`: Start new session
  - **Input**: `{ participantId: string, sessionNumber: number }`
  - **Process**:
    1. Looks up condition from participant's `conditionSequence`
    2. Creates Session record with `startTime = now()`
  - **Output**: `{ sessionId: string, condition: "COUNTDOWN" | "HOURGLASS", targetDuration: number }`

- `POST /end`: End session
  - **Input**: `{ sessionId: string }`
  - **Process**:
    1. Sets `endTime = now()`
    2. Calculates `actualDuration = endTime - startTime` (in seconds)
    3. Sets `completedFullSession = actualDuration >= targetDuration`
    4. Calculates `overrunAmount` if applicable
  - **Output**: Full session data with calculated fields

### `/api/surveys/rating`
- `POST`: Submit post-session rating
  - **Input**:
    ```typescript
    {
      sessionId: string,
      perceivedStress: number,      // 1-5
      easeOfFollowing: number,      // 1-5
      subjectiveFocusQuality?: number,  // 1-5
      comments?: string
    }
    ```
  - **Output**: Rating ID and completion status

### `/api/surveys/post-treatment`
- `POST`: Submit final post-treatment survey
  - **Input**:
    ```typescript
    {
      participantId: string,
      preferredTimer: "COUNTDOWN" | "HOURGLASS" | "NO_PREFERENCE",
      qualitativeFeedback: string,
      wouldUseAgain?: boolean,
      recommendToOthers?: boolean
    }
    ```
  - **Output**: Survey ID and completion status

### `/api/admin/export`
- `GET`: Export data as CSV (password-protected)
  - **Query params**:
    - `password` (required): Admin password from `ADMIN_PASSWORD` env var
    - `format` (optional): `sessions`, `baseline`, `ratings`, `post-treatment`, or `all`
  - **Output**: CSV file download (or JSON for `format=all`)
  - **Status**: 401 if password incorrect, 400 if invalid format

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_PASSWORD="changeme"
```

## Development Workflow

1. **Setup Database**:
   ```bash
   npm run db:push  # Push schema to database
   npm run db:studio  # Open Prisma Studio (GUI)
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Testing Flow**:
   - Open http://localhost:3000
   - Complete consent + baseline
   - Test both timer conditions
   - Verify data in Prisma Studio

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

**Database**: Use Supabase (free PostgreSQL) or AWS RDS

### Option 2: AWS Amplify
1. Use AWS Amplify CLI
2. Deploy Next.js SSR app
3. Connect to AWS RDS PostgreSQL

### Option 3: Docker + AWS ECS
1. Containerize Next.js app
2. Deploy to ECS Fargate
3. Use RDS for database

## Data Analysis

### Exporting Data
- Admin endpoint: `/api/admin/export?password=...`
- Returns CSV files ready for R/Python analysis

### Key Metrics
- **Primary outcome**: `actualDuration` by `condition`
- **Secondary**: `overrunAmount`, `perceivedStress`, `easeOfFollowing`
- **Moderator**: `timeAnxietyScore` from baseline

### Analysis Considerations
- Pair t-test for within-subjects comparison
- Check for order effects (session number as covariate)
- Examine moderator effects (high vs low time anxiety)

## UX Design Principles

1. **Frictionless**: Minimize clicks, maximize automation
2. **Clear**: Always show progress and next steps
3. **Trustworthy**: Transparent data collection
4. **Beautiful**: Polished animations and transitions
5. **Accessible**: Mobile-friendly, readable text

## Troubleshooting

### Common Issues

**Database connection fails**:
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Run `npm run db:push` to sync schema

**Timer doesn't start**:
- Check browser console for errors
- Verify participant has valid sequence
- Check session number is within range

**Data not saving**:
- Check network tab for API errors
- Verify Prisma client is initialized
- Check database logs

## Future Enhancements

1. Email/SMS reminders for sessions
2. PWA support (offline mode)
3. Real-time analytics dashboard
4. A/B test different session lengths
5. Multi-language support

## Contact & Resources

- **Project**: DATASCI 241 Final Project
- **Team**: Ariel Gholar, Colton Hester, Jeremy Liu, Nitya Sree Cheera
- **Semester**: Fall 2025, Section 3, Group 4

## Access Code System Implementation Details

### Code Generation (`lib/accessCode.ts`)

**Format**: `MIDS-XXXX-YYYY` where X and Y are alphanumeric characters

**Character Set**: `23456789ABCDEFGHJKMNPQRSTUVWXYZ`
- Excludes: 0 (zero), O (letter O), 1 (one), I (letter I), L (letter L)
- Reason: Prevents confusion when reading/typing codes

**Generation Process**:
1. Use `crypto.getRandomValues()` for cryptographic randomness
2. Generate two 4-character segments
3. Check database for uniqueness via `prisma.participant.findUnique()`
4. Retry up to 10 times if collision detected
5. Throw error if unable to generate unique code

**Validation**:
- `isValidAccessCodeFormat()`: Regex pattern match
- `normalizeAccessCode()`: Uppercase + trim whitespace
- `verifyAccessCode()`: Check format + database lookup

### Participant Persistence Strategy

**Three-Layer Approach**:

1. **localStorage** (Browser-side)
   - Key: `participantId`
   - Purpose: Quick access without API call
   - Limitation: Cleared if user clears browser data

2. **Access Code** (User-saved)
   - Displayed after baseline survey
   - Can be bookmarked as URL: `/resume?code=MIDS-XXXX-YYYY`
   - Persistent across devices/browsers

3. **Email Collection** (Optional)
   - Timestamp stored in `emailCollectedAt`
   - Email itself NOT stored in experiment database
   - Future: Synced to separate recruitment database for reminders

### Security Considerations

**Why access codes instead of passwords?**
- Lower friction (no password rules, reset flow, etc.)
- Sufficient security for anonymous research data
- Easy to communicate via email/text
- URL-friendly (can bookmark)

**Attack surface**:
- Brute force: ~1 billion possible codes (30^8), impractical
- No sensitive PII in experiment database
- Admin endpoints separately password-protected

### Email Privacy Architecture

**Dual-Database Approach** (Sprint 3):

```
┌─────────────────────────┐         ┌──────────────────────┐
│  Experiment Database    │         │ Recruitment Database │
│  (PostgreSQL)           │         │ (Supabase)           │
├─────────────────────────┤         ├──────────────────────┤
│ Participant             │         │ RecruitmentRecord    │
│  - id (UUID)            │ ◄──┐    │  - participantId     │
│  - accessCode           │    └────┼─ - email             │
│  - emailCollectedAt     │         │  - lastReminderSent  │
│  - conditionSequence    │         │  - consentedAt       │
│  - NO EMAIL STORED      │         │  - sessionsCompleted │
│                         │         │                      │
│ Session, Ratings, etc.  │         └──────────────────────┘
│ (all anonymous)         │              ↑
└─────────────────────────┘              │
                                    Sync via API
```

**Benefits**:
- Research data remains fully anonymous
- Email data can be deleted independently after study
- IRB compliance: clear separation of identifiable data
- Recruitment team can't access experiment data

## For Future Claude Instances

When working on this project:

1. **Understand the experiment**: This is a rigorous causal inference study. Data integrity is paramount.

2. **Maintain randomization**: Never modify the randomization algorithm without careful consideration. It's designed to minimize bias.

3. **Preserve anonymity**: The experiment database contains NO PII. Access codes are not PII. Emails (if collected) are stored in a SEPARATE recruitment database.

4. **Automated data collection**: Timer data should NEVER require manual entry. All timestamps are automatic.

5. **UX is critical**: Non-compliance is the #1 risk. Every design decision should reduce friction.

6. **Testing**: Always test both timer conditions. They must be identical except for visualization.

7. **Database migrations**: Use Prisma migrations carefully. Data loss is unacceptable. If adding non-nullable fields to tables with existing data, use `--force-reset` with explicit user consent.

8. **Performance**: Timers must be accurate to the second. Test for drift/lag.

9. **Access code security**: Access codes are sufficient for this use case. Don't add password authentication unless explicitly requested.

10. **Email handling**: Emails should ONLY be stored in the recruitment database (Sprint 3). The experiment database only stores `emailCollectedAt` timestamp.

## Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run db:studio        # Open database GUI

# Database
npm run db:push          # Sync schema to database
npx prisma migrate dev   # Create migration
npx prisma generate      # Regenerate client

# Production
npm run build            # Build for production
npm run start            # Start production server
```

---

**Remember**: This experiment is testing whether subtle design changes can influence human behavior. The webapp itself is an intervention, so every detail matters. Keep the UX clean, the data collection reliable, and the randomization sound.

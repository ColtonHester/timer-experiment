# Timer Experiment Webapp - Claude Context Guide

## Project Overview

This is a web application for conducting a causal inference experiment for DATASCI 241 (Fall 2025, Section 3, Group 4).

**Research Question**: Does the visualization of time (precise countdown vs. approximate hourglass) influence how long individuals sustain focused work?

**Experiment Design**: Within-subjects design where each participant experiences both conditions:
- **Control**: Precise countdown timer (mm:ss format)
- **Treatment**: Hourglass visualization (no numbers)

**Target**: ~40 participants from UC Berkeley MIDS program
**Duration**: Multi-day study with at least 2 sessions per day
**Session Length**: 25-minute focus bouts (Pomodoro-style)

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
│   ├── page.tsx           # Landing page
│   ├── consent/           # Consent form
│   ├── baseline/          # Baseline survey
│   ├── dashboard/         # Participant dashboard
│   ├── session/           # Timer session pages
│   │   ├── countdown/     # Countdown timer
│   │   └── hourglass/     # Hourglass timer
│   ├── rating/            # Post-session ratings
│   ├── post-survey/       # Post-treatment survey
│   └── api/               # API endpoints
│       ├── participants/  # Participant creation & management
│       ├── sessions/      # Session logging
│       └── surveys/       # Survey submissions
├── components/            # React components
│   ├── timers/           # Timer visualizations
│   └── ui/               # Reusable UI components
├── lib/
│   ├── db.ts             # Prisma client singleton
│   ├── randomization.ts  # Session sequence algorithm
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── types/                # TypeScript type definitions
```

## Database Schema

### Core Models

1. **Participant**: Anonymous subject with UUID, stores randomized condition sequence
2. **BaselineSurvey**: Pre-experiment survey (time anxiety, typical focus duration)
3. **Session**: Each 25-minute focus session with automated timing data
4. **PostSessionRating**: Brief ratings after each session (stress, ease of following)
5. **PostTreatmentSurvey**: Final qualitative feedback

### Key Fields

- `conditionSequence` (JSON): Pre-randomized session order for each participant
- `startTime` / `endTime`: Automated timestamps for calculating actual duration
- `actualDuration`: Calculated in seconds (endTime - startTime)
- `completedFullSession`: Boolean - did they reach 25 minutes?
- `overrunAmount`: How many seconds past target (null if stopped early)

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

1. **Landing** → Consent Form
2. **Baseline Survey** → Creates Participant record + generates sequence
3. **Dashboard** → Shows progress, next session condition
4. **Session** → Timer (countdown or hourglass based on sequence)
5. **Post-Session Rating** → Brief 3-question survey
6. **Repeat** until all sessions complete
7. **Post-Treatment Survey** → Final feedback
8. **Thank You** → Raffle entry confirmation

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

### `/api/participants`
- `POST`: Create new participant (after baseline survey)
  - Generates UUID
  - Creates randomized sequence
  - Returns `subject_id`

### `/api/sessions`
- `POST /start`: Start new session
  - Input: `participantId`, `sessionNumber`
  - Returns: `sessionId`, `condition`, `targetDuration`
- `POST /end`: End session
  - Input: `sessionId`
  - Calculates duration, completion status
  - Returns: session data

### `/api/surveys/baseline`
- `POST`: Submit baseline survey
  - Creates Participant + BaselineSurvey
  - Returns `participantId`

### `/api/surveys/rating`
- `POST`: Submit post-session rating
  - Input: `sessionId`, ratings (1-5 Likert)
  - Links to session

### `/api/surveys/post-treatment`
- `POST`: Submit final survey
  - Input: `participantId`, qualitative feedback
  - Marks study complete

### `/api/admin/export`
- `GET`: Export all data as CSV (password-protected)
  - Returns: sessions.csv, baseline.csv, ratings.csv

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

## For Future Claude Instances

When working on this project:

1. **Understand the experiment**: This is a rigorous causal inference study. Data integrity is paramount.

2. **Maintain randomization**: Never modify the randomization algorithm without careful consideration. It's designed to minimize bias.

3. **Preserve anonymity**: Never collect PII. Subject ID is a UUID, not linked to real identities.

4. **Automated data collection**: Timer data should NEVER require manual entry. All timestamps are automatic.

5. **UX is critical**: Non-compliance is the #1 risk. Every design decision should reduce friction.

6. **Testing**: Always test both timer conditions. They must be identical except for visualization.

7. **Database migrations**: Use Prisma migrations carefully. Data loss is unacceptable.

8. **Performance**: Timers must be accurate to the second. Test for drift/lag.

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

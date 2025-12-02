# Focus Timer Experiment - DATASCI 241

A web application for conducting a causal inference experiment on how timer visualization affects sustained focus.

## Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local, Supabase, or AWS RDS)
- npm or yarn package manager

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your DATABASE_URL
# Example for local PostgreSQL:
DATABASE_URL="postgresql://postgres:password@localhost:5432/timer_experiment"
```

3. **Set up the database**:
```bash
# Push the schema to your database
npm run db:push

# (Optional) Open Prisma Studio to view your database
npm run db:studio
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open the app**:
Visit [http://localhost:3000](http://localhost:3000)

## Database Setup Options

### Option 1: Local PostgreSQL with Docker

```bash
# Run PostgreSQL in Docker
docker run --name timer-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=timer_experiment \
  -p 5432:5432 \
  -d postgres:15

# Your DATABASE_URL:
# postgresql://postgres:password@localhost:5432/timer_experiment
```

### Option 2: Supabase (Free Cloud PostgreSQL)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > Database and copy the connection string
4. Use the "Connection Pooling" string for better performance

### Option 3: AWS RDS

1. Create a PostgreSQL RDS instance in AWS
2. Note the endpoint, port, username, and password
3. Format: `postgresql://username:password@endpoint:5432/database`

## Project Structure

```
timer-experiment/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── baseline/          # Baseline survey page
│   ├── consent/           # Consent form
│   ├── dashboard/         # Participant dashboard
│   ├── session/           # Timer sessions
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── timers/           # Countdown & Hourglass
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities
│   ├── db.ts             # Prisma client
│   ├── randomization.ts  # Session sequencing
│   └── utils.ts          # Helper functions
├── prisma/
│   └── schema.prisma     # Database schema
└── CLAUDE.md             # Context for AI assistants
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio (database GUI)
```

## Experiment Flow

### First-Time Participants
1. **Landing Page** → Introduction to the study
2. **Consent** → Informed consent form
3. **Baseline Survey** → Pre-treatment questionnaire + email (optional)
4. **Access Code** → Receive unique code (e.g., `MIDS-A7B3-C9X2`) - **SAVE THIS!**
5. **Dashboard** → View progress, start sessions
6. **Session** → 25-minute timer (countdown or hourglass)
7. **Rating** → Post-session brief survey
8. **Repeat** → Complete both sessions
9. **Post-Survey** → Final feedback

### Returning Participants
You can resume your progress in three ways:

**Fastest**: Bookmark your personalized URL
```
http://localhost:3000/resume?code=MIDS-XXXX-YYYY
```

**Alternative**: Manual login at `/login` page

**Last resort**: Click "Already started? Resume with your access code →" on landing page

## Key Features

### Access Code System
- **Unique codes**: Each participant gets a code like `MIDS-A7B3-C9X2`
- **Session persistence**: Resume your progress across browsers/devices
- **No passwords needed**: Just save your access code
- **Email reminders**: Optional email collection for study reminders (emails stored separately from experiment data)

### Randomization
- Each participant gets a randomized sequence of 2 sessions
- Perfect balance: 1 countdown, 1 hourglass
- Order randomized to control for sequence effects

### Data Collection
- **Automated timing**: All start/stop timestamps logged automatically
- **Calculated metrics**: Duration, completion, overrun computed server-side
- **Anonymous**: UUID-based participant IDs, experiment data contains no PII

### Timer Conditions

**Control (Countdown)**:
- Large mm:ss display
- Circular progress ring
- Precise numeric feedback

**Treatment (Hourglass)**:
- Animated sand visualization
- No numbers displayed
- Approximate time sense

## Development Tips

### Testing the Flow

1. Complete the baseline survey
2. Check `localStorage` for `participantId`
3. Open Prisma Studio to view database records
4. Test both timer conditions

### Debugging

```bash
# View database records
npm run db:studio

# Check API logs
# Look at terminal where `npm run dev` is running

# Clear localStorage (to start fresh)
# In browser console:
localStorage.clear()
```

### Adding Sessions

To change the number of required sessions, edit `lib/randomization.ts`:

```typescript
const sequence = generateSessionSequence({ totalSessions: 4 }) // Change from 2 to 4
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `ADMIN_PASSWORD`: Password for admin endpoints
4. Deploy!

### Deploy to AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

## Environment Variables

```bash
# Required
DATABASE_URL="postgresql://..."           # PostgreSQL connection string

# Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # App URL (for redirects)
ADMIN_PASSWORD="changeme"                     # Admin panel password
```

## Admin Features

### Data Export

Access the admin panel to export data as CSV:

```bash
# Export all sessions
http://localhost:3000/api/admin/export?password=YOUR_ADMIN_PASSWORD&format=sessions

# Export baseline surveys
http://localhost:3000/api/admin/export?password=YOUR_ADMIN_PASSWORD&format=baseline

# Export post-session ratings
http://localhost:3000/api/admin/export?password=YOUR_ADMIN_PASSWORD&format=ratings

# Export post-treatment surveys
http://localhost:3000/api/admin/export?password=YOUR_ADMIN_PASSWORD&format=post-treatment

# Export everything as JSON
http://localhost:3000/api/admin/export?password=YOUR_ADMIN_PASSWORD&format=all
```

**Note**: Set `ADMIN_PASSWORD` in your `.env` file. Default is `changeme` (change this in production!)

## Database Schema

### Participant
- `id` (UUID) - Anonymous subject ID
- `conditionSequence` (JSON) - Randomized session order
- `createdAt` - Registration timestamp

### BaselineSurvey
- Linked to Participant
- Time anxiety score (1-5 Likert)
- Typical focus duration
- Current timer usage

### Session
- Linked to Participant
- `condition` - COUNTDOWN or HOURGLASS
- `startTime`, `endTime` - Automated timestamps
- `actualDuration` - Calculated duration
- `completedFullSession` - Boolean

### PostSessionRating
- Linked to Session
- Perceived stress (1-5)
- Ease of following (1-5)
- Subjective focus quality (1-5)

### PostTreatmentSurvey
- Linked to Participant
- Preferred timer
- Qualitative feedback

## Troubleshooting

**"Error: P1001 Can't reach database server"**
- Check that PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Test connection with: `npx prisma db push`

**"Module not found" errors**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

**Timer doesn't start**
- Check browser console for errors
- Verify `participantId` in localStorage
- Check that session sequence exists in database

**Data not saving**
- Open browser Network tab
- Check for failed API requests
- View terminal logs for server errors

## Contributing

This is an academic research project. If you're part of the team:

1. Create a new branch for features
2. Test thoroughly before merging
3. Update CLAUDE.md if you change architecture
4. Don't modify randomization algorithm without team discussion

## License

MIT - For academic use in DATASCI 241, Fall 2025

## Contact

- **Course**: UC Berkeley DATASCI 241, Section 3
- **Team**: Group 4 (Ariel Gholar, Colton Hester, Jeremy Liu, Nitya Sree Cheera)
- **Semester**: Fall 2025

---

**For detailed technical documentation**, see [CLAUDE.md](./CLAUDE.md)

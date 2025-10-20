# Quick Start Guide - 5 Minutes to Running

Get the Focus Timer Experiment running in 5 minutes.

## Step 1: Database Setup (2 minutes)

### Option A: Supabase (Recommended - Free & Easy)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: `timer-experiment`
   - **Database Password**: Generate a strong one (save it!)
   - **Region**: Choose closest to you
6. Click "Create new project" (takes ~2 minutes to provision)
7. Once ready, click "Connect" → "Connection Pooling" → Copy the string

### Option B: Local PostgreSQL (If you have Docker)

```bash
docker run --name timer-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=timer_experiment \
  -p 5432:5432 \
  -d postgres:15
```

Connection string: `postgresql://postgres:password@localhost:5432/timer_experiment`

## Step 2: Configure Environment (30 seconds)

```bash
cd timer-experiment

# Copy example env file
cp .env.example .env

# Edit .env (use Notepad, VS Code, or any editor)
# Add your connection string:
DATABASE_URL="postgresql://postgres.xxx:[password]@xxx.supabase.co:5432/postgres?pgbouncer=true"
ADMIN_PASSWORD="your_secure_password_here"
```

## Step 3: Install & Setup (1 minute)

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push
```

You should see:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

## Step 4: Start Development Server (5 seconds)

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

## Step 5: Test It! (1 minute)

1. Open http://localhost:3000
2. Click "Get Started"
3. Check consent checkbox → "Continue to Survey"
4. Fill in baseline survey (any values) → Submit
5. Dashboard should show "Session #1"
6. Click "Start Session"
7. Timer should start counting down!

**Success!** 🎉

---

## Verify Data is Saving

```bash
# Open Prisma Studio (database GUI)
npm run db:studio
```

- Opens at http://localhost:5555
- Click "Participant" → You should see 1 row
- Click "Session" → You should see your test session

---

## Common Issues

### "Can't reach database server"

**Solution**: Check your `DATABASE_URL` in `.env`

For Supabase, use the **"Connection Pooling"** string, not "Direct Connection"

### "Module not found"

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use

**Solution**: Kill the process or use a different port:
```bash
PORT=3001 npm run dev
```

---

## Next Steps

### Test the Full Flow

Use the [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) to test every feature.

### Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment (takes 10 minutes).

### Understand the Code

See [CLAUDE.md](./CLAUDE.md) for complete technical documentation.

---

## Quick Commands Reference

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Check for code issues

npm run db:push       # Push schema to database
npm run db:studio     # Open database GUI

npx prisma migrate reset  # Reset database (deletes all data!)
```

---

## File Structure (Where Things Are)

```
timer-experiment/
├── app/                    # All pages and API routes
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Participant dashboard
│   ├── session/           # Timer pages
│   │   ├── countdown/
│   │   └── hourglass/
│   └── api/               # Backend endpoints
├── components/timers/     # Timer components
├── lib/                   # Utility functions
├── prisma/schema.prisma   # Database design
└── .env                   # Your secrets (not committed to git)
```

---

## Need Help?

1. **Setup issues**: Check [README.md](./README.md)
2. **Deployment**: Check [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Testing**: Check [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)
4. **Code questions**: Check [CLAUDE.md](./CLAUDE.md)
5. **Everything else**: Ask Claude (he built this!) or your team

---

**You're all set!** Now go test the timers and be amazed by the hourglass animation. 😊

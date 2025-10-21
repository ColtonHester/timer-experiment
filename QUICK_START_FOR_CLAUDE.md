# Quick Start Guide for Future Claude Instances

**Last Updated**: October 21, 2025 (Monday, 7:50 PM)

## 🚀 TL;DR - Current State

**What's Working**:
- ✅ Full experiment flow (consent → baseline → 8 sessions → post-survey)
- ✅ Access code system (participants can resume sessions)
- ✅ Both timer visualizations (countdown & hourglass) working correctly
- ✅ Database schema with Prisma + PostgreSQL
- ✅ CSV data export endpoint

**What's Next**:
- 📋 Sprint 2: Admin dashboard (due Thursday) - see IMPLEMENTATION_STATUS.md
- 📋 Sprint 3: Email reminders system
- 📋 Sprint 4: Production deployment

## 📁 Key Files to Read First

1. **CLAUDE.md** - Full technical context (read this!)
2. **IMPLEMENTATION_STATUS.md** - What's done, what's next
3. **README.md** - User-facing documentation
4. **prisma/schema.prisma** - Database schema
5. **lib/accessCode.ts** - Access code generation system

## 🎯 Current Priority

**Sprint 2: Admin Dashboard** (Must-Have by Thursday)
- Real-time participation chart
- Participant list table (no emails shown)
- CSV export button
- Session pacing warnings (>2/day indicator)

See "Sprint 2" section in IMPLEMENTATION_STATUS.md for full checklist.

## 🐛 Recent Bug Fixes (Don't Re-Break These!)

1. **Countdown timer ring**: Uses `strokeDashoffset = circumference * (1 - progress / 100)`
2. **Countdown progress text**: Shows elapsed time, not remaining time
3. **Hourglass sand fill**: Bottom chamber fills correctly (y-position anchored at 380)
4. **Timer animations**: Both use `initial={false}` to prevent startup animation

## 🗄️ Database Quick Reference

**Tables**: Participant, BaselineSurvey, Session, PostSessionRating, PostTreatmentSurvey

**Key Fields**:
- `Participant.accessCode` - Format: `MIDS-XXXX-YYYY`
- `Participant.emailCollectedAt` - Timestamp (email itself NOT stored here)
- `Participant.conditionSequence` - JSON array: `["COUNTDOWN", "HOURGLASS", ...]`
- `Session.actualDuration` - Calculated server-side (endTime - startTime)
- `Session.completedFullSession` - Boolean (reached 25 minutes?)

**Access Code System**:
- Character set excludes confusing chars: NO 0/O, 1/I/L
- Validated via `lib/accessCode.ts`
- Three login methods: localStorage, manual login (`/login`), URL (`/resume?code=...`)

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server (usually on port 3000)
npm run db:studio        # Open Prisma Studio (database GUI)

# Database
npm run db:push          # Sync schema to database
npx prisma db push --force-reset  # ⚠️ Nuclear option (clears all data!)

# Check running processes
netstat -ano | findstr :3000  # Windows: Find what's using port 3000
taskkill /F /PID <pid>        # Windows: Kill process by PID
```

## 🚨 Important Warnings

1. **NEVER add emails to experiment database** - They go in separate recruitment DB (Sprint 3)
2. **NEVER modify randomization algorithm** without team discussion
3. **NEVER use `db push --force-reset`** without explicit user consent
4. **ALWAYS test both timer conditions** after any changes
5. **Access codes are NOT PII** - they're just random strings

## 📊 Architecture Overview

```
User Flow:
Landing → Consent → Baseline (get access code) → Dashboard → Sessions (8x) → Post-Survey

Persistence:
localStorage (fast) → Access Code Login (cross-device) → Email Reminders (Sprint 3)

Data Export:
/api/admin/export?password=XXX&format=sessions|baseline|ratings|post-treatment|all
```

## 🧪 Testing Checklist Before Making Changes

- [ ] Test full flow from baseline to first session
- [ ] Test access code login (`/login`)
- [ ] Test URL resume (`/resume?code=...`)
- [ ] Test both timer visualizations
- [ ] Check data in Prisma Studio
- [ ] Verify CSV export works

## 💡 Pro Tips

1. **Context window low?** Update CLAUDE.md and IMPLEMENTATION_STATUS.md before running out
2. **Database issues?** Check if dev server is holding locks (kill and restart)
3. **Port 3000 in use?** Server will auto-start on 3001, check URL
4. **Timer not accurate?** `actualDuration` is in SECONDS, not milliseconds
5. **Need to reset DB?** Get user consent first, then use `--force-reset`

## 🤝 Team Info

- **Course**: UC Berkeley DATASCI 241, Section 3
- **Team**: Ariel Gholar, Colton Hester, Jeremy Liu, Nitya Sree Cheera
- **Semester**: Fall 2025

## 📞 When User Needs Help

If user asks "where are we?":
1. Point to IMPLEMENTATION_STATUS.md for progress
2. Next priority is Sprint 2 (admin dashboard)
3. Timer bugs are FIXED, don't touch unless broken again

If user asks "what's the access code system?":
1. Participants get `MIDS-XXXX-YYYY` after baseline
2. Can bookmark `/resume?code=...` URL
3. Email collection is optional, for reminders only
4. Read "Access Code System Implementation Details" in CLAUDE.md

If user asks "how do I export data?":
```
http://localhost:3000/api/admin/export?password=changeme&format=sessions
```
(Change password in .env for production!)

---

**Remember**: This is a rigorous research experiment. Data integrity > speed. UX matters for compliance. Every detail counts.

**Start here**: Read CLAUDE.md sections marked 🆕 for recent changes, then check IMPLEMENTATION_STATUS.md for next tasks.

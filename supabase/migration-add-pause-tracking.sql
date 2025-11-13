-- Migration: Add Pause Tracking to Timer Experiment Database
-- Date: 2025-11-13
-- Description: Adds pause tracking fields to Session table and creates SessionPause table

-- Step 1: Add pause tracking columns to existing Session table
ALTER TABLE "Session"
ADD COLUMN "pauseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "totalPausedTime" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Create SessionPause table for detailed pause event tracking
CREATE TABLE "SessionPause" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionId" UUID NOT NULL REFERENCES "Session"("id") ON DELETE CASCADE,
    "pausedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "resumedAt" TIMESTAMP WITH TIME ZONE,
    "pauseDuration" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX "SessionPause_sessionId_idx" ON "SessionPause"("sessionId");
CREATE INDEX "SessionPause_pausedAt_idx" ON "SessionPause"("pausedAt");

-- Step 4: Add comments for documentation
COMMENT ON TABLE "SessionPause" IS 'Individual pause events within sessions for behavioral analysis';
COMMENT ON COLUMN "Session"."pauseCount" IS 'Number of times participant paused during this session';
COMMENT ON COLUMN "Session"."totalPausedTime" IS 'Total seconds spent paused during this session';
COMMENT ON COLUMN "Session"."actualDuration" IS 'Calculated duration in seconds (endTime - startTime), includes paused time';
COMMENT ON COLUMN "SessionPause"."pauseDuration" IS 'Duration of this pause in seconds (resumedAt - pausedAt)';

-- Verification queries (optional - run these to verify the migration worked)
-- SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'Session' AND column_name IN ('pauseCount', 'totalPausedTime');
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'SessionPause';

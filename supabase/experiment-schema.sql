-- Timer Experiment Database Schema
-- DATASCI 241 - Focus Timer Visualization Study
-- Production Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE "TimerCondition" AS ENUM ('COUNTDOWN', 'HOURGLASS');
CREATE TYPE "TimerPreference" AS ENUM ('COUNTDOWN', 'HOURGLASS', 'NO_PREFERENCE');

-- Participant table
CREATE TABLE "Participant" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "accessCode" TEXT NOT NULL UNIQUE,
    "emailCollectedAt" TIMESTAMP WITH TIME ZONE,
    "conditionSequence" JSONB NOT NULL,
    "recruitmentBatch" TEXT,
    "cohort" TEXT
);

-- BaselineSurvey table
CREATE TABLE "BaselineSurvey" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "participantId" UUID NOT NULL UNIQUE REFERENCES "Participant"("id") ON DELETE CASCADE,
    "timeAnxietyScore" INTEGER NOT NULL CHECK ("timeAnxietyScore" BETWEEN 1 AND 5),
    "typicalFocusDuration" INTEGER NOT NULL,
    "unitsEnrolled" INTEGER,
    "usesTimerCurrently" BOOLEAN,
    "preferredTimerType" TEXT,
    "completedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Session table
CREATE TABLE "Session" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "participantId" UUID NOT NULL REFERENCES "Participant"("id") ON DELETE CASCADE,
    "condition" "TimerCondition" NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "targetDuration" INTEGER NOT NULL,
    "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endTime" TIMESTAMP WITH TIME ZONE,
    "actualDuration" INTEGER,
    "completedFullSession" BOOLEAN NOT NULL DEFAULT FALSE,
    "overrunAmount" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "Session_participantId_sessionNumber_unique" UNIQUE ("participantId", "sessionNumber")
);

-- PostSessionRating table
CREATE TABLE "PostSessionRating" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionId" UUID NOT NULL UNIQUE REFERENCES "Session"("id") ON DELETE CASCADE,
    "perceivedStress" INTEGER NOT NULL CHECK ("perceivedStress" BETWEEN 1 AND 5),
    "easeOfFollowing" INTEGER NOT NULL CHECK ("easeOfFollowing" BETWEEN 1 AND 5),
    "subjectiveFocusQuality" INTEGER CHECK ("subjectiveFocusQuality" BETWEEN 1 AND 5),
    "comments" TEXT,
    "completedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- PostTreatmentSurvey table
CREATE TABLE "PostTreatmentSurvey" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "participantId" UUID NOT NULL UNIQUE REFERENCES "Participant"("id") ON DELETE CASCADE,
    "preferredTimer" "TimerPreference" NOT NULL,
    "qualitativeFeedback" TEXT NOT NULL,
    "wouldUseAgain" BOOLEAN,
    "recommendToOthers" BOOLEAN,
    "completedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX "Participant_createdAt_idx" ON "Participant"("createdAt");
CREATE INDEX "Participant_accessCode_idx" ON "Participant"("accessCode");
CREATE INDEX "BaselineSurvey_participantId_idx" ON "BaselineSurvey"("participantId");
CREATE INDEX "Session_participantId_sessionNumber_idx" ON "Session"("participantId", "sessionNumber");
CREATE INDEX "Session_condition_idx" ON "Session"("condition");
CREATE INDEX "PostSessionRating_sessionId_idx" ON "PostSessionRating"("sessionId");
CREATE INDEX "PostTreatmentSurvey_participantId_idx" ON "PostTreatmentSurvey"("participantId");

-- Trigger to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_participant_updated_at
    BEFORE UPDATE ON "Participant"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE "Participant" IS 'Anonymous participant records with access codes for session resumption';
COMMENT ON TABLE "BaselineSurvey" IS 'Pre-experiment baseline survey measuring time anxiety and focus habits';
COMMENT ON TABLE "Session" IS 'Individual 25-minute focus sessions with automated timing data';
COMMENT ON TABLE "PostSessionRating" IS 'Post-session ratings collected immediately after each session';
COMMENT ON TABLE "PostTreatmentSurvey" IS 'Final survey collected after all 8 sessions are complete';

COMMENT ON COLUMN "Participant"."accessCode" IS 'Unique access code in format MIDS-XXXX-YYYY for participant persistence';
COMMENT ON COLUMN "Participant"."emailCollectedAt" IS 'Timestamp when email was provided (email stored in separate recruitment DB)';
COMMENT ON COLUMN "Participant"."conditionSequence" IS 'Pre-randomized array of 8 timer conditions for perfect counterbalancing';
COMMENT ON COLUMN "Session"."actualDuration" IS 'Calculated duration in seconds (endTime - startTime)';
COMMENT ON COLUMN "Session"."completedFullSession" IS 'True if participant reached target duration (25 minutes)';
COMMENT ON COLUMN "Session"."overrunAmount" IS 'Seconds past target duration, null if stopped early';

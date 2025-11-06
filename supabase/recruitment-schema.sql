-- Recruitment Database Schema
-- DATASCI 241 - Focus Timer Study
-- Separate database for PII (email addresses) - IRB compliant data separation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- RecruitmentRecord table
-- Stores participant emails and reminder tracking
-- Completely separate from experiment data for privacy
CREATE TABLE "RecruitmentRecord" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "participantId" UUID NOT NULL UNIQUE, -- Links to Participant.id in experiment DB
    "email" TEXT NOT NULL UNIQUE, -- Ensure one email per participant (prevent duplicates)
    "accessCode" TEXT NOT NULL, -- Duplicated for convenience (from Participant table)

    -- Tracking fields
    "consentedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "sessionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "lastReminderSent" TIMESTAMP WITH TIME ZONE,
    "reminderCount" INTEGER NOT NULL DEFAULT 0,

    -- Unsubscribe/withdrawal tracking
    "unsubscribedFromReminders" BOOLEAN NOT NULL DEFAULT FALSE,
    "unsubscribedAt" TIMESTAMP WITH TIME ZONE,
    "withdrawnAt" TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX "RecruitmentRecord_participantId_idx" ON "RecruitmentRecord"("participantId");
CREATE INDEX "RecruitmentRecord_email_idx" ON "RecruitmentRecord"("email");
CREATE INDEX "RecruitmentRecord_accessCode_idx" ON "RecruitmentRecord"("accessCode");
CREATE INDEX "RecruitmentRecord_sessionsCompleted_idx" ON "RecruitmentRecord"("sessionsCompleted");
CREATE INDEX "RecruitmentRecord_lastReminderSent_idx" ON "RecruitmentRecord"("lastReminderSent");
CREATE INDEX "RecruitmentRecord_createdAt_idx" ON "RecruitmentRecord"("createdAt");

-- Composite indexes for common queries
CREATE INDEX "RecruitmentRecord_reminder_eligible_idx"
    ON "RecruitmentRecord"("sessionsCompleted", "lastReminderSent", "unsubscribedFromReminders", "withdrawnAt");

-- Trigger to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recruitment_record_updated_at
    BEFORE UPDATE ON "RecruitmentRecord"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE "RecruitmentRecord" IS 'Participant email addresses and reminder tracking - CONTAINS PII, separate from experiment data';
COMMENT ON COLUMN "RecruitmentRecord"."participantId" IS 'UUID linking to Participant table in experiment database';
COMMENT ON COLUMN "RecruitmentRecord"."email" IS 'Participant email address - only field containing PII';
COMMENT ON COLUMN "RecruitmentRecord"."accessCode" IS 'Duplicated from Participant table for convenience in reminder emails';
COMMENT ON COLUMN "RecruitmentRecord"."sessionsCompleted" IS 'Cached count of completed sessions, synced from experiment DB';
COMMENT ON COLUMN "RecruitmentRecord"."lastReminderSent" IS 'Timestamp of most recent reminder email sent';
COMMENT ON COLUMN "RecruitmentRecord"."reminderCount" IS 'Total number of reminder emails sent to this participant';
COMMENT ON COLUMN "RecruitmentRecord"."unsubscribedFromReminders" IS 'True if participant opted out of reminder emails only';
COMMENT ON COLUMN "RecruitmentRecord"."withdrawnAt" IS 'Timestamp when participant fully withdrew from study';

-- Row Level Security (RLS) policies
-- Enable RLS on the table
ALTER TABLE "RecruitmentRecord" ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role has full access"
    ON "RecruitmentRecord"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated users (API) can read/insert/update
CREATE POLICY "API can manage recruitment records"
    ON "RecruitmentRecord"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Anonymous users cannot access
CREATE POLICY "Anonymous users cannot access"
    ON "RecruitmentRecord"
    FOR ALL
    TO anon
    USING (false);

-- View for reminder eligibility (used by reminder management page)
CREATE OR REPLACE VIEW "ReminderEligibility" AS
SELECT
    "id",
    "participantId",
    "email",
    "accessCode",
    "sessionsCompleted",
    "lastReminderSent",
    "reminderCount",
    "createdAt",
    "unsubscribedFromReminders",
    "withdrawnAt",
    -- Calculate days since registration
    EXTRACT(DAY FROM (NOW() - "createdAt")) AS "daysSinceRegistration",
    -- Calculate days since last reminder
    CASE
        WHEN "lastReminderSent" IS NULL THEN NULL
        ELSE EXTRACT(DAY FROM (NOW() - "lastReminderSent"))
    END AS "daysSinceLastReminder",
    -- Determine which reminder they need (if any)
    CASE
        WHEN "withdrawnAt" IS NOT NULL THEN 'WITHDRAWN'
        WHEN "unsubscribedFromReminders" = true THEN 'UNSUBSCRIBED'
        WHEN "sessionsCompleted" >= 2 THEN 'COMPLETE'
        WHEN "sessionsCompleted" = 0 AND EXTRACT(DAY FROM (NOW() - "createdAt")) >= 2 AND ("lastReminderSent" IS NULL OR "lastReminderSent" < NOW() - INTERVAL '1 day') THEN 'DAY_2'
        WHEN "sessionsCompleted" = 1 AND EXTRACT(DAY FROM (NOW() - "createdAt")) >= 5 AND ("lastReminderSent" IS NULL OR "lastReminderSent" < NOW() - INTERVAL '2 days') THEN 'DAY_5'
        ELSE 'NONE'
    END AS "recommendedReminder"
FROM "RecruitmentRecord";

COMMENT ON VIEW "ReminderEligibility" IS 'Calculated view showing which participants need reminders based on session progress and time elapsed';

-- Grant access to the view
GRANT SELECT ON "ReminderEligibility" TO service_role, authenticated;

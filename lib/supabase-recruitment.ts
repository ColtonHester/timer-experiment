import { createClient } from '@supabase/supabase-js'

// Recruitment database types
export interface RecruitmentRecord {
  id: string
  participantId: string
  email: string
  accessCode: string
  consentedAt: string
  sessionsCompleted: number
  lastReminderSent: string | null
  reminderCount: number
  unsubscribedFromReminders: boolean
  unsubscribedAt: string | null
  withdrawnAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ReminderEligibility extends RecruitmentRecord {
  daysSinceRegistration: number
  daysSinceLastReminder: number | null
  recommendedReminder: 'DAY_3' | 'DAY_7' | 'DAY_14' | 'COMPLETE' | 'WITHDRAWN' | 'UNSUBSCRIBED' | 'NONE'
}

// Database interface for type safety
export interface RecruitmentDatabase {
  RecruitmentRecord: RecruitmentRecord
  ReminderEligibility: ReminderEligibility
}

// Initialize Supabase client for recruitment database
// This connects to a SEPARATE Supabase project from the experiment database
// to maintain IRB-compliant separation of PII (emails) from research data
const supabaseUrl = process.env.SUPABASE_RECRUITMENT_URL || ''
const supabaseKey = process.env.SUPABASE_RECRUITMENT_SERVICE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase recruitment credentials not configured. Email sync will be disabled.')
}

export const supabaseRecruitment = createClient(supabaseUrl, supabaseKey)

// Helper functions for common operations

/**
 * Create a new recruitment record (called when participant completes baseline)
 */
export async function createRecruitmentRecord(data: {
  participantId: string
  email: string
  accessCode: string
}) {
  const { data: record, error } = await supabaseRecruitment
    .from('RecruitmentRecord')
    .insert({
      participantId: data.participantId,
      email: data.email.toLowerCase().trim(),
      accessCode: data.accessCode,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating recruitment record:', error)
    throw error
  }

  return record
}

/**
 * Update session count for a participant (called after each session)
 */
export async function updateSessionCount(participantId: string, sessionCount: number) {
  const { error } = await supabaseRecruitment
    .from('RecruitmentRecord')
    .update({ sessionsCompleted: sessionCount })
    .eq('participantId', participantId)

  if (error) {
    console.error('Error updating session count:', error)
    throw error
  }
}

/**
 * Get reminder eligibility view for all participants
 */
export async function getReminderEligibility(filter?: {
  reminderType?: 'DAY_3' | 'DAY_7' | 'DAY_14'
  excludeComplete?: boolean
  excludeWithdrawn?: boolean
}) {
  let query = supabaseRecruitment
    .from('ReminderEligibility')
    .select('*')
    .order('createdAt', { ascending: false })

  // Apply filters
  if (filter?.reminderType) {
    query = query.eq('recommendedReminder', filter.reminderType)
  }

  if (filter?.excludeComplete) {
    query = query.neq('recommendedReminder', 'COMPLETE')
  }

  if (filter?.excludeWithdrawn) {
    query = query.is('withdrawnAt', null)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching reminder eligibility:', error)
    throw error
  }

  return data as ReminderEligibility[]
}

/**
 * Get a single recruitment record by participant ID
 */
export async function getRecruitmentRecord(participantId: string) {
  const { data, error } = await supabaseRecruitment
    .from('RecruitmentRecord')
    .select('*')
    .eq('participantId', participantId)
    .single()

  if (error) {
    console.error('Error fetching recruitment record:', error)
    throw error
  }

  return data as RecruitmentRecord
}

/**
 * Mark that a reminder was sent
 */
export async function markReminderSent(participantId: string) {
  // First get current reminder count
  const { data: current } = await supabaseRecruitment
    .from('RecruitmentRecord')
    .select('reminderCount')
    .eq('participantId', participantId)
    .single()

  const { error } = await supabaseRecruitment
    .from('RecruitmentRecord')
    .update({
      lastReminderSent: new Date().toISOString(),
      reminderCount: (current?.reminderCount || 0) + 1,
    })
    .eq('participantId', participantId)

  if (error) {
    console.error('Error marking reminder sent:', error)
    throw error
  }
}

/**
 * Unsubscribe from reminders (but don't withdraw from study)
 */
export async function unsubscribeFromReminders(participantId: string) {
  const { error } = await supabaseRecruitment
    .from('RecruitmentRecord')
    .update({
      unsubscribedFromReminders: true,
      unsubscribedAt: new Date().toISOString(),
    })
    .eq('participantId', participantId)

  if (error) {
    console.error('Error unsubscribing from reminders:', error)
    throw error
  }
}

/**
 * Withdraw from study completely
 */
export async function withdrawFromStudy(participantId: string) {
  const { error } = await supabaseRecruitment
    .from('RecruitmentRecord')
    .update({
      withdrawnAt: new Date().toISOString(),
      unsubscribedFromReminders: true,
      unsubscribedAt: new Date().toISOString(),
    })
    .eq('participantId', participantId)

  if (error) {
    console.error('Error withdrawing from study:', error)
    throw error
  }
}

/**
 * Get recruitment statistics for admin dashboard
 */
export async function getRecruitmentStats() {
  const { data, error } = await supabaseRecruitment
    .from('RecruitmentRecord')
    .select('*')

  if (error) {
    console.error('Error fetching recruitment stats:', error)
    throw error
  }

  const records = data as RecruitmentRecord[]

  return {
    totalWithEmails: records.length,
    unsubscribed: records.filter(r => r.unsubscribedFromReminders).length,
    withdrawn: records.filter(r => r.withdrawnAt !== null).length,
    activeParticipants: records.filter(r => !r.unsubscribedFromReminders && !r.withdrawnAt).length,
    averageSessionsCompleted: records.length > 0
      ? records.reduce((sum, r) => sum + r.sessionsCompleted, 0) / records.length
      : 0,
    totalRemindersSent: records.reduce((sum, r) => sum + r.reminderCount, 0),
  }
}

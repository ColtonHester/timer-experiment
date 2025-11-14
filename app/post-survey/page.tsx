'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Loader2, Trophy } from 'lucide-react'
import { useBeforeUnload } from '@/hooks/useBeforeUnload'

export default function PostTreatmentSurveyPage() {
  const router = useRouter()
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    preferredTimer: '',
    qualitativeFeedback: '',
    wouldUseAgain: '',
    recommendToOthers: '',
  })

  // Warn user before closing tab if they haven't submitted yet
  useBeforeUnload(!submitted && !loading && !!participantId, 'Your final survey has not been submitted yet. Are you sure you want to leave?')

  useEffect(() => {
    const id = localStorage.getItem('participantId')
    if (!id) {
      router.push('/')
      return
    }
    setParticipantId(id)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/surveys/post-treatment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          preferredTimer: formData.preferredTimer,
          qualitativeFeedback: formData.qualitativeFeedback,
          wouldUseAgain: formData.wouldUseAgain === 'yes',
          recommendToOthers: formData.recommendToOthers === 'yes',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit survey')
      }

      setSubmitted(true) // Mark as submitted to disable beforeunload warning
      // Navigate to thank you page
      router.push('/thank-you')
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('Failed to submit survey. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full"
      >
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-3xl text-center">Final Survey</CardTitle>
            <CardDescription className="text-center text-base">
              Congratulations on completing all sessions! Please share your overall experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Timer Preference */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Which timer style did you prefer overall?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'COUNTDOWN', label: 'Countdown Timer (with numbers)' },
                    { value: 'HOURGLASS', label: 'Hourglass Visualization (no numbers)' },
                    { value: 'NO_PREFERENCE', label: 'No preference / Both were similar' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="preferredTimer"
                        value={option.value}
                        checked={formData.preferredTimer === option.value}
                        onChange={(e) =>
                          setFormData({ ...formData, preferredTimer: e.target.value })
                        }
                        required
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Qualitative Feedback */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Please describe your experience with both timer styles. What did you notice
                  about how each one affected your focus?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={formData.qualitativeFeedback}
                  onChange={(e) =>
                    setFormData({ ...formData, qualitativeFeedback: e.target.value })
                  }
                  required
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Share your thoughts about the countdown timer vs. the hourglass visualization..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Consider: Did one feel more/less stressful? Did you lose track of time more with
                  one? Did either help you focus better?
                </p>
              </div>

              {/* Would Use Again */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Would you use this timer app again for your own work?
                </label>
                <div className="flex gap-4">
                  {['yes', 'no'].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors flex-1"
                    >
                      <input
                        type="radio"
                        name="wouldUseAgain"
                        value={option}
                        checked={formData.wouldUseAgain === option}
                        onChange={(e) =>
                          setFormData({ ...formData, wouldUseAgain: e.target.value })
                        }
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Recommend to Others */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Would you recommend this app to other students?
                </label>
                <div className="flex gap-4">
                  {['yes', 'no'].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors flex-1"
                    >
                      <input
                        type="radio"
                        name="recommendToOthers"
                        value={option}
                        checked={formData.recommendToOthers === option}
                        onChange={(e) =>
                          setFormData({ ...formData, recommendToOthers: e.target.value })
                        }
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Final Survey'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

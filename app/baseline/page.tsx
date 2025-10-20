'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function BaselineSurveyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    timeAnxietyScore: 3,
    typicalFocusDuration: 25,
    unitsEnrolled: '',
    usesTimerCurrently: '',
    preferredTimerType: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/surveys/baseline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeAnxietyScore: formData.timeAnxietyScore,
          typicalFocusDuration: formData.typicalFocusDuration,
          unitsEnrolled: formData.unitsEnrolled ? parseInt(formData.unitsEnrolled) : null,
          usesTimerCurrently: formData.usesTimerCurrently === 'yes',
          preferredTimerType: formData.preferredTimerType || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit survey')
      }

      const { participantId } = await response.json()

      // Store participant ID in localStorage for this browser session
      localStorage.setItem('participantId', participantId)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('Failed to submit survey. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const likertScale = [
    { value: 1, label: '1 - Not at all' },
    { value: 2, label: '2 - Slightly' },
    { value: 3, label: '3 - Moderately' },
    { value: 4, label: '4 - Quite a bit' },
    { value: 5, label: '5 - Extremely' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-3xl">Baseline Survey</CardTitle>
            <CardDescription>
              Tell us about your current focus habits (takes ~2 minutes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Time Anxiety Question */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  How anxious do you typically feel about time passing while working?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="space-y-2">
                  {likertScale.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="timeAnxiety"
                        value={option.value}
                        checked={formData.timeAnxietyScore === option.value}
                        onChange={() =>
                          setFormData({ ...formData, timeAnxietyScore: option.value })
                        }
                        required
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Typical Focus Duration */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  What is your typical focus session length (in minutes)?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={formData.typicalFocusDuration}
                  onChange={(e) =>
                    setFormData({ ...formData, typicalFocusDuration: parseInt(e.target.value) })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="e.g., 25"
                />
                <p className="text-xs text-gray-500">
                  How long can you typically work before needing a break?
                </p>
              </div>

              {/* Units Enrolled (Optional) */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  How many units are you enrolled in this semester?
                  <span className="text-gray-400 ml-1">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.unitsEnrolled}
                  onChange={(e) =>
                    setFormData({ ...formData, unitsEnrolled: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="e.g., 12"
                />
              </div>

              {/* Current Timer Usage */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  Do you currently use a timer for focus work?
                </label>
                <div className="space-y-2">
                  {['yes', 'no'].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="usesTimer"
                        value={option}
                        checked={formData.usesTimerCurrently === option}
                        onChange={(e) =>
                          setFormData({ ...formData, usesTimerCurrently: e.target.value })
                        }
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Timer Type (if they use timers) */}
              {formData.usesTimerCurrently === 'yes' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    What type of timer do you typically use?
                  </label>
                  <input
                    type="text"
                    value={formData.preferredTimerType}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredTimerType: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
                    placeholder="e.g., Pomodoro app, phone timer, etc."
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Continue to Dashboard'
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

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function RatingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [formData, setFormData] = useState({
    perceivedStress: 3,
    easeOfFollowing: 3,
    subjectiveFocusQuality: 3,
    comments: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/surveys/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit rating')
      }

      // Navigate back to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const LikertQuestion = ({
    question,
    value,
    onChange,
    labels,
  }: {
    question: string
    value: number
    onChange: (value: number) => void
    labels: { low: string; high: string }
  }) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {question}
      </label>
      <div className="space-y-3">
        {/* Radio buttons */}
        <div className="flex items-center justify-between gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <label
              key={rating}
              className="flex-1 cursor-pointer"
            >
              <input
                type="radio"
                name={question}
                value={rating}
                checked={value === rating}
                onChange={() => onChange(rating)}
                className="sr-only"
              />
              <div
                className={`
                  flex items-center justify-center h-12 rounded-lg border-2 transition-all
                  ${
                    value === rating
                      ? 'border-primary bg-primary text-white shadow-md scale-105'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                  }
                `}
              >
                <span className="text-lg font-semibold">{rating}</span>
              </div>
            </label>
          ))}
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
          <span>{labels.low}</span>
          <span>{labels.high}</span>
        </div>
      </div>
    </div>
  )

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
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <CardTitle className="text-3xl text-center">Session Complete!</CardTitle>
            <CardDescription className="text-center">
              Please rate your experience (takes ~30 seconds)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Perceived Stress */}
              <LikertQuestion
                question="How stressful did you find this session?"
                value={formData.perceivedStress}
                onChange={(value) => setFormData({ ...formData, perceivedStress: value })}
                labels={{ low: 'Not stressful', high: 'Very stressful' }}
              />

              {/* Ease of Following */}
              <LikertQuestion
                question="How easy was it to follow the timer?"
                value={formData.easeOfFollowing}
                onChange={(value) => setFormData({ ...formData, easeOfFollowing: value })}
                labels={{ low: 'Very difficult', high: 'Very easy' }}
              />

              {/* Subjective Focus Quality */}
              <LikertQuestion
                question="How would you rate your focus during this session?"
                value={formData.subjectiveFocusQuality}
                onChange={(value) =>
                  setFormData({ ...formData, subjectiveFocusQuality: value })
                }
                labels={{ low: 'Poor focus', high: 'Excellent focus' }}
              />

              {/* Optional Comments */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Any additional comments? (Optional)
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Share any thoughts about this session..."
                />
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
                    'Submit & Continue'
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

export default function ConsentPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)

  const handleContinue = () => {
    if (agreed) {
      router.push('/baseline')
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
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-3xl">Informed Consent</CardTitle>
            <CardDescription>
              Please read the following information carefully before participating
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <h3 className="text-lg font-semibold">Study Purpose</h3>
              <p>
                This study investigates whether timer visualization (precise countdown vs.
                approximate hourglass) affects sustained focus duration during work sessions.
                You will complete 2 focus sessions using different timer styles.
              </p>

              <h3 className="text-lg font-semibold mt-4">What We'll Collect</h3>
              <ul className="space-y-2">
                <li>
                  <strong>Baseline information:</strong> Self-reported time anxiety and typical
                  focus duration
                </li>
                <li>
                  <strong>Session data:</strong> Start/stop times for each focus session
                  (automatically logged)
                </li>
                <li>
                  <strong>Ratings:</strong> Brief post-session ratings about stress and ease of
                  use
                </li>
                <li>
                  <strong>Feedback:</strong> Qualitative comments about your experience
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">Privacy & Anonymity</h3>
              <p>
                Your participation is <strong>completely anonymous</strong>. We do not collect
                any personally identifiable information (no names, emails, or IP addresses).
                You will be assigned a random ID number that cannot be traced back to you.
              </p>

              <h3 className="text-lg font-semibold mt-4">Voluntary Participation</h3>
              <p>
                Participation is entirely voluntary. You may withdraw at any time without
                penalty. If you withdraw, your data will be deleted upon request.
              </p>

              <h3 className="text-lg font-semibold mt-4">Time Commitment</h3>
              <p>
                The study requires 2 focus sessions (25 minutes each) which you can complete
                at your convenience. Each session includes a brief rating survey (~30 seconds).
              </p>

              <h3 className="text-lg font-semibold mt-4">Risks & Benefits</h3>
              <p>
                <strong>Risks:</strong> Minimal. You may experience mild eye strain from screen
                time, but you're free to take breaks.
              </p>
              <p>
                <strong>Benefits:</strong> You'll develop better focus habits, contribute to
                scientific research, and be entered into a raffle for a gift card.
              </p>

              <h3 className="text-lg font-semibold mt-4">Contact Information</h3>
              <p>
                If you have questions about this study, contact the research team at{' '}
                <a href="mailto:mids.timer.study@gmail.com" className="text-primary">
                  mids.timer.study@gmail.com
                </a>
              </p>
            </div>

            {/* Consent Checkbox */}
            <div className="border-t pt-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I have read and understood the information above. I voluntarily agree to
                  participate in this study. I understand that my participation is anonymous
                  and that I can withdraw at any time.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full sm:w-auto"
              >
                Go Back
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!agreed}
                className="w-full sm:w-auto"
              >
                {agreed && <CheckCircle2 className="w-4 h-4 mr-2" />}
                Continue to Survey
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

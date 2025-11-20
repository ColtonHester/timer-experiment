'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Gift, Mail } from 'lucide-react'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex items-center justify-center mb-6"
            >
              <div className="relative">
                <CheckCircle2 className="w-24 h-24 text-green-500" />
                <motion.div
                  className="absolute inset-0 w-24 h-24 rounded-full bg-green-500/20"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            <CardTitle className="text-4xl mb-4">Thank You!</CardTitle>
            <CardDescription className="text-lg">
              You've successfully completed the Focus Timer Study
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg text-green-900 dark:text-green-100 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Study Complete
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your participation has been invaluable to our research. You completed all 8
                focus sessions and provided detailed feedback that will help us understand how
                timer visualization affects sustained attention.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 flex items-center">
                <Gift className="w-5 h-5 mr-2" />
                Gift Card Raffle
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                You've been entered into our raffle for completing the study! Winners will be
                selected at random and notified via email within 3 weeks.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg text-purple-900 dark:text-purple-100 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Questions or Feedback?
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                If you have any questions about the study or would like to learn about the
                results when they're available, please contact us at{' '}
                <a
                  href="mailto:mids.timer.study@gmail.com"
                  className="underline font-medium"
                >
                  mids.timer.study@gmail.com
                </a>
              </p>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold mb-3">What Happens Next?</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-primary mr-2">1.</span>
                  <span>
                    Our team will analyze the data from all participants to identify patterns in
                    focus duration across timer types
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">2.</span>
                  <span>
                    We'll conduct statistical tests to determine if there's a causal effect of
                    timer visualization on sustained attention
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">3.</span>
                  <span>
                    Results will be presented in our final project for DATASCI 241 during Week 14
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">4.</span>
                  <span>
                    If you'd like to receive a summary of our findings, please email us to be
                    added to our results mailing list
                  </span>
                </li>
              </ul>
            </div>

            <div className="text-center pt-6 border-t">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This study was conducted by Group 4 in UC Berkeley's DATASCI 241
                <br />
                (Experiments and Causal Inference), Fall 2025, Section 3
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Ariel Gholar • Colton Hester • Jeremy Liu • Nitya Sree Cheera
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Clock, Target, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Clock className="w-16 h-16 mx-auto text-primary" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Focus Timer Study
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Help us understand how timer visualizations affect sustained focus and productivity
          </p>
        </div>

        {/* Study Overview Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>About This Study</CardTitle>
            <CardDescription>
              UC Berkeley DATASCI 241 - Experiments and Causal Inference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              We're investigating whether the design of a timer influences how long you can
              sustain focused work. You'll use two different timer styles across multiple
              25-minute focus sessions and share brief feedback about your experience.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Time Commitment</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    At least 8 focus sessions over several days
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Session Length</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    25 minutes per session (Pomodoro-style)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Benefits</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Improve your focus habits + enter raffle
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Privacy</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fully anonymous - no personal data collected
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Do Section */}
        <Card>
          <CardHeader>
            <CardTitle>What You'll Do</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
              <li>Complete a brief baseline survey about your focus habits</li>
              <li>Use our timer app for your regular study sessions (at least 2 per day)</li>
              <li>Experience both timer styles (you'll be automatically assigned each session)</li>
              <li>Provide quick ratings after each session (takes ~30 seconds)</li>
              <li>Share final feedback about your experience</li>
            </ol>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/consent">
            <Button size="xl" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>

          <Link href="/about">
            <Button size="xl" variant="outline" className="w-full sm:w-auto">
              Learn More
            </Button>
          </Link>
        </motion.div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          This study is conducted by students in UC Berkeley's MIDS program as part of
          DATASCI 241. All data is collected anonymously and used solely for academic research.
        </p>
      </motion.div>
    </div>
  )
}

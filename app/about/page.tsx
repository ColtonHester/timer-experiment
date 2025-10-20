'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Users, Target, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">About This Study</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Understanding how timer visualization affects sustained focus and productivity
          </p>
        </motion.div>

        {/* Research Question */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-6 h-6 mr-2 text-primary" />
              Research Question
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-lg">
              Can the visualization of time influence how long individuals sustain focused work?
            </p>
            <p>
              We investigate whether the design of a timer shapes persistence by comparing two
              framings of the same 25-minute interval:
            </p>
            <ul>
              <li>
                <strong>Control:</strong> Conventional countdown timer with precise numeric
                feedback (mm:ss)
              </li>
              <li>
                <strong>Treatment:</strong> Hourglass visualization with only approximate sense
                of time (no numbers)
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Theory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-primary" />
              Theoretical Foundation
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Our hypothesis is grounded in behavioral research showing that the framing of
              identical information can meaningfully shift human behavior (Kahneman & Tversky,
              1979). Work on "choice architecture" demonstrates how subtle design features nudge
              decisions without changing incentives (Thaler & Sunstein, 2008).
            </p>
            <p>
              Applied to our context, timers function as a form of choice architecture: a
              countdown foregrounds scarcity and temporal precision, while an hourglass softens
              time's salience. Research on time perception shows that monitoring time competes
              with task attention and reduces persistence (Zakay & Block, 1997).
            </p>
          </CardContent>
        </Card>

        {/* Experiment Design */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-primary" />
              Experiment Design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Within-Subjects Design</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Each participant experiences both conditions (countdown and hourglass) across
                multiple sessions. This approach reduces between-subject variability and ensures
                individual differences are balanced across conditions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Randomization</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Timer conditions are randomized at the session level with counterbalancing to
                ensure equal exposure (4 sessions each) and alternating patterns to minimize
                carryover effects.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Data Collection</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                We measure actual work duration via automated timestamp logging, eliminating
                self-report bias. Additional measures include perceived stress, ease of following
                the timer, and qualitative feedback.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-6 h-6 mr-2 text-primary" />
              Research Team
            </CardTitle>
            <CardDescription>
              UC Berkeley DATASCI 241, Fall 2025, Section 3, Group 4
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {['Ariel Gholar', 'Colton Hester', 'Jeremy Liu', 'Nitya Sree Cheera'].map(
                (name) => (
                  <div
                    key={name}
                    className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                  >
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      MIDS Student, UC Berkeley
                    </p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* References */}
        <Card>
          <CardHeader>
            <CardTitle>Key References</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <ul className="text-xs space-y-2">
              <li>
                Kahneman, D., & Tversky, A. (1979). Prospect theory: An analysis of decision
                under risk. <em>Econometrica, 47</em>(2), 263-291.
              </li>
              <li>
                Thaler, R. H., & Sunstein, C. R. (2008). <em>Nudge: Improving decisions about
                health, wealth, and happiness</em>. Yale University Press.
              </li>
              <li>
                Zakay, D., & Block, R. A. (1997). Temporal cognition. <em>Current Directions in
                Psychological Science, 6</em>(1), 12-16.
              </li>
              <li>
                Harrison, C., Yeo, Z., & Hudson, S. (2010). Faster Progress Bars: Manipulating
                Perceived Duration with Visual Augmentations.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link href="/consent">
            <Button size="lg">
              Participate in This Study
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

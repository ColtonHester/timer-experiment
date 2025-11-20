'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, Mail, LogOut } from 'lucide-react'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const participantId = searchParams.get('participantId')

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    type?: 'reminders' | 'withdraw'
    message?: string
  } | null>(null)

  const handleUnsubscribe = async (type: 'reminders' | 'withdraw') => {
    if (!participantId) {
      alert('Invalid unsubscribe link')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/recruitment/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          type,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          success: true,
          type,
          message: data.message,
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to process request',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Show error if no participant ID
  if (!participantId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <CardTitle className="text-gray-900 dark:text-white">Invalid Link</CardTitle>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              This unsubscribe link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If you need assistance, please contact the research team at mids.timer.study@gmail.com
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show result after action
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className={`flex items-center gap-2 ${result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.success ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              <CardTitle className="text-gray-900 dark:text-white">{result.success ? 'Confirmed' : 'Error'}</CardTitle>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {result.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.success && result.type === 'reminders' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>You can still complete your sessions!</strong>
                  <br />
                  <br />
                  You won't receive any more reminder emails, but you can still access the study using your access code at any time.
                </p>
              </div>
            )}

            {result.success && result.type === 'withdraw' && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  Thank you for your time and participation in our research. If you change your mind, please contact us at mids.timer.study@gmail.com
                </p>
              </div>
            )}

            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show unsubscribe options
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white">Email Preferences</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            UC Berkeley DATASCI 241 - Focus Timer Study
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            We're sorry to see you go! Please choose how you'd like to proceed:
          </p>

          {/* Option 1: Stop Reminders Only */}
          <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-600 transition-colors">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Stop Reminder Emails Only</CardTitle>
                  <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                    You'll stop receiving reminder emails, but you can still complete your study sessions using your access code.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-900 dark:text-green-100">
                  <strong>✓ Recommended if:</strong> You want to continue the study at your own pace without email reminders
                </p>
              </div>
              <Button
                onClick={() => handleUnsubscribe('reminders')}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
              >
                {loading ? 'Processing...' : 'Stop Emails, Keep Study Access'}
              </Button>
            </CardContent>
          </Card>

          {/* Option 2: Withdraw Completely */}
          <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-600 transition-colors">
            <CardHeader>
              <div className="flex items-start gap-3">
                <LogOut className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Withdraw from Study</CardTitle>
                  <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                    You'll be removed from the study completely. You won't receive emails and won't be able to complete more sessions.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-900 dark:text-red-100">
                  <strong>⚠️ Important:</strong> This action cannot be undone. Your partial data will be retained for research purposes, but you won't be able to complete the study.
                </p>
              </div>
              <Button
                onClick={() => handleUnsubscribe('withdraw')}
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                {loading ? 'Processing...' : 'Withdraw from Study'}
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p>
              Questions? Contact us at{' '}
              <a href="mailto:mids.timer.study@gmail.com" className="text-primary hover:underline">
                mids.timer.study@gmail.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Loader2, Key, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      })

      const data = await response.json()

      if (!response.ok || !data.valid) {
        setError(data.error || 'Invalid access code. Please check and try again.')
        setLoading(false)
        return
      }

      // Store participant ID in localStorage
      localStorage.setItem('participantId', data.participantId)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Error verifying access code:', err)
      setError('Failed to verify access code. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Welcome Back!</CardTitle>
            <CardDescription>
              Enter your access code to continue your study sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Access Code Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  Access Code
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value.toUpperCase())
                    setError('')
                  }}
                  placeholder="MIDS-XXXX-YYYY"
                  required
                  maxLength={14}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 font-mono text-lg text-center tracking-wider"
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Format: MIDS-XXXX-YYYY (e.g., MIDS-A7B3-C9X2)
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button type="submit" size="lg" disabled={loading || !accessCode} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Continue to Dashboard'
                )}
              </Button>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>Don't have an access code yet?</p>
                <Link href="/consent" className="text-primary hover:underline font-medium">
                  Start the study →
                </Link>
              </div>

              {/* Lost Code Help */}
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  <strong>Can't find your code?</strong> Check your email or contact the study coordinator.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

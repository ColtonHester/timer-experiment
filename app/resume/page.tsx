'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Resume Page - Auto-login via URL parameter
 *
 * Usage: /resume?code=MIDS-A7B3-C9X2
 *
 * This page automatically verifies the access code from the URL
 * and redirects to the dashboard if valid.
 */
function ResumeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      // No code provided, redirect to login page
      router.push('/login')
      return
    }

    verifyAndResume(code)
  }, [searchParams, router])

  const verifyAndResume = async (code: string) => {
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: code }),
      })

      const data = await response.json()

      if (!response.ok || !data.valid) {
        setError('Invalid or expired access code. Redirecting to login...')
        setTimeout(() => router.push('/login'), 3000)
        return
      }

      // Store participant ID in localStorage
      localStorage.setItem('participantId', data.participantId)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Error verifying access code:', err)
      setError('Failed to verify access code. Redirecting to login...')
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Verification Failed</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Verifying Access Code</h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we log you in...</p>
      </motion.div>
    </div>
  )
}

export default function ResumePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    }>
      <ResumeContent />
    </Suspense>
  )
}

import { useEffect } from 'react'

/**
 * Hook to warn users before closing the browser tab/window
 * Prevents accidental data loss during active sessions or incomplete surveys
 *
 * @param shouldWarn - Boolean to enable/disable the warning
 * @param message - Optional custom message (most browsers ignore this and show their own)
 */
export function useBeforeUnload(shouldWarn: boolean, message?: string) {
  useEffect(() => {
    if (!shouldWarn) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Modern browsers ignore custom messages and show their own
      // But we need to set returnValue for the dialog to appear
      event.preventDefault()
      event.returnValue = message || 'Are you sure you want to leave? Your progress may be lost.'
      return event.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [shouldWarn, message])
}

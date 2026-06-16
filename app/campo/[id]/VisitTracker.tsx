'use client'

import { useEffect } from 'react'

export default function VisitTracker({ campoId }: { campoId: string }) {
  useEffect(() => {
    let referrerPath: string | null = null
    try {
      if (document.referrer) {
        const url = new URL(document.referrer)
        if (url.origin === window.location.origin) {
          referrerPath = url.pathname
        }
      }
    } catch {
      referrerPath = null
    }

    fetch('/api/visitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campoId, referrerPath: referrerPath && referrerPath !== '/' ? referrerPath : null }),
    }).catch(() => {})
  }, [campoId])
  return null
}

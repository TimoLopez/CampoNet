'use client'

import { useEffect } from 'react'

export default function VisitTracker({ campoId }: { campoId: string }) {
  useEffect(() => {
    fetch('/api/visitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campoId }),
    }).catch(() => {})
  }, [campoId])
  return null
}

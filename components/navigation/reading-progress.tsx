'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const currentPosition = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const percentage = (currentPosition / scrollHeight) * 100
      setProgress(Math.min(100, Math.max(0, percentage)))
    }

    window.addEventListener('scroll', updateProgress)
    updateProgress()

    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <Progress
      value={progress}
      className='fixed left-0 right-0 top-0 z-50 h-1 rounded-none'
      aria-label='Reading progress'
    />
  )
}

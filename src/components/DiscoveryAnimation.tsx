import { useEffect } from 'react'

interface Props {
  plantName: string
  category: string
  imageUrl: string
  onComplete: () => void
}

export default function DiscoveryAnimation({ onComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 100)
    return () => clearTimeout(timer)
  }, [onComplete])
  return null
}

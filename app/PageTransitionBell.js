'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const BELL_SOUND = '/audio/page-transition-bell.mp3?v=2'

export default function PageTransitionBell() {
  const pathname = usePathname()
  const previousPath = useRef(pathname)
  const audio = useRef(null)
  const lastPlayedAt = useRef(0)

  const playBell = useCallback(() => {
    const bell = audio.current
    if (!bell) return

    bell.pause()
    bell.currentTime = 0
    lastPlayedAt.current = performance.now()
    bell.play().catch(() => {})
  }, [])

  useEffect(() => {
    const bell = new Audio(BELL_SOUND)
    bell.preload = 'auto'
    bell.volume = 0.72
    audio.current = bell

    const playOnInternalNavigation = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target.closest('a[href]')
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return

      const destination = new URL(link.href, window.location.href)
      const current = new URL(window.location.href)
      if (destination.origin !== current.origin || `${destination.pathname}${destination.search}` === `${current.pathname}${current.search}`) return

      playBell()
    }

    document.addEventListener('click', playOnInternalNavigation, true)

    return () => {
      document.removeEventListener('click', playOnInternalNavigation, true)
      bell.pause()
      audio.current = null
    }
  }, [playBell])

  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname

    if (performance.now() - lastPlayedAt.current < 700) return
    playBell()
  }, [pathname, playBell])

  return null
}

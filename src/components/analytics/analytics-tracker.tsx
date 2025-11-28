'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface AnalyticsTrackerProps {
    profileId: string
}

export function AnalyticsTracker({ profileId }: AnalyticsTrackerProps) {
    const pathname = usePathname()
    const startTimeRef = useRef<number>(Date.now())
    const visitorIdRef = useRef<string>('')
    const sessionIdRef = useRef<string>('')

    useEffect(() => {
        // Get or create visitor ID (persistent across sessions)
        let visitorId = localStorage.getItem('biztree_visitor_id')
        if (!visitorId) {
            visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            localStorage.setItem('biztree_visitor_id', visitorId)
        }
        visitorIdRef.current = visitorId

        // Get or create session ID (expires after 30 minutes of inactivity)
        let sessionId = sessionStorage.getItem('biztree_session_id')
        const lastActivity = sessionStorage.getItem('biztree_last_activity')
        const now = Date.now()

        if (!sessionId || !lastActivity || (now - parseInt(lastActivity)) > 30 * 60 * 1000) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            sessionStorage.setItem('biztree_session_id', sessionId)
        }
        sessionStorage.setItem('biztree_last_activity', now.toString())
        sessionIdRef.current = sessionId
    }, [])

    useEffect(() => {
        // Reset start time when pathname changes
        startTimeRef.current = Date.now()

        // Track page view
        const trackPageView = async () => {
            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        profileId,
                        visitorId: visitorIdRef.current,
                        sessionId: sessionIdRef.current,
                        path: pathname,
                        referrer: document.referrer || null,
                        userAgent: navigator.userAgent,
                    }),
                })
            } catch (error) {
                console.error('Failed to track page view:', error)
            }
        }

        if (visitorIdRef.current && sessionIdRef.current) {
            trackPageView()
        }

        // Track time spent when user leaves the page
        const handleBeforeUnload = async () => {
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)

            // Use sendBeacon for reliable tracking on page unload
            navigator.sendBeacon(
                '/api/analytics/time',
                JSON.stringify({
                    profileId,
                    visitorId: visitorIdRef.current,
                    sessionId: sessionIdRef.current,
                    path: pathname,
                    timeSpent,
                })
            )
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            // Also track time when component unmounts (route change)
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
            if (timeSpent > 0) {
                fetch('/api/analytics/time', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        profileId,
                        visitorId: visitorIdRef.current,
                        sessionId: sessionIdRef.current,
                        path: pathname,
                        timeSpent,
                    }),
                }).catch(() => { })
            }
        }
    }, [pathname, profileId])

    return null // This component doesn't render anything
}

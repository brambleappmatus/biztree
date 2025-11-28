import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { UAParser } from 'ua-parser-js'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { profileId, visitorId, sessionId, path, referrer, userAgent } = body

        if (!profileId || !visitorId || !sessionId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Parse user agent
        const parser = new UAParser(userAgent)
        const result = parser.getResult()

        // Create page view record
        await prisma.pageView.create({
            data: {
                profileId,
                visitorId,
                sessionId,
                path: path || '/',
                referrer,
                userAgent,
                device: result.device.type || 'desktop',
                browser: result.browser.name || null,
                os: result.os.name || null,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Analytics tracking error:', error)
        return NextResponse.json(
            { error: 'Failed to track page view' },
            { status: 500 }
        )
    }
}

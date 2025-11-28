import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { profileId, visitorId, sessionId, path, timeSpent } = body

        if (!profileId || !visitorId || !sessionId || timeSpent === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Find the most recent page view for this session and path
        const pageView = await prisma.pageView.findFirst({
            where: {
                profileId,
                visitorId,
                sessionId,
                path: path || '/',
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        if (pageView) {
            // Update the time spent
            await prisma.pageView.update({
                where: { id: pageView.id },
                data: { timeSpent },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Analytics time tracking error:', error)
        return NextResponse.json(
            { error: 'Failed to track time' },
            { status: 500 }
        )
    }
}

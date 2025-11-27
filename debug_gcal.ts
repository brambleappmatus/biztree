// Debug script to check Google Calendar availability
// Run with: npx tsx debug_gcal.ts <serviceId> <date>

import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { parseISO, setHours, setMinutes } from 'date-fns';

const prisma = new PrismaClient();

function getGoogleCalendarClient(accessToken: string, refreshToken: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    return google.calendar({ version: 'v3', auth: oauth2Client });
}

async function checkGCal(serviceId: string, date: string) {
    console.log(`\n🔍 Checking GCal for Service ${serviceId} on ${date}`);

    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { profile: true },
    });

    if (!service) {
        console.error("❌ Service not found");
        return;
    }

    const profile = service.profile;
    if (!profile.googleAccessToken || !profile.googleRefreshToken) {
        console.log("⚠️ No Google Calendar tokens found");
        return;
    }

    console.log("✅ Tokens found");

    const selectedDate = parseISO(date);
    const start = setHours(setMinutes(selectedDate, 0), 0); // 00:00
    const end = setHours(setMinutes(selectedDate, 59), 23); // 23:59

    console.log(`📅 Checking range: ${start.toISOString()} - ${end.toISOString()}`);

    try {
        const calendar = getGoogleCalendarClient(profile.googleAccessToken, profile.googleRefreshToken);
        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin: start.toISOString(),
                timeMax: end.toISOString(),
                items: [{ id: 'primary' }],
            },
        });

        const busy = response.data.calendars?.primary?.busy;
        if (busy && busy.length > 0) {
            console.log("🚫 Busy slots found:");
            busy.forEach(b => {
                console.log(`   - ${b.start} to ${b.end}`);
            });
        } else {
            console.log("✅ No busy slots found in GCal");
        }
    } catch (error) {
        console.error("❌ GCal Error:", error);
    }
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: npx tsx debug_gcal.ts <serviceId> <date>");
} else {
    checkGCal(args[0], args[1]).catch(console.error).finally(() => prisma.$disconnect());
}

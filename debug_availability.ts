// Debug script to check availability logic
// Run with: npx tsx debug_availability.ts <serviceId> <date>

import { PrismaClient } from '@prisma/client';
import { parseISO, setHours, setMinutes, format, addDays } from 'date-fns';

const prisma = new PrismaClient();

async function getAvailability(serviceId: string, date: string) {
    console.log(`\n🔍 Checking availability for Service ${serviceId} on ${date}`);

    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { profile: { include: { hours: true } } },
    });

    if (!service) {
        console.error("❌ Service not found");
        return;
    }

    console.log(`✅ Service found: ${service.name} (${service.duration} min)`);
    const profile = service.profile;
    console.log(`👤 Profile: ${profile.name} (ID: ${profile.id})`);

    const selectedDate = parseISO(date);
    const dayOfWeek = selectedDate.getDay();
    console.log(`📅 Parsed date: ${selectedDate.toISOString()}`);
    console.log(`📆 Day of week: ${dayOfWeek} (0=Sun, 1=Mon, ...)`);

    const workingHours = profile.hours.find((h) => h.dayOfWeek === dayOfWeek);
    console.log(`⏰ Working hours config:`, workingHours);

    if (!workingHours || workingHours.isClosed) {
        console.log("❌ Closed on this day (No working hours found or isClosed=true)");
        return [];
    }

    const [openHour, openMinute] = workingHours.openTime.split(":").map(Number);
    const [closeHour, closeMinute] = workingHours.closeTime.split(":").map(Number);

    let currentTime = setMinutes(setHours(selectedDate, openHour), openMinute);
    const endTime = setMinutes(setHours(selectedDate, closeHour), closeMinute);

    console.log(`⏳ Time range: ${currentTime.toISOString()} - ${endTime.toISOString()}`);

    // Check bookings
    const existingBookings = await prisma.booking.findMany({
        where: {
            profileId: profile.id,
            startTime: {
                gte: currentTime,
                lt: addDays(currentTime, 1),
            },
            status: {
                in: ["PENDING", "CONFIRMED", "COMPLETED"],
            },
        },
    });
    console.log(`📚 Existing bookings (${existingBookings.length}):`);
    existingBookings.forEach(b => {
        console.log(`   - ${b.startTime.toISOString()} to ${b.endTime.toISOString()} (${b.status})`);
    });

    // Check Google Calendar (Simulated logic)
    if (profile.googleAccessToken) {
        console.log("⚠️ Google Calendar integration enabled (cannot check real GCal in this script)");
    }

    const slots = [];
    while (currentTime < endTime) {
        const durationInMinutes = service.duration > 0 ? service.duration : 30;
        const slotEnd = new Date(currentTime.getTime() + durationInMinutes * 60000);

        if (slotEnd > endTime) break;

        const isBooked = existingBookings.some((booking) => {
            return (
                (currentTime >= booking.startTime && currentTime < booking.endTime) ||
                (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
                (currentTime <= booking.startTime && slotEnd >= booking.endTime)
            );
        });

        if (!isBooked) {
            slots.push(format(currentTime, "HH:mm"));
        } else {
            console.log(`   - Slot ${format(currentTime, "HH:mm")} blocked by booking`);
        }

        currentTime = new Date(currentTime.getTime() + durationInMinutes * 60000);
    }

    console.log(`\n✅ Generated Slots: ${slots.join(", ")}`);
}

// Get arguments
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: npx tsx debug_availability.ts <serviceId> <date>");
    // Try to find a service to default to
    prisma.service.findFirst().then(s => {
        if (s) {
            console.log(`Example: npx tsx debug_availability.ts ${s.id} 2025-12-02`);
        }
    });
} else {
    getAvailability(args[0], args[1]).catch(console.error).finally(() => prisma.$disconnect());
}

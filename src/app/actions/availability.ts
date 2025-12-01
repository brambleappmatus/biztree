"use server";

import prisma from "@/lib/prisma";
import { addDays, endOfMonth, eachDayOfInterval, format, setHours, setMinutes } from "date-fns";
import { getGoogleCalendarClient } from "@/lib/google-calendar";

export async function getFullyBookedDates(serviceId: string, year: number, month: number, numberOfPeople?: number) {
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { profile: { include: { hours: true } } },
    });

    if (!service) throw new Error("Service not found");

    const profile = service.profile;
    const startDate = new Date(year, month - 1, 1);
    const endDate = endOfMonth(startDate);

    // Fetch all bookings for the month
    const bookings = await prisma.booking.findMany({
        where: {
            profileId: profile.id,
            startTime: {
                gte: startDate,
                lt: addDays(endDate, 1),
            },
            status: {
                in: ["PENDING", "CONFIRMED", "COMPLETED"],
            },
        },
        include: {
            service: {
                select: {
                    calendarType: true
                }
            }
        }
    });

    // Fetch tables if this is a table reservation service or if tables exist
    const tables = await prisma.table.findMany({
        where: { profileId: profile.id },
    });

    // Fetch Google Calendar busy slots for the month
    let googleBusySlots: { start: Date; end: Date }[] = [];
    if (profile.googleAccessToken && profile.googleRefreshToken) {
        try {
            const calendar = getGoogleCalendarClient(profile.googleAccessToken, profile.googleRefreshToken);
            // Use events.list to get details and filter out our own bookings
            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: startDate.toISOString(),
                timeMax: endDate.toISOString(),
                singleEvents: true,
            });

            const events = response.data.items || [];
            googleBusySlots = events
                .filter(event => !event.extendedProperties?.private?.biztreeBookingId) // Filter out our own bookings
                .map(event => ({
                    start: new Date(event.start?.dateTime || event.start?.date!),
                    end: new Date(event.end?.dateTime || event.end?.date!),
                }));
        } catch (error) {
            console.error("❌ Failed to fetch Google Calendar availability:", error);
        }
    }

    const fullyBookedDates: string[] = [];
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    for (const day of daysInMonth) {
        const dayOfWeek = day.getDay();
        const workingHours = profile.hours.find((h) => h.dayOfWeek === dayOfWeek);

        if (!workingHours || workingHours.isClosed) {
            // Closed days are effectively "fully booked" or unavailable
            fullyBookedDates.push(format(day, "yyyy-MM-dd"));
            continue;
        }

        const [openHour, openMinute] = workingHours.openTime.split(":").map(Number);
        const [closeHour, closeMinute] = workingHours.closeTime.split(":").map(Number);

        let currentTime = setMinutes(setHours(day, openHour), openMinute);
        const endTimeOfDay = setMinutes(setHours(day, closeHour), closeMinute);

        let hasAvailableSlot = false;

        while (currentTime < endTimeOfDay) {
            const durationInMinutes = service.duration > 0 ? service.duration : 30;
            const slotEnd = new Date(currentTime.getTime() + durationInMinutes * 60000);

            if (slotEnd > endTimeOfDay) break;

            // Check collision with Google Calendar
            // Now we respect GCal blocks for ALL service types, because we filtered out our own bookings
            const isGoogleBusy = googleBusySlots.some((slot) => {
                return (
                    (currentTime >= slot.start && currentTime < slot.end) ||
                    (slotEnd > slot.start && slotEnd <= slot.end) ||
                    (currentTime <= slot.start && slotEnd >= slot.end)
                );
            });

            // Check if slot is in the past
            const now = new Date();
            const isPast = currentTime < now;

            if (isGoogleBusy || isPast) {
                currentTime = new Date(currentTime.getTime() + durationInMinutes * 60000);
                continue;
            }

            let isSlotAvailable = false;

            if (tables.length > 0) {
                // Table-based availability
                const suitableTables = numberOfPeople
                    ? tables.filter(t => t.capacity >= numberOfPeople)
                    : tables;

                if (suitableTables.length > 0) {
                    const isAnyTableFree = suitableTables.some(table => {
                        const isTableBooked = bookings.some(booking => {
                            const overlap = (
                                (currentTime >= booking.startTime && currentTime < booking.endTime) ||
                                (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
                                (currentTime <= booking.startTime && slotEnd >= booking.endTime)
                            );
                            return overlap && booking.tableId === table.id;
                        });
                        return !isTableBooked;
                    });
                    isSlotAvailable = isAnyTableFree;
                }
            } else {
                // Single resource availability OR Simple Table Reservation
                if (service.calendarType === 'TABLE_RESERVATION' && !service.requiresTable) {
                    isSlotAvailable = true;
                } else {
                    // Hourly Service: Check collisions
                    const isBooked = bookings.some((booking) => {
                        // Always ignore Table Reservation bookings
                        if (booking.service.calendarType === 'TABLE_RESERVATION') return false;

                        // If allowConcurrentServices is enabled, only check bookings for the SAME service
                        if (profile.allowConcurrentServices && booking.serviceId !== service.id) return false;

                        return (
                            (currentTime >= booking.startTime && currentTime < booking.endTime) ||
                            (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
                            (currentTime <= booking.startTime && slotEnd >= booking.endTime)
                        );
                    });
                    isSlotAvailable = !isBooked;
                }
            }

            if (isSlotAvailable) {
                hasAvailableSlot = true;
                break; // Found at least one slot, so day is not fully booked
            }

            currentTime = new Date(currentTime.getTime() + durationInMinutes * 60000);
        }

        if (!hasAvailableSlot) {
            fullyBookedDates.push(format(day, "yyyy-MM-dd"));
        }
    }

    return fullyBookedDates;
}

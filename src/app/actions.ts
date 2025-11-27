"use server";

import prisma from "@/lib/prisma";
import { addDays, format, isSameDay, parseISO, setHours, setMinutes } from "date-fns";
import { getGoogleCalendarClient } from "@/lib/google-calendar";
import { Resend } from "resend";
import { BookingConfirmationEmail } from "@/components/emails/BookingConfirmationEmail";
import { NewBookingNotificationEmail } from "@/components/emails/NewBookingNotificationEmail";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function getAvailability(serviceId: string, date: string) {
    // date is ISO string (YYYY-MM-DD)
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { profile: { include: { hours: true } } },
    });

    if (!service) throw new Error("Service not found");

    const profile = service.profile;

    // Parse date manually to avoid timezone issues (treat as wall-clock time)
    const [year, month, day] = date.split('-').map(Number);
    // Create date at 00:00:00 system local time
    const selectedDate = new Date(year, month - 1, day);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sun

    // Find working hours for this day
    const workingHours = profile.hours.find((h) => h.dayOfWeek === dayOfWeek);

    if (!workingHours || workingHours.isClosed) {
        return [];
    }

    // Generate slots
    const slots = [];
    const [openHour, openMinute] = workingHours.openTime.split(":").map(Number);
    const [closeHour, closeMinute] = workingHours.closeTime.split(":").map(Number);

    let currentTime = setMinutes(setHours(selectedDate, openHour), openMinute);
    const endTime = setMinutes(setHours(selectedDate, closeHour), closeMinute);

    // Fetch existing bookings for this service/profile on this day
    // In a real app, we should check all bookings for the profile to prevent overlap if resources are shared
    // For simplicity, assuming single resource (the business owner)
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

    // Fetch Google Calendar busy slots
    let googleBusySlots: { start: Date; end: Date }[] = [];
    if (profile.googleAccessToken && profile.googleRefreshToken) {
        try {
            const calendar = getGoogleCalendarClient(profile.googleAccessToken, profile.googleRefreshToken);
            const response = await calendar.freebusy.query({
                requestBody: {
                    timeMin: currentTime.toISOString(),
                    timeMax: endTime.toISOString(),
                    items: [{ id: 'primary' }],
                },
            });

            const busy = response.data.calendars?.primary?.busy;
            if (busy) {
                googleBusySlots = busy.map((b) => ({
                    start: new Date(b.start!),
                    end: new Date(b.end!),
                }));
            }
        } catch (error) {
            console.error("❌ Failed to fetch Google Calendar availability:", error);
            // Continue without Google Calendar slots if it fails
        }
    }

    while (currentTime < endTime) {
        const durationInMinutes = service.duration > 0 ? service.duration : 30;
        const slotEnd = new Date(currentTime.getTime() + durationInMinutes * 60000);

        if (slotEnd > endTime) break;

        // Check collision
        const isBooked = existingBookings.some((booking) => {
            return (
                (currentTime >= booking.startTime && currentTime < booking.endTime) ||
                (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
                (currentTime <= booking.startTime && slotEnd >= booking.endTime)
            );
        });

        const isGoogleBusy = googleBusySlots.some((slot) => {
            return (
                (currentTime >= slot.start && currentTime < slot.end) ||
                (slotEnd > slot.start && slotEnd <= slot.end) ||
                (currentTime <= slot.start && slotEnd >= slot.end)
            );
        });

        // Also check if slot is in the past (if date is today)
        const now = new Date();
        const isPast = currentTime < now;

        if (!isBooked && !isGoogleBusy && !isPast) {
            slots.push(format(currentTime, "HH:mm"));
        }

        // Increment by duration or fixed interval (e.g. 30 mins)
        currentTime = new Date(currentTime.getTime() + durationInMinutes * 60000);
    }

    return slots;
}

export async function createBooking(data: {
    serviceId: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    name: string;
    email: string;
    phone: string;
}) {
    const service = await prisma.service.findUnique({
        where: { id: data.serviceId },
        include: {
            profile: {
                include: {
                    user: true
                }
            }
        },
    });

    if (!service) throw new Error("Service not found");

    const startTime = parseISO(`${data.date}T${data.time}`);
    const durationInMinutes = service.duration > 0 ? service.duration : 30;
    const endTime = new Date(startTime.getTime() + durationInMinutes * 60000);

    // Double check availability (race condition possible, but skipping lock for MVP)
    const existing = await prisma.booking.findFirst({
        where: {
            profileId: service.profileId,
            status: {
                in: ["PENDING", "CONFIRMED", "COMPLETED"],
            },
            OR: [
                { startTime: { lte: startTime }, endTime: { gt: startTime } },
                { startTime: { lt: endTime }, endTime: { gte: endTime } },
            ],
        },
    });

    if (existing) {
        return { error: "Slot already taken" };
    }

    const booking = await prisma.booking.create({
        data: {
            serviceId: service.id,
            profileId: service.profileId,
            customerName: data.name,
            customerEmail: data.email,
            customerPhone: data.phone,
            startTime,
            endTime,
            status: "PENDING",
        },
    });

    // Add to Google Calendar
    const profile = service.profile;
    console.log("📝 Attempting to add booking to Google Calendar...");
    console.log("🔑 Has tokens?", !!(profile.googleAccessToken && profile.googleRefreshToken));
    if (profile.googleAccessToken && profile.googleRefreshToken) {
        try {
            console.log("📅 Creating event:", {
                summary: `Rezervácia: ${service.name} - ${data.name}`,
                start: startTime.toISOString(),
                end: endTime.toISOString()
            });
            const calendar = getGoogleCalendarClient(profile.googleAccessToken, profile.googleRefreshToken);
            const result = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: {
                    summary: `Rezervácia: ${service.name} - ${data.name}`,
                    description: `Služba: ${service.name}\nKlient: ${data.name}\nEmail: ${data.email}\nTel: ${data.phone}`,
                    start: { dateTime: startTime.toISOString() },
                    end: { dateTime: endTime.toISOString() },
                },
            });
            console.log("✅ Event created successfully:", result.data.id);
        } catch (error) {
            console.error("❌ Failed to add event to Google Calendar:", error);
            // Don't fail the booking if Google Calendar sync fails
        }
    } else {
        console.log("⚠️ No Google Calendar tokens, skipping sync");
    }

    // Send emails
    try {
        // 1. Send confirmation to customer
        const formattedDate = format(startTime, "d.M.yyyy");
        const formattedTime = format(startTime, "HH:mm");

        // Create Google Calendar link
        const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Rezervácia: ${service.name}`)}&dates=${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Služba: ${service.name}\nPoskytovateľ: ${profile.name}`)}&location=${encodeURIComponent(profile.address || '')}`;

        if (resend) {
            await resend.emails.send({
                from: 'BizTree <no-reply@biztree.bio>',
                to: data.email,
                subject: 'Potvrdenie rezervácie - BizTree',
                react: BookingConfirmationEmail({
                    customerName: data.name,
                    serviceName: service.name,
                    date: formattedDate,
                    time: formattedTime,
                    location: profile.address || undefined,
                    googleCalendarLink
                }) as React.ReactNode,
            });
        } else {
            console.warn("⚠️ Resend API key missing, skipping confirmation email");
        }

        // 2. Send notification to owner
        const ownerEmail = profile.email || profile.user?.email;

        if (ownerEmail) {
            if (resend) {
                await resend.emails.send({
                    from: 'BizTree <no-reply@biztree.bio>',
                    to: ownerEmail,
                    subject: 'Nová rezervácia! - BizTree',
                    react: NewBookingNotificationEmail({
                        ownerName: profile.name, // Or user name if available
                        customerName: data.name,
                        customerEmail: data.email,
                        customerPhone: data.phone,
                        serviceName: service.name,
                        date: formattedDate,
                        time: formattedTime,
                    }) as React.ReactNode,
                });
            } else {
                console.warn("⚠️ Resend API key missing, skipping owner notification email");
            }
        } else {
            console.warn("⚠️ No owner email found for profile:", profile.id);
        }

    } catch (emailError) {
        console.error("❌ Failed to send booking emails:", emailError);
        // Don't fail the booking if email sending fails
    }

    return { success: true, bookingId: booking.id };
}


export async function updateProfile(profileId: string, data: {
    name: string;
    about?: string;
    phone?: string;
    email?: string;
    address?: string;
    mapEmbed?: string;
    theme: string;
    language?: string;
    bgImage?: string;
    bgBlur?: boolean;
    bgNoise?: boolean;
    avatarUrl?: string;
    showBusinessCard?: boolean;
}) {
    await prisma.profile.update({
        where: { id: profileId },
        data: {
            name: data.name,
            about: data.about,
            phone: data.phone,
            email: data.email,
            address: data.address,
            mapEmbed: data.mapEmbed,
            theme: data.theme,
            language: data.language,
            bgImage: data.bgImage,
            bgBlur: data.bgBlur,
            bgNoise: data.bgNoise,
            avatarUrl: data.avatarUrl,
            showBusinessCard: data.showBusinessCard,
        },
    });

    return { success: true };
}


export async function createService(profileId: string, data: {
    name: string;
    duration: number;
    price: number;
    bookingEnabled?: boolean;
}) {
    await prisma.service.create({
        data: {
            profileId,
            name: data.name,
            duration: data.duration,
            price: data.price,
            bookingEnabled: data.bookingEnabled ?? true,
        },
    });
    return { success: true };
}

export async function updateService(serviceId: string, data: {
    name: string;
    duration: number;
    price: number;
    bookingEnabled?: boolean;
}) {
    await prisma.service.update({
        where: { id: serviceId },
        data: {
            name: data.name,
            duration: data.duration,
            price: data.price,
            bookingEnabled: data.bookingEnabled,
        },
    });
    return { success: true };
}

export async function deleteService(serviceId: string) {
    await prisma.service.delete({
        where: { id: serviceId },
    });
    return { success: true };
}

export async function updateBookingStatus(bookingId: string, status: string) {
    await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
    });
    return { success: true };
}

export async function getBookingCount(profileId: string) {
    const count = await prisma.booking.count({
        where: {
            profileId,
            status: { in: ["PENDING", "CONFIRMED"] },
        },
    });
    return count;
}

export async function updateWorkingHours(profileId: string, hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[]) {
    // Transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
        // Delete existing hours
        await tx.workingHours.deleteMany({
            where: { profileId },
        });

        // Create new hours
        if (hours.length > 0) {
            await tx.workingHours.createMany({
                data: hours.map((h) => ({
                    profileId,
                    dayOfWeek: h.dayOfWeek,
                    openTime: h.openTime,
                    closeTime: h.closeTime,
                    isClosed: h.isClosed,
                })),
            });
        }
    });

    return { success: true };
}

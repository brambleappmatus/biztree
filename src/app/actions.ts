"use server";

import prisma from "@/lib/prisma";
import { CalendarType } from "@prisma/client";
import { addDays, format, isSameDay, parseISO, setHours, setMinutes } from "date-fns";
import { getGoogleCalendarClient } from "@/lib/google-calendar";
import { Resend } from "resend";
import { BookingConfirmationEmail } from "@/components/emails/BookingConfirmationEmail";
import { NewBookingNotificationEmail } from "@/components/emails/NewBookingNotificationEmail";
import { checkServiceLimit, isCalendarTypeAllowed, isFeatureAllowed } from "@/lib/subscription-limits";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function getAvailability(serviceId: string, date: string, numberOfPeople?: number) {
    // date is ISO string (YYYY-MM-DD)
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: {
            profile: {
                include: {
                    hours: true,
                    tier: true
                }
            }
        },
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
        include: {
            service: {
                select: {
                    calendarType: true
                }
            }
        }
    });

    // Fetch tables if this is a table reservation service
    const tables = await prisma.table.findMany({
        where: { profileId: profile.id },
    });

    // Check features based on tier (Downgrade Protection)
    const tierName = profile.tier?.name;
    const canUseGoogle = isFeatureAllowed(tierName, 'googleCalendar');
    const canUseConcurrent = isFeatureAllowed(tierName, 'concurrentBookings');
    const canUseWorkers = isFeatureAllowed(tierName, 'workerSelection');

    // Fetch assigned workers if this is a worker-based service AND allowed by tier
    let assignedWorkers: any[] = [];
    if (service.allowWorkerSelection && canUseWorkers) {
        assignedWorkers = await prisma.serviceWorker.findMany({
            where: { serviceId: service.id },
            include: {
                worker: true
            }
        });
    }

    // Fetch Google Calendar busy slots
    let googleBusySlots: { start: Date; end: Date }[] = [];
    if (canUseGoogle && profile.googleAccessToken && profile.googleRefreshToken) {
        try {
            const calendar = getGoogleCalendarClient(profile.googleAccessToken, profile.googleRefreshToken);
            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: currentTime.toISOString(),
                timeMax: endTime.toISOString(),
                singleEvents: true,
            });

            const events = response.data.items || [];
            googleBusySlots = events
                .filter(event => !event.extendedProperties?.private?.biztreeBookingId)
                .map(event => ({
                    start: new Date(event.start?.dateTime || event.start?.date!),
                    end: new Date(event.end?.dateTime || event.end?.date!),
                }));
        } catch (error) {
            console.error("❌ Failed to fetch Google Calendar availability:", error);
        }
    }

    const durationInMinutes = service.duration > 0 ? service.duration : 30;

    while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + durationInMinutes * 60000);

        if (slotEnd > endTime) break;

        // Check collision with Google Calendar
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

        let isAvailable = false;
        let availableWorkers: any[] = [];

        if (service.calendarType === 'TABLE_RESERVATION' && tables.length > 0) {
            // Table-based availability
            const suitableTables = numberOfPeople
                ? tables.filter(t => t.capacity >= numberOfPeople)
                : tables;

            if (suitableTables.length > 0) {
                const isAnyTableFree = suitableTables.some(table => {
                    const isTableBooked = existingBookings.some(booking => {
                        const overlap = (
                            (currentTime >= booking.startTime && currentTime < booking.endTime) ||
                            (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
                            (currentTime <= booking.startTime && slotEnd >= booking.endTime)
                        );
                        return overlap && booking.tableId === table.id;
                    });
                    return !isTableBooked;
                });
                isAvailable = isAnyTableFree;
            }
        } else if (service.calendarType === 'TABLE_RESERVATION' && !service.requiresTable) {
            // Simple Table Reservation: Allow multiple bookings
            isAvailable = true;
        } else if (service.allowWorkerSelection && assignedWorkers.length > 0) {
            // Worker-based service
            availableWorkers = assignedWorkers.filter(sw => {
                const worker = sw.worker;
                if (!worker.isActive) return false;

                // Check if this worker has ANY booking at this time
                const isWorkerBusy = existingBookings.some(booking => {
                    if (booking.workerId !== worker.id) return false;

                    const overlap = (
                        (currentTime >= booking.startTime && currentTime < booking.endTime) ||
                        (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
                        (currentTime <= booking.startTime && slotEnd >= booking.endTime)
                    );
                    return overlap;
                });

                return !isWorkerBusy;
            }).map(sw => sw.worker);

            isAvailable = availableWorkers.length > 0;
        } else {
            // Hourly Service without workers: Use allowConcurrentServices logic
            const isBooked = existingBookings.some((booking) => {
                // Always ignore Table Reservation bookings (different resource type)
                if (booking.service.calendarType === 'TABLE_RESERVATION') return false;

                // If allowConcurrentServices is disabled (or not allowed by tier), check all services
                // If enabled AND allowed, only check the same service
                if (canUseConcurrent && profile.allowConcurrentServices) {
                    // Only check bookings for THIS service
                    // (Other services don't block this one)
                    if (booking.serviceId !== service.id) return false;
                    // Log for debugging
                    // debugLog(`[Availability] Concurrent services enabled. Checking only service ${service.id}`);
                } else {
                    // Check bookings for ALL services in the profile
                    // (Any booking blocks this slot)
                    // No need to modify whereClause here, as existingBookings already fetched all for profile
                    // debugLog(`[Availability] Concurrent services disabled. Checking all services for profile ${profile.id}`);
                }
                return (
                    (currentTime >= booking.startTime && currentTime < booking.endTime) ||
                    (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
                    (currentTime <= booking.startTime && slotEnd >= booking.endTime)
                );
            });
            isAvailable = !isBooked;
        }

        if (isAvailable) {
            slots.push({
                time: format(currentTime, "HH:mm"),
                available: true,
                availableWorkers: availableWorkers.length > 0 ? availableWorkers : undefined,
            });
        }

        currentTime = new Date(currentTime.getTime() + durationInMinutes * 60000);
    }

    return slots;
}

export async function getBookedDateRanges(serviceId: string) {
    const bookings = await prisma.booking.findMany({
        where: {
            serviceId,
            status: {
                in: ["PENDING", "CONFIRMED", "COMPLETED"],
            },
        },
        select: {
            startTime: true,
            endTime: true,
        },
    });

    return bookings.map(b => ({
        start: b.startTime.toISOString(), // Full ISO string with time
        end: b.endTime.toISOString(),
        startDate: b.startTime.toISOString().split('T')[0], // Just the date
        endDate: b.endTime.toISOString().split('T')[0],
    }));
}

export async function createBooking(data: {
    serviceId: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    name: string;
    email: string;
    phone: string;
    numberOfPeople?: number;
    notes?: string;
    workerId?: string;
    categoryId?: string;
    tableId?: string;
    endDate?: string; // For daily rentals
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

    const profile = service.profile;

    const startTime = parseISO(`${data.date}T${data.time}`);

    // Check availability based on calendar type
    let endTime: Date;
    if (data.endDate) {
        // Daily rental - check-in at 14:00, check-out at 10:00 next day
        // Start time: date at 14:00
        startTime.setHours(14, 0, 0, 0);
        // End time: endDate at 10:00
        endTime = parseISO(`${data.endDate}T10:00`);
    } else {
        // Hourly service or table reservation - use duration
        const durationInMinutes = service.duration > 0 ? service.duration : 30;
        endTime = new Date(startTime.getTime() + durationInMinutes * 60000);
    }

    // Check availability based on calendar type
    const whereClause: any = {
        profileId: service.profileId,
        status: {
            in: ["PENDING", "CONFIRMED", "COMPLETED"],
        },
    };

    // For daily rentals, check date range overlap
    if (service.calendarType === "DAILY_RENTAL") {
        whereClause.serviceId = service.id; // Same service
        whereClause.OR = [
            // New booking starts during existing booking
            { startTime: { lte: startTime }, endTime: { gt: startTime } },
            // New booking ends during existing booking
            { startTime: { lt: endTime }, endTime: { gte: endTime } },
            // New booking completely contains existing booking
            { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ];
    } else if (service.calendarType === "TABLE_RESERVATION" && data.tableId) {
        // For table reservations, check if specific table is available
        whereClause.tableId = data.tableId;
        whereClause.OR = [
            { startTime: { lte: startTime }, endTime: { gt: startTime } },
            { startTime: { lt: endTime }, endTime: { gte: endTime } },
        ];
    } else {
        // For hourly services, check time slot overlap
        whereClause.OR = [
            { startTime: { lte: startTime }, endTime: { gt: startTime } },
            { startTime: { lt: endTime }, endTime: { gte: endTime } },
        ];

        if (service.allowWorkerSelection) {
            // Worker-based service
            if (data.workerId) {
                // Check if THIS worker is busy (regardless of service)
                whereClause.workerId = data.workerId;
            } else {
                // No worker selected (optional)
                // We don't enforce collision check against specific workers here
                // But we should probably check if we're not violating some global limit?
                // For now, let's allow it (assuming getAvailability filtered correctly)
                // To be safe, we could check if there is AT LEAST one worker free, but that's expensive here.
                // Let's rely on the UI/getAvailability for now.

                // However, to prevent "double booking" the same service if allowConcurrentServices is false?
                // No, worker services ignore allowConcurrentServices.

                // So if no worker selected, we just pass (or maybe we shouldn't check existing bookings at all?)
                // If we leave whereClause as is (just time overlap), it will find ANY booking in this profile at this time.
                // That would block if ANYONE is working. That's wrong.

                // So if workerId is NOT provided, we should probably NOT check for collisions 
                // (or maybe check if ALL workers are busy? but that's complex).
                // Let's set a condition that won't match anything if we want to skip check
                // OR better: only run findFirst if we have a valid check to make.

                // Actually, if allowWorkerSelection is true but no worker selected, 
                // we effectively treat it as "pending assignment".
                // We shouldn't block it based on other bookings.
                // So we can make the query return nothing.
                whereClause.id = "skip_check"; // Hack to make it return null
            }
        } else {
            // Workerless service
            // Respect allowConcurrentServices setting
            if (profile.allowConcurrentServices) {
                whereClause.serviceId = service.id;
            }
        }
    }

    const existing = await prisma.booking.findFirst({
        where: whereClause,
        include: {
            service: {
                select: {
                    calendarType: true
                }
            }
        }
    });

    // Additional filtering: ignore Table Reservation bookings when checking Hourly services
    if (existing && service.calendarType === 'HOURLY_SERVICE' && existing.service.calendarType === 'TABLE_RESERVATION') {
        // Table bookings don't block hourly services (different resource)
        // Continue with booking creation
    } else if (existing) {
        return { error: "Tento termín už nie je dostupný" };
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
            numberOfPeople: data.numberOfPeople,
            notes: data.notes,
            workerId: data.workerId,
            categoryId: data.categoryId,
            tableId: data.tableId,
        },
    });

    console.log("✅ Booking created in DB:", booking.id);

    // Add to Google Calendar
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
                    extendedProperties: {
                        private: {
                            biztreeBookingId: booking.id
                        }
                    }
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
    console.log("📧 Starting email sending process...");
    console.log("📧 Resend client initialized?", !!resend);
    try {
        // 1. Send confirmation to customer
        const formattedDate = format(startTime, "d.M.yyyy");
        const formattedTime = format(startTime, "HH:mm");

        // Create Google Calendar link
        const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Rezervácia: ${service.name}`)}&dates=${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Služba: ${service.name}\nPoskytovateľ: ${profile.name}`)}&location=${encodeURIComponent(profile.address || '')}`;

        // Create Apple Calendar (.ics) link
        const appleCalendarLink = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z%0ADTEND:${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z%0ASUMMARY:${encodeURIComponent(`Rezervácia: ${service.name}`)}%0ADESCRIPTION:${encodeURIComponent(`Služba: ${service.name}\nPoskytovateľ: ${profile.name}`)}%0ALOCATION:${encodeURIComponent(profile.address || '')}%0AEND:VEVENT%0AEND:VCALENDAR`;

        if (resend) {
            console.log(`📧 Sending confirmation email to ${data.email}...`);
            const result = await resend.emails.send({
                from: 'BizTree <no-reply@biztree.bio>',
                to: data.email,
                subject: 'Rezervácia prijatá - BizTree',
                react: BookingConfirmationEmail({
                    customerName: data.name,
                    serviceName: service.name,
                    date: formattedDate,
                    time: formattedTime,
                    location: profile.address || undefined,
                    googleCalendarLink,
                    appleCalendarLink
                }) as React.ReactNode,
            });
            console.log("✅ Confirmation email sent:", result.data?.id || result.error);
        } else {
            console.warn("⚠️ Resend API key missing, skipping confirmation email");
        }

        // 2. Send notification to owner (prioritize login email over business email)
        const ownerEmail = profile.user?.email || profile.email;
        console.log(`📧 Owner email: ${ownerEmail}`);

        if (ownerEmail) {
            if (resend) {
                console.log(`📧 Sending notification email to owner ${ownerEmail}...`);
                const result = await resend.emails.send({
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
                console.log("✅ Owner notification email sent:", result.data?.id || result.error);
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
    calendarType?: CalendarType;
    minimumDays?: number;
    minimumValue?: number;
    pricePerDay?: number;
    requiresTable?: boolean;
    maxCapacity?: number;
    allowWorkerSelection?: boolean;
    requireWorker?: boolean;
}) {
    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: {
            tier: true,
            _count: { select: { services: true } }
        }
    });

    if (!profile) throw new Error("Profile not found");

    // Check Limits
    if (!checkServiceLimit(profile.tier?.name, profile._count.services)) {
        throw new Error("Service limit reached for your plan");
    }

    if (!isCalendarTypeAllowed(profile.tier?.name, data.calendarType ?? "HOURLY_SERVICE")) {
        throw new Error("This service type is not available in your plan");
    }

    await prisma.service.create({
        data: {
            profileId,
            name: data.name,
            duration: data.duration,
            price: data.price,
            bookingEnabled: data.bookingEnabled ?? true,
            calendarType: data.calendarType ?? "HOURLY_SERVICE",
            minimumDays: data.minimumDays,
            minimumValue: data.minimumValue,
            pricePerDay: data.pricePerDay,
            requiresTable: data.requiresTable ?? false,
            maxCapacity: data.maxCapacity,
            allowWorkerSelection: data.allowWorkerSelection ?? false,
            requireWorker: data.requireWorker ?? false,
        },
    });
    return { success: true };
}

export async function updateService(serviceId: string, data: {
    name: string;
    duration: number;
    price: number;
    bookingEnabled?: boolean;
    calendarType?: CalendarType;
    minimumDays?: number;
    minimumValue?: number;
    pricePerDay?: number;
    requiresTable?: boolean;
    maxCapacity?: number;
    allowWorkerSelection?: boolean;
    requireWorker?: boolean;
}) {
    await prisma.service.update({
        where: { id: serviceId },
        data: {
            name: data.name,
            duration: data.duration,
            price: data.price,
            bookingEnabled: data.bookingEnabled,
            calendarType: data.calendarType,
            minimumDays: data.minimumDays,
            minimumValue: data.minimumValue,
            pricePerDay: data.pricePerDay,
            requiresTable: data.requiresTable,
            maxCapacity: data.maxCapacity,
            allowWorkerSelection: data.allowWorkerSelection,
            requireWorker: data.requireWorker,
        },
    });
    return { success: true };
}

export async function deleteService(serviceId: string) {
    await prisma.$transaction(async (tx) => {
        // Delete all bookings for this service first
        await tx.booking.deleteMany({
            where: { serviceId },
        });

        // Then delete the service
        await tx.service.delete({
            where: { id: serviceId },
        });
    });
    return { success: true };
}

export async function updateBookingStatus(bookingId: string, status: string) {
    const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
        include: {
            service: true,
            profile: true,
        },
    });

    // Send email notification to customer when status changes to CONFIRMED or CANCELLED
    if ((status === "CONFIRMED" || status === "CANCELLED") && resend) {
        try {
            const formattedDate = format(booking.startTime, "d.M.yyyy");
            const formattedTime = format(booking.startTime, "HH:mm");

            const { BookingStatusUpdateEmail } = await import("@/components/emails/BookingStatusUpdateEmail");

            await resend.emails.send({
                from: 'BizTree <no-reply@biztree.bio>',
                to: booking.customerEmail,
                subject: status === "CONFIRMED"
                    ? `Rezervácia potvrdená - ${booking.service.name}`
                    : `Rezervácia zrušená - ${booking.service.name}`,
                react: BookingStatusUpdateEmail({
                    customerName: booking.customerName,
                    businessName: booking.profile.name,
                    serviceName: booking.service.name,
                    date: formattedDate,
                    time: formattedTime,
                    status: status === "CONFIRMED" ? 'confirmed' : 'cancelled',
                    location: booking.profile.address || undefined,
                }) as React.ReactNode,
            });

            console.log(`✅ Status update email sent to ${booking.customerEmail} (${status})`);
        } catch (emailError) {
            console.error("❌ Failed to send status update email:", emailError);
            // Don't fail the status update if email fails
        }
    }

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

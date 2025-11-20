"use server";

import prisma from "@/lib/prisma";
import { addDays, format, isSameDay, parseISO, setHours, setMinutes } from "date-fns";

export async function getAvailability(serviceId: string, date: string) {
    // date is ISO string (YYYY-MM-DD)
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { profile: { include: { hours: true } } },
    });

    if (!service) throw new Error("Service not found");

    const profile = service.profile;
    const selectedDate = parseISO(date);
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
            status: "CONFIRMED",
        },
    });

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

        if (!isBooked) {
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
        include: { profile: true },
    });

    if (!service) throw new Error("Service not found");

    const startTime = parseISO(`${data.date}T${data.time}`);
    const durationInMinutes = service.duration > 0 ? service.duration : 30;
    const endTime = new Date(startTime.getTime() + durationInMinutes * 60000);

    // Double check availability (race condition possible, but skipping lock for MVP)
    const existing = await prisma.booking.findFirst({
        where: {
            profileId: service.profileId,
            status: "CONFIRMED",
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
            status: "CONFIRMED",
        },
    });

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
    avatarUrl?: string;
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
            avatarUrl: data.avatarUrl,
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

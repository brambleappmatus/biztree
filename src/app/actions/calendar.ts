"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { parseISO } from "date-fns";
import { checkWorkerLimit } from "@/lib/subscription-limits";

// --- Workers ---

export async function getWorkers(profileId: string) {
    return await prisma.worker.findMany({
        where: { profileId },
        orderBy: { order: "asc" },
        include: {
            services: {
                include: {
                    service: true
                }
            }
        }
    });
}

export async function createWorker(profileId: string, data: {
    name: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
}) {
    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: {
            tier: true,
            _count: { select: { workers: true } }
        }
    });

    if (!profile) throw new Error("Profile not found");

    if (!checkWorkerLimit(profile.tier?.name, profile._count.workers)) {
        throw new Error("Worker limit reached for your plan");
    }

    const worker = await prisma.worker.create({
        data: {
            ...data,
            profileId
        }
    });

    revalidatePath(`/admin/workers`);
    return worker;
}

export async function updateWorker(workerId: string, data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
    order?: number;
}) {
    const worker = await prisma.worker.update({
        where: { id: workerId },
        data
    });

    revalidatePath(`/admin/workers`);
    return worker;
}

export async function deleteWorker(workerId: string) {
    await prisma.worker.delete({
        where: { id: workerId }
    });

    revalidatePath(`/admin/workers`);
}

export async function assignWorkerToService(workerId: string, serviceId: string) {
    await prisma.serviceWorker.create({
        data: {
            workerId,
            serviceId
        }
    });
    revalidatePath(`/admin/workers`);
}

export async function removeWorkerFromService(workerId: string, serviceId: string) {
    await prisma.serviceWorker.delete({
        where: {
            serviceId_workerId: {
                serviceId,
                workerId
            }
        }
    });
    revalidatePath(`/admin/workers`);
}

export async function getServiceWorkers(serviceId: string) {
    const serviceWorkers = await prisma.serviceWorker.findMany({
        where: { serviceId },
        include: {
            worker: true
        }
    });

    // Return only active workers
    return serviceWorkers
        .map(sw => sw.worker)
        .filter(w => w.isActive)
        .sort((a, b) => a.order - b.order);
}

// --- Service Categories ---

export async function createServiceCategory(serviceId: string, data: {
    name: string;
    description?: string;
    price?: number;
    duration?: number;
}) {
    const category = await prisma.serviceCategory.create({
        data: {
            ...data,
            serviceId
        }
    });

    revalidatePath(`/admin/services`);
    return category;
}

export async function updateServiceCategory(categoryId: string, data: {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
    order?: number;
}) {
    const category = await prisma.serviceCategory.update({
        where: { id: categoryId },
        data
    });

    revalidatePath(`/admin/services`);
    return category;
}

export async function deleteServiceCategory(categoryId: string) {
    await prisma.serviceCategory.delete({
        where: { id: categoryId }
    });

    revalidatePath(`/admin/services`);
}

// --- Tables ---

export async function getTables(profileId: string) {
    return await prisma.table.findMany({
        where: { profileId },
        orderBy: { order: "asc" }
    });
}

export async function createTable(profileId: string, data: {
    name: string;
    capacity: number;
    shape?: string;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
}) {
    const table = await prisma.table.create({
        data: {
            ...data,
            profileId
        }
    });

    revalidatePath(`/admin/tables`);
    return table;
}

export async function updateTable(tableId: string, data: {
    name?: string;
    capacity?: number;
    shape?: string;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
    isActive?: boolean;
}) {
    const table = await prisma.table.update({
        where: { id: tableId },
        data
    });

    revalidatePath(`/admin/tables`);
    return table;
}

export async function deleteTable(tableId: string) {
    await prisma.table.delete({
        where: { id: tableId }
    });

    revalidatePath(`/admin/tables`);
}

// --- Floor Plan ---

export async function getFloorPlan(profileId: string) {
    return await prisma.floorPlan.findUnique({
        where: { profileId }
    });
}

export async function saveFloorPlan(profileId: string, data: {
    name?: string;
    imageUrl?: string;
    width?: number;
    height?: number;
}) {
    const floorPlan = await prisma.floorPlan.upsert({
        where: { profileId },
        create: {
            ...data,
            profileId
        },
        update: data
    });

    revalidatePath(`/admin/tables`);
    return floorPlan;
}

export async function getAvailableTables(serviceId: string, date: string, time: string, duration: number) {
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { profile: true },
    });

    if (!service) throw new Error("Service not found");

    const profile = service.profile;
    const startTime = parseISO(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Fetch all tables
    const tables = await prisma.table.findMany({
        where: { profileId: profile.id },
        orderBy: { order: "asc" }
    });

    // Fetch bookings that overlap with this time slot
    const bookings = await prisma.booking.findMany({
        where: {
            profileId: profile.id,
            startTime: {
                lt: endTime,
            },
            endTime: {
                gt: startTime,
            },
            status: {
                in: ["PENDING", "CONFIRMED", "COMPLETED"],
            },
        },
    });

    // Filter out tables that are booked
    const availableTables = tables.filter(table => {
        const isBooked = bookings.some(booking => booking.tableId === table.id);
        return !isBooked;
    });

    return availableTables;
}

export async function getMaxTableCapacity(profileId: string) {
    const table = await prisma.table.findFirst({
        where: { profileId },
        orderBy: { capacity: 'desc' },
    });
    return table?.capacity || 0;
}

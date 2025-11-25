import React from "react";
import prisma from "@/lib/prisma";
import BookingsManager from "@/components/admin/bookings-manager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LockedFeatureGuard } from "@/components/admin/LockedFeatureGuard";

export default async function BookingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profiles: true }
    });

    if (!user || !user.profiles || user.profiles.length === 0) {
        redirect("/onboarding");
    }

    const bookings = await prisma.booking.findMany({
        where: { profileId: user.profiles[0].id },
        include: { service: true },
        orderBy: { startTime: "desc" },
    });

    // Serialize bookings for client component (convert Decimal to number)
    const serializedBookings = bookings.map(booking => ({
        ...booking,
        service: {
            ...booking.service,
            price: booking.service.price ? Number(booking.service.price) : null,
        },
    }));

    return (
        <LockedFeatureGuard featureKey="page_bookings">
            <div>
                <h1 className="text-2xl font-bold mb-6">Správa rezervácií</h1>
                <BookingsManager bookings={serializedBookings} />
            </div>
        </LockedFeatureGuard>
    );
}

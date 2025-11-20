import React from "react";
import prisma from "@/lib/prisma";
import BookingsManager from "@/components/admin/bookings-manager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BookingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true }
    });

    if (!user || !user.profile) {
        redirect("/onboarding");
    }

    const bookings = await prisma.booking.findMany({
        where: { profileId: user.profile.id },
        include: { service: true },
        orderBy: { startTime: "desc" },
    });

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Správa rezervácií</h1>
            <BookingsManager bookings={bookings} />
        </div>
    );
}

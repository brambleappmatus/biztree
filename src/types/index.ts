import { Prisma } from "@prisma/client";

// Define the Profile with all necessary relations included
export type ProfileCore = Prisma.ProfileGetPayload<{
    include: {
        services: true;
        socialLinks: true;
        hours: true;
        bookings: false; // We usually don't need bookings for the public profile view
    };
}>;

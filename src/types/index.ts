import { Prisma } from "@prisma/client";

// Define the Profile with all necessary relations included
export type ProfileCore = Prisma.ProfileGetPayload<{
    include: {
        services: true;
        socialLinks: true;
        hours: true;
        links: true;
        albums: {
            include: {
                images: true;
            };
        };
        documents: true;
        tier: {
            include: {
                features: {
                    include: {
                        feature: true;
                    };
                };
            };
        };
        bookings: false;
    };
}>;

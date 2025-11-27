import { cache } from "react";
import prisma from "@/lib/prisma";
import { ProfileCore } from "@/types";

// Cached data fetcher to deduplicate requests
export const getProfile = cache(async (subdomain: string) => {
    return await prisma.profile.findUnique({
        where: { subdomain },
        include: {
            services: true,
            socialLinks: true,
            hours: true,
            links: true,
            albums: {
                include: {
                    images: {
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { order: 'asc' }
            },
            documents: {
                orderBy: { order: 'asc' }
            },
            tier: {
                include: {
                    features: {
                        include: {
                            feature: true
                        }
                    }
                }
            }
        },
    }) as ProfileCore | null;
});

import { cache } from "react";
import prisma from "@/lib/prisma";
import { ProfileCore } from "@/types";

// Cached data fetcher to deduplicate requests
export const getProfile = cache(async (subdomain: string) => {
    const profile = await prisma.profile.findUnique({
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
            },
            user: {
                select: {
                    email: true
                }
            }
        },
    });

    if (!profile) return null;

    // Serialize Decimal fields to numbers for client components
    return {
        ...profile,
        services: profile.services.map(service => ({
            ...service,
            price: service.price ? Number(service.price) : 0,
            minimumValue: service.minimumValue ? Number(service.minimumValue) : 0,
            pricePerDay: service.pricePerDay ? Number(service.pricePerDay) : 0,
        })),
        tier: profile.tier ? {
            ...profile.tier,
            price: profile.tier.price ? Number(profile.tier.price) : null,
        } : null
    } as any as ProfileCore;
});

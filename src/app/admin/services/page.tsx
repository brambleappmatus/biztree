import React from "react";
import prisma from "@/lib/prisma";
import ServicesManager from "@/components/admin/services-manager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LockedFeatureGuard } from "@/components/admin/LockedFeatureGuard";
import { PageHeader } from "@/components/ui/page-header";

export default async function ServicesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            profiles: {
                include: {
                    tier: {
                        include: {
                            features: {
                                include: {
                                    feature: true
                                }
                            }
                        }
                    },
                    services: {
                        include: {
                            workers: {
                                include: {
                                    worker: true
                                }
                            }
                        }
                    },
                    workers: true
                }
            }
        }
    });

    if (!user || !user.profiles || user.profiles.length === 0) {
        redirect("/onboarding");
    }

    const profile = user.profiles[0];
    const enabledFeatures = profile.tier?.features.map((f: any) => f.feature.key) || [];

    return (
        <LockedFeatureGuard featureKey="page_services">
            <div>
                <PageHeader
                    title="Správa služieb"
                    description="Spravujte svoje služby a ich nastavenia."
                />
                <ServicesManager
                    profileId={profile.id}
                    services={profile.services.map(service => ({
                        ...service,
                        price: service.price ? Number(service.price) : 0,
                        minimumValue: service.minimumValue ? Number(service.minimumValue) : 0,
                        pricePerDay: service.pricePerDay ? Number(service.pricePerDay) : 0,
                    }))}
                    workers={profile.workers}
                    isGoogleConnected={!!(profile.googleAccessToken && profile.googleRefreshToken)}
                    allowConcurrentServices={profile.allowConcurrentServices}
                    tierName={profile.tier?.name}
                    enabledFeatures={enabledFeatures}
                />
            </div>
        </LockedFeatureGuard>
    );
}

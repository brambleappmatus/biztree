import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import OnboardingForm from "./onboarding-form";
import { getStripePriceIds } from "../actions";

export default async function OnboardingPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Check if user already has a profile
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profiles: true }
    });

    if (user?.profiles && user.profiles.length > 0) {
        redirect("/admin");
    }

    // Get Stripe price IDs
    const priceIds = await getStripePriceIds();

    return <OnboardingForm businessPriceId={priceIds.businessMonthly} proPriceId={priceIds.proMonthly} />;
}

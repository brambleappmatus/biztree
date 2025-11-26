"use server";

import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { Resend } from "resend";
import { WelcomeEmail } from "@/components/emails/WelcomeEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function registerUser(data: {
    email: string;
    password: string;
}) {
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return { error: "Používateľ s týmto emailom už existuje" };
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: "USER",
                onboardingCompleted: false
            }
        });

        // Send welcome email
        try {
            await resend.emails.send({
                from: 'BizTree <no-reply@biztree.bio>',
                to: data.email,
                subject: 'Vitajte v BizTree!',
                react: WelcomeEmail({ name: data.email.split('@')[0] }) as React.ReactNode, // Use part of email as name for now
            });
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // Don't fail registration if email fails
        }

        return { success: true, userId: user.id };
    } catch (error) {
        console.error("Registration error:", error);
        throw error; // Re-throw to let Next.js handle it as 500, but now we have logs
    }
}

export async function checkSubdomainAvailability(subdomain: string) {
    const existing = await prisma.profile.findUnique({
        where: { subdomain }
    });

    return { available: !existing };
}

export async function createProfileFromOnboarding(userId: string, data: {
    subdomain: string;
    name: string;
    about?: string;
    phone?: string;
    email?: string;
    theme: string;
    bgImage?: string;
    bgBlur?: boolean;
    address?: string;
    language?: string;
    hours?: { day: number; isOpen: boolean; openTime: string; closeTime: string }[];
    socialLinks?: { platform: string; url: string }[];
}) {
    // Check subdomain availability again
    const existing = await prisma.profile.findUnique({
        where: { subdomain: data.subdomain }
    });

    if (existing) {
        return { error: "Subdoména už existuje" };
    }

    // Find or create FREE tier
    let freeTier = await prisma.tier.findUnique({
        where: { name: 'Free' }
    });

    if (!freeTier) {
        // Create Free tier if it doesn't exist (safety fallback)
        console.log("⚠️ Free tier not found, creating it...");
        freeTier = await prisma.tier.create({
            data: {
                name: 'Free',
                price: 0,
            }
        });
    }

    // Create profile with hours and social links
    const profile = await prisma.profile.create({
        data: {
            userId,
            subdomain: data.subdomain,
            name: data.name,
            about: data.about,
            phone: data.phone,
            email: data.email,
            theme: data.theme,
            bgImage: data.bgImage,
            bgBlur: data.bgBlur ?? false,
            address: data.address,
            language: data.language || "sk",
            tierId: freeTier.id,
            // Create hours if provided
            hours: data.hours && data.hours.length > 0 ? {
                create: data.hours
                    .filter(h => h.isOpen) // Only create records for open days
                    .map(h => ({
                        dayOfWeek: h.day,
                        openTime: h.openTime,
                        closeTime: h.closeTime,
                        isClosed: false
                    }))
            } : undefined,
            // Create social links if provided
            socialLinks: data.socialLinks && data.socialLinks.length > 0 ? {
                create: data.socialLinks
                    .filter(s => s.url && s.url.trim() !== '') // Only create if URL is provided
                    .map(s => ({
                        platform: s.platform,
                        url: s.url
                    }))
            } : undefined
        }
    });

    // Mark onboarding as completed
    await prisma.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true }
    });

    return { success: true };
}


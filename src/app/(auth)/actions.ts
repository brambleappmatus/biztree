"use server";

import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

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
}) {
    // Check subdomain availability again
    const existing = await prisma.profile.findUnique({
        where: { subdomain: data.subdomain }
    });

    if (existing) {
        return { error: "Subdoména už existuje" };
    }

    // Create profile
    await prisma.profile.create({
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
            language: "sk"
        }
    });

    // Mark onboarding as completed
    await prisma.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true }
    });

    return { success: true };
}

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
            // Default card styling: white background with 80% opacity and black text
            cardColor: "#ffffff",
            cardOpacity: 0.8,
            cardTextColor: "#000000",
            iconStyle: "standard",
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

export async function requestPasswordReset(email: string) {
    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { accounts: true }
        });

        if (!user) {
            // Don't reveal if user exists or not for security
            return { success: true };
        }

        // Check if user has a password (not OAuth-only)
        if (!user.password) {
            // User only has OAuth accounts, can't reset password
            return { success: true }; // Still return success to not reveal account info
        }

        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });

        // Send reset email
        const { ForgotPasswordEmail } = await import("@/components/emails/ForgotPasswordEmail");
        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

        try {
            await resend.emails.send({
                from: 'BizTree <no-reply@biztree.bio>',
                to: email,
                subject: 'Reset hesla - BizTree',
                react: ForgotPasswordEmail({
                    name: user.name || email.split('@')[0],
                    resetLink
                }) as React.ReactNode,
            });
        } catch (emailError) {
            console.error("Failed to send password reset email:", emailError);
            return { error: "Nepodarilo sa odoslať email. Skúste to prosím neskôr." };
        }

        return { success: true };
    } catch (error) {
        console.error("Password reset request error:", error);
        return { error: "Nastala chyba. Skúste to prosím neskôr." };
    }
}

export async function resetPassword(token: string, newPassword: string) {
    try {
        // Find user with valid token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date() // Token must not be expired
                }
            }
        });

        if (!user) {
            return { error: "Neplatný alebo expirovaný token. Požiadajte o nový reset hesla." };
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Password reset error:", error);
        return { error: "Nastala chyba pri resetovaní hesla. Skúste to prosím neskôr." };
    }
}

export async function getStripePriceIds() {
    return {
        businessMonthly: process.env.STRIPE_BUSINESS_PRICE_ID || '',
        proMonthly: process.env.STRIPE_PRO_PRICE_ID || '',
    };
}

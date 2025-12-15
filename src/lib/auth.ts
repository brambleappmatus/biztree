import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

export const authOptions: NextAuthOptions = {
    debug: true, // Enable debugging to see why sign-in fails
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        AppleProvider({
            clientId: process.env.APPLE_ID!,
            clientSecret: process.env.APPLE_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    onboardingCompleted: user.onboardingCompleted
                };
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" || account?.provider === "apple") {
                console.log(`🔐 ${account.provider} Sign In Attempt:`, {
                    userEmail: user.email,
                    accountProvider: account.provider,
                    profileEmail: profile?.email
                });

                // Check if user exists with this email
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                    include: { accounts: true }
                });

                if (existingUser) {
                    // Check if this OAuth provider is already linked
                    const isLinked = existingUser.accounts.some(
                        acc => acc.provider === account.provider
                    );

                    if (!isLinked) {
                        // Link the account
                        console.log("🔗 Linking OAuth account to existing user");
                        await prisma.account.create({
                            data: {
                                userId: existingUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                refresh_token: account.refresh_token,
                                access_token: account.access_token,
                                expires_at: account.expires_at,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                                session_state: account.session_state,
                            }
                        });
                    }
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.onboardingCompleted = (user as any).onboardingCompleted;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub!;
                (session.user as any).role = token.role as string;
                (session.user as any).onboardingCompleted = token.onboardingCompleted as boolean;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Check if this is a new OAuth user by looking for our special flag in the URL
            if (url.includes("newOAuthUser=true")) {
                // Extract the provider from URL
                const urlObj = new URL(url, baseUrl);
                const provider = urlObj.searchParams.get("provider") || "google";
                return `${baseUrl}/register/success?provider=${provider}`;
            }

            // Default redirect behavior
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        }
    },
    events: {
        async createUser({ user }) {
            console.log("👤 User Created:", user);

            // Send welcome email for new users (including OAuth users)
            try {
                const { Resend } = await import("resend");
                const { WelcomeEmail } = await import("@/components/emails/WelcomeEmail");

                const resend = new Resend(process.env.RESEND_API_KEY);

                await resend.emails.send({
                    from: 'BizTree <no-reply@biztree.bio>',
                    to: user.email!,
                    subject: 'Vitajte v BizTree!',
                    react: WelcomeEmail({
                        name: user.name || user.email!.split('@')[0]
                    }) as React.ReactNode,
                });

                console.log("✅ Welcome email sent to:", user.email);
            } catch (emailError) {
                console.error("❌ Failed to send welcome email:", emailError);
                // Don't fail user creation if email fails
            }
        },
        async linkAccount({ user, account }) {
            console.log("🔗 Account Linked:", { userId: user.id, provider: account.provider });
        },
        async signIn({ user, account, isNewUser }) {
            console.log("✅ Sign In Successful:", { userId: user.id, isNewUser, provider: account?.provider });
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function isSuperAdmin(session: any): boolean {
    return session?.user?.role === "SUPERADMIN";
}

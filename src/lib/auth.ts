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
            if (account?.provider === "google") {
                console.log("🔐 Google Sign In Attempt:", {
                    userEmail: user.email,
                    accountProvider: account.provider,
                    profileEmail: profile?.email
                });
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
        }
    },
    events: {
        async createUser({ user }) {
            console.log("👤 User Created:", user);
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

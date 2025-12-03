module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/Desktop/biztree/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const prismaClientSingleton = ()=>{
    return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
};
const prisma = globalThis.prisma ?? prismaClientSingleton();
const __TURBOPACK__default__export__ = prisma;
if ("TURBOPACK compile-time truthy", 1) globalThis.prisma = prisma;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/Desktop/biztree/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authOptions",
    ()=>authOptions,
    "hashPassword",
    ()=>hashPassword,
    "isSuperAdmin",
    ()=>isSuperAdmin,
    "verifyPassword",
    ()=>verifyPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f40$next$2d$auth$2f$prisma$2d$adapter$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/node_modules/@next-auth/prisma-adapter/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/node_modules/next-auth/providers/google.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2d$auth$2f$providers$2f$apple$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/node_modules/next-auth/providers/apple.js [app-route] (ecmascript)");
;
;
;
;
;
;
const authOptions = {
    debug: true,
    adapter: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f40$next$2d$auth$2f$prisma$2d$adapter$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaAdapter"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]),
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2d$auth$2f$providers$2f$apple$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
            allowDangerousEmailAccountLinking: true
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: "credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const user = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });
                if (!user || !user.password) {
                    return null;
                }
                const isPasswordValid = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(credentials.password, user.password);
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
        signIn: "/login"
    },
    callbacks: {
        async signIn ({ user, account, profile }) {
            if (account?.provider === "google" || account?.provider === "apple") {
                console.log(`🔐 ${account.provider} Sign In Attempt:`, {
                    userEmail: user.email,
                    accountProvider: account.provider,
                    profileEmail: profile?.email
                });
                // Check if user exists with this email
                const existingUser = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
                    where: {
                        email: user.email
                    },
                    include: {
                        accounts: true
                    }
                });
                if (existingUser) {
                    // Check if this OAuth provider is already linked
                    const isLinked = existingUser.accounts.some((acc)=>acc.provider === account.provider);
                    if (!isLinked) {
                        // Link the account
                        console.log("🔗 Linking OAuth account to existing user");
                        await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].account.create({
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
                                session_state: account.session_state
                            }
                        });
                    }
                }
            }
            return true;
        },
        async jwt ({ token, user }) {
            if (user) {
                token.role = user.role;
                token.onboardingCompleted = user.onboardingCompleted;
            }
            return token;
        },
        async session ({ session, token }) {
            if (session.user) {
                session.user.id = token.sub;
                session.user.role = token.role;
                session.user.onboardingCompleted = token.onboardingCompleted;
            }
            return session;
        }
    },
    events: {
        async createUser ({ user }) {
            console.log("👤 User Created:", user);
            // Send welcome email for new users (including OAuth users)
            try {
                const { Resend } = await __turbopack_context__.A("[project]/Desktop/biztree/node_modules/resend/dist/index.mjs [app-route] (ecmascript, async loader)");
                const { WelcomeEmail } = await __turbopack_context__.A("[project]/Desktop/biztree/src/components/emails/WelcomeEmail.tsx [app-route] (ecmascript, async loader)");
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                    from: 'BizTree <no-reply@biztree.bio>',
                    to: user.email,
                    subject: 'Vitajte v BizTree!',
                    react: WelcomeEmail({
                        name: user.name || user.email.split('@')[0]
                    })
                });
                console.log("✅ Welcome email sent to:", user.email);
            } catch (emailError) {
                console.error("❌ Failed to send welcome email:", emailError);
            // Don't fail user creation if email fails
            }
        },
        async linkAccount ({ user, account }) {
            console.log("🔗 Account Linked:", {
                userId: user.id,
                provider: account.provider
            });
        },
        async signIn ({ user, account, isNewUser }) {
            console.log("✅ Sign In Successful:", {
                userId: user.id,
                isNewUser,
                provider: account?.provider
            });
        }
    },
    secret: process.env.NEXTAUTH_SECRET
};
async function hashPassword(password) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(password, 12);
}
async function verifyPassword(password, hashedPassword) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, hashedPassword);
}
function isSuperAdmin(session) {
    return session?.user?.role === "SUPERADMIN";
}
}),
"[project]/Desktop/biztree/src/lib/licensing.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"000c11ce6b22c40a97a1526042300d7497a8697291":"getCurrentUserFeatures","402a9aa9aaaada7ebeb29e4109b30bb198786b8fcc":"getProfileFeatures","404dfe10cff4e9e17aa05871f8f90ebff1d30773f8":"getEffectiveTier","40984a28cd8b5f5be23f31c770f0c8980445a5a73a":"applyPromoCode","60ab408c342397d1b1e3b5ee4df9c50e232726978d":"validatePromoCode","60c7a5fc7187759a506d62d317e745d3667e8f7372":"hasFeatureAccess"},"",""] */ __turbopack_context__.s([
    "applyPromoCode",
    ()=>applyPromoCode,
    "getCurrentUserFeatures",
    ()=>getCurrentUserFeatures,
    "getEffectiveTier",
    ()=>getEffectiveTier,
    "getProfileFeatures",
    ()=>getProfileFeatures,
    "hasFeatureAccess",
    ()=>hasFeatureAccess,
    "validatePromoCode",
    ()=>validatePromoCode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
;
;
/**
 * Check if a subscription is expired and handle auto-downgrade
 */ async function checkAndHandleExpiration(profileId) {
    const profile = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].profile.findUnique({
        where: {
            id: profileId
        },
        select: {
            id: true,
            subscriptionExpiresAt: true,
            subscriptionStatus: true,
            tierId: true,
            tier: {
                select: {
                    name: true
                }
            }
        }
    });
    if (!profile) return;
    // Check if subscription is expired
    const now = new Date();
    if (profile.subscriptionExpiresAt && profile.subscriptionExpiresAt < now) {
        // Only downgrade if not already on Free tier
        if (profile.tier?.name !== "Free") {
            // Get Free tier
            const freeTier = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].tier.findUnique({
                where: {
                    name: "Free"
                }
            });
            if (freeTier) {
                // Update profile to Free tier
                await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].profile.update({
                    where: {
                        id: profileId
                    },
                    data: {
                        tierId: freeTier.id,
                        subscriptionStatus: "EXPIRED",
                        bgImage: "dark-gray" // Reset background on downgrade
                    }
                });
                // Log the downgrade
                await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].subscriptionHistory.create({
                    data: {
                        profileId,
                        action: "EXPIRED",
                        previousTierId: profile.tierId,
                        newTierId: freeTier.id,
                        performedBy: "SYSTEM",
                        notes: "Subscription expired and auto-downgraded to Free tier"
                    }
                });
            }
        }
    }
}
async function getEffectiveTier(profileId) {
    await checkAndHandleExpiration(profileId);
    const profile = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].profile.findUnique({
        where: {
            id: profileId
        },
        include: {
            tier: {
                include: {
                    features: {
                        include: {
                            feature: true
                        }
                    }
                }
            }
        }
    });
    return profile?.tier || null;
}
async function hasFeatureAccess(profileId, featureKey) {
    const tier = await getEffectiveTier(profileId);
    if (!tier) {
        // No tier assigned = no access to premium features
        return false;
    }
    return tier.features.some((tf)=>tf.feature.key === featureKey);
}
async function getProfileFeatures(profileId) {
    const tier = await getEffectiveTier(profileId);
    if (!tier) {
        return [];
    }
    return tier.features.map((tf)=>tf.feature.key);
}
async function getCurrentUserFeatures() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
    if (!session?.user?.id) {
        return [];
    }
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
        where: {
            id: session.user.id
        },
        include: {
            profiles: {
                select: {
                    id: true
                }
            }
        }
    });
    if (!user || !user.profiles || user.profiles.length === 0) {
        return [];
    }
    return getProfileFeatures(user.profiles[0].id);
}
async function validatePromoCode(code, tierId) {
    const promoCode = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].promoCode.findUnique({
        where: {
            code: code.toUpperCase()
        }
    });
    if (!promoCode) {
        return {
            valid: false,
            error: "Promo code not found"
        };
    }
    if (!promoCode.isActive) {
        return {
            valid: false,
            error: "Promo code is inactive"
        };
    }
    const now = new Date();
    if (promoCode.validFrom > now) {
        return {
            valid: false,
            error: "Promo code not yet valid"
        };
    }
    if (promoCode.validUntil && promoCode.validUntil < now) {
        return {
            valid: false,
            error: "Promo code has expired"
        };
    }
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
        return {
            valid: false,
            error: "Promo code usage limit reached"
        };
    }
    // Check if applicable to the tier
    if (tierId && promoCode.applicableTierIds.length > 0) {
        if (!promoCode.applicableTierIds.includes(tierId)) {
            return {
                valid: false,
                error: "Promo code not applicable to this tier"
            };
        }
    }
    return {
        valid: true,
        promoCode: {
            id: promoCode.id,
            code: promoCode.code,
            type: promoCode.type,
            value: promoCode.value,
            description: promoCode.description
        }
    };
}
async function applyPromoCode(promoCodeId) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].promoCode.update({
        where: {
            id: promoCodeId
        },
        data: {
            currentUses: {
                increment: 1
            }
        }
    });
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getEffectiveTier,
    hasFeatureAccess,
    getProfileFeatures,
    getCurrentUserFeatures,
    validatePromoCode,
    applyPromoCode
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getEffectiveTier, "404dfe10cff4e9e17aa05871f8f90ebff1d30773f8", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(hasFeatureAccess, "60c7a5fc7187759a506d62d317e745d3667e8f7372", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getProfileFeatures, "402a9aa9aaaada7ebeb29e4109b30bb198786b8fcc", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getCurrentUserFeatures, "000c11ce6b22c40a97a1526042300d7497a8697291", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(validatePromoCode, "60ab408c342397d1b1e3b5ee4df9c50e232726978d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(applyPromoCode, "40984a28cd8b5f5be23f31c770f0c8980445a5a73a", null);
}),
"[project]/Desktop/biztree/src/app/api/user/features/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$licensing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/src/lib/licensing.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const features = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$src$2f$lib$2f$licensing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCurrentUserFeatures"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            features
        });
    } catch (error) {
        console.error("Failed to fetch user features:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            features: []
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5944fd10._.js.map
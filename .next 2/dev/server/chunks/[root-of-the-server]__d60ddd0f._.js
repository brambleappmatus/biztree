module.exports = [
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/biztree/src/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/biztree/node_modules/next/server.js [middleware] (ecmascript)");
;
function proxy(req) {
    const url = req.nextUrl;
    const hostname = req.headers.get("host") || "";
    // Skip subdomain routing for Vercel deployment URLs
    if (hostname.includes("vercel.app")) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Define allowed domains (localhost, biztree.sk, biztree.bio, etc.)
    const allowedDomains = [
        "localhost",
        "biztree.sk",
        "biztree.bio"
    ];
    // Remove port from hostname for domain check
    const hostnameWithoutPort = hostname.split(":")[0];
    // Check if the current hostname is a subdomain
    const isSubdomain = !allowedDomains.some((domain)=>hostnameWithoutPort === domain || hostnameWithoutPort.endsWith(`.${domain}`));
    // Extract subdomain
    // For localhost:3000, subdomains are like test.localhost:3000
    // For biztree.sk, subdomains are like test.biztree.sk
    let subdomain = "";
    if (hostname.includes("localhost")) {
        const parts = hostname.split(".");
        if (parts.length > 1 && parts[0] !== "localhost") {
            subdomain = parts[0];
        }
    } else {
        const parts = hostname.split(".");
        if (parts.length > 2) {
            subdomain = parts[0];
        }
    }
    // Handle subdomain routing
    if (subdomain && subdomain !== "www" && !url.pathname.startsWith("/privacy") && !url.pathname.startsWith("/cookies") && !url.pathname.startsWith("/textures")) {
        // Rewrite to /app/[subdomain]
        console.log(`Rewriting subdomain ${subdomain} to /app/${subdomain}${url.pathname}`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(new URL(`/app/${subdomain}${url.pathname}`, req.url));
    }
    // Handle admin routing with onboarding check
    if (url.pathname.startsWith("/admin")) {
        // Get the session token from cookies
        const sessionToken = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");
        // If no session, redirect to login
        if (!sessionToken) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/login", req.url));
        }
        // Note: We can't easily check onboardingCompleted in middleware without a database call
        // The server component will handle the onboarding redirect
        // But we can add a loading state to prevent the flash
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Handle public landing page (no subdomain)
    if (!subdomain || subdomain === "www") {
        // If accessing root path, serve the landing page
        // which is effectively the default handling in App Router (src/app/page.tsx)
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$biztree$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */ "/((?!api|_next/static|_next/image|favicon.ico).*)"
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d60ddd0f._.js.map
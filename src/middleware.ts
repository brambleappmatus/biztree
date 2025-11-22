import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get("host") || "";

    // Skip subdomain routing for Vercel deployment URLs
    if (hostname.includes("vercel.app")) {
        return NextResponse.next();
    }

    // Define allowed domains (localhost, biztree.sk, biztree.bio, etc.)
    const allowedDomains = ["localhost", "biztree.sk", "biztree.bio"];

    // Remove port from hostname for domain check
    const hostnameWithoutPort = hostname.split(":")[0];

    // Check if the current hostname is a subdomain
    const isSubdomain = !allowedDomains.some(domain => hostnameWithoutPort === domain || hostnameWithoutPort.endsWith(`.${domain}`));

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
        return NextResponse.rewrite(new URL(`/app/${subdomain}${url.pathname}`, req.url));
    }

    // Handle admin routing with onboarding check
    if (url.pathname.startsWith("/admin")) {
        // Get the session token from cookies
        const sessionToken = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");

        // If no session, redirect to login
        if (!sessionToken) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // Note: We can't easily check onboardingCompleted in middleware without a database call
        // The server component will handle the onboarding redirect
        // But we can add a loading state to prevent the flash
        return NextResponse.next();
    }

    // Handle public landing page (no subdomain)
    if (!subdomain || subdomain === "www") {
        // If accessing root path, serve the landing page
        // which is effectively the default handling in App Router (src/app/page.tsx)
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};

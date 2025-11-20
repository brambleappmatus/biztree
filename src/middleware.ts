import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get("host") || "";

    // Define allowed domains (localhost, vercel.app, etc.)
    const allowedDomains = ["localhost", "biztree.sk", "vercel.app"];

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
    if (subdomain && subdomain !== "www") {
        // Rewrite to /app/[subdomain]
        console.log(`Rewriting subdomain ${subdomain} to /app/${subdomain}${url.pathname}`);
        return NextResponse.rewrite(new URL(`/app/${subdomain}${url.pathname}`, req.url));
    }

    // Handle admin routing
    if (url.pathname.startsWith("/admin")) {
        // Keep as is, or add auth checks here later
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

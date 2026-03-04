import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Role-based route access configuration
const routePermissions = {
    "/dashboard/patient": ["patient"],
    "/dashboard/nurse": ["nurse"],
    "/dashboard/physician": ["physician"],
    "/dashboard/admin": ["admin"],
    "/dashboard/staff": ["admin", "nurse"],
    "/dashboard/beds": ["admin", "nurse", "physician"],
    "/dashboard/equipment": ["admin", "nurse", "physician"],
    "/dashboard/inventory": ["admin", "nurse"],
    "/dashboard/blood-bank": ["admin", "nurse", "physician"],
    "/dashboard/appointments": ["admin", "nurse", "physician", "patient"],
    "/dashboard/medical-records": ["admin", "physician", "patient"],
    "/dashboard/departments": ["admin"],
    "/dashboard/rooms": ["admin", "nurse"],
    "/dashboard": ["admin", "nurse", "physician", "patient"],
}

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl
        const userRole = req.nextauth.token?.role

        // Check if the current route requires specific permissions
        for (const [route, allowedRoles] of Object.entries(routePermissions)) {
            if (pathname.startsWith(route)) {
                if (!userRole || !allowedRoles.includes(userRole)) {
                    // Redirect to unauthorized page
                    return NextResponse.redirect(new URL("/unauthorized", req.url))
                }
            }
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized({ req, token }) {
                // Allow access to public routes
                if (
                    req.nextUrl.pathname === "/" ||
                    req.nextUrl.pathname === "/login" ||
                    req.nextUrl.pathname === "/signup" ||
                    req.nextUrl.pathname === "/forgot-password" ||
                    req.nextUrl.pathname.startsWith("/reset-password") ||
                    req.nextUrl.pathname === "/unauthorized" ||
                    req.nextUrl.pathname.startsWith("/api/auth") ||
                    req.nextUrl.pathname.startsWith("/_next") ||
                    req.nextUrl.pathname.startsWith("/images") ||
                    req.nextUrl.pathname.startsWith("/icon") ||
                    req.nextUrl.pathname.startsWith("/favicon")
                ) {
                    return true
                }

                // Require authentication for all other routes
                return !!token
            },
        },
        pages: {
            signIn: "/login",
            error: "/login",
        },
    }
)

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/((?!auth).)*", // Match all API routes except auth
    ],
}

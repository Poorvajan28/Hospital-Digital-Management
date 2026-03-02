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
                    // Redirect to unauthorized page or dashboard
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
                    req.nextUrl.pathname.startsWith("/api/auth")
                ) {
                    return true
                }
                // Require authentication for all other routes
                return !!token
            },
        },
    }
)

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}

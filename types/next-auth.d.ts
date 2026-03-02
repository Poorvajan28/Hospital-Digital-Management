import NextAuth from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            name: string
            role: "patient" | "nurse" | "physician" | "admin"
            department?: string
        }
    }

    interface User {
        id: string
        email: string
        name: string
        role: "patient" | "nurse" | "physician" | "admin"
        department?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: "patient" | "nurse" | "physician" | "admin"
        department?: string
    }
}
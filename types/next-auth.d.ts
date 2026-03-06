import "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
            role: "admin" | "physician" | "nurse" | "patient"
            department: string | null
        }
    }

    interface User {
        id: string
        role: string
        department: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        department: string | null
    }
}

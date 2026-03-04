import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

interface DemoUser {
    id: string
    email: string
    password: string
    name: string
    role: "admin" | "physician" | "nurse" | "patient"
    department: string | null
}

// Demo users for testing
const demoUsers: DemoUser[] = [
    {
        id: "1",
        email: "admin@example.com",
        password: "admin123",
        name: "Admin User",
        role: "admin",
        department: "Administration"
    },
    {
        id: "2",
        email: "doctor@example.com",
        password: "doctor123",
        name: "Dr. Priya Sharma",
        role: "physician",
        department: "Cardiology"
    },
    {
        id: "3",
        email: "nurse@example.com",
        password: "nurse123",
        name: "Lakshmi N",
        role: "nurse",
        department: "General Medicine"
    },
    {
        id: "4",
        email: "patient@example.com",
        password: "patient123",
        name: "Rajesh Kumar",
        role: "patient",
        department: null
    }
]

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                role: { label: "Role", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                // Find user in demo users
                const user = demoUsers.find(
                    u => u.email.toLowerCase() === credentials.email.toLowerCase() &&
                        u.password === credentials.password
                )

                if (!user) {
                    console.error("Invalid credentials for:", credentials.email)
                    return null
                }

                // Check if role matches
                if (credentials.role && user.role !== credentials.role) {
                    console.error("Role mismatch:", credentials.role, "!==", user.role)
                    return null
                }

                console.log("Authenticated user:", user.email, "with role:", user.role)

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    department: user.department
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production"
            }
        }
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.department = user.department
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as "admin" | "physician" | "nurse" | "patient"
                session.user.department = token.department as string | null
                session.user.id = token.id as string
            }
            return session
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    debug: process.env.NODE_ENV === "development"
})

export { handler as GET, handler as POST }

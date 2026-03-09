import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { validatePatientCredentials } from "@/lib/registered-users"

// For NextAuth v4 on Vercel: dynamically set NEXTAUTH_URL at runtime
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
}

const isProduction = process.env.NODE_ENV === "production"

export const authOptions: NextAuthOptions = {
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

                try {
                    const user = await validatePatientCredentials(
                        credentials.email,
                        credentials.password
                    )

                    if (!user) {
                        console.error("Invalid credentials for:", credentials.email)
                        return null
                    }

                    if (credentials.role && user.role !== credentials.role && user.role !== 'patient') {
                        console.error("Role mismatch:", credentials.role, "!==", user.role)
                        return null
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role as "admin" | "physician" | "nurse" | "patient",
                        department: user.department || null
                    }
                } catch (error) {
                    console.error("Auth error:", error)
                    return null
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    cookies: {
        sessionToken: {
            name: isProduction
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: isProduction,
            },
        },
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.department = (user as any).department;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (token && session.user) {
                session.user.role = token.role;
                session.user.department = token.department;
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    debug: process.env.NODE_ENV === "development"
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

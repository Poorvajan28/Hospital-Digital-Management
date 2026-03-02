import bcrypt from "bcryptjs"
import { getTable } from "./db"

export type UserRole = "patient" | "nurse" | "physician" | "admin"

export interface User {
    id: string
    email: string
    name: string
    role: UserRole
    department?: string
    phone?: string
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        const users = await getTable<User>("users", {
            filter: { email }
        })
        return users[0] || null
    } catch (error) {
        console.error("Error fetching user:", error)
        return null
    }
}

export function hasRole(user: User | null, role: UserRole): boolean {
    return user?.role === role
}

export function checkPermission(user: User | null, allowedRoles: UserRole[]): boolean {
    if (!user) return false
    return allowedRoles.includes(user.role)
}

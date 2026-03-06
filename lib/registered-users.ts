// Database-backed storage for registered users
import { query, insert } from './db'

export interface RegisteredUser {
    id: string
    email: string
    password: string
    name: string
    role: string
    department?: string | null
}

/**
 * Add a new registered user (patient or staff)
 */
export async function addRegisteredPatient(patient: {
    id: string
    email: string
    password: string
    firstName: string
    lastName: string
    role?: string
}) {
    try {
        const user = {
            id_ref: patient.id,
            email: patient.email.toLowerCase(),
            password: patient.password, // In production, this should be hashed
            name: `${patient.firstName} ${patient.lastName}`,
            role: patient.role || "patient"
        }

        const newUser = await insert("users", user)
        console.log("✅ User registered in database:", patient.email)
        return newUser
    } catch (error: any) {
        console.error("❌ Failed to register user in database:", error.message)
        // Check if user already exists
        if (error.message.includes("unique-constraint") || error.message.includes("already exists")) {
            console.log("User already exists, skipping insertion")
            return null
        }
        throw error
    }
}

/**
 * Get a user by email from the database
 */
export async function getRegisteredPatient(email: string): Promise<RegisteredUser | undefined> {
    try {
        const users = await query<RegisteredUser>(
            "SELECT id::text, email, password, name, role, department FROM users WHERE email = $1",
            [email.toLowerCase()]
        )
        return users[0]
    } catch (error) {
        console.error("❌ Database error fetching user:", error)
        return undefined
    }
}

/**
 * Validate user credentials against the database
 */
export async function validatePatientCredentials(email: string, password: string): Promise<RegisteredUser | null> {
    console.log("🔍 Validating database credentials for:", email)

    try {
        const user = await getRegisteredPatient(email)

        if (user && user.password === password) {
            console.log("✅ Credentials valid for:", email)
            return user
        }

        console.log("❌ Invalid credentials for:", email)
        return null
    } catch (error) {
        console.error("❌ Error validating credentials:", error)
        return null
    }
}

/**
 * Get all registered users from the database
 */
export async function getAllRegisteredPatients(): Promise<RegisteredUser[]> {
    try {
        return await query<RegisteredUser>("SELECT id::text, email, name, role, department FROM users")
    } catch (error) {
        console.error("❌ Error fetching all users:", error)
        return []
    }
}

// In-memory storage for registered patients
// In production, this would be stored in a database

interface RegisteredUser {
    id: string
    email: string
    password: string // In production, this should be hashed
    name: string
    role: "patient"
    firstName: string
    lastName: string
}

// Store registered patients (in production, use database)
const registeredPatients: Map<string, RegisteredUser> = new Map()

export function addRegisteredPatient(patient: {
    id: string
    email: string
    password: string
    firstName: string
    lastName: string
}) {
    const user: RegisteredUser = {
        id: patient.id,
        email: patient.email,
        password: patient.password,
        name: `${patient.firstName} ${patient.lastName}`,
        role: "patient",
        firstName: patient.firstName,
        lastName: patient.lastName
    }
    registeredPatients.set(patient.email.toLowerCase(), user)
    console.log("Registered patient added:", patient.email, "with password:", patient.password ? "YES" : "NO")
    console.log("Total registered patients:", registeredPatients.size)
}

export function getRegisteredPatient(email: string): RegisteredUser | undefined {
    return registeredPatients.get(email.toLowerCase())
}

export function validatePatientCredentials(email: string, password: string): RegisteredUser | null {
    console.log("Validating credentials for:", email)
    console.log("Registered patients:", Array.from(registeredPatients.entries()))
    const user = registeredPatients.get(email.toLowerCase())
    console.log("Found user:", user)
    console.log("Password match:", user?.password === password)
    if (user && user.password === password) {
        return user
    }
    return null
}

export function getAllRegisteredPatients(): RegisteredUser[] {
    return Array.from(registeredPatients.values())
}

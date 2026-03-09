import { type UserRole } from "./role-permissions"

/**
 * Masks sensitive information based on the user's role.
 * Sensitive data is fully visible to 'admin' and relevant medical roles.
 * Masked for 'patient' or others with limited view access.
 */
export function maskPII(value: string | undefined | null, role: UserRole | undefined, fieldType: "phone" | "email" | "address" | "diagnosis" | "name" = "phone"): string {
    if (!value) return ""
    if (role === "admin") return value

    // Physicians and Nurses can see patient diagnoses and contact info
    if ((role === "physician" || role === "nurse") && (fieldType === "phone" || fieldType === "email" || fieldType === "address" || fieldType === "diagnosis")) {
        return value
    }

    // Default masking logic
    switch (fieldType) {
        case "phone":
            return value.length > 4 ? `******${value.slice(-4)}` : "****"
        case "email":
            const [local, domain] = value.split("@")
            return local ? `${local[0]}***@${domain}` : "***@***.com"
        case "address":
            return "Masked for Privacy"
        case "diagnosis":
            return "Confidential Medical Detail"
        case "name":
            return value.split(" ").map((n, i) => i === 0 ? n : "***").join(" ")
        default:
            return "****"
    }
}

/**
 * Checks if a user has access to raw sensitive data
 */
export function canViewPII(role: UserRole | undefined): boolean {
    return role === "admin" || role === "physician" || role === "nurse"
}

// Role-based CRUD permission definitions
// Roles: admin, physician, nurse, patient

export type UserRole = "admin" | "physician" | "nurse" | "patient"

export type Permission = "view" | "add" | "edit" | "delete"

export type Resource =
    | "staff"
    | "appointments"
    | "patients"
    | "inventory"
    | "blood_bank"
    | "medical_records"
    | "departments"
    | "rooms"
    | "equipment"

const permissions: Record<UserRole, Record<Resource, Permission[]>> = {
    admin: {
        staff: ["view", "add", "edit", "delete"],
        appointments: ["view", "add", "edit", "delete"],
        patients: ["view", "add", "edit", "delete"],
        inventory: ["view", "add", "edit", "delete"],
        blood_bank: ["view", "add", "edit", "delete"],
        medical_records: ["view", "add", "edit", "delete"],
        departments: ["view", "add", "edit", "delete"],
        rooms: ["view", "add", "edit", "delete"],
        equipment: ["view", "add", "edit", "delete"],
    },
    physician: {
        staff: ["view"],
        appointments: ["view", "add", "edit"],
        patients: ["view", "add", "edit"],
        inventory: ["view"],
        blood_bank: ["view"],
        medical_records: ["view", "add", "edit"],
        departments: ["view"],
        rooms: ["view"],
        equipment: ["view"],
    },
    nurse: {
        staff: ["view"],
        appointments: ["view", "add"],
        patients: ["view", "add"],
        inventory: ["view"],
        blood_bank: ["view", "add"],
        medical_records: ["view"],
        departments: ["view"],
        rooms: ["view"],
        equipment: ["view"],
    },
    patient: {
        staff: ["view"],
        appointments: ["view"],
        patients: [],
        inventory: [],
        blood_bank: [],
        medical_records: ["view"],
        departments: ["view"],
        rooms: [],
        equipment: [],
    },
}

export function hasPermission(
    role: UserRole | undefined,
    resource: Resource,
    permission: Permission
): boolean {
    if (!role) return false
    return permissions[role]?.[resource]?.includes(permission) ?? false
}

export function canAdd(role: UserRole | undefined, resource: Resource): boolean {
    return hasPermission(role, resource, "add")
}

export function canEdit(role: UserRole | undefined, resource: Resource): boolean {
    return hasPermission(role, resource, "edit")
}

export function canDelete(role: UserRole | undefined, resource: Resource): boolean {
    return hasPermission(role, resource, "delete")
}

export function canView(role: UserRole | undefined, resource: Resource): boolean {
    return hasPermission(role, resource, "view")
}

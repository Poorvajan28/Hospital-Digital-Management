"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    BedDouble,
    Stethoscope,
    Droplets,
    Users,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ArrowRight,
    MapPin,
    Activity,
    Calendar,
    Wrench,
    Thermometer
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types for Hospital Resources
interface BedResource {
    id: string
    ward: string
    bedNumber: string
    type: 'general' | 'icu' | 'emergency' | 'private'
    status: 'available' | 'occupied' | 'maintenance' | 'reserved'
    patientName?: string
    admissionDate?: string
    expectedDischarge?: string
}

interface EquipmentResource {
    id: string
    name: string
    type: string
    department: string
    status: 'available' | 'in_use' | 'maintenance' | 'out_of_order'
    lastMaintenance?: string
    nextMaintenance?: string
}

interface BloodResource {
    group: string
    units: number
    minThreshold: number
    status: 'adequate' | 'low' | 'critical'
}

interface StaffResource {
    id: string
    name: string
    role: string
    department: string
    status: 'on_duty' | 'off_duty' | 'on_leave' | 'emergency_on_call'
    currentAssignment?: string
}

// Mock data for demonstration
const bedResources: BedResource[] = [
    { id: '1', ward: 'General Ward A', bedNumber: 'A-01', type: 'general', status: 'occupied', patientName: 'Rajesh Kumar', admissionDate: '02/03/2026', expectedDischarge: '05/03/2026' },
    { id: '2', ward: 'General Ward A', bedNumber: 'A-02', type: 'general', status: 'available' },
    { id: '3', ward: 'General Ward A', bedNumber: 'A-03', type: 'general', status: 'maintenance' },
    { id: '4', ward: 'ICU', bedNumber: 'ICU-01', type: 'icu', status: 'occupied', patientName: 'Lakshmi N', admissionDate: '01/03/2026' },
    { id: '5', ward: 'ICU', bedNumber: 'ICU-02', type: 'icu', status: 'available' },
    { id: '6', ward: 'Emergency', bedNumber: 'E-01', type: 'emergency', status: 'occupied', patientName: 'Suresh M', admissionDate: '02/03/2026' },
    { id: '7', ward: 'Emergency', bedNumber: 'E-02', type: 'emergency', status: 'available' },
    { id: '8', ward: 'Private Room', bedNumber: 'P-101', type: 'private', status: 'reserved' },
]

const equipmentResources: EquipmentResource[] = [
    { id: '1', name: 'Ventilator', type: 'Life Support', department: 'ICU', status: 'in_use', lastMaintenance: '15/02/2026', nextMaintenance: '15/03/2026' },
    { id: '2', name: 'X-Ray Machine', type: 'Diagnostic', department: 'Radiology', status: 'available', lastMaintenance: '01/02/2026', nextMaintenance: '01/05/2026' },
    { id: '3', name: 'MRI Scanner', type: 'Diagnostic', department: 'Radiology', status: 'maintenance', lastMaintenance: '01/01/2026' },
    { id: '4', name: 'Defibrillator', type: 'Emergency', department: 'Emergency', status: 'available', lastMaintenance: '10/02/2026', nextMaintenance: '10/03/2026' },
    { id: '5', name: 'Dialysis Machine', type: 'Therapeutic', department: 'Nephrology', status: 'in_use', lastMaintenance: '20/02/2026', nextMaintenance: '20/03/2026' },
]

const bloodResources: BloodResource[] = [
    { group: 'A+', units: 25, minThreshold: 15, status: 'adequate' },
    { group: 'A-', units: 8, minThreshold: 10, status: 'low' },
    { group: 'B+', units: 32, minThreshold: 15, status: 'adequate' },
    { group: 'B-', units: 5, minThreshold: 8, status: 'critical' },
    { group: 'AB+', units: 12, minThreshold: 10, status: 'adequate' },
    { group: 'AB-', units: 3, minThreshold: 5, status: 'critical' },
    { group: 'O+', units: 45, minThreshold: 20, status: 'adequate' },
    { group: 'O-', units: 10, minThreshold: 12, status: 'low' },
]

const staffResources: StaffResource[] = [
    { id: '1', name: 'Dr. Priya Sharma', role: 'Cardiologist', department: 'Cardiology', status: 'on_duty', currentAssignment: 'OPD-1' },
    { id: '2', name: 'Dr. Karthik R', role: 'General Surgeon', department: 'Surgery', status: 'on_duty', currentAssignment: 'OT-2' },
    { id: '3', name: 'Nurse Anitha', role: 'Staff Nurse', department: 'ICU', status: 'on_duty', currentAssignment: 'ICU-01' },
    { id: '4', name: 'Dr. Venkatesh', role: 'Orthopedic', department: 'Orthopedics', status: 'emergency_on_call' },
    { id: '5', name: 'Nurse Meena', role: 'Staff Nurse', department: 'General Ward', status: 'off_duty' },
    { id: '6', name: 'Dr. Lakshmi', role: 'Pediatrician', department: 'Pediatrics', status: 'on_leave' },
]

// Status helpers
const getBedStatusColor = (status: BedResource['status']) => {
    const colors = {
        available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        occupied: 'bg-rose-100 text-rose-800 border-rose-200',
        maintenance: 'bg-amber-100 text-amber-800 border-amber-200',
        reserved: 'bg-blue-100 text-blue-800 border-blue-200',
    }
    return colors[status]
}

const getEquipmentStatusColor = (status: EquipmentResource['status']) => {
    const colors = {
        available: 'bg-emerald-100 text-emerald-800',
        in_use: 'bg-blue-100 text-blue-800',
        maintenance: 'bg-amber-100 text-amber-800',
        out_of_order: 'bg-rose-100 text-rose-800',
    }
    return colors[status]
}

const getBloodStatusColor = (status: BloodResource['status']) => {
    const colors = {
        adequate: 'bg-emerald-100 text-emerald-800',
        low: 'bg-amber-100 text-amber-800',
        critical: 'bg-rose-100 text-rose-800',
    }
    return colors[status]
}

const getStaffStatusColor = (status: StaffResource['status']) => {
    const colors = {
        on_duty: 'bg-emerald-100 text-emerald-800',
        off_duty: 'bg-slate-100 text-slate-800',
        on_leave: 'bg-amber-100 text-amber-800',
        emergency_on_call: 'bg-rose-100 text-rose-800',
    }
    return colors[status]
}

// Summary stats
const bedStats = {
    total: bedResources.length,
    available: bedResources.filter(b => b.status === 'available').length,
    occupied: bedResources.filter(b => b.status === 'occupied').length,
    maintenance: bedResources.filter(b => b.status === 'maintenance').length,
}

const equipmentStats = {
    total: equipmentResources.length,
    available: equipmentResources.filter(e => e.status === 'available').length,
    inUse: equipmentResources.filter(e => e.status === 'in_use').length,
    maintenance: equipmentResources.filter(e => e.status === 'maintenance').length,
}

const bloodStats = {
    critical: bloodResources.filter(b => b.status === 'critical').length,
    low: bloodResources.filter(b => b.status === 'low').length,
}

const staffStats = {
    onDuty: staffResources.filter(s => s.status === 'on_duty').length,
    onCall: staffResources.filter(s => s.status === 'emergency_on_call').length,
}

export function ResourceManagerDashboard() {
    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Hospital Resource Manager</h1>
                <p className="text-muted-foreground">
                    Real-time monitoring of beds, equipment, blood bank, and staff availability
                </p>
            </div>

            {/* Critical Alerts */}
            {(bloodStats.critical > 0 || bedStats.available < 3) && (
                <div className="space-y-2">
                    {bloodStats.critical > 0 && (
                        <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
                            <AlertTriangle className="h-5 w-5 text-rose-600" />
                            <div>
                                <p className="font-semibold text-rose-900">Critical Blood Stock Alert</p>
                                <p className="text-sm text-rose-700">
                                    {bloodStats.critical} blood groups at critical level. Immediate donor recruitment required.
                                </p>
                            </div>
                        </div>
                    )}
                    {bedStats.available < 3 && (
                        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="font-semibold text-amber-900">Low Bed Availability</p>
                                <p className="text-sm text-amber-700">
                                    Only {bedStats.available} beds available. Consider patient discharge planning.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Resource Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Beds Summary */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round((bedStats.occupied / bedStats.total) * 100)}%</div>
                        <div className="mt-2 space-y-1">
                            <Progress value={(bedStats.occupied / bedStats.total) * 100} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{bedStats.available} Available</span>
                                <span>{bedStats.occupied} Occupied</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Equipment Summary */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Equipment Status</CardTitle>
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{equipmentStats.available}</div>
                        <p className="text-xs text-muted-foreground">
                            Available out of {equipmentStats.total} equipment
                        </p>
                        {equipmentStats.maintenance > 0 && (
                            <p className="mt-1 text-xs text-amber-600">
                                {equipmentStats.maintenance} under maintenance
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Blood Bank Summary */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blood Bank</CardTitle>
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bloodResources.reduce((acc, b) => acc + b.units, 0)}</div>
                        <p className="text-xs text-muted-foreground">Total units available</p>
                        {bloodStats.critical > 0 && (
                            <p className="mt-1 text-xs text-rose-600">{bloodStats.critical} critical groups</p>
                        )}
                    </CardContent>
                </Card>

                {/* Staff Summary */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Staff on Duty</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{staffStats.onDuty}</div>
                        <p className="text-xs text-muted-foreground">
                            {staffStats.onCall} on emergency call
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Resource Views */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Bed Management */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <BedDouble className="h-5 w-5" />
                                    Bed Allocation
                                </CardTitle>
                                <CardDescription>Real-time bed occupancy status</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                View All <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {bedResources.slice(0, 5).map((bed) => (
                                <div
                                    key={bed.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-lg font-semibold",
                                            bed.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                        )}>
                                            {bed.bedNumber}
                                        </div>
                                        <div>
                                            <p className="font-medium">{bed.ward}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {bed.type.charAt(0).toUpperCase() + bed.type.slice(1)} Bed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className={getBedStatusColor(bed.status)}>
                                            {bed.status.replace('_', ' ')}
                                        </Badge>
                                        {bed.patientName && (
                                            <p className="mt-1 text-xs text-muted-foreground">{bed.patientName}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Equipment Status */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Medical Equipment
                                </CardTitle>
                                <CardDescription>Equipment availability and maintenance</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                View All <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {equipmentResources.map((equipment) => (
                                <div
                                    key={equipment.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                            <Wrench className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{equipment.name}</p>
                                            <p className="text-sm text-muted-foreground">{equipment.department}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className={getEquipmentStatusColor(equipment.status)}>
                                            {equipment.status.replace('_', ' ')}
                                        </Badge>
                                        {equipment.nextMaintenance && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Next: {equipment.nextMaintenance}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Blood Bank */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Droplets className="h-5 w-5" />
                                    Blood Bank Inventory
                                </CardTitle>
                                <CardDescription>Current blood stock levels</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                Manage <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-2">
                            {bloodResources.map((blood) => (
                                <div
                                    key={blood.group}
                                    className={cn(
                                        "rounded-lg border p-3 text-center",
                                        blood.status === 'critical' && "border-rose-200 bg-rose-50",
                                        blood.status === 'low' && "border-amber-200 bg-amber-50"
                                    )}
                                >
                                    <p className="text-lg font-bold">{blood.group}</p>
                                    <p className={cn(
                                        "text-2xl font-bold",
                                        blood.status === 'adequate' ? 'text-emerald-600' :
                                            blood.status === 'low' ? 'text-amber-600' : 'text-rose-600'
                                    )}>
                                        {blood.units}
                                    </p>
                                    <p className="text-xs text-muted-foreground">units</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                <span>Adequate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-amber-500" />
                                <span>Low</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-rose-500" />
                                <span>Critical</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Staff on Duty */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Staff Availability
                                </CardTitle>
                                <CardDescription>Current staff status and assignments</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                Schedule <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {staffResources.map((staff) => (
                                <div
                                    key={staff.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <span className="text-sm font-semibold text-primary">
                                                {staff.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{staff.name}</p>
                                            <p className="text-sm text-muted-foreground">{staff.role} • {staff.department}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className={getStaffStatusColor(staff.status)}>
                                            {staff.status.replace('_', ' ')}
                                        </Badge>
                                        {staff.currentAssignment && (
                                            <p className="mt-1 text-xs text-muted-foreground">{staff.currentAssignment}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common resource management tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button>Admit Patient</Button>
                        <Button variant="outline">Discharge Patient</Button>
                        <Button variant="outline">Book Equipment</Button>
                        <Button variant="outline">Request Blood</Button>
                        <Button variant="outline">Schedule Staff</Button>
                        <Button variant="outline">Generate Report</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

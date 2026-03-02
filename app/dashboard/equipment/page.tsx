"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Stethoscope,
    Search,
    Plus,
    Wrench,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    Building,
    MoreHorizontal,
    Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatIndianDate } from "@/lib/indian-utils"

interface Equipment {
    id: string
    name: string
    type: string
    department: string
    status: 'available' | 'in_use' | 'maintenance' | 'out_of_order'
    serialNumber: string
    purchaseDate: string
    warrantyExpiry: string
    lastMaintenance: string
    nextMaintenance: string
    maintenanceCost: number
    supplier: string
}

const equipment: Equipment[] = [
    {
        id: '1',
        name: 'Ventilator',
        type: 'Life Support',
        department: 'ICU',
        status: 'in_use',
        serialNumber: 'VN-2023-001',
        purchaseDate: '15/03/2023',
        warrantyExpiry: '15/03/2026',
        lastMaintenance: '15/02/2026',
        nextMaintenance: '15/03/2026',
        maintenanceCost: 15000,
        supplier: 'Meditech India Pvt Ltd'
    },
    {
        id: '2',
        name: 'X-Ray Machine',
        type: 'Diagnostic',
        department: 'Radiology',
        status: 'available',
        serialNumber: 'XR-2022-005',
        purchaseDate: '20/06/2022',
        warrantyExpiry: '20/06/2025',
        lastMaintenance: '01/02/2026',
        nextMaintenance: '01/05/2026',
        maintenanceCost: 25000,
        supplier: 'Siemens Healthcare'
    },
    {
        id: '3',
        name: 'MRI Scanner',
        type: 'Diagnostic',
        department: 'Radiology',
        status: 'maintenance',
        serialNumber: 'MRI-2021-002',
        purchaseDate: '10/01/2021',
        warrantyExpiry: '10/01/2024',
        lastMaintenance: '01/01/2026',
        nextMaintenance: 'Ongoing',
        maintenanceCost: 50000,
        supplier: 'GE Healthcare'
    },
    {
        id: '4',
        name: 'Defibrillator',
        type: 'Emergency',
        department: 'Emergency',
        status: 'available',
        serialNumber: 'DF-2023-008',
        purchaseDate: '05/08/2023',
        warrantyExpiry: '05/08/2026',
        lastMaintenance: '10/02/2026',
        nextMaintenance: '10/03/2026',
        maintenanceCost: 3000,
        supplier: 'Phillips Medical'
    },
    {
        id: '5',
        name: 'Dialysis Machine',
        type: 'Therapeutic',
        department: 'Nephrology',
        status: 'in_use',
        serialNumber: 'DM-2022-003',
        purchaseDate: '12/04/2022',
        warrantyExpiry: '12/04/2025',
        lastMaintenance: '20/02/2026',
        nextMaintenance: '20/03/2026',
        maintenanceCost: 12000,
        supplier: 'Fresenius Medical Care'
    },
    {
        id: '6',
        name: 'ECG Machine',
        type: 'Diagnostic',
        department: 'Cardiology',
        status: 'available',
        serialNumber: 'ECG-2023-012',
        purchaseDate: '18/09/2023',
        warrantyExpiry: '18/09/2026',
        lastMaintenance: '18/01/2026',
        nextMaintenance: '18/04/2026',
        maintenanceCost: 5000,
        supplier: 'Meditech India Pvt Ltd'
    },
    {
        id: '7',
        name: 'Ultrasound Machine',
        type: 'Diagnostic',
        department: 'Radiology',
        status: 'in_use',
        serialNumber: 'US-2022-007',
        purchaseDate: '22/07/2022',
        warrantyExpiry: '22/07/2025',
        lastMaintenance: '22/02/2026',
        nextMaintenance: '22/05/2026',
        maintenanceCost: 18000,
        supplier: 'GE Healthcare'
    },
    {
        id: '8',
        name: 'Anesthesia Machine',
        type: 'Surgical',
        department: 'OT',
        status: 'available',
        serialNumber: 'AM-2021-004',
        purchaseDate: '30/11/2021',
        warrantyExpiry: '30/11/2024',
        lastMaintenance: '30/01/2026',
        nextMaintenance: '30/04/2026',
        maintenanceCost: 20000,
        supplier: 'Drager India'
    },
    {
        id: '9',
        name: 'Patient Monitor',
        type: 'Monitoring',
        department: 'ICU',
        status: 'in_use',
        serialNumber: 'PM-2023-015',
        purchaseDate: '08/12/2023',
        warrantyExpiry: '08/12/2026',
        lastMaintenance: '08/02/2026',
        nextMaintenance: '08/05/2026',
        maintenanceCost: 8000,
        supplier: 'Phillips Medical'
    },
    {
        id: '10',
        name: 'Infusion Pump',
        type: 'Therapeutic',
        department: 'General Ward',
        status: 'out_of_order',
        serialNumber: 'IP-2022-009',
        purchaseDate: '14/05/2022',
        warrantyExpiry: '14/05/2025',
        lastMaintenance: '14/02/2026',
        nextMaintenance: 'Awaiting Parts',
        maintenanceCost: 6000,
        supplier: 'Baxter Healthcare'
    },
]

const getStatusColor = (status: Equipment['status']) => {
    const colors = {
        available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        in_use: 'bg-blue-100 text-blue-800 border-blue-200',
        maintenance: 'bg-amber-100 text-amber-800 border-amber-200',
        out_of_order: 'bg-rose-100 text-rose-800 border-rose-200',
    }
    return colors[status]
}

const departments = ['All', 'ICU', 'Radiology', 'Emergency', 'Nephrology', 'Cardiology', 'OT', 'General Ward']

export default function EquipmentManagementPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDept, setSelectedDept] = useState('All')

    const filteredEquipment = equipment.filter(eq => {
        const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesDept = selectedDept === 'All' || eq.department === selectedDept
        return matchesSearch && matchesDept
    })

    const stats = {
        total: equipment.length,
        available: equipment.filter(e => e.status === 'available').length,
        inUse: equipment.filter(e => e.status === 'in_use').length,
        maintenance: equipment.filter(e => e.status === 'maintenance').length,
        outOfOrder: equipment.filter(e => e.status === 'out_of_order').length,
    }

    const upcomingMaintenance = equipment.filter(e => {
        if (e.status === 'maintenance' || e.status === 'out_of_order') return false
        // Check if maintenance is within next 30 days
        return true // Simplified for demo
    })

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Equipment Management</h1>
                <p className="text-muted-foreground">
                    Track medical equipment status, maintenance schedules, and availability
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{stats.available}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Use</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.inUse}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                        <Wrench className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{stats.maintenance}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Order</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">{stats.outOfOrder}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search equipment name or serial number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Equipment
                    </Button>
                </div>
            </div>

            {/* Equipment List */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="available">Available</TabsTrigger>
                    <TabsTrigger value="in_use">In Use</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                    <TabsTrigger value="out_of_order">Out of Order</TabsTrigger>
                </TabsList>

                {['all', 'available', 'in_use', 'maintenance', 'out_of_order'].map((tabValue) => (
                    <TabsContent key={tabValue} value={tabValue} className="mt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            {filteredEquipment
                                .filter(eq => tabValue === 'all' || eq.status === tabValue)
                                .map((eq) => (
                                    <Card key={eq.id} className={cn(
                                        "transition-all hover:shadow-md",
                                        eq.status === 'out_of_order' && "border-rose-200",
                                        eq.status === 'maintenance' && "border-amber-200"
                                    )}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                                        <Stethoscope className="h-5 w-5 text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base">{eq.name}</CardTitle>
                                                        <CardDescription className="flex items-center gap-1">
                                                            <Building className="h-3 w-3" />
                                                            {eq.department}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={getStatusColor(eq.status)}>
                                                    {eq.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Serial Number:</span>
                                                    <span className="font-medium">{eq.serialNumber}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Type:</span>
                                                    <span>{eq.type}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Supplier:</span>
                                                    <span>{eq.supplier}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Purchase Date:</span>
                                                    <span>{eq.purchaseDate}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Warranty Expires:</span>
                                                    <span className={cn(
                                                        eq.warrantyExpiry < '02/03/2026' && "text-amber-600 font-medium"
                                                    )}>{eq.warrantyExpiry}</span>
                                                </div>
                                                <div className="border-t pt-2 mt-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Last Maintenance:</span>
                                                        <span>{eq.lastMaintenance}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Next Maintenance:</span>
                                                        <span className={cn(
                                                            eq.nextMaintenance === 'Ongoing' && "text-amber-600 font-medium",
                                                            eq.nextMaintenance === 'Awaiting Parts' && "text-rose-600 font-medium"
                                                        )}>{eq.nextMaintenance}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                {eq.status === 'available' && (
                                                    <Button size="sm" className="flex-1">Book Equipment</Button>
                                                )}
                                                {eq.status === 'in_use' && (
                                                    <Button size="sm" variant="outline" className="flex-1">Release</Button>
                                                )}
                                                {(eq.status === 'maintenance' || eq.status === 'out_of_order') && (
                                                    <Button size="sm" variant="outline" className="flex-1">Update Status</Button>
                                                )}
                                                <Button size="sm" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Maintenance Schedule Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Maintenance
                    </CardTitle>
                    <CardDescription>Equipment requiring maintenance in the next 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {upcomingMaintenance.slice(0, 3).map((eq) => (
                            <div key={eq.id} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                        <Wrench className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{eq.name}</p>
                                        <p className="text-sm text-muted-foreground">{eq.department}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">Due: {eq.nextMaintenance}</p>
                                    <p className="text-xs text-muted-foreground">Est. Cost: ₹{eq.maintenanceCost.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

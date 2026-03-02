"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BedDouble, Search, Filter, Plus, User, Clock, Wrench, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatIndianDate } from "@/lib/indian-utils"

interface Bed {
    id: string
    ward: string
    bedNumber: string
    type: 'general' | 'icu' | 'emergency' | 'private' | 'maternity'
    status: 'available' | 'occupied' | 'maintenance' | 'reserved'
    patientName?: string
    patientId?: string
    admissionDate?: string
    expectedDischarge?: string
    doctorName?: string
    dailyCharge: number
}

const beds: Bed[] = [
    { id: '1', ward: 'General Ward A', bedNumber: 'A-01', type: 'general', status: 'occupied', patientName: 'Rajesh Kumar', patientId: 'PT-001', admissionDate: '02/03/2026', expectedDischarge: '05/03/2026', doctorName: 'Dr. Priya Sharma', dailyCharge: 1500 },
    { id: '2', ward: 'General Ward A', bedNumber: 'A-02', type: 'general', status: 'available', dailyCharge: 1500 },
    { id: '3', ward: 'General Ward A', bedNumber: 'A-03', type: 'general', status: 'maintenance', dailyCharge: 1500 },
    { id: '4', ward: 'General Ward B', bedNumber: 'B-01', type: 'general', status: 'occupied', patientName: 'Lakshmi N', patientId: 'PT-002', admissionDate: '01/03/2026', expectedDischarge: '04/03/2026', doctorName: 'Dr. Karthik R', dailyCharge: 1500 },
    { id: '5', ward: 'General Ward B', bedNumber: 'B-02', type: 'general', status: 'available', dailyCharge: 1500 },
    { id: '6', ward: 'ICU', bedNumber: 'ICU-01', type: 'icu', status: 'occupied', patientName: 'Suresh M', patientId: 'PT-003', admissionDate: '02/03/2026', doctorName: 'Dr. Priya Sharma', dailyCharge: 8500 },
    { id: '7', ward: 'ICU', bedNumber: 'ICU-02', type: 'icu', status: 'available', dailyCharge: 8500 },
    { id: '8', ward: 'ICU', bedNumber: 'ICU-03', type: 'icu', status: 'available', dailyCharge: 8500 },
    { id: '9', ward: 'Emergency', bedNumber: 'E-01', type: 'emergency', status: 'occupied', patientName: 'Meena Devi', patientId: 'PT-004', admissionDate: '02/03/2026', doctorName: 'Dr. Karthik R', dailyCharge: 2500 },
    { id: '10', ward: 'Emergency', bedNumber: 'E-02', type: 'emergency', status: 'available', dailyCharge: 2500 },
    { id: '11', ward: 'Private Room', bedNumber: 'P-101', type: 'private', status: 'reserved', dailyCharge: 4500 },
    { id: '12', ward: 'Private Room', bedNumber: 'P-102', type: 'private', status: 'available', dailyCharge: 4500 },
    { id: '13', ward: 'Private Room', bedNumber: 'P-103', type: 'private', status: 'occupied', patientName: 'Ramesh Babu', patientId: 'PT-005', admissionDate: '28/02/2026', expectedDischarge: '03/03/2026', doctorName: 'Dr. Anitha K', dailyCharge: 4500 },
    { id: '14', ward: 'Maternity Ward', bedNumber: 'M-01', type: 'maternity', status: 'occupied', patientName: 'Saraswati P', patientId: 'PT-006', admissionDate: '01/03/2026', doctorName: 'Dr. Lakshmi V', dailyCharge: 3500 },
    { id: '15', ward: 'Maternity Ward', bedNumber: 'M-02', type: 'maternity', status: 'available', dailyCharge: 3500 },
]

const getStatusColor = (status: Bed['status']) => {
    const colors = {
        available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        occupied: 'bg-rose-100 text-rose-800 border-rose-200',
        maintenance: 'bg-amber-100 text-amber-800 border-amber-200',
        reserved: 'bg-blue-100 text-blue-800 border-blue-200',
    }
    return colors[status]
}

const getTypeLabel = (type: Bed['type']) => {
    const labels = {
        general: 'General Ward',
        icu: 'ICU',
        emergency: 'Emergency',
        private: 'Private Room',
        maternity: 'Maternity',
    }
    return labels[type]
}

export default function BedManagementPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedWard, setSelectedWard] = useState('all')

    const wards = ['all', ...Array.from(new Set(beds.map(b => b.ward)))]

    const filteredBeds = beds.filter(bed => {
        const matchesSearch = bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bed.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bed.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesWard = selectedWard === 'all' || bed.ward === selectedWard
        return matchesSearch && matchesWard
    })

    const stats = {
        total: beds.length,
        available: beds.filter(b => b.status === 'available').length,
        occupied: beds.filter(b => b.status === 'occupied').length,
        maintenance: beds.filter(b => b.status === 'maintenance').length,
        reserved: beds.filter(b => b.status === 'reserved').length,
    }

    const occupancyRate = Math.round((stats.occupied / stats.total) * 100)

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Bed Management</h1>
                <p className="text-muted-foreground">
                    Manage bed allocation, patient admissions, and ward occupancy
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
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
                        <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                        <User className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">{stats.occupied}</div>
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
                        <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{occupancyRate}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search bed number, patient name, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="all">All Wards</option>
                        {wards.filter(w => w !== 'all').map(ward => (
                            <option key={ward} value={ward}>{ward}</option>
                        ))}
                    </select>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Admit Patient
                    </Button>
                </div>
            </div>

            {/* Bed Grid */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
                    <TabsTrigger value="all">All Beds</TabsTrigger>
                    <TabsTrigger value="available">Available</TabsTrigger>
                    <TabsTrigger value="occupied">Occupied</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                    <TabsTrigger value="reserved">Reserved</TabsTrigger>
                </TabsList>

                {['all', 'available', 'occupied', 'maintenance', 'reserved'].map((tabValue) => (
                    <TabsContent key={tabValue} value={tabValue} className="mt-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredBeds
                                .filter(bed => tabValue === 'all' || bed.status === tabValue)
                                .map((bed) => (
                                    <Card key={bed.id} className={cn(
                                        "transition-all hover:shadow-md",
                                        bed.status === 'occupied' && "border-rose-200",
                                        bed.status === 'available' && "border-emerald-200",
                                        bed.status === 'maintenance' && "border-amber-200",
                                        bed.status === 'reserved' && "border-blue-200"
                                    )}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "flex h-12 w-12 items-center justify-center rounded-lg font-bold text-lg",
                                                        bed.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                                            bed.status === 'occupied' ? 'bg-rose-100 text-rose-700' :
                                                                bed.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                    )}>
                                                        {bed.bedNumber}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base">{bed.ward}</CardTitle>
                                                        <CardDescription>{getTypeLabel(bed.type)}</CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={getStatusColor(bed.status)}>
                                                    {bed.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            {bed.status === 'occupied' && (
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Patient:</span>
                                                        <span className="font-medium">{bed.patientName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Patient ID:</span>
                                                        <span>{bed.patientId}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Doctor:</span>
                                                        <span>{bed.doctorName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Admitted:</span>
                                                        <span>{bed.admissionDate}</span>
                                                    </div>
                                                    {bed.expectedDischarge && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Expected Discharge:</span>
                                                            <span>{bed.expectedDischarge}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {bed.status === 'available' && (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Ready for patient admission</p>
                                                    <Button size="sm" className="w-full">Admit Patient</Button>
                                                </div>
                                            )}
                                            {bed.status === 'maintenance' && (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-amber-600">Under maintenance/cleaning</p>
                                                    <Button size="sm" variant="outline" className="w-full">Mark Available</Button>
                                                </div>
                                            )}
                                            {bed.status === 'reserved' && (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-blue-600">Reserved for incoming patient</p>
                                                    <Button size="sm" variant="outline" className="w-full">Cancel Reservation</Button>
                                                </div>
                                            )}
                                            <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                                                <span className="text-muted-foreground">Daily Charge:</span>
                                                <span className="font-semibold">₹{bed.dailyCharge.toLocaleString('en-IN')}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

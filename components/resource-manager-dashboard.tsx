"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
    BedDouble,
    Droplets,
    Users,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ArrowRight,
    Activity,
    Package,
    Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Status color helpers
function getRoomStatusColor(status: string) {
    switch (status) {
        case 'available': return 'bg-[#059669]/10 text-[#059669]'
        case 'occupied': return 'bg-[#2563eb]/10 text-[#2563eb]'
        case 'maintenance': return 'bg-[#d97706]/10 text-[#d97706]'
        default: return 'bg-[#6b7280]/10 text-[#6b7280]'
    }
}

function getBloodStatusColor(units: number, minThreshold: number) {
    if (units <= minThreshold * 0.5) return 'bg-[#dc2626]/10 text-[#dc2626]'
    if (units <= minThreshold) return 'bg-[#d97706]/10 text-[#d97706]'
    return 'bg-[#059669]/10 text-[#059669]'
}

function getBloodStatusLabel(units: number, minThreshold: number) {
    if (units <= minThreshold * 0.5) return 'critical'
    if (units <= minThreshold) return 'low'
    return 'adequate'
}

function getStaffStatusColor(status: string) {
    switch (status) {
        case 'active': return 'bg-[#059669]/10 text-[#059669]'
        case 'on_leave': return 'bg-[#d97706]/10 text-[#d97706]'
        case 'inactive': return 'bg-[#dc2626]/10 text-[#dc2626]'
        default: return 'bg-[#6b7280]/10 text-[#6b7280]'
    }
}

function getInventoryStatusColor(status: string) {
    switch (status) {
        case 'in_stock': return 'bg-[#059669]/10 text-[#059669]'
        case 'low_stock': return 'bg-[#d97706]/10 text-[#d97706]'
        case 'out_of_stock': return 'bg-[#dc2626]/10 text-[#dc2626]'
        default: return 'bg-[#6b7280]/10 text-[#6b7280]'
    }
}

export function ResourceManagerDashboard() {
    const { data: rooms } = useSWR("/api/rooms", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
    const { data: bloodStock } = useSWR("/api/blood-stock", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
    const { data: staff } = useSWR("/api/staff", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
    const { data: inventory } = useSWR("/api/inventory", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })

    // Compute stats from real data
    const totalBeds = rooms?.reduce((sum: number, r: { beds_total: number }) => sum + Number(r.beds_total), 0) || 0
    const occupiedBeds = rooms?.reduce((sum: number, r: { beds_occupied: number }) => sum + Number(r.beds_occupied), 0) || 0
    const availableBeds = totalBeds - occupiedBeds
    const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

    const totalEquipment = inventory?.length || 0
    const inStockEquipment = inventory?.filter((i: { status: string }) => i.status === 'in_stock').length || 0
    const lowStockEquipment = inventory?.filter((i: { status: string }) => i.status === 'low_stock').length || 0

    const criticalBlood = bloodStock?.filter((b: { units_available: number; min_threshold: number }) =>
        Number(b.units_available) <= Number(b.min_threshold) * 0.5
    ).length || 0
    const totalBloodUnits = bloodStock?.reduce((sum: number, b: { units_available: number }) => sum + Number(b.units_available), 0) || 0

    const activeStaff = staff?.filter((s: { status: string }) => s.status === 'active').length || 0
    const onCallStaff = staff?.filter((s: { status: string }) => s.status === 'on_leave').length || 0

    const isLoading = !rooms || !bloodStock || !staff || !inventory

    return (
        <div className="space-y-8 stagger-children">
            {/* Summary Cards */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="group border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Bed Occupancy</CardTitle>
                        <div className="rounded-lg bg-primary/10 p-2 transition-transform duration-300 group-hover:scale-110">
                            <BedDouble className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-10 animate-pulse rounded bg-muted" />
                        ) : (
                            <>
                                <p className="text-3xl font-extrabold tracking-tight text-foreground">{bedOccupancyRate}%</p>
                                <Progress value={bedOccupancyRate} className="mt-3 h-2" />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {availableBeds} Available · {occupiedBeds} Occupied
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="group border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Equipment Status</CardTitle>
                        <div className="rounded-lg bg-[#7c3aed]/10 p-2 transition-transform duration-300 group-hover:scale-110">
                            <Package className="h-4 w-4 text-[#7c3aed]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-10 animate-pulse rounded bg-muted" />
                        ) : (
                            <>
                                <p className="text-3xl font-extrabold tracking-tight text-foreground">{inStockEquipment}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Available out of {totalEquipment} equipment
                                </p>
                                {lowStockEquipment > 0 && (
                                    <p className="mt-1 text-xs font-medium text-[#d97706]">{lowStockEquipment} low stock</p>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="group border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Blood Bank</CardTitle>
                        <div className="rounded-lg bg-[#dc2626]/10 p-2 transition-transform duration-300 group-hover:scale-110">
                            <Droplets className="h-4 w-4 text-[#dc2626]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-10 animate-pulse rounded bg-muted" />
                        ) : (
                            <>
                                <p className="text-3xl font-extrabold tracking-tight text-foreground">{totalBloodUnits}</p>
                                <p className="mt-1 text-xs text-muted-foreground">Total units available</p>
                                {criticalBlood > 0 && (
                                    <p className="mt-1 text-xs font-medium text-[#dc2626]">{criticalBlood} critical groups</p>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="group border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Staff on Duty</CardTitle>
                        <div className="rounded-lg bg-[#059669]/10 p-2 transition-transform duration-300 group-hover:scale-110">
                            <Users className="h-4 w-4 text-[#059669]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-10 animate-pulse rounded bg-muted" />
                        ) : (
                            <>
                                <p className="text-3xl font-extrabold tracking-tight text-foreground">{activeStaff}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{onCallStaff} on leave</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Critical Alerts */}
            {!isLoading && criticalBlood > 0 && (
                <Card className="border-[#dc2626]/20 bg-[#dc2626]/5">
                    <CardContent className="flex items-center gap-3 p-4">
                        <AlertTriangle className="h-5 w-5 text-[#dc2626]" />
                        <div>
                            <p className="font-semibold text-[#dc2626]">Critical Blood Stock Alert</p>
                            <p className="text-sm text-[#dc2626]/80">{criticalBlood} blood groups at critical level. Immediate donor recruitment required.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bed Allocation Section */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BedDouble className="h-5 w-5 text-foreground" />
                        <h2 className="text-lg font-bold text-foreground">Bed Allocation</h2>
                        <span className="text-sm text-muted-foreground">Real-time bed occupancy status</span>
                    </div>
                    <Button variant="outline" size="sm" asChild className="gap-1.5 transition-all hover:gap-2.5">
                        <Link href="/dashboard/rooms">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </Button>
                </div>
                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map(i => <Card key={i} className="border-border/50"><CardContent className="p-4"><div className="h-20 animate-pulse rounded bg-muted" /></CardContent></Card>)}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {rooms?.slice(0, 8).map((room: Record<string, string | number>, index: number) => {
                            const occupancy = Number(room.beds_total) > 0
                                ? Math.round((Number(room.beds_occupied) / Number(room.beds_total)) * 100)
                                : 0
                            return (
                                <Card key={room.id} className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${index * 50}ms` }}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-foreground">Room {room.room_number}</p>
                                            <Badge variant="secondary" className={cn("text-xs font-medium", getRoomStatusColor(room.status as string))}>
                                                {room.status}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">{room.room_type} · Floor {room.floor}</p>
                                        <div className="mt-3 flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Beds: {room.beds_occupied}/{room.beds_total}</span>
                                            <span className="font-bold text-foreground">{occupancy}%</span>
                                        </div>
                                        <Progress value={occupancy} className="mt-1.5 h-1.5" />
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Blood Bank Section */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-foreground" />
                        <h2 className="text-lg font-bold text-foreground">Blood Stock</h2>
                        <span className="text-sm text-muted-foreground">Current inventory levels</span>
                    </div>
                    <Button variant="outline" size="sm" asChild className="gap-1.5 transition-all hover:gap-2.5">
                        <Link href="/dashboard/blood-bank">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </Button>
                </div>
                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map(i => <Card key={i} className="border-border/50"><CardContent className="p-4"><div className="h-16 animate-pulse rounded bg-muted" /></CardContent></Card>)}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {bloodStock?.map((blood: Record<string, string | number>, index: number) => {
                            const units = Number(blood.units_available)
                            const minThreshold = Number(blood.min_threshold)
                            const statusLabel = getBloodStatusLabel(units, minThreshold)
                            return (
                                <Card key={blood.id || index} className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${index * 50}ms` }}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-2xl font-extrabold text-foreground">{blood.blood_group}</p>
                                            <Badge variant="secondary" className={cn("text-xs font-medium capitalize", getBloodStatusColor(units, minThreshold))}>
                                                {statusLabel}
                                            </Badge>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{units} units</span>
                                            <span className="text-xs text-muted-foreground">min: {minThreshold}</span>
                                        </div>
                                        <Progress value={Math.min((units / (minThreshold * 2)) * 100, 100)} className="mt-2 h-1.5" />
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Staff Overview Section */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-foreground" />
                        <h2 className="text-lg font-bold text-foreground">Staff Overview</h2>
                        <span className="text-sm text-muted-foreground">Active personnel</span>
                    </div>
                    <Button variant="outline" size="sm" asChild className="gap-1.5 transition-all hover:gap-2.5">
                        <Link href="/dashboard/staff">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </Button>
                </div>
                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => <Card key={i} className="border-border/50"><CardContent className="p-4"><div className="h-16 animate-pulse rounded bg-muted" /></CardContent></Card>)}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {staff?.slice(0, 6).map((member: Record<string, string | number>, index: number) => (
                            <Card key={member.id} className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${index * 50}ms` }}>
                                <CardContent className="flex items-center gap-3 p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                        {(member.first_name as string)?.charAt(0)}{(member.last_name as string)?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate font-medium text-foreground">{member.first_name} {member.last_name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{member.role} · {member.department}</p>
                                    </div>
                                    <Badge variant="secondary" className={cn("shrink-0 text-xs", getStaffStatusColor(member.status as string))}>
                                        {(member.status as string)?.replace('_', ' ')}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Inventory Section */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-foreground" />
                        <h2 className="text-lg font-bold text-foreground">Inventory Status</h2>
                        <span className="text-sm text-muted-foreground">Medical supplies</span>
                    </div>
                    <Button variant="outline" size="sm" asChild className="gap-1.5 transition-all hover:gap-2.5">
                        <Link href="/dashboard/inventory">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </Button>
                </div>
                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map(i => <Card key={i} className="border-border/50"><CardContent className="p-4"><div className="h-16 animate-pulse rounded bg-muted" /></CardContent></Card>)}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {inventory?.slice(0, 8).map((item: Record<string, string | number>, index: number) => (
                            <Card key={item.id} className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${index * 50}ms` }}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="truncate font-medium text-foreground">{item.name}</p>
                                        <Badge variant="secondary" className={cn("shrink-0 text-xs capitalize", getInventoryStatusColor(item.status as string))}>
                                            {(item.status as string)?.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        <span className="font-bold text-foreground">{item.quantity} {item.unit}</span>
                                        <span className="text-xs text-muted-foreground">min: {item.reorder_level}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

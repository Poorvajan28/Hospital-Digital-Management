"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BedDouble, Search, DoorOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusColors: Record<string, string> = {
    available: "bg-[#059669]/10 text-[#059669]",
    occupied: "bg-[#2563eb]/10 text-[#2563eb]",
    maintenance: "bg-[#d97706]/10 text-[#d97706]",
}

const typeColors: Record<string, string> = {
    General: "bg-[#6b7280]/10 text-[#6b7280]",
    ICU: "bg-[#dc2626]/10 text-[#dc2626]",
    Private: "bg-[#7c3aed]/10 text-[#7c3aed]",
    "Semi-Private": "bg-[#0891b2]/10 text-[#0891b2]",
    Emergency: "bg-[#ea580c]/10 text-[#ea580c]",
}

export default function BedManagementPage() {
    const { data: rooms, mutate } = useSWR("/api/rooms", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] = useState<string>("all")

    const totalBeds = rooms?.reduce((sum: number, r: { beds_total: number }) => sum + Number(r.beds_total), 0) || 0
    const occupiedBeds = rooms?.reduce((sum: number, r: { beds_occupied: number }) => sum + Number(r.beds_occupied), 0) || 0
    const availableBeds = totalBeds - occupiedBeds
    const maintenanceRooms = rooms?.filter((r: { status: string }) => r.status === "maintenance").length || 0

    const filtered = rooms?.filter((room: Record<string, string | number>) => {
        const matchesSearch = `${room.room_number} ${room.room_type} ${room.floor}`.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = filterStatus === "all" || room.status === filterStatus
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid gap-5 sm:grid-cols-4">
                <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:0ms]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Beds</CardTitle>
                        <div className="rounded-lg bg-primary/10 p-2 transition-transform duration-300 group-hover:scale-110">
                            <BedDouble className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-extrabold tracking-tight text-foreground">{totalBeds}</p>
                        <p className="mt-1 text-xs text-muted-foreground">across {rooms?.length || 0} rooms</p>
                    </CardContent>
                </Card>
                <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:100ms]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
                        <div className="rounded-lg bg-[#059669]/10 p-2 transition-transform duration-300 group-hover:scale-110">
                            <BedDouble className="h-4 w-4 text-[#059669]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-extrabold tracking-tight text-[#059669]">{availableBeds}</p>
                        <p className="mt-1 text-xs text-muted-foreground">beds ready</p>
                    </CardContent>
                </Card>
                <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:200ms]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Occupied</CardTitle>
                        <div className="rounded-lg bg-[#2563eb]/10 p-2 transition-transform duration-300 group-hover:scale-110">
                            <BedDouble className="h-4 w-4 text-[#2563eb]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-extrabold tracking-tight text-[#2563eb]">{occupiedBeds}</p>
                        <Progress value={totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0} className="mt-2 h-2" />
                    </CardContent>
                </Card>
                <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:300ms]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance</CardTitle>
                        <div className="rounded-lg bg-[#d97706]/10 p-2 transition-transform duration-300 group-hover:scale-110">
                            <DoorOpen className="h-4 w-4 text-[#d97706]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-extrabold tracking-tight text-[#d97706]">{maintenanceRooms}</p>
                        <p className="mt-1 text-xs text-muted-foreground">rooms</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>
                <div className="flex gap-2">
                    {["all", "available", "occupied", "maintenance"].map((status) => (
                        <Button key={status} variant={filterStatus === status ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(status)} className="capitalize">
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Room/Bed Grid */}
            {!rooms ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="border-border/50"><CardContent className="p-6"><div className="h-32 animate-pulse rounded-lg bg-muted" /></CardContent></Card>
                    ))}
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered?.map((room: Record<string, string | number>, index: number) => {
                        const occupancy = Number(room.beds_total) > 0
                            ? Math.round((Number(room.beds_occupied) / Number(room.beds_total)) * 100)
                            : 0

                        return (
                            <Card
                                key={room.id}
                                className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5"
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-bold text-foreground">Room {room.room_number}</CardTitle>
                                            <p className="mt-0.5 text-xs text-muted-foreground">Floor {room.floor}</p>
                                        </div>
                                        <Badge variant="secondary" className={cn("font-semibold", typeColors[room.room_type as string] || "")}>
                                            {room.room_type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Beds</span>
                                        <span className="font-bold text-foreground">{room.beds_occupied}/{room.beds_total}</span>
                                    </div>
                                    <Progress value={occupancy} className="h-2" />
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className={cn("font-semibold", statusColors[room.status as string] || "")}>
                                            {room.status}
                                        </Badge>
                                        <span className="text-sm font-bold text-foreground">
                                            ₹{Number(room.daily_rate).toFixed(0)}<span className="text-xs font-normal text-muted-foreground">/day</span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {filtered?.length === 0 && rooms && (
                <div className="py-12 text-center text-muted-foreground">
                    <BedDouble className="mx-auto h-12 w-12 opacity-30" />
                    <p className="mt-2 font-medium">No rooms match your search</p>
                </div>
            )}
        </div>
    )
}

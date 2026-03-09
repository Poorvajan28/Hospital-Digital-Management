"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BedDouble, DoorOpen, Plus, Search } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { canAdd, type UserRole } from "@/lib/role-permissions"
import { AnimatedCounter } from "@/components/animated-counter"

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

export default function RoomsPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role as UserRole | undefined
  const { data: rooms, mutate } = useSWR("/api/rooms", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [open, setOpen] = useState(false)

  // Controlled form state
  const [formType, setFormType] = useState("General")

  const filtered = rooms?.filter((r: Record<string, string>) => {
    const matchesSearch = `Room ${r.room_number} ${r.room_type} Floor ${r.floor}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    const matchesType = typeFilter === "all" || r.room_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const totalBeds = rooms?.reduce((sum: number, r: { beds_total: number }) => sum + Number(r.beds_total), 0) || 0
  const occupiedBeds = rooms?.reduce((sum: number, r: { beds_occupied: number }) => sum + Number(r.beds_occupied), 0) || 0
  const availableRooms = rooms?.filter((r: { status: string }) => r.status === "available").length || 0

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      room_number: form.get("room_number"),
      room_type: formType,
      floor: Number(form.get("floor") || 1),
      beds_total: Number(form.get("beds_total") || 1),
      beds_occupied: 0,
      daily_rate: Number(form.get("daily_rate") || 0),
      status: "available",
    }
    if (!body.room_number) {
      toast.error("Please fill in the room number")
      return
    }
    const res = await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success("Room added successfully")
      mutate()
      setOpen(false)
      setFormType("General")
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to add room")
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:0ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rooms</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 transition-transform duration-300 group-hover:scale-110">
              <DoorOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold tracking-tight text-foreground"><AnimatedCounter value={rooms?.length || 0} /></p>
            <p className="mt-1 text-xs text-muted-foreground">{availableRooms} available</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:100ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Beds</CardTitle>
            <div className="rounded-lg bg-[#2563eb]/10 p-2 transition-transform duration-300 group-hover:scale-110">
              <BedDouble className="h-4 w-4 text-[#2563eb]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold tracking-tight text-foreground"><AnimatedCounter value={totalBeds} /></p>
            <p className="mt-1 text-xs text-muted-foreground">{totalBeds - occupiedBeds} available</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:200ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
            <div className="rounded-lg bg-[#d97706]/10 p-2 transition-transform duration-300 group-hover:scale-110">
              <BedDouble className="h-4 w-4 text-[#d97706]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0}%
            </p>
            <Progress value={totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filters & Add */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-border/50" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 border-border/50"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36 border-border/50"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="ICU">ICU</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Semi-Private">Semi-Private</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canAdd(userRole, "rooms") && <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setFormType("General") }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20"><Plus className="h-4 w-4" />Add Room</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Add New Room</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Room Number *</Label><Input name="room_number" required className="border-border/50" placeholder="e.g. 301" /></div>
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Floor</Label><Input name="floor" type="number" defaultValue="1" className="border-border/50" /></div>
                <div className="space-y-2"><Label>Total Beds</Label><Input name="beds_total" type="number" defaultValue="1" className="border-border/50" /></div>
                <div className="space-y-2"><Label>Daily Rate (₹)</Label><Input name="daily_rate" type="number" step="0.01" className="border-border/50" /></div>
              </div>
              <Button type="submit" className="w-full shadow-lg shadow-primary/20">Add Room</Button>
            </form>
          </DialogContent>
        </Dialog>}
      </div>

      {/* Room Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BedDouble className="h-4 w-4" />
        <span>{filtered?.length || 0} rooms shown</span>
      </div>

      {/* Room Grid */}
      {!rooms ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6"><div className="h-32 animate-pulse rounded-lg bg-muted" /></CardContent>
            </Card>
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
                    <Badge variant="secondary" className={`font-semibold ${typeColors[room.room_type as string] || ""}`}>
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
                    <Badge variant="secondary" className={`font-semibold ${statusColors[room.status as string] || ""}`}>
                      {room.status}
                    </Badge>
                    <span className="text-sm font-bold text-foreground">₹{Number(room.daily_rate).toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/day</span></span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

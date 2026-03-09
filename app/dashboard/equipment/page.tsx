"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Stethoscope,
    Search,
    Plus,
    Wrench,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Building,
    MoreVertical,
    Edit,
    Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { canAdd, canEdit, canDelete, type UserRole } from "@/lib/role-permissions"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        in_stock: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        low_stock: 'bg-amber-100 text-amber-800 border-amber-200',
        out_of_stock: 'bg-rose-100 text-rose-800 border-rose-200',
    }
    return colors[status] || colors.in_stock
}

const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
        in_stock: 'available',
        low_stock: 'maintenance',
        out_of_stock: 'out of order',
    }
    return labels[status] || status.replace(/_/g, ' ')
}

export default function EquipmentManagementPage() {
    const { data: session } = useSession()
    const userRole = (session?.user as { role?: string })?.role as UserRole | undefined
    const { data: equipment, mutate } = useSWR("/api/inventory", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [open, setOpen] = useState(false)
    const [formCategory, setFormCategory] = useState("")

    // Filter to equipment category items
    const equipmentItems = equipment?.filter((e: Record<string, string>) => e.category === 'Equipment') || []
    const allItems = equipment || []

    const filteredEquipment = (selectedCategory === 'all' ? allItems : allItems.filter((eq: Record<string, string>) => eq.category === selectedCategory))
        .filter((eq: Record<string, string>) => {
            const matchesSearch = eq.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                eq.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
            return matchesSearch
        })

    const stats = {
        total: allItems.length,
        available: allItems.filter((e: { status: string }) => e.status === 'in_stock').length,
        lowStock: allItems.filter((e: { status: string }) => e.status === 'low_stock').length,
        outOfStock: allItems.filter((e: { status: string }) => e.status === 'out_of_stock').length,
        equipment: equipmentItems.length,
    }

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        const body = {
            item_name: form.get("item_name"),
            category: formCategory || "Equipment",
            quantity: Number(form.get("quantity") || 1),
            unit: "pieces",
            min_stock_level: Number(form.get("min_stock_level") || 1),
            supplier: form.get("supplier"),
            unit_price: form.get("unit_price") ? Number(form.get("unit_price")) : null,
        }
        if (!body.item_name) {
            toast.error("Please fill in the equipment name")
            return
        }
        const res = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        if (res.ok) {
            toast.success("Equipment added successfully")
            mutate()
            setOpen(false)
            setFormCategory("")
        } else {
            const err = await res.json().catch(() => ({}))
            toast.error(err.error || "Failed to add equipment")
        }
    }

    async function handleStatusChange(id: number, newStatus: string) {
        const promise = fetch(`/api/inventory?id=${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        }).then(async (res) => {
            if (!res.ok) throw new Error("Update failed")
            return res.json()
        })

        toast.promise(promise, {
            loading: "Updating equipment status...",
            success: () => {
                mutate()
                return `Equipment status updated to ${newStatus.replace('_', ' ')}`
            },
            error: "Failed to update equipment status",
        })
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Equipment Management</h1>
                <p className="text-muted-foreground">
                    Track medical equipment status, inventory, and availability
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card className="animate-fade-in transition-all hover:-translate-y-0.5 hover:shadow-lg [animation-delay:0ms]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="animate-fade-in transition-all hover:-translate-y-0.5 hover:shadow-lg [animation-delay:50ms]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{stats.available}</div>
                    </CardContent>
                </Card>
                <Card className="animate-fade-in transition-all hover:-translate-y-0.5 hover:shadow-lg [animation-delay:100ms]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Equipment</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.equipment}</div>
                    </CardContent>
                </Card>
                <Card className="animate-fade-in transition-all hover:-translate-y-0.5 hover:shadow-lg [animation-delay:150ms]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <Wrench className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{stats.lowStock}</div>
                    </CardContent>
                </Card>
                <Card className="animate-fade-in transition-all hover:-translate-y-0.5 hover:shadow-lg [animation-delay:200ms]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">{stats.outOfStock}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search equipment name or supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Equipment">Equipment</SelectItem>
                            <SelectItem value="Medicine">Medicine</SelectItem>
                            <SelectItem value="Supplies">Supplies</SelectItem>
                            <SelectItem value="PPE">PPE</SelectItem>
                        </SelectContent>
                    </Select>
                    {canAdd(userRole, "equipment") && <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setFormCategory("") }}>
                        <DialogTrigger asChild>
                            <Button className="btn-premium">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Equipment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg glass-dialog">
                            <DialogHeader><DialogTitle>Add New Equipment</DialogTitle></DialogHeader>
                            <form onSubmit={handleAdd} className="grid gap-4 pt-4">
                                <div className="space-y-2"><Label>Equipment Name *</Label><Input name="item_name" required /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={formCategory} onValueChange={setFormCategory}>
                                            <SelectTrigger><SelectValue placeholder="Equipment" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Equipment">Equipment</SelectItem>
                                                <SelectItem value="Medicine">Medicine</SelectItem>
                                                <SelectItem value="Supplies">Supplies</SelectItem>
                                                <SelectItem value="PPE">PPE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2"><Label>Quantity</Label><Input name="quantity" type="number" defaultValue="1" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Unit Price (₹)</Label><Input name="unit_price" type="number" step="0.01" /></div>
                                    <div className="space-y-2"><Label>Min Stock Level</Label><Input name="min_stock_level" type="number" defaultValue="1" /></div>
                                </div>
                                <div className="space-y-2"><Label>Supplier</Label><Input name="supplier" className="border-border/50" /></div>
                                <Button type="submit" className="w-full btn-premium">Add Equipment</Button>
                            </form>
                        </DialogContent>
                    </Dialog>}
                </div>
            </div>

            {/* Equipment List */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="in_stock">In Stock</TabsTrigger>
                    <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
                    <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
                </TabsList>

                {['all', 'in_stock', 'low_stock', 'out_of_stock'].map((tabValue) => (
                    <TabsContent key={tabValue} value={tabValue} className="mt-6">
                        {!equipment ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {[1, 2, 3, 4].map(i => (
                                    <Card key={i}><CardContent className="p-6"><div className="h-40 animate-pulse rounded bg-muted" /></CardContent></Card>
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {filteredEquipment
                                    .filter((eq: { status: string }) => tabValue === 'all' || eq.status === tabValue)
                                    .map((eq: Record<string, string | number | null>, index: number) => (
                                        <Card key={eq.id} className={cn(
                                            "animate-fade-in transition-all hover:shadow-md glass-card",
                                            eq.status === 'out_of_stock' && "border-rose-200",
                                            eq.status === 'low_stock' && "border-amber-200"
                                        )} style={{ animationDelay: `${index * 50}ms` }}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                                            <Stethoscope className="h-5 w-5 text-slate-600" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-base">{eq.item_name}</CardTitle>
                                                            <p className="flex items-center gap-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                                                <Building className="h-3 w-3" />
                                                                {eq.category}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <Badge variant="outline" className={cn("font-bold px-2.5", getStatusColor(eq.status as string))}>
                                                          {statusLabel(eq.status as string)}
                                                      </Badge>
                                                      {canEdit(userRole, "equipment") && (
                                                        <DropdownMenu>
                                                          <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
                                                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                          </DropdownMenuTrigger>
                                                          <DropdownMenuContent align="end" className="w-48 glass-dialog">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleStatusChange(eq.id as number, 'in_stock')} className="cursor-pointer">
                                                              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Mark Available
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(eq.id as number, 'low_stock')} className="cursor-pointer">
                                                              <Clock className="mr-2 h-4 w-4 text-amber-600" /> Mark Maintenance
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(eq.id as number, 'out_of_stock')} className="cursor-pointer">
                                                              <AlertTriangle className="mr-2 h-4 w-4 text-rose-600" /> Mark Out of Order
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                                                              <Trash2 className="mr-2 h-4 w-4" /> Delete Equipment
                                                            </DropdownMenuItem>
                                                          </DropdownMenuContent>
                                                        </DropdownMenu>
                                                      )}
                                                    </div>
                                                </div>
                                            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{eq.quantity} {eq.unit}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Min Stock:</span>
                        <span>{eq.min_stock_level}</span>
                    </div>
                    {eq.supplier && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Supplier:</span>
                            <span>{eq.supplier}</span>
                        </div>
                    )}
                    {eq.unit_price && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Unit Price:</span>
                            <span>₹{Number(eq.unit_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    {eq.expiry_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expiry:</span>
                            <span className={cn(
                                new Date(eq.expiry_date as string) < new Date() && "text-rose-600 font-medium"
                            )}>{new Date(eq.expiry_date as string).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
                <div className="mt-4 flex gap-2">
                    {eq.status === 'in_stock' && (
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleStatusChange(eq.id as number, 'low_stock')}>
                            Mark Low Stock
                        </Button>
                    )}
                    {eq.status === 'low_stock' && (
                        <Button size="sm" className="flex-1" onClick={() => handleStatusChange(eq.id as number, 'in_stock')}>
                            Restock
                        </Button>
                    )}
                    {eq.status === 'out_of_stock' && (
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleStatusChange(eq.id as number, 'in_stock')}>
                            Mark Available
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    ))
}
                            </div >
                        )}
                    </TabsContent >
                ))}
            </Tabs >
        </div >
    )
}

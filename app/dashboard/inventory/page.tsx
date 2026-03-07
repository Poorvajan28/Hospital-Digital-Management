"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Package, Plus, Search, AlertTriangle, CheckCircle, XCircle, ArrowUpDown } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  in_stock: { color: "bg-[#059669]/10 text-[#059669]", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  low_stock: { color: "bg-[#d97706]/10 text-[#d97706]", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  out_of_stock: { color: "bg-[#dc2626]/10 text-[#dc2626]", icon: <XCircle className="h-3.5 w-3.5" /> },
}

const categoryColors: Record<string, string> = {
  Medicine: "bg-[#2563eb]/10 text-[#2563eb]",
  Equipment: "bg-[#7c3aed]/10 text-[#7c3aed]",
  Supplies: "bg-[#0891b2]/10 text-[#0891b2]",
  PPE: "bg-[#ea580c]/10 text-[#ea580c]",
}

export default function InventoryPage() {
  const { data: inventory, mutate } = useSWR("/api/inventory", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"name" | "qty" | "price">("name")
  const [open, setOpen] = useState(false)

  // Controlled form state
  const [formCategory, setFormCategory] = useState("")

  const filtered = inventory?.filter((item: Record<string, string>) => {
    const matchesSearch = `${item.item_name} ${item.supplier} ${item.category}`.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })?.sort((a: Record<string, string | number>, b: Record<string, string | number>) => {
    if (sortBy === "name") return String(a.item_name).localeCompare(String(b.item_name))
    if (sortBy === "qty") return Number(b.quantity) - Number(a.quantity)
    return Number(b.unit_price || 0) - Number(a.unit_price || 0)
  })

  const totalItems = inventory?.length || 0
  const lowStock = inventory?.filter((i: { status: string }) => i.status === "low_stock").length || 0
  const outOfStock = inventory?.filter((i: { status: string }) => i.status === "out_of_stock").length || 0
  const totalValue = inventory?.reduce((sum: number, i: { quantity: number; unit_price: number }) =>
    sum + (Number(i.quantity) * Number(i.unit_price || 0)), 0) || 0

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      item_name: form.get("item_name"),
      category: formCategory,
      quantity: Number(form.get("quantity") || 0),
      unit: form.get("unit"),
      min_stock_level: Number(form.get("min_stock_level") || 10),
      unit_price: form.get("unit_price") ? Number(form.get("unit_price")) : null,
      supplier: form.get("supplier"),
      expiry_date: form.get("expiry_date") || null,
    }
    if (!body.item_name || !body.category) {
      toast.error("Please fill in item name and category")
      return
    }
    const res = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success("Inventory item added successfully")
      mutate()
      setOpen(false)
      setFormCategory("")
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to add inventory item")
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-4">
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:0ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 transition-transform duration-300 group-hover:scale-110">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent><p className="text-3xl font-extrabold tracking-tight text-foreground">{totalItems}</p></CardContent>
        </Card>
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:100ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
            <div className="rounded-lg bg-[#d97706]/10 p-2 transition-transform duration-300 group-hover:scale-110">
              <AlertTriangle className="h-4 w-4 text-[#d97706]" />
            </div>
          </CardHeader>
          <CardContent><p className="text-3xl font-extrabold tracking-tight text-foreground">{lowStock}</p></CardContent>
        </Card>
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:200ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
            <div className="rounded-lg bg-[#dc2626]/10 p-2 transition-transform duration-300 group-hover:scale-110">
              <XCircle className="h-4 w-4 text-[#dc2626]" />
            </div>
          </CardHeader>
          <CardContent><p className="text-3xl font-extrabold tracking-tight text-foreground">{outOfStock}</p></CardContent>
        </Card>
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:300ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            <div className="rounded-lg bg-[#059669]/10 p-2 transition-transform duration-300 group-hover:scale-110">
              <Package className="h-4 w-4 text-[#059669]" />
            </div>
          </CardHeader>
          <CardContent><p className="text-3xl font-extrabold tracking-tight text-foreground">${totalValue.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      {/* Filters & Add */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Medicine">Medicine</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Supplies">Supplies</SelectItem>
              <SelectItem value="PPE">PPE</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === "name" ? "qty" : sortBy === "qty" ? "price" : "name")} className="gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortBy === "name" ? "Name" : sortBy === "qty" ? "Qty" : "Price"}
          </Button>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setFormCategory("") }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Item</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 pt-4">
              <div className="space-y-2"><Label>Item Name *</Label><Input name="item_name" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Supplies">Supplies</SelectItem>
                      <SelectItem value="PPE">PPE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Unit</Label><Input name="unit" defaultValue="pieces" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Quantity *</Label><Input name="quantity" type="number" required /></div>
                <div className="space-y-2"><Label>Min Stock</Label><Input name="min_stock_level" type="number" defaultValue="10" /></div>
                <div className="space-y-2"><Label>Unit Price</Label><Input name="unit_price" type="number" step="0.01" /></div>
              </div>
              <div className="space-y-2"><Label>Supplier</Label><Input name="supplier" /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input name="expiry_date" type="date" /></div>
              <Button type="submit" className="w-full">Add Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {!inventory ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setSortBy("name")}>Item</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setSortBy("qty")}>Qty</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Min</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setSortBy("price")}>Price</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiry</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((item: Record<string, string | number | null>) => {
                const cfg = statusConfig[item.status as string] || statusConfig.in_stock
                return (
                  <tr key={item.id} className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{item.item_name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={categoryColors[item.category as string] || ""}>{item.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{item.min_stock_level}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {item.unit_price ? `$${Number(item.unit_price).toFixed(2)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.supplier || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {item.expiry_date ? new Date(item.expiry_date as string).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={`gap-1 ${cfg.color}`}>
                        {cfg.icon}
                        {(item.status as string).replace(/_/g, " ")}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

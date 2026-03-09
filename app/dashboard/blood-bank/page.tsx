"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Droplets, Plus, Search, Heart, Edit, Trash2 } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { canAdd, canEdit, canDelete, type UserRole } from "@/lib/role-permissions"
import { AnimatedCounter } from "@/components/animated-counter"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusColors: Record<string, string> = {
  active: "bg-[#059669]/10 text-[#059669]",
  inactive: "bg-[#6b7280]/10 text-[#6b7280]",
  deferred: "bg-[#d97706]/10 text-[#d97706]",
}

const chartConfig = { units: { label: "Units", color: "var(--color-chart-1)" } }

export default function BloodBankPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role as UserRole | undefined
  const { data: donors, mutate } = useSWR("/api/blood-donors", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const { data: stock } = useSWR("/api/blood-stock", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const [search, setSearch] = useState("")
  const [bloodFilter, setBloodFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState<any>(null)

  // Controlled form state
  const [formBlood, setFormBlood] = useState("")
  const [formGender, setFormGender] = useState("")
  const [formStatus, setFormStatus] = useState("active")

  const filtered = donors?.filter((d: Record<string, string>) => {
    const matchesSearch = `${d.first_name} ${d.last_name} ${d.blood_group} ${d.email}`.toLowerCase().includes(search.toLowerCase())
    const matchesBlood = bloodFilter === "all" || d.blood_group === bloodFilter
    return matchesSearch && matchesBlood
  })

  const totalUnits = stock?.reduce((sum: number, s: { units_available: number }) => sum + Number(s.units_available), 0) || 0
  const criticalStock = stock?.filter((s: { units_available: number }) => Number(s.units_available) < 10) || []

  function resetForm() {
    setFormBlood(""); setFormGender("")
    setFormStatus("active"); setSelectedDonor(null)
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      first_name: form.get("first_name"),
      last_name: form.get("last_name"),
      email: form.get("email"),
      phone: form.get("phone"),
      blood_group: formBlood,
      date_of_birth: form.get("date_of_birth"),
      gender: formGender,
      address: form.get("address"),
      status: "active",
    }
    if (!body.first_name || !body.last_name || !body.blood_group) {
      toast.error("Please fill in name and blood group")
      return
    }
    const res = await fetch("/api/blood-donors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success("Blood donor registered successfully")
      mutate()
      setOpen(false)
      resetForm()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to register donor")
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      first_name: form.get("first_name"),
      last_name: form.get("last_name"),
      email: form.get("email"),
      phone: form.get("phone"),
      blood_group: formBlood,
      date_of_birth: form.get("date_of_birth"),
      gender: formGender,
      address: form.get("address"),
      status: formStatus,
    }
    const res = await fetch(`/api/blood-donors?id=${selectedDonor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      toast.success("Donor details updated successfully")
      mutate()
      setEditOpen(false)
      resetForm()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to update donor")
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this donor record?")) return
    const res = await fetch(`/api/blood-donors?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Donor record deleted successfully")
      mutate()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to delete donor")
    }
  }

  function openEdit(donor: any) {
    setSelectedDonor(donor)
    setFormBlood(donor.blood_group)
    setFormGender(donor.gender || "")
    setFormStatus(donor.status)
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Blood Stock Overview */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:0ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Blood Units</CardTitle>
            <div className="rounded-lg bg-[#dc2626]/10 p-2 transition-transform duration-300 group-hover:scale-110">
              <Droplets className="h-4 w-4 text-[#dc2626]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold tracking-tight text-foreground"><AnimatedCounter value={totalUnits} /></p>
            <p className="mt-1 text-xs text-muted-foreground">Across all blood groups</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:100ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Donors</CardTitle>
            <div className="rounded-lg bg-[#dc2626]/10 p-2 transition-transform duration-300 group-hover:scale-110">
              <Heart className="h-4 w-4 text-[#dc2626]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {donors?.filter((d: { status: string }) => d.status === "active").length || 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Ready to donate</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 [animation-delay:200ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Stock</CardTitle>
            <div className={`rounded-lg p-2 transition-transform duration-300 group-hover:scale-110 ${criticalStock.length > 0 ? "bg-[#dc2626]/10" : "bg-[#059669]/10"}`}>
              <Droplets className={`h-4 w-4 ${criticalStock.length > 0 ? "text-[#dc2626]" : "text-[#059669]"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold tracking-tight text-foreground"><AnimatedCounter value={criticalStock.length} /></p>
            <p className="mt-1 text-xs text-muted-foreground">
              {criticalStock.length > 0
                ? `Low: ${criticalStock.map((s: { blood_group: string }) => s.blood_group).join(", ")}`
                : "All blood groups stocked"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Blood Stock Chart */}
      {stock && (
        <Card className="animate-fade-in border-border/50 [animation-delay:300ms]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-foreground">
              <div className="rounded-lg bg-[#dc2626]/10 p-1.5">
                <Droplets className="h-4 w-4 text-[#dc2626]" />
              </div>
              Blood Stock by Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={stock.map((s: { blood_group: string; units_available: number }) => ({ ...s, units: Number(s.units_available) }))}>
                <XAxis dataKey="blood_group" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="units" radius={[8, 8, 0, 0]}>
                  {stock.map((_: unknown, i: number) => (
                    <Cell key={i} fill={Number(stock[i].units_available) < 10 ? "oklch(0.577 0.245 27.325)" : "var(--color-chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Donors List */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search donors..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-border/50 pl-10" />
          </div>
          <Select value={bloodFilter} onValueChange={setBloodFilter}>
            <SelectTrigger className="w-28 border-border/50"><SelectValue placeholder="Blood" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blood</SelectItem>
              {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canAdd(userRole, "blood_bank") && <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20"><Plus className="h-4 w-4" />Register Donor</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle className="text-xl">Register Blood Donor</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name *</Label><Input name="first_name" required className="border-border/50" /></div>
                <div className="space-y-2"><Label>Last Name *</Label><Input name="last_name" required className="border-border/50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" className="border-border/50" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input name="phone" className="border-border/50" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Blood Group *</Label>
                  <Select value={formBlood} onValueChange={setFormBlood}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>DOB</Label><Input name="date_of_birth" type="date" className="border-border/50" /></div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formGender} onValueChange={setFormGender}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Input name="address" className="border-border/50" /></div>
              <Button type="submit" className="w-full shadow-lg shadow-primary/20">Register Donor</Button>
            </form>
          </DialogContent>
        </Dialog>}
      </div>

      {!donors ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : (
        <div className="animate-fade-in overflow-x-auto rounded-xl border border-border/50 [animation-delay:400ms]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Blood Group</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Donation</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                {(canEdit(userRole, "blood_bank") || canDelete(userRole, "blood_bank")) && (
                  <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered?.map((d: Record<string, string | number | null>, index: number) => (
                <tr key={d.id} className="animate-row-enter border-b border-border/30 transition-colors last:border-0 hover:bg-muted/20" style={{ animationDelay: `${index * 40}ms` }}>
                  <td className="px-4 py-3.5 font-semibold text-foreground">{d.first_name} {d.last_name}</td>
                  <td className="px-4 py-3.5"><Badge variant="secondary" className="bg-[#dc2626]/10 font-bold text-[#dc2626]">{d.blood_group}</Badge></td>
                  <td className="px-4 py-3.5">
                    <div className="text-foreground">{d.email || "-"}</div>
                    <div className="text-xs text-muted-foreground">{d.phone}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                    {d.last_donation_date ? new Date(d.last_donation_date as string).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-foreground">{d.total_donations}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant="secondary" className={`font-semibold ${statusColors[d.status as string] || ""}`}>
                      {d.status}
                    </Badge>
                  </td>
                  {(canEdit(userRole, "blood_bank") || canDelete(userRole, "blood_bank")) && (
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit(userRole, "blood_bank") && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(d)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete(userRole, "blood_bank") && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(d.id as number)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) resetForm() }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader><DialogTitle className="text-xl">Edit Donor Profile</DialogTitle></DialogHeader>
              <form onSubmit={handleEdit} className="grid gap-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>First Name *</Label><Input name="first_name" defaultValue={selectedDonor?.first_name} required /></div>
                  <div className="space-y-2"><Label>Last Name *</Label><Input name="last_name" defaultValue={selectedDonor?.last_name} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" defaultValue={selectedDonor?.email} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input name="phone" defaultValue={selectedDonor?.phone} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Blood Group *</Label>
                    <Select value={formBlood} onValueChange={setFormBlood}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>DOB</Label><Input name="date_of_birth" type="date" defaultValue={selectedDonor?.date_of_birth} /></div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={formGender} onValueChange={setFormGender}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Status</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="deferred">Deferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Address</Label><Input name="address" defaultValue={selectedDonor?.address} /></div>
                </div>
                <Button type="submit" className="w-full">Update Donor Profile</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}

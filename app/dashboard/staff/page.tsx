"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Plus, Search, Mail, Phone, UserCircle, ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { canAdd, canEdit, canDelete, type UserRole } from "@/lib/role-permissions"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const roleColors: Record<string, string> = {
  physician: "bg-[#2563eb]/10 text-[#2563eb]",
  nurse: "bg-[#059669]/10 text-[#059669]",
  technician: "bg-[#d97706]/10 text-[#d97706]",
  admin: "bg-[#6b7280]/10 text-[#6b7280]",
}

const statusColors: Record<string, string> = {
  active: "bg-[#059669]/10 text-[#059669]",
  on_leave: "bg-[#d97706]/10 text-[#d97706]",
  inactive: "bg-[#dc2626]/10 text-[#dc2626]",
}

export default function StaffPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role as UserRole | undefined
  const { data: staff, mutate } = useSWR("/api/staff", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const { data: departments } = useSWR("/api/departments", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"name" | "date">("name")
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)

  // Form state for controlled Selects
  const [formRole, setFormRole] = useState("")
  const [formDeptId, setFormDeptId] = useState("")
  const [formStatus, setFormStatus] = useState("active")

  const filtered = staff?.filter((s: Record<string, string>) => {
    const matchesSearch =
      `${s.first_name} ${s.last_name} ${s.email} ${s.specialization}`.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || s.role === roleFilter
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })?.sort((a: Record<string, string>, b: Record<string, string>) => {
    if (sortBy === "name") return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  })

  function resetForm() {
    setFormRole(""); setFormDeptId(""); setFormStatus("active")
    setSelectedStaff(null)
  }

  async function handleAddStaff(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      first_name: form.get("first_name"),
      last_name: form.get("last_name"),
      email: form.get("email"),
      phone: form.get("phone"),
      role: formRole,
      department_id: formDeptId ? Number(formDeptId) : null,
      specialization: form.get("specialization"),
      salary: form.get("salary") ? Number(form.get("salary")) : null,
      status: "active",
    }
    if (!body.first_name || !body.last_name || !body.role) {
      toast.error("Please fill in required fields (name and role)")
      return
    }
    const res = await fetch("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success("Staff member added successfully")
      mutate()
      setOpen(false)
      resetForm()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to add staff member")
    }
  }

  async function handleEditStaff(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      first_name: form.get("first_name"),
      last_name: form.get("last_name"),
      email: form.get("email"),
      phone: form.get("phone"),
      role: formRole,
      department_id: formDeptId ? Number(formDeptId) : null,
      specialization: form.get("specialization"),
      salary: form.get("salary") ? Number(form.get("salary")) : null,
      status: formStatus,
    }
    const res = await fetch(`/api/staff?id=${selectedStaff.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      toast.success("Staff member updated successfully")
      mutate()
      setEditOpen(false)
      resetForm()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to update staff member")
    }
  }

  async function handleDeleteStaff(id: number) {
    if (!confirm("Are you sure you want to delete this staff member?")) return
    const res = await fetch(`/api/staff?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Staff member deleted successfully")
      mutate()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to delete staff member")
    }
  }

  function openEdit(member: any) {
    setSelectedStaff(member)
    setFormRole(member.role)
    setFormDeptId(member.department_id ? String(member.department_id) : "")
    setFormStatus(member.status)
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-border/50" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36 border-border/50">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="physician">Physician</SelectItem>
              <SelectItem value="nurse">Nurse</SelectItem>
              <SelectItem value="technician">Technician</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 border-border/50">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === "name" ? "date" : "name")} className="gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortBy === "name" ? "A-Z" : "Newest"}
          </Button>
        </div>
        {canAdd(userRole, "staff") && <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setFormRole(""); setFormDeptId(""); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input id="first_name" name="first_name" required className="border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input id="last_name" name="last_name" required className="border-border/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" className="border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" className="border-border/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select value={formRole} onValueChange={setFormRole}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physician">Physician</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={formDeptId} onValueChange={setFormDeptId}>
                    <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                    <SelectContent>
                      {departments?.map((d: { id: number; name: string }) => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" name="specialization" className="border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Annual Salary</Label>
                <Input id="salary" name="salary" type="number" className="border-border/50" />
              </div>
              <Button type="submit" className="w-full shadow-lg shadow-primary/20">Add Staff Member</Button>
            </form>
          </DialogContent>
        </Dialog>}
      </div>

      {!staff ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <div className="h-40 animate-pulse rounded-lg bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{filtered?.length || 0} staff members found</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((member: Record<string, string | number | null>, index: number) => (
              <Card
                key={member.id}
                className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <UserCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-foreground">
                          {member.role === "physician" ? "Dr. " : ""}
                          {member.first_name} {member.last_name}
                        </CardTitle>
                        <p className="mt-0.5 text-xs text-muted-foreground">{member.specialization || member.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {canEdit(userRole, "staff") && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(member)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete(userRole, "staff") && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteStaff(member.id as number)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className={`font-semibold ${roleColors[member.role as string] || ""}`}>
                      {member.role}
                    </Badge>
                    <Badge variant="secondary" className={`font-semibold ${statusColors[member.status as string] || ""}`}>
                      {(member.status as string)?.replace("_", " ")}
                    </Badge>
                  </div>
                  {member.department_name && (
                    <p className="text-muted-foreground">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground/60">Dept:</span>{" "}
                      <span className="font-medium text-foreground">{member.department_name}</span>
                    </p>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate text-xs">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs">{member.phone}</span>
                    </div>
                  )}
                  {member.join_date && (
                    <p className="border-t border-border/30 pt-2 text-xs text-muted-foreground">
                      Joined {new Date(member.join_date as string).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) resetForm(); }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">Edit Staff Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditStaff} className="grid gap-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_first_name">First Name *</Label>
                    <Input id="edit_first_name" name="first_name" defaultValue={selectedStaff?.first_name} required className="border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_last_name">Last Name *</Label>
                    <Input id="edit_last_name" name="last_name" defaultValue={selectedStaff?.last_name} required className="border-border/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_email">Email</Label>
                  <Input id="edit_email" name="email" type="email" defaultValue={selectedStaff?.email} className="border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input id="edit_phone" name="phone" defaultValue={selectedStaff?.phone} className="border-border/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select value={formRole} onValueChange={setFormRole}>
                      <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physician">Physician</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={formDeptId} onValueChange={setFormDeptId}>
                      <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                      <SelectContent>
                        {departments?.map((d: { id: number; name: string }) => (
                          <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_specialization">Specialization</Label>
                    <Input id="edit_specialization" name="specialization" defaultValue={selectedStaff?.specialization} className="border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_salary">Annual Salary</Label>
                  <Input id="edit_salary" name="salary" type="number" defaultValue={selectedStaff?.salary} className="border-border/50" />
                </div>
                <Button type="submit" className="w-full shadow-lg shadow-primary/20">Update Staff Member</Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

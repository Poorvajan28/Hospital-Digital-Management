"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Users, Phone, Plus, Search, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { canAdd, canEdit, canDelete, type UserRole } from "@/lib/role-permissions"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DepartmentsPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role as UserRole | undefined
  const { data: departments, mutate } = useSWR("/api/departments", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState<any>(null)

  const filtered = departments?.filter((d: Record<string, string>) =>
    `${d.name} ${d.description} ${d.head_doctor} ${d.phone}`.toLowerCase().includes(search.toLowerCase())
  )

  function resetForm() { setSelectedDept(null); }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get("name"),
      description: form.get("description"),
      head_doctor: form.get("head_doctor"),
      phone: form.get("phone"),
    }
    if (!body.name) {
      toast.error("Please fill in the department name")
      return
    }
    const res = await fetch("/api/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success("Department added successfully")
      mutate()
      setOpen(false)
      resetForm()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to add department")
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get("name"),
      description: form.get("description"),
      head_doctor: form.get("head_doctor"),
      phone: form.get("phone"),
    }
    const res = await fetch(`/api/departments?id=${selectedDept.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      toast.success("Department updated successfully")
      mutate()
      setEditOpen(false)
      resetForm()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to update department")
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure? This may affect associated staff.")) return
    const res = await fetch(`/api/departments?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Department deleted successfully")
      mutate()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to delete department")
    }
  }

  function openEdit(dept: any) {
    setSelectedDept(dept)
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search departments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-border/50" />
        </div>
        {canAdd(userRole, "departments") && <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20"><Plus className="h-4 w-4" />Add Department</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Add New Department</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 pt-4">
              <div className="space-y-2"><Label>Department Name *</Label><Input name="name" required className="border-border/50" /></div>
              <div className="space-y-2"><Label>Description</Label><Input name="description" className="border-border/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Head Doctor</Label><Input name="head_doctor" className="border-border/50" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input name="phone" className="border-border/50" /></div>
              </div>
              <Button type="submit" className="w-full shadow-lg shadow-primary/20">Add Department</Button>
            </form>
          </DialogContent>
        </Dialog>}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>{filtered?.length || 0} departments</span>
      </div>

      {!departments ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-32 rounded bg-muted" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered?.map((dept: Record<string, string | number>, index: number) => (
            <Card key={dept.id} className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5" style={{ animationDelay: `${index * 60}ms` }}>
              <CardHeader className="pb-3 px-6 pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-foreground">{dept.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{dept.description}</p>
                  </div>
                  <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="absolute right-2 top-14 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {canEdit(userRole, "departments") && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(dept)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete(userRole, "departments") && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(dept.id as number)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                {dept.head_doctor && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Head: </span>
                    <span className="font-medium text-foreground">{dept.head_doctor}</span>
                  </div>
                )}
                {dept.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{dept.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {dept.staff_count} staff
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) resetForm() }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Department</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="grid gap-4 pt-4">
            <div className="space-y-2">
              <Label>Department Name *</Label>
              <Input name="name" defaultValue={selectedDept?.name} required className="border-border/50" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input name="description" defaultValue={selectedDept?.description} className="border-border/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Head Doctor</Label>
                <Input name="head_doctor" defaultValue={selectedDept?.head_doctor} className="border-border/50" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" defaultValue={selectedDept?.phone} className="border-border/50" />
              </div>
            </div>
            <Button type="submit" className="w-full shadow-lg shadow-primary/20">Update Department</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

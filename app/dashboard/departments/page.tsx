"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, Users, Phone, Plus, Search, Edit, Trash2, MoreVertical, Activity, UserCheck, AlertTriangle, Link as LinkIcon } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { canAdd, canEdit, canDelete, type UserRole } from "@/lib/role-permissions"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DepartmentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
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

    const promise = fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to add department")
      }
      return res.json()
    })

    toast.promise(promise, {
      loading: "Creating department...",
      success: () => {
        mutate()
        setOpen(false)
        resetForm()
        return "Department added successfully"
      },
      error: (err) => err.message,
    })
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
    const promise = fetch(`/api/departments?id=${selectedDept.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update department")
      }
      return res.json()
    })

    toast.promise(promise, {
      loading: "Updating department...",
      success: () => {
        mutate()
        setEditOpen(false)
        resetForm()
        return "Department updated successfully"
      },
      error: (err) => err.message,
    })
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure? This may affect associated staff.")) return
    const promise = fetch(`/api/departments?id=${id}`, { method: "DELETE" }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to delete department")
      }
      return res.json()
    })

    toast.promise(promise, {
      loading: "Removing department...",
      success: () => {
        mutate()
        return "Department deleted successfully"
      },
      error: (err) => err.message,
    })
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
            <Button className="gap-2 btn-premium"><Plus className="h-4 w-4" />Add Department</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg glass-dialog">
            <DialogHeader><DialogTitle>Add New Department</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 pt-4">
              <div className="space-y-2"><Label>Department Name *</Label><Input name="name" required className="border-border/50" /></div>
              <div className="space-y-2"><Label>Description</Label><Input name="description" className="border-border/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Head Doctor</Label><Input name="head_doctor" className="border-border/50" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input name="phone" className="border-border/50" /></div>
              </div>
              <Button type="submit" className="w-full btn-premium">Add Department</Button>
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
            <Card key={dept.id} className="animate-fade-in group glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10" style={{ animationDelay: `${index * 60}ms` }}>
              <CardHeader className="pb-3 px-6 pt-6 relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold text-foreground truncate">{dept.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{dept.description || "No description provided."}</p>
                  </div>
                  <div className="flex shrink-0 h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                {(canEdit(userRole, "departments") || canDelete(userRole, "departments")) && (
                  <div className="absolute right-4 top-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 glass-dialog">
                        <DropdownMenuLabel>Department Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {canEdit(userRole, "departments") && (
                          <>
                            <DropdownMenuItem onClick={() => openEdit(dept)} className="cursor-pointer font-medium">
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast.info(`Viewing capacity for ${dept.name}...`)} className="cursor-pointer">
                              <Activity className="mr-2 h-4 w-4 text-blue-600" /> View Capacity
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/staff?dept=${dept.id}`)} className="cursor-pointer">
                              <LinkIcon className="mr-2 h-4 w-4 text-emerald-600" /> Manage Doctors
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => toast.info("Opening analytics dashboard...")} className="cursor-pointer">
                          <UserCheck className="mr-2 h-4 w-4" /> Dept. Analytics
                        </DropdownMenuItem>
                        {canDelete(userRole, "departments") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(dept.id as number)} className="cursor-pointer text-destructive focus:text-destructive font-medium">
                              <Trash2 className="mr-2 h-4 w-4" /> Close Department
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6 pt-0">
                <div className="grid gap-2">
                  {dept.head_doctor && (
                    <div className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-lg">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span className="text-muted-foreground font-medium">Head: </span>
                      <span className="font-bold text-foreground">{dept.head_doctor}</span>
                    </div>
                  )}
                  {dept.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-medium">{dept.phone}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-border/20 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Operational</span>
                  </div>
                  <Badge variant="secondary" className="gap-1 bg-primary/5 text-primary border-none font-bold">
                    <Users className="h-3 w-3" />
                    {dept.staff_count} Staff
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) resetForm() }}>
        <DialogContent className="sm:max-w-lg glass-dialog">
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
            <Button type="submit" className="w-full btn-premium">Update Department</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

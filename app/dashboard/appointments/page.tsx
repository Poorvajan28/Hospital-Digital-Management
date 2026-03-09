"use client"

import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, CalendarDays, ArrowUpDown, Edit, Trash2, MoreVertical, CheckCircle, XCircle } from "lucide-react"
import { useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"
import { canAdd, canEdit, canDelete, type UserRole } from "@/lib/role-permissions"
import { maskPII } from "@/lib/privacy"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusColors: Record<string, string> = {
  scheduled: "bg-[#2563eb]/10 text-[#2563eb]",
  completed: "bg-[#059669]/10 text-[#059669]",
  cancelled: "bg-[#dc2626]/10 text-[#dc2626]",
  no_show: "bg-[#d97706]/10 text-[#d97706]",
}

const typeColors: Record<string, string> = {
  consultation: "bg-[#0891b2]/10 text-[#0891b2]",
  follow_up: "bg-[#7c3aed]/10 text-[#7c3aed]",
  emergency: "bg-[#dc2626]/10 text-[#dc2626]",
  surgery: "bg-[#d97706]/10 text-[#d97706]",
}

function AppointmentsPageContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientIdParam = searchParams.get("patientId")
  const doctorIdParam = searchParams.get("doctorId")
  const searchParam = searchParams.get("search")

  const userRole = (session?.user as { role?: string })?.role as UserRole | undefined
  const { data: appointments, mutate } = useSWR("/api/appointments", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const { data: patients } = useSWR("/api/patients", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const { data: staff } = useSWR("/api/staff", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const { data: departments } = useSWR("/api/departments", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const [search, setSearch] = useState(searchParam || "")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  // Controlled form state for Selects
  const [formPatient, setFormPatient] = useState("")
  const [formDoctor, setFormDoctor] = useState("")
  const [formDept, setFormDept] = useState("")
  const [formType, setFormType] = useState("consultation")
  const [formStatus, setFormStatus] = useState("scheduled")

  const doctors = staff?.filter((s: Record<string, string>) => s.role === "physician" || s.role === "Doctor")

  const filtered = appointments?.filter((a: Record<string, string | number>) => {
    const matchesSearch =
      `${a.patient_name || ""} ${a.doctor_name || ""} ${a.department_name || ""}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || a.status === statusFilter
    const matchesPatientId = !patientIdParam || String(a.patient_id) === patientIdParam
    const matchesDoctorId = !doctorIdParam || String(a.doctor_id) === doctorIdParam
    return matchesSearch && matchesStatus && matchesPatientId && matchesDoctorId
  })?.sort((a: Record<string, string>, b: Record<string, string>) => {
    const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`).getTime()
    const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`).getTime()
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB
  })

  function resetForm() {
    setFormPatient(""); setFormDoctor(""); setFormDept(""); setFormType("consultation"); setFormStatus("scheduled")
    setSelectedAppointment(null)
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      patient_id: Number(formPatient),
      doctor_id: Number(formDoctor),
      department_id: Number(formDept),
      appointment_date: form.get("appointment_date"),
      appointment_time: form.get("appointment_time"),
      type: formType,
      notes: form.get("notes"),
    }
    if (!body.patient_id || !body.doctor_id || !body.department_id || !body.appointment_date || !body.appointment_time) {
      toast.error("Please fill in all required fields")
      return
    }

    const promise = fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to schedule appointment")
      }
      return res.json()
    })

    toast.promise(promise, {
      loading: "Scheduling appointment...",
      success: () => {
        mutate()
        setOpen(false)
        resetForm()
        return "Appointment scheduled successfully"
      },
      error: (err) => err.message,
    })
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      patient_id: Number(formPatient),
      doctor_id: Number(formDoctor),
      department_id: Number(formDept),
      appointment_date: form.get("appointment_date"),
      appointment_time: form.get("appointment_time"),
      type: formType,
      status: formStatus,
      notes: form.get("notes"),
    }
    const promise = fetch(`/api/appointments?id=${selectedAppointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update appointment")
      }
      return res.json()
    })

    toast.promise(promise, {
      loading: "Updating appointment...",
      success: () => {
        mutate()
        setEditOpen(false)
        resetForm()
        return "Appointment updated successfully"
      },
      error: (err) => err.message,
    })
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this appointment?")) return
    const promise = fetch(`/api/appointments?id=${id}`, { method: "DELETE" }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to delete appointment")
      }
      return res.json()
    })

    toast.promise(promise, {
      loading: "Deleting appointment...",
      success: () => {
        mutate()
        return "Appointment deleted successfully"
      },
      error: (err) => err.message,
    })
  }

  async function handleStatusUpdate(id: number, newStatus: string) {
    const promise = fetch(`/api/appointments?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update status")
      }
      return res.json()
    })

    toast.promise(promise, {
      loading: `Marking as ${newStatus}...`,
      success: () => {
        mutate()
        return `Appointment ${newStatus}`
      },
      error: (err) => err.message,
    })
  }

  function openEdit(a: any) {
    setSelectedAppointment(a)
    setFormPatient(String(a.patient_id))
    setFormDoctor(String(a.doctor_id))
    setFormDept(String(a.department_id))
    setFormType(a.type)
    setFormStatus(a.status)
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")} className="gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </Button>
        </div>
        {canAdd(userRole, "appointments") && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 btn-premium"><Plus className="h-4 w-4" />Book Appointment</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg glass-dialog">
              <DialogHeader><DialogTitle>Book New Appointment</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="grid gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select value={formPatient} onValueChange={setFormPatient}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients?.map((p: { id: number; first_name: string; last_name: string }) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.first_name} {p.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Doctor *</Label>
                    <Select value={formDoctor} onValueChange={setFormDoctor}>
                      <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                      <SelectContent>
                        {doctors?.map((d: { id: number; first_name: string; last_name: string }) => (
                          <SelectItem key={d.id} value={String(d.id)}>Dr. {d.first_name} {d.last_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select value={formDept} onValueChange={setFormDept}>
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
                  <div className="space-y-2"><Label>Date *</Label><Input name="appointment_date" type="date" required /></div>
                  <div className="space-y-2"><Label>Time *</Label><Input name="appointment_time" type="time" required /></div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Notes</Label><Textarea name="notes" rows={2} /></div>
                <Button type="submit" className="w-full btn-premium">Book Appointment</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        <span>{filtered?.length || 0} appointments</span>
      </div>

      {!appointments ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Doctor</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}>Date & Time ↕</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                {(canEdit(userRole, "appointments") || canDelete(userRole, "appointments")) && (
                  <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered?.map((a: Record<string, string | number>, index: number) => (
                <tr key={a.id} className="animate-row-enter border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30" style={{ animationDelay: `${index * 40}ms` }}>
                  <td className="px-4 py-3 font-medium text-foreground">
                    <button
                      onClick={() => router.push(`/dashboard/patients?search=${a.patient_name}`)}
                      className="hover:underline underline-offset-4 decoration-primary/30"
                    >
                      {maskPII(a.patient_name as string, userRole, "name")}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {a.doctor_name ? (
                      <button
                        onClick={() => router.push(`/dashboard/staff?search=${a.doctor_name}`)}
                        className="hover:underline underline-offset-2"
                      >
                        Dr. {a.doctor_name}
                      </button>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.department_name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {a.appointment_date ? new Date(a.appointment_date as string).toLocaleDateString("en-IN") : "—"} {(a.appointment_time as string)?.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={typeColors[a.type as string] || ""}>
                      {(a.type as string)?.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={statusColors[a.status as string] || ""}>
                      {(a.status as string)?.replace("_", " ")}
                    </Badge>
                  </td>
                  {(canEdit(userRole, "appointments") || canDelete(userRole, "appointments")) && (
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 glass-dialog">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {canEdit(userRole, "appointments") && (
                            <>
                              <DropdownMenuItem onClick={() => openEdit(a)} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit Appointment
                              </DropdownMenuItem>
                              {a.status === "scheduled" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(a.id as number, "completed")} className="cursor-pointer text-emerald-600 focus:text-emerald-600">
                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(a.id as number, "cancelled")} className="cursor-pointer text-rose-600 focus:text-rose-600">
                                    <XCircle className="mr-2 h-4 w-4" /> Cancel Appointment
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          )}
                          {canDelete(userRole, "appointments") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(a.id as number)} className="cursor-pointer text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Record
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) resetForm(); }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg glass-dialog">
              <DialogHeader><DialogTitle>Edit Appointment</DialogTitle></DialogHeader>
              <form onSubmit={handleEdit} className="grid gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select value={formPatient} onValueChange={setFormPatient}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients?.map((p: { id: number; first_name: string; last_name: string }) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.first_name} {p.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Doctor *</Label>
                    <Select value={formDoctor} onValueChange={setFormDoctor}>
                      <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                      <SelectContent>
                        {doctors?.map((d: { id: number; first_name: string; last_name: string }) => (
                          <SelectItem key={d.id} value={String(d.id)}>Dr. {d.first_name} {d.last_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select value={formDept} onValueChange={setFormDept}>
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
                  <div className="space-y-2"><Label>Date *</Label><Input name="appointment_date" type="date" defaultValue={selectedAppointment?.appointment_date} required /></div>
                  <div className="space-y-2"><Label>Time *</Label><Input name="appointment_time" type="time" defaultValue={selectedAppointment?.appointment_time?.slice(0, 5)} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no_show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Notes</Label><Textarea name="notes" rows={2} defaultValue={selectedAppointment?.notes} /></div>
                <Button type="submit" className="w-full btn-premium">Update Appointment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Loading appointments data...</div>}>
      <AppointmentsPageContent />
    </Suspense>
  )
}

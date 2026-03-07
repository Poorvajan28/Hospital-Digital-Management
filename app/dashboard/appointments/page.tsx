"use client"

import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, CalendarDays } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

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

export default function AppointmentsPage() {
  const { data: appointments, mutate } = useSWR("/api/appointments", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const { data: patients } = useSWR("/api/patients", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const { data: staff } = useSWR("/api/staff", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const { data: departments } = useSWR("/api/departments", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [open, setOpen] = useState(false)

  const doctors = staff?.filter((s: Record<string, string>) => s.role === "Doctor")

  const filtered = appointments?.filter((a: Record<string, string>) => {
    const matchesSearch =
      `${a.patient_first} ${a.patient_last} ${a.doctor_first} ${a.doctor_last} ${a.department_name}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      patient_id: Number(form.get("patient_id")),
      doctor_id: Number(form.get("doctor_id")),
      department_id: Number(form.get("department_id")),
      appointment_date: form.get("appointment_date"),
      appointment_time: form.get("appointment_time"),
      type: form.get("type"),
      notes: form.get("notes"),
    }
    const res = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success("Appointment scheduled successfully")
      mutate()
      setOpen(false)
    } else {
      toast.error("Failed to schedule appointment")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
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
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Book Appointment</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>Book New Appointment</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 pt-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select name="patient_id" required>
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
                  <Label>Doctor</Label>
                  <Select name="doctor_id" required>
                    <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                    <SelectContent>
                      {doctors?.map((d: { id: number; first_name: string; last_name: string }) => (
                        <SelectItem key={d.id} value={String(d.id)}>Dr. {d.first_name} {d.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select name="department_id" required>
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
                <div className="space-y-2"><Label>Date</Label><Input name="appointment_date" type="date" required /></div>
                <div className="space-y-2"><Label>Time</Label><Input name="appointment_time" type="time" required /></div>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select name="type">
                  <SelectTrigger><SelectValue placeholder="Consultation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea name="notes" rows={2} /></div>
              <Button type="submit" className="w-full">Book Appointment</Button>
            </form>
          </DialogContent>
        </Dialog>
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
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date & Time</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((a: Record<string, string | number>) => (
                <tr key={a.id} className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{a.patient_first} {a.patient_last}</td>
                  <td className="px-4 py-3 text-foreground">Dr. {a.doctor_first} {a.doctor_last}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.department_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {new Date(a.appointment_date as string).toLocaleDateString()} {(a.appointment_time as string)?.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={typeColors[a.type as string] || ""}>
                      {(a.type as string).replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={statusColors[a.status as string] || ""}>
                      {(a.status as string).replace("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

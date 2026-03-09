"use client"

import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, FileText, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { canAdd, canEdit, canDelete, type UserRole } from "@/lib/role-permissions"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MedicalRecordsPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role as UserRole | undefined
  const { data: records, mutate } = useSWR("/api/medical-records", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const { data: patients } = useSWR("/api/patients", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const { data: staff } = useSWR("/api/staff", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

  // Controlled form state
  const [formPatient, setFormPatient] = useState("")
  const [formDoctor, setFormDoctor] = useState("")

  const doctors = staff?.filter((s: Record<string, string>) => s.role === "physician" || s.role === "Doctor")

  const filtered = records?.filter((r: Record<string, string>) =>
    `${r.patient_name || ""} ${r.doctor_name || ""} ${r.diagnosis || ""}`.toLowerCase().includes(search.toLowerCase())
  )

  function resetForm() {
    setFormPatient(""); setFormDoctor("")
    setSelectedRecord(null)
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      patient_id: Number(formPatient),
      doctor_id: Number(formDoctor),
      diagnosis: form.get("diagnosis"),
      treatment: form.get("treatment"),
      prescription: form.get("prescription"),
      visit_date: form.get("visit_date"),
      follow_up_date: form.get("follow_up_date") || null,
      notes: form.get("notes"),
    }
    if (!body.patient_id || !body.doctor_id || !body.diagnosis) {
      toast.error("Please fill in patient, doctor, and diagnosis")
      return
    }
    const res = await fetch("/api/medical-records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success("Medical record added successfully")
      mutate()
      setOpen(false)
      resetForm()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to add medical record")
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      patient_id: Number(formPatient),
      doctor_id: Number(formDoctor),
      diagnosis: form.get("diagnosis"),
      treatment: form.get("treatment"),
      prescription: form.get("prescription"),
      visit_date: form.get("visit_date"),
      follow_up_date: form.get("follow_up_date") || null,
      notes: form.get("notes"),
    }
    const res = await fetch(`/api/medical-records?id=${selectedRecord.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      toast.success("Medical record updated successfully")
      mutate()
      setEditOpen(false)
      resetForm()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to update record")
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this medical record?")) return
    const res = await fetch(`/api/medical-records?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Medical record deleted successfully")
      mutate()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to delete record")
    }
  }

  function openEdit(record: any) {
    setSelectedRecord(record)
    setFormPatient(String(record.patient_id))
    setFormDoctor(String(record.doctor_id))
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        {canAdd(userRole, "medical_records") && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Add Record</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader><DialogTitle>Add Medical Record</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="grid gap-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div className="space-y-2"><Label>Diagnosis *</Label><Textarea name="diagnosis" required rows={2} /></div>
                <div className="space-y-2"><Label>Treatment</Label><Textarea name="treatment" rows={2} /></div>
                <div className="space-y-2"><Label>Prescription</Label><Textarea name="prescription" rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Visit Date</Label><Input name="visit_date" type="date" /></div>
                  <div className="space-y-2"><Label>Follow-up Date</Label><Input name="follow_up_date" type="date" /></div>
                </div>
                <div className="space-y-2"><Label>Notes</Label><Textarea name="notes" rows={2} /></div>
                <Button type="submit" className="w-full">Add Record</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>{filtered?.length || 0} records</span>
      </div>

      {!records ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : (
        <div className="space-y-4">
          {filtered?.map((r: Record<string, string | number | null>) => (
            <div key={r.id} className="rounded-lg border border-border bg-card p-5 transition-all hover:shadow-md hover:shadow-primary/5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{r.patient_name || "Unknown Patient"}</h3>
                    <span className="text-sm text-muted-foreground">by Dr. {r.doctor_name || "Unknown"}</span>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-foreground">Diagnosis: {r.diagnosis}</p>
                      <div className="flex gap-1">
                        {canEdit(userRole, "medical_records") && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(r)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canDelete(userRole, "medical_records") && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(r.id as number)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {r.treatment && <p className="mt-1 text-sm text-muted-foreground">Treatment: {r.treatment}</p>}
                    {r.prescription && <p className="mt-1 text-sm text-muted-foreground">Rx: {r.prescription}</p>}
                  </div>
                  {r.notes && <p className="text-xs text-muted-foreground italic">{r.notes}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
                  <span className="font-mono">Visit: {r.visit_date ? new Date(r.visit_date as string).toLocaleDateString("en-IN") : "—"}</span>
                  {r.follow_up_date && (
                    <Badge variant="outline" className="text-xs">
                      Follow-up: {new Date(r.follow_up_date as string).toLocaleDateString("en-IN")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) resetForm() }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Medical Record</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="grid gap-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="space-y-2"><Label>Diagnosis *</Label><Textarea name="diagnosis" defaultValue={selectedRecord?.diagnosis} required rows={2} /></div>
            <div className="space-y-2"><Label>Treatment</Label><Textarea name="treatment" defaultValue={selectedRecord?.treatment} rows={2} /></div>
            <div className="space-y-2"><Label>Prescription</Label><Textarea name="prescription" defaultValue={selectedRecord?.prescription} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Visit Date</Label><Input name="visit_date" type="date" defaultValue={selectedRecord?.visit_date} /></div>
              <div className="space-y-2"><Label>Follow-up Date</Label><Input name="follow_up_date" type="date" defaultValue={selectedRecord?.follow_up_date} /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea name="notes" defaultValue={selectedRecord?.notes} rows={2} /></div>
            <Button type="submit" className="w-full">Update Record</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

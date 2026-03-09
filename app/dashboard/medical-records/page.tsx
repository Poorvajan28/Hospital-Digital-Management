"use client"

import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, FileText, Edit, Trash2, MoreVertical, Eye, Share2, Download } from "lucide-react"
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

    const promise = fetch("/api/medical-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to add medical record")
      }
      return res.json()
    })

    toast.promise(promise, {
      loading: "Saving record...",
      success: () => {
        mutate()
        setOpen(false)
        resetForm()
        return "Medical record added successfully"
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
      diagnosis: form.get("diagnosis"),
      treatment: form.get("treatment"),
      prescription: form.get("prescription"),
      visit_date: form.get("visit_date"),
      follow_up_date: form.get("follow_up_date") || null,
      notes: form.get("notes"),
    }
    const promise = fetch(`/api/medical-records?id=${selectedRecord.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update record")
      }
      return res.json()
    })

    toast.promise(promise, {
      loading: "Updating record...",
      success: () => {
        mutate()
        setEditOpen(false)
        resetForm()
        return "Medical record updated successfully"
      },
      error: (err) => err.message,
    })
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this medical record?")) return
    const promise = fetch(`/api/medical-records?id=${id}`, { method: "DELETE" }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to delete record")
      }
      return res.json()
    })

    toast.promise(promise, {
      loading: "Deleting record...",
      success: () => {
        mutate()
        return "Medical record deleted successfully"
      },
      error: (err) => err.message,
    })
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
              <Button className="gap-2 btn-premium"><Plus className="h-4 w-4" />Add Record</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg glass-dialog">
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
                <Button type="submit" className="w-full btn-premium">Add Record</Button>
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
          {filtered?.map((r: Record<string, string | number | null>, index: number) => (
            <div key={r.id} className="animate-row-enter rounded-xl border border-border/50 bg-card p-5 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-foreground">{r.patient_name || "Unknown Patient"}</h3>
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none">Dr. {r.doctor_name || "Unknown"}</Badge>
                  </div>
                  <div className="rounded-xl border border-border/30 bg-muted/20 p-4 space-y-3 transition-colors hover:bg-muted/30">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-foreground">Diagnosis</p>
                        <p className="text-sm text-muted-foreground mt-1">{r.diagnosis}</p>
                      </div>
                      {(canEdit(userRole, "medical_records") || canDelete(userRole, "medical_records")) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 glass-dialog">
                            <DropdownMenuLabel>Record Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast.info("Opening report viewer...")} className="cursor-pointer font-medium">
                              <Eye className="mr-2 h-4 w-4" /> View Full Report
                            </DropdownMenuItem>
                            {canEdit(userRole, "medical_records") && (
                              <DropdownMenuItem onClick={() => openEdit(r)} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit Record
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast.info("Sharing with patient...")} className="cursor-pointer">
                              <Share2 className="mr-2 h-4 w-4" /> Share with Patient
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info("Generating PDF...")} className="cursor-pointer">
                              <Download className="mr-2 h-4 w-4" /> Download PDF
                            </DropdownMenuItem>
                            {canDelete(userRole, "medical_records") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(r.id as number)} className="cursor-pointer text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Record
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {(r.treatment || r.prescription) && (
                      <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border/20">
                        {r.treatment && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Treatment</p>
                            <p className="text-sm text-foreground mt-1">{r.treatment}</p>
                          </div>
                        )}
                        {r.prescription && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Prescription (Rx)</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-500 font-medium mt-1">{r.prescription}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {r.notes && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground italic px-1">
                      <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                      <p>{r.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 text-xs">
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[10px]">Visit Date</span>
                    <span className="font-bold text-foreground font-mono">{r.visit_date ? new Date(r.visit_date as string).toLocaleDateString("en-IN") : "—"}</span>
                  </div>
                  {r.follow_up_date && (
                    <Badge variant="outline" className="text-[10px] font-bold border-primary/20 bg-primary/5 text-primary px-2 py-0.5">
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg glass-dialog">
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
            <Button type="submit" className="w-full btn-premium">Update Record</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

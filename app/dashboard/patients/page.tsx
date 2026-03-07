"use client"

import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Activity, ArrowUpDown } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const bloodGroupColors: Record<string, string> = {
  "O+": "bg-[#dc2626]/10 text-[#dc2626]",
  "O-": "bg-[#dc2626]/5 text-[#dc2626]",
  "A+": "bg-[#2563eb]/10 text-[#2563eb]",
  "A-": "bg-[#2563eb]/5 text-[#2563eb]",
  "B+": "bg-[#059669]/10 text-[#059669]",
  "B-": "bg-[#059669]/5 text-[#059669]",
  "AB+": "bg-[#d97706]/10 text-[#d97706]",
  "AB-": "bg-[#d97706]/5 text-[#d97706]",
}

export default function PatientsPage() {
  const { data: patients, mutate } = useSWR("/api/patients", fetcher, { refreshInterval: 5000, revalidateOnFocus: true })
  const [search, setSearch] = useState("")
  const [bloodFilter, setBloodFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"name" | "date">("name")
  const [open, setOpen] = useState(false)

  // Controlled form state for Selects
  const [formGender, setFormGender] = useState("")
  const [formBlood, setFormBlood] = useState("")

  const filtered = patients?.filter((p: Record<string, string>) => {
    const matchesSearch = `${p.first_name} ${p.last_name} ${p.email} ${p.blood_group} ${p.phone}`.toLowerCase().includes(search.toLowerCase())
    const matchesBlood = bloodFilter === "all" || p.blood_group === bloodFilter
    return matchesSearch && matchesBlood
  })?.sort((a: Record<string, string>, b: Record<string, string>) => {
    if (sortBy === "name") return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  })

  function resetForm() { setFormGender(""); setFormBlood("") }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      first_name: form.get("first_name"),
      last_name: form.get("last_name"),
      email: form.get("email"),
      phone: form.get("phone"),
      date_of_birth: form.get("date_of_birth"),
      gender: formGender,
      blood_group: formBlood,
      address: form.get("address"),
      emergency_contact: form.get("emergency_contact"),
      emergency_phone: form.get("emergency_phone"),
      insurance_id: form.get("insurance_id"),
    }
    if (!body.first_name || !body.last_name) {
      toast.error("Please fill in the patient's name")
      return
    }
    const res = await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success("Patient registered successfully")
      mutate()
      setOpen(false)
      resetForm()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to register patient")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={bloodFilter} onValueChange={setBloodFilter}>
            <SelectTrigger className="w-28"><SelectValue placeholder="Blood" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blood</SelectItem>
              {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === "name" ? "date" : "name")} className="gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortBy === "name" ? "A-Z" : "Newest"}
          </Button>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Register Patient</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>Register New Patient</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name *</Label><Input name="first_name" required /></div>
                <div className="space-y-2"><Label>Last Name *</Label><Input name="last_name" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input name="phone" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Date of Birth</Label><Input name="date_of_birth" type="date" /></div>
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
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select value={formBlood} onValueChange={setFormBlood}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Textarea name="address" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Emergency Contact</Label><Input name="emergency_contact" /></div>
                <div className="space-y-2"><Label>Emergency Phone</Label><Input name="emergency_phone" /></div>
              </div>
              <div className="space-y-2"><Label>Insurance ID</Label><Input name="insurance_id" /></div>
              <Button type="submit" className="w-full">Register Patient</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Activity className="h-4 w-4" />
        <span>{filtered?.length || 0} patients</span>
      </div>

      {!patients ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setSortBy("name")}>Name</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">DOB</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Blood</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Insurance</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Emergency</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((p: Record<string, string | number | null>) => (
                <tr key={p.id} className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{p.first_name} {p.last_name}</td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{p.email}</div>
                    <div className="text-xs text-muted-foreground">{p.phone}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.date_of_birth ? new Date(p.date_of_birth as string).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.gender || "-"}</td>
                  <td className="px-4 py-3">
                    {p.blood_group ? (
                      <Badge variant="secondary" className={bloodGroupColors[p.blood_group as string] || ""}>{p.blood_group}</Badge>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.insurance_id || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="text-foreground text-xs">{p.emergency_contact || "-"}</div>
                    <div className="text-xs text-muted-foreground">{p.emergency_phone}</div>
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

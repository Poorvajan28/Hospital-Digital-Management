"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Droplets, Plus, Search, Heart } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState } from "react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusColors: Record<string, string> = {
  active: "bg-[#059669]/10 text-[#059669]",
  inactive: "bg-[#6b7280]/10 text-[#6b7280]",
  deferred: "bg-[#d97706]/10 text-[#d97706]",
}

const chartConfig = { units: { label: "Units", color: "var(--color-chart-1)" } }

export default function BloodBankPage() {
  const { data: donors, mutate } = useSWR("/api/blood-donors", fetcher)
  const { data: stock } = useSWR("/api/blood-stock", fetcher)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const filtered = donors?.filter((d: Record<string, string>) =>
    `${d.first_name} ${d.last_name} ${d.blood_group} ${d.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnits = stock?.reduce((sum: number, s: { units_available: number }) => sum + Number(s.units_available), 0) || 0
  const criticalStock = stock?.filter((s: { units_available: number }) => Number(s.units_available) < 10) || []

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = Object.fromEntries(form.entries())
    const res = await fetch("/api/blood-donors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success("Blood donor registered successfully")
      mutate()
      setOpen(false)
    } else {
      toast.error("Failed to register donor")
    }
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
            <p className="text-3xl font-extrabold tracking-tight text-foreground">{totalUnits}</p>
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
            <p className="text-3xl font-extrabold tracking-tight text-foreground">{criticalStock.length}</p>
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
        <div className="relative flex-1 sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search donors..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-border/50 pl-10" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20"><Plus className="h-4 w-4" />Register Donor</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle className="text-xl">Register Blood Donor</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name</Label><Input name="first_name" required className="border-border/50" /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input name="last_name" required className="border-border/50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" className="border-border/50" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input name="phone" className="border-border/50" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select name="blood_group" required>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>DOB</Label><Input name="date_of_birth" type="date" className="border-border/50" /></div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select name="gender">
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
        </Dialog>
      </div>

      {!donors ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>
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
              </tr>
            </thead>
            <tbody>
              {filtered?.map((d: Record<string, string | number | null>) => (
                <tr key={d.id} className="border-b border-border/30 transition-colors last:border-0 hover:bg-muted/20">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

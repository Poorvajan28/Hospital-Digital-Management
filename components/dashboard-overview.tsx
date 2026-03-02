"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Activity, CalendarDays, BedDouble, Package, Droplets, AlertTriangle, TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DashboardStats {
  activeStaff: number
  activePatients: number
  todayAppointments: number
  scheduledAppointments: number
  availableRooms: number
  totalBeds: number
  occupiedBeds: number
  lowStockItems: number
  bloodStock: Array<{ blood_group: string; units_available: number }>
  recentAppointments: Array<{
    id: number
    patient_first: string
    patient_last: string
    doctor_first: string
    doctor_last: string
    department_name: string
    appointment_date: string
    appointment_time: string
    type: string
    status: string
  }>
  departmentStats: Array<{ name: string; staff_count: number }>
}

const statusColors: Record<string, string> = {
  scheduled: "bg-[#2563eb]/10 text-[#2563eb]",
  completed: "bg-[#059669]/10 text-[#059669]",
  cancelled: "bg-[#dc2626]/10 text-[#dc2626]",
  no_show: "bg-[#d97706]/10 text-[#d97706]",
}

const bloodChartConfig = {
  units: { label: "Units Available", color: "var(--color-chart-1)" },
}

const deptChartConfig = {
  staff_count: { label: "Staff Count", color: "var(--color-chart-2)" },
}

export function DashboardOverview({ stats }: { stats: DashboardStats }) {
  const bedOccupancy = stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Primary Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Staff"
          value={stats.activeStaff}
          icon={<Users className="h-5 w-5" />}
          description="Currently employed"
          trend="+2 this week"
          index={0}
        />
        <StatCard
          title="Active Patients"
          value={stats.activePatients}
          icon={<Activity className="h-5 w-5" />}
          description="Registered patients"
          trend="+5 this month"
          index={1}
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={<CalendarDays className="h-5 w-5" />}
          description={`${stats.scheduledAppointments} scheduled total`}
          index={2}
        />
        <StatCard
          title="Bed Occupancy"
          value={`${bedOccupancy}%`}
          icon={<BedDouble className="h-5 w-5" />}
          description={`${stats.occupiedBeds}/${stats.totalBeds} beds used`}
          index={3}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 [animation-delay:400ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Rooms</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 transition-transform duration-300 group-hover:scale-110">
              <BedDouble className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">{stats.availableRooms}</p>
            <p className="mt-1 text-xs text-muted-foreground">Ready for admission</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 [animation-delay:500ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
            <div className={`rounded-lg p-2 transition-transform duration-300 group-hover:scale-110 ${stats.lowStockItems > 0 ? "bg-[#dc2626]/10" : "bg-primary/10"}`}>
              {stats.lowStockItems > 0 ? (
                <AlertTriangle className="h-4 w-4 text-[#dc2626]" />
              ) : (
                <Package className="h-4 w-4 text-primary" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">{stats.lowStockItems}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stats.lowStockItems > 0 ? "Need restocking" : "All items stocked"}</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in group border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 [animation-delay:600ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Blood Units</CardTitle>
            <div className="rounded-lg bg-[#dc2626]/10 p-2 transition-transform duration-300 group-hover:scale-110">
              <Droplets className="h-4 w-4 text-[#dc2626]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {stats.bloodStock.reduce((sum, b) => sum + Number(b.units_available), 0)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Across all blood groups</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in border-border/50 [animation-delay:700ms]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-foreground">
              <div className="rounded-lg bg-[#dc2626]/10 p-1.5">
                <Droplets className="h-4 w-4 text-[#dc2626]" />
              </div>
              Blood Stock Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={bloodChartConfig} className="h-[260px] w-full">
              <BarChart data={stats.bloodStock.map(b => ({ ...b, units: Number(b.units_available) }))}>
                <XAxis dataKey="blood_group" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="units" radius={[8, 8, 0, 0]}>
                  {stats.bloodStock.map((_, i) => (
                    <Cell key={i} fill={Number(stats.bloodStock[i].units_available) < 10 ? "oklch(0.577 0.245 27.325)" : "var(--color-chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in border-border/50 [animation-delay:800ms]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-foreground">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              Staff by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={deptChartConfig} className="h-[260px] w-full">
              <BarChart data={stats.departmentStats.map(d => ({ ...d, staff_count: Number(d.staff_count) }))} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="staff_count" fill="var(--color-chart-2)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card className="animate-fade-in border-border/50 [animation-delay:900ms]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-foreground">
            <div className="rounded-lg bg-[#2563eb]/10 p-1.5">
              <CalendarDays className="h-4 w-4 text-[#2563eb]" />
            </div>
            Recent Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left">
                  <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient</th>
                  <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Doctor</th>
                  <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</th>
                  <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-border/30 transition-colors last:border-0 hover:bg-muted/30">
                    <td className="py-3.5 pr-4 font-medium text-foreground">{apt.patient_first} {apt.patient_last}</td>
                    <td className="py-3.5 pr-4 text-foreground">Dr. {apt.doctor_first} {apt.doctor_last}</td>
                    <td className="py-3.5 pr-4 text-muted-foreground">{apt.department_name}</td>
                    <td className="py-3.5 pr-4 font-mono text-xs text-muted-foreground">
                      {new Date(apt.appointment_date).toLocaleDateString()} {apt.appointment_time?.slice(0, 5)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="capitalize text-foreground">{apt.type.replace("_", " ")}</span>
                    </td>
                    <td className="py-3.5">
                      <Badge variant="secondary" className={`font-semibold ${statusColors[apt.status] || ""}`}>
                        {apt.status.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  index,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
  trend?: string
  index: number
}) {
  return (
    <Card
      className="animate-fade-in group border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-lg bg-primary/10 p-2 text-primary transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <span className="rounded-full bg-[#059669]/10 px-2 py-0.5 text-[10px] font-semibold text-[#059669]">
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

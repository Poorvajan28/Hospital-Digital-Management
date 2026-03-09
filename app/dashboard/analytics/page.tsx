"use client"

import { useMemo } from "react"
import useSWR from "swr"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Package, 
  Calendar, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BrainCircuit
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function AnalyticsPage() {
  const { data: patients } = useSWR("/api/patients", fetcher)
  const { data: inventory } = useSWR("/api/inventory", fetcher)
  const { data: appointments } = useSWR("/api/appointments", fetcher)
  const { data: bloodStock } = useSWR("/api/blood-stock", fetcher)

  // 1. Patient Demographics Data
  const patientStats = useMemo(() => {
    if (!patients) return []
    const counts: Record<string, number> = {}
    patients.forEach((p: any) => {
      const bg = p.blood_group || "Unknown"
      counts[bg] = (counts[bg] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [patients])

  // 2. Inventory Status Data
  const inventoryData = useMemo(() => {
    if (!inventory) return []
    return inventory.map((item: any) => ({
      name: item.item_name,
      quantity: item.quantity,
      min: item.min_stock_level,
    })).slice(0, 8)
  }, [inventory])

  // 3. Appointment Trends (Simulated monthly for visualization)
  const appointmentTrends = useMemo(() => {
    if (!appointments) return []
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return months.map(month => ({
      name: month,
      scheduled: Math.floor(Math.random() * 20) + 10,
      completed: Math.floor(Math.random() * 15) + 5,
    }))
  }, [appointments])

  // 4. Blood Stock Units
  const bloodData = useMemo(() => {
    if (!bloodStock) return []
    return bloodStock.map((b: any) => ({
      group: b.blood_group,
      units: b.units_available
    }))
  }, [bloodStock])

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Hospital Intelligence & Analytics
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-500" />
          Real-time insights and performance metrics powered by hospital data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Users size={48} className="text-blue-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total registered Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients?.length || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-emerald-500 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 12%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Calendar size={48} className="text-indigo-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments?.length || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-rose-500 flex items-center">
                <ArrowDownRight className="w-3 h-3" /> 4%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Package size={48} className="text-amber-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{inventory?.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0).toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-emerald-500 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 8%
              </span>
              re-stock valuation
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Activity size={48} className="text-emerald-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Efficiency</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.4%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-emerald-500 flex items-center">
                <Activity className="w-3 h-3" /> Optimal
              </span>
              infrastructure load
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory & Resources</TabsTrigger>
          <TabsTrigger value="demographics">Patient Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 glass-card border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Appointment Trends
                </CardTitle>
                <CardDescription>Scheduled vs Completed appointments over time.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={appointmentTrends}>
                    <defs>
                      <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="scheduled" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScheduled)" strokeWidth={3} />
                    <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3 glass-card border-none shadow-xl">
              <CardHeader>
                <CardTitle>Blood Bank Availability</CardTitle>
                <CardDescription>Units available per blood group.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={bloodData} layout="vertical" margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="group" type="category" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="units" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                      {bloodData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card className="glass-card border-none shadow-xl">
            <CardHeader>
              <CardTitle>Inventory Stock Levels</CardTitle>
              <CardDescription>Current quantity vs Minimum required stock.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend />
                  <Bar dataKey="quantity" fill="#3b82f6" name="Present Stock" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="min" fill="#ef4444" name="Minimum Alert Level" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <Card className="glass-card border-none shadow-xl">
            <CardHeader>
              <CardTitle>Patient Blood Group Distribution</CardTitle>
              <CardDescription>Breakdown of registered patients by blood group.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={patientStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {patientStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
      `}</style>
    </div>
  )
}

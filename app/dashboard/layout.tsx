"use client"

import { usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { PageTransition } from "@/components/page-transition"
import {
  LayoutDashboard,
  Users,
  Activity,
  CalendarDays,
  FileText,
  Droplets,
  Package,
  Building2,
  BedDouble,
} from "lucide-react"

const pageConfig: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  "/dashboard": { title: "Dashboard Overview", description: "Monitor hospital operations at a glance", icon: LayoutDashboard },
  "/dashboard/staff": { title: "Staff Management", description: "Manage doctors, nurses, and admin staff", icon: Users },
  "/dashboard/patients": { title: "Patient Records", description: "View and manage patient information", icon: Activity },
  "/dashboard/appointments": { title: "Appointments", description: "Schedule and track patient appointments", icon: CalendarDays },
  "/dashboard/medical-records": { title: "Medical Records", description: "Access patient medical history", icon: FileText },
  "/dashboard/blood-bank": { title: "Blood Bank", description: "Monitor blood stock and donor registry", icon: Droplets },
  "/dashboard/inventory": { title: "Inventory & Stock", description: "Track medical supplies and equipment", icon: Package },
  "/dashboard/departments": { title: "Departments", description: "Hospital department directory", icon: Building2 },
  "/dashboard/rooms": { title: "Rooms & Beds", description: "Room availability and occupancy", icon: BedDouble },
  "/dashboard/beds": { title: "Bed Management", description: "Track and manage hospital beds", icon: BedDouble },
  "/dashboard/equipment": { title: "Equipment", description: "Medical equipment tracking", icon: Package },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const config = pageConfig[pathname] || { title: "Dashboard", description: "", icon: LayoutDashboard }
  const Icon = config.icon

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="min-h-screen transition-all duration-300 lg:ml-[260px]">
        <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-4 px-6">
            <div className="ml-10 flex items-center gap-3 lg:ml-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground">{config.title}</h1>
                {config.description && (
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="p-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  )
}


"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Users,
  CalendarDays,
  FileText,
  Droplets,
  Package,
  Building2,
  LayoutDashboard,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Resource Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/beds", label: "Bed Management", icon: BedDouble },
  { href: "/dashboard/equipment", label: "Equipment", icon: Package },
  { href: "/dashboard/blood-bank", label: "Blood Bank", icon: Droplets },
  { href: "/dashboard/staff", label: "Staff Schedule", icon: Users },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/dashboard/inventory", label: "Medical Inventory", icon: Activity },
  { href: "/dashboard/departments", label: "Departments", icon: Building2 },
]

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: (typeof navItems)[0]
  collapsed: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive = pathname === item.href

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        collapsed && "justify-center px-2.5",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {isActive && !collapsed && (
        <div className="absolute -left-[1px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
      )}
    </Link>
  )
}

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-[1.1rem] z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] animate-fade-in bg-sidebar shadow-2xl [animation-delay:0ms]">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                    <Activity className="h-4 w-4 text-sidebar-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold text-sidebar-foreground">
                    MediCore
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {navItems.map((item, index) => (
                  <div key={item.href} className="animate-slide-in-left" style={{ animationDelay: `${index * 40}ms` }}>
                    <NavLink item={item} collapsed={false} onClick={() => setMobileOpen(false)} />
                  </div>
                ))}
              </nav>
              <div className="border-t border-sidebar-border p-4">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                >
                  <Home className="h-[18px] w-[18px]" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:flex",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border transition-all duration-300",
            collapsed ? "justify-center px-2" : "gap-2.5 px-5"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary shadow-md shadow-sidebar-primary/20">
            <Activity className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
              MediCore
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item, index) => (
            <div key={item.href} className="animate-slide-in-left" style={{ animationDelay: `${index * 50}ms` }}>
              <NavLink item={item} collapsed={collapsed} />
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-sidebar-border p-3">
          <Link
            href="/"
            title={collapsed ? "Back to Home" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              collapsed && "justify-center px-2.5"
            )}
          >
            <Home className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Back to Home</span>}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-sidebar-foreground/40 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </>
  )
}

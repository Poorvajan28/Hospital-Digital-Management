import Link from "next/link"
import Image from "next/image"
import {
  Activity,
  Users,
  CalendarDays,
  Droplets,
  Package,
  Building2,
  ArrowRight,
  ShieldCheck,
  Clock,
  BarChart3,
  Heart,
  Stethoscope,
  BedDouble,
  FileText,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { UnicornHero } from "@/components/unicorn-hero"

const features = [
  {
    icon: Users,
    title: "Staff Management",
    description:
      "Manage doctors, nurses, technicians, and admin staff with department tracking, role assignments, and salary management.",
    color: "from-[#0891b2]/10 to-[#0891b2]/5",
    iconBg: "bg-[#0891b2]/15 text-[#0891b2]",
  },
  {
    icon: CalendarDays,
    title: "Patient Bookings",
    description:
      "Schedule appointments, track consultations, follow-ups, emergencies, and surgeries all in real-time.",
    color: "from-[#2563eb]/10 to-[#2563eb]/5",
    iconBg: "bg-[#2563eb]/15 text-[#2563eb]",
  },
  {
    icon: FileText,
    title: "Medical History",
    description:
      "Comprehensive patient records including diagnoses, treatments, prescriptions, and follow-up scheduling.",
    color: "from-[#7c3aed]/10 to-[#7c3aed]/5",
    iconBg: "bg-[#7c3aed]/15 text-[#7c3aed]",
  },
  {
    icon: Droplets,
    title: "Blood Bank",
    description:
      "Track blood donors, manage stock levels by blood group, and monitor donation history with critical alerts.",
    color: "from-[#dc2626]/10 to-[#dc2626]/5",
    iconBg: "bg-[#dc2626]/15 text-[#dc2626]",
  },
  {
    icon: Package,
    title: "Inventory & Stock",
    description:
      "Monitor medicines, equipment, PPE, and supplies with low-stock alerts, expiry tracking, and value reports.",
    color: "from-[#059669]/10 to-[#059669]/5",
    iconBg: "bg-[#059669]/15 text-[#059669]",
  },
  {
    icon: BedDouble,
    title: "Room Management",
    description:
      "Track room availability, bed occupancy rates, and manage ICU, private, and emergency room assignments.",
    color: "from-[#d97706]/10 to-[#d97706]/5",
    iconBg: "bg-[#d97706]/15 text-[#d97706]",
  },
]

const stats = [
  { label: "Departments", value: "8+", icon: Building2, suffix: "managed" },
  { label: "Staff Members", value: "50+", icon: Stethoscope, suffix: "tracked" },
  { label: "Patients Served", value: "1K+", icon: Heart, suffix: "registered" },
  { label: "System Uptime", value: "99.9%", icon: Clock, suffix: "reliability" },
]

const capabilities = [
  "Real-time appointment scheduling",
  "Blood group stock monitoring",
  "Automated low-stock alerts",
  "Department staff analytics",
  "Patient emergency contacts",
  "Room occupancy tracking",
  "Medical record history",
  "Insurance ID management",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Medi<span className="text-primary">Core</span>
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#stats" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Statistics
            </a>
            <a href="#capabilities" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Capabilities
            </a>
          </div>
          <Button asChild size="sm" className="gap-1.5 shadow-lg shadow-primary/20">
            <Link href="/dashboard">
              Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <UnicornHero />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="animate-fade-in">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-lg shadow-primary/5 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>Next-Generation Hospital Platform</span>
            </div>
          </div>
          <h1 className="animate-fade-in text-balance text-5xl font-extrabold tracking-tight text-foreground drop-shadow-lg sm:text-6xl lg:text-8xl [animation-delay:100ms]">
            Medi<span className="text-primary">Core</span>
          </h1>
          <p className="animate-fade-in mt-4 text-lg font-semibold tracking-wide text-foreground/80 drop-shadow-md sm:text-xl [animation-delay:200ms]">
            HOSPITAL MANAGEMENT SYSTEM
          </p>
          <p className="animate-fade-in mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-foreground/90 drop-shadow-sm sm:text-lg [animation-delay:300ms]">
            Streamline every aspect of your hospital operations. From patient care to inventory, staff management to blood bank monitoring -- one unified, intelligent platform.
          </p>
          <div className="animate-fade-in mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row [animation-delay:400ms]">
            <Button asChild size="lg" className="h-13 gap-2.5 px-10 text-base font-semibold shadow-xl shadow-primary/25">
              <Link href="/dashboard">
                Open Dashboard
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-13 gap-2 border-border/50 bg-background/50 px-10 text-base font-semibold backdrop-blur-sm"
            >
              <Link href="#features">
                Explore Features
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
          <div className="h-10 w-6 rounded-full border-2 border-muted-foreground/30 p-1">
            <div className="h-2 w-full rounded-full bg-muted-foreground/40" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative border-t border-border/30 bg-card/80 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="animate-fade-in group text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/10">
                  <stat.icon className="h-7 w-7 text-primary" />
                </div>
                <p className="text-4xl font-extrabold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.suffix}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-20 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
              <BarChart3 className="h-4 w-4" />
              Comprehensive Suite
            </div>
            <h2 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Everything Your Hospital Needs
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
              Six powerful modules designed to handle every aspect of hospital administration with precision and elegance.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-fade-in group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                <div className="relative">
                  <div className={`mb-5 flex h-13 w-13 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <span>Learn more</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hospital Image Section */}
      <section className="py-0">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src="/images/hospital-interior.jpg"
              alt="Modern hospital interior"
              width={1400}
              height={500}
              className="h-[400px] w-full object-cover brightness-75"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 backdrop-blur-[2px]">
              <div className="text-center">
                <h3 className="text-balance text-3xl font-extrabold tracking-tight text-[#ffffff] sm:text-4xl">
                  Built for Modern Healthcare
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-pretty text-[#e2e8f0]">
                  Designed with the latest technology to support hospitals of all sizes in delivering exceptional patient care.
                </p>
                <Button asChild size="lg" className="mt-8 gap-2 shadow-xl">
                  <Link href="/dashboard">
                    Try the Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" />
                Platform Capabilities
              </div>
              <h2 className="text-balance text-4xl font-extrabold tracking-tight text-foreground">
                Powerful Features, Simple Interface
              </h2>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
                MediCore combines enterprise-grade functionality with an intuitive design that your staff will love using every day.
              </p>
              <Button asChild size="lg" className="mt-8 gap-2 shadow-lg shadow-primary/20">
                <Link href="/dashboard">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {capabilities.map((cap, index) => (
                <div
                  key={cap}
                  className="animate-fade-in flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/30 bg-card/80 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-8 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Ready to Transform Your Hospital?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
            Join hundreds of healthcare facilities already using MediCore to deliver better patient outcomes.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-13 gap-2.5 px-12 text-base font-semibold shadow-xl shadow-primary/25">
              <Link href="/dashboard">
                Launch Dashboard
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-13 px-12 text-base font-semibold"
            >
              <Link href="/dashboard/patients">View Patients</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Medi<span className="text-primary">Core</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Hospital Management System. Built for modern healthcare excellence.
            </p>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#stats" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Stats
              </a>
              <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

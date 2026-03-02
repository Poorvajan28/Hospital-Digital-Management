import { getDb } from "@/lib/db"
import { DashboardOverview } from "@/components/dashboard-overview"

async function getDashboardStats() {
  const sql = getDb()

  const [staffCount] = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'active'`
  const [patientCount] = await sql`SELECT COUNT(*) as count FROM patients WHERE status = 'active'`
  const [appointmentToday] = await sql`SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURRENT_DATE`
  const [appointmentScheduled] = await sql`SELECT COUNT(*) as count FROM appointments WHERE status = 'scheduled'`
  const [roomsAvailable] = await sql`SELECT COUNT(*) as count FROM rooms WHERE status = 'available'`
  const [totalBeds] = await sql`SELECT COALESCE(SUM(beds_total), 0) as total, COALESCE(SUM(beds_occupied), 0) as occupied FROM rooms`
  const [lowStockCount] = await sql`SELECT COUNT(*) as count FROM inventory WHERE status IN ('low_stock', 'out_of_stock')`
  const bloodStock = await sql`SELECT blood_group, units_available FROM blood_stock ORDER BY blood_group`

  const recentAppointments = await sql`
    SELECT a.*, 
      p.first_name as patient_first, p.last_name as patient_last,
      s.first_name as doctor_first, s.last_name as doctor_last,
      d.name as department_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN staff s ON a.doctor_id = s.id
    JOIN departments d ON a.department_id = d.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
    LIMIT 5
  `

  const departmentStats = await sql`
    SELECT d.name, COUNT(s.id) as staff_count
    FROM departments d
    LEFT JOIN staff s ON d.id = s.department_id AND s.status = 'active'
    GROUP BY d.id, d.name
    ORDER BY d.name
  `

  return {
    activeStaff: Number(staffCount.count),
    activePatients: Number(patientCount.count),
    todayAppointments: Number(appointmentToday.count),
    scheduledAppointments: Number(appointmentScheduled.count),
    availableRooms: Number(roomsAvailable.count),
    totalBeds: Number(totalBeds.total),
    occupiedBeds: Number(totalBeds.occupied),
    lowStockItems: Number(lowStockCount.count),
    bloodStock,
    recentAppointments,
    departmentStats,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return <DashboardOverview stats={stats} />
}

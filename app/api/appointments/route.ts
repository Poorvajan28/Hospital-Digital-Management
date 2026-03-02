import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const sql = getDb()
  const appointments = await sql`
    SELECT a.*,
      p.first_name as patient_first, p.last_name as patient_last,
      s.first_name as doctor_first, s.last_name as doctor_last,
      d.name as department_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN staff s ON a.doctor_id = s.id
    JOIN departments d ON a.department_id = d.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `
  return NextResponse.json(appointments)
}

export async function POST(request: NextRequest) {
  const sql = getDb()
  const body = await request.json()
  const { patient_id, doctor_id, department_id, appointment_date, appointment_time, type, notes } = body

  const [appointment] = await sql`
    INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, appointment_time, type, notes)
    VALUES (${patient_id}, ${doctor_id}, ${department_id}, ${appointment_date}, ${appointment_time}, ${type || 'consultation'}, ${notes || null})
    RETURNING *
  `
  return NextResponse.json(appointment, { status: 201 })
}

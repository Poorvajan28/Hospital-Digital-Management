import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const sql = getDb()
  const records = await sql`
    SELECT mr.*,
      p.first_name as patient_first, p.last_name as patient_last,
      s.first_name as doctor_first, s.last_name as doctor_last
    FROM medical_records mr
    JOIN patients p ON mr.patient_id = p.id
    JOIN staff s ON mr.doctor_id = s.id
    ORDER BY mr.visit_date DESC
  `
  return NextResponse.json(records)
}

export async function POST(request: NextRequest) {
  const sql = getDb()
  const body = await request.json()
  const { patient_id, doctor_id, diagnosis, treatment, prescription, visit_date, follow_up_date, notes } = body

  const [record] = await sql`
    INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, prescription, visit_date, follow_up_date, notes)
    VALUES (${patient_id}, ${doctor_id}, ${diagnosis}, ${treatment || null}, ${prescription || null}, ${visit_date || new Date().toISOString().split('T')[0]}, ${follow_up_date || null}, ${notes || null})
    RETURNING *
  `
  return NextResponse.json(record, { status: 201 })
}

import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const sql = getDb()
  const patients = await sql`SELECT * FROM patients ORDER BY last_name, first_name`
  return NextResponse.json(patients)
}

export async function POST(request: NextRequest) {
  const sql = getDb()
  const body = await request.json()
  const { first_name, last_name, email, phone, date_of_birth, gender, blood_group, address, emergency_contact, emergency_phone, insurance_id } = body

  const [patient] = await sql`
    INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, blood_group, address, emergency_contact, emergency_phone, insurance_id)
    VALUES (${first_name}, ${last_name}, ${email || null}, ${phone || null}, ${date_of_birth || null}, ${gender || null}, ${blood_group || null}, ${address || null}, ${emergency_contact || null}, ${emergency_phone || null}, ${insurance_id || null})
    RETURNING *
  `
  return NextResponse.json(patient, { status: 201 })
}

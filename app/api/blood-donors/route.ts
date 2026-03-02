import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const sql = getDb()
  const donors = await sql`SELECT * FROM blood_donors ORDER BY last_name, first_name`
  return NextResponse.json(donors)
}

export async function POST(request: NextRequest) {
  const sql = getDb()
  const body = await request.json()
  const { first_name, last_name, email, phone, blood_group, date_of_birth, gender, address } = body

  const [donor] = await sql`
    INSERT INTO blood_donors (first_name, last_name, email, phone, blood_group, date_of_birth, gender, address)
    VALUES (${first_name}, ${last_name}, ${email || null}, ${phone || null}, ${blood_group}, ${date_of_birth || null}, ${gender || null}, ${address || null})
    RETURNING *
  `
  return NextResponse.json(donor, { status: 201 })
}

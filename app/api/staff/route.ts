import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const sql = getDb()
  const staff = await sql`
    SELECT s.*, d.name as department_name 
    FROM staff s 
    LEFT JOIN departments d ON s.department_id = d.id 
    ORDER BY s.last_name, s.first_name
  `
  return NextResponse.json(staff)
}

export async function POST(request: NextRequest) {
  const sql = getDb()
  const body = await request.json()
  const { first_name, last_name, email, phone, role, department_id, specialization, salary } = body

  const [staff] = await sql`
    INSERT INTO staff (first_name, last_name, email, phone, role, department_id, specialization, salary)
    VALUES (${first_name}, ${last_name}, ${email}, ${phone}, ${role}, ${department_id || null}, ${specialization || null}, ${salary || null})
    RETURNING *
  `
  return NextResponse.json(staff, { status: 201 })
}

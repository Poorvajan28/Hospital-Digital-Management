import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const sql = getDb()
  const departments = await sql`
    SELECT d.*, COUNT(s.id) as staff_count 
    FROM departments d 
    LEFT JOIN staff s ON d.id = s.department_id AND s.status = 'active'
    GROUP BY d.id 
    ORDER BY d.name
  `
  return NextResponse.json(departments)
}

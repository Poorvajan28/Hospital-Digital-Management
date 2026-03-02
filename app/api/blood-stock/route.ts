import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const sql = getDb()
  const stock = await sql`SELECT * FROM blood_stock ORDER BY blood_group`
  return NextResponse.json(stock)
}

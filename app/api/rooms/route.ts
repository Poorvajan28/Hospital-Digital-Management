import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const sql = getDb()
  const rooms = await sql`SELECT * FROM rooms ORDER BY room_number`
  return NextResponse.json(rooms)
}

import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const sql = getDb()
  const inventory = await sql`SELECT * FROM inventory ORDER BY category, item_name`
  return NextResponse.json(inventory)
}

export async function POST(request: NextRequest) {
  const sql = getDb()
  const body = await request.json()
  const { item_name, category, quantity, unit, min_stock_level, unit_price, supplier, expiry_date } = body

  const status = quantity <= 0 ? 'out_of_stock' : quantity < (min_stock_level || 10) ? 'low_stock' : 'in_stock'

  const [item] = await sql`
    INSERT INTO inventory (item_name, category, quantity, unit, min_stock_level, unit_price, supplier, expiry_date, status)
    VALUES (${item_name}, ${category}, ${quantity || 0}, ${unit || 'pieces'}, ${min_stock_level || 10}, ${unit_price || null}, ${supplier || null}, ${expiry_date || null}, ${status})
    RETURNING *
  `
  return NextResponse.json(item, { status: 201 })
}

import { NextRequest, NextResponse } from "next/server"
import { getTable, insert, update, remove } from "@/lib/db"

export async function GET() {
  try {
    const inventory = await getTable("inventory", {
      order: "item_name.asc",
    })
    return NextResponse.json(inventory)
  } catch (error) {
    console.error("Database error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newItem = await insert("inventory", {
      item_name: body.item_name || body.itemName,
      category: body.category,
      quantity: body.quantity || 0,
      unit: body.unit || "pieces",
      min_stock_level: body.min_stock_level || body.minStockLevel || 10,
      unit_price: body.unit_price || body.unitPrice,
      supplier: body.supplier,
      expiry_date: body.expiry_date || body.expiryDate,
      status: body.status || "in_stock",
    })
    return NextResponse.json(newItem, { status: 201 })
  } catch (error: any) {
    console.error("Database error creating inventory item:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const body = await request.json()
    const updated = await update("inventory", id, body)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Database error updating inventory:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await remove("inventory", id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Database error deleting inventory item:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

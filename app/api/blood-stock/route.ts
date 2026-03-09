import { NextRequest, NextResponse } from "next/server"
import { getTable, insert, update } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const bloodStock = await getTable("blood_stock", {
      order: "blood_group.asc",
    })
    return NextResponse.json(bloodStock)
  } catch (error) {
    console.error("Database error fetching blood stock:", error)
    return NextResponse.json({ error: "Failed to fetch blood stock" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newRecord = await insert("blood_stock", {
      blood_group: body.blood_group || body.bloodGroup,
      units_available: body.units_available || body.unitsAvailable || 0,
    })
    return NextResponse.json(newRecord, { status: 201 })
  } catch (error: any) {
    console.error("Database error creating blood stock:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const body = await request.json()
    const updated = await update("blood_stock", id, body)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Database error updating blood stock:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

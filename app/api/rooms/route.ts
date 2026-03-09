import { NextRequest, NextResponse } from "next/server"
import { getTable, insert, update, remove } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const rooms = await getTable("rooms", {
      order: "room_number.asc",
    })
    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Database error fetching rooms:", error)
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 })
  }
  try {
    const body = await request.json()
    const newRoom = await insert("rooms", {
      room_number: body.room_number || body.roomNumber,
      room_type: body.room_type || body.roomType,
      floor: body.floor,
      beds_total: body.beds_total || body.bedsTotal || 1,
      beds_occupied: body.beds_occupied || body.bedsOccupied || 0,
      status: body.status || "available",
      daily_rate: body.daily_rate || body.dailyRate,
    })
    return NextResponse.json(newRoom, { status: 201 })
  } catch (error: any) {
    console.error("Database error creating room:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "admin" && session.user.role !== "physician" && session.user.role !== "nurse")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const body = await request.json()
    const updated = await update("rooms", id, body)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Database error updating room:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await remove("rooms", id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Database error deleting room:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

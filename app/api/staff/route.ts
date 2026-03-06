import { NextRequest, NextResponse } from "next/server"
import { query, insert, update, remove } from "@/lib/db"

export async function GET() {
  try {
    const staff = await query(`
      SELECT s.*, d.name as department_name
      FROM staff s
      LEFT JOIN departments d ON s.department_id = d.id
      ORDER BY s.created_at DESC
    `)
    return NextResponse.json(staff)
  } catch (error) {
    console.error("Database error fetching staff:", error)
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newStaff = await insert("staff", {
      first_name: body.first_name || body.firstName,
      last_name: body.last_name || body.lastName,
      email: body.email,
      phone: body.phone,
      role: body.role,
      department_id: body.department_id || body.departmentId,
      specialization: body.specialization,
      status: body.status || "active",
      salary: body.salary,
    })
    return NextResponse.json(newStaff, { status: 201 })
  } catch (error: any) {
    console.error("Database error creating staff:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const body = await request.json()
    const updated = await update("staff", id, body)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Database error updating staff:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await remove("staff", id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Database error deleting staff:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getTable, insert, update, remove } from "@/lib/db"

export async function GET() {
  try {
    const departments = await getTable("departments", {
      order: "name.asc",
    })
    return NextResponse.json(departments)
  } catch (error) {
    console.error("Database error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newDepartment = await insert("departments", {
      name: body.name,
      description: body.description,
      head_doctor: body.head_doctor || body.headDoctor,
      phone: body.phone,
    })
    return NextResponse.json(newDepartment, { status: 201 })
  } catch (error: any) {
    console.error("Database error creating department:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const body = await request.json()
    const updated = await update("departments", id, body)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Database error updating department:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await remove("departments", id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Database error deleting department:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

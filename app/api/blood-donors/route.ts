import { NextRequest, NextResponse } from "next/server"
import { getTable, insert, update, remove } from "@/lib/db"

export async function GET() {
  try {
    const donors = await getTable("blood_donors", {
      order: "created_at.desc",
    })
    return NextResponse.json(donors)
  } catch (error) {
    console.error("Database error fetching blood donors:", error)
    return NextResponse.json({ error: "Failed to fetch blood donors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newDonor = await insert("blood_donors", {
      first_name: body.first_name || body.firstName,
      last_name: body.last_name || body.lastName,
      email: body.email,
      phone: body.phone,
      blood_group: body.blood_group || body.bloodGroup,
      date_of_birth: body.date_of_birth || body.dateOfBirth,
      gender: body.gender,
      last_donation_date: body.last_donation_date || body.lastDonationDate,
      total_donations: body.total_donations || body.totalDonations || 0,
      status: body.status || "active",
      address: body.address,
    })
    return NextResponse.json(newDonor, { status: 201 })
  } catch (error: any) {
    console.error("Database error creating blood donor:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const body = await request.json()
    const updated = await update("blood_donors", id, body)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Database error updating blood donor:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await remove("blood_donors", id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Database error deleting blood donor:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

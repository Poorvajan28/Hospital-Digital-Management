import { NextRequest, NextResponse } from "next/server"
import { query, insert, update, remove } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const records = await query(`
      SELECT mr.*,
        p.first_name || ' ' || p.last_name as patient_name,
        s.first_name || ' ' || s.last_name as doctor_name,
        sig.first_name || ' ' || sig.last_name as signer_name
      FROM medical_records mr
      LEFT JOIN patients p ON mr.patient_id = p.id
      LEFT JOIN staff s ON mr.doctor_id = s.id
      LEFT JOIN staff sig ON mr.signed_off_by = sig.id
      ORDER BY mr.visit_date DESC
    `)
    return NextResponse.json(records)
  } catch (error) {
    console.error("Database error fetching medical records:", error)
    return NextResponse.json({ error: "Failed to fetch medical records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "admin" && session.user.role !== "physician")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  try {
    const body = await request.json()
    const newRecord = await insert("medical_records", {
      patient_id: body.patient_id || body.patientId,
      doctor_id: body.doctor_id || body.doctorId,
      diagnosis: body.diagnosis,
      treatment: body.treatment,
      prescription: body.prescription,
      visit_date: body.visit_date || body.visitDate,
      follow_up_date: body.follow_up_date || body.followUpDate,
      notes: body.notes,
    })
    return NextResponse.json(newRecord, { status: 201 })
  } catch (error: any) {
    console.error("Database error creating medical record:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const body = await request.json()
    
    // Handle Digital Sign-off
    if (body.action === "sign_off") {
      if (session.user.role !== "physician") {
        return NextResponse.json({ error: "Only physicians can sign off" }, { status: 403 })
      }
      
      // Get the correct staff ID for this user (they might have joined via id_ref)
      const user = await query("SELECT id_ref FROM users WHERE email = $1", [session.user.email])
      const staffId = user[0]?.id_ref
      
      if (!staffId) return NextResponse.json({ error: "Staff profile not found" }, { status: 400 })
      
      const signed = await update("medical_records", id, {
        signed_off_by: staffId,
        signed_at: new Date().toISOString()
      })
      return NextResponse.json(signed)
    }

    // Regular Edit
    if (session.user.role !== "admin" && session.user.role !== "physician") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await update("medical_records", id, body)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Database error updating medical record:", error.message)
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

    await remove("medical_records", id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Database error deleting medical record:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

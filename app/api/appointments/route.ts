import { NextRequest, NextResponse } from "next/server"
import { query, insert, update, remove } from "@/lib/db"

export async function GET() {
  try {
    const appointments = await query(`
      SELECT a.*,
        p.first_name || ' ' || p.last_name as patient_name,
        s.first_name || ' ' || s.last_name as doctor_name,
        d.name as department_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN staff s ON a.doctor_id = s.id
      LEFT JOIN departments d ON a.department_id = d.id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `)
    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Database error fetching appointments:", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newAppointment = await insert("appointments", {
      patient_id: body.patient_id || body.patientId,
      doctor_id: body.doctor_id || body.doctorId,
      department_id: body.department_id || body.departmentId,
      appointment_date: body.appointment_date || body.appointmentDate,
      appointment_time: body.appointment_time || body.appointmentTime,
      type: body.type || "consultation",
      status: body.status || "scheduled",
      notes: body.notes,
    })
    return NextResponse.json(newAppointment, { status: 201 })
  } catch (error: any) {
    console.error("Database error creating appointment:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const body = await request.json()
    const updated = await update("appointments", id, body)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Database error updating appointment:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await remove("appointments", id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Database error deleting appointment:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

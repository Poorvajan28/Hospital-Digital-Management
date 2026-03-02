import { NextRequest, NextResponse } from "next/server"

// Mock data for testing
const mockAppointments = [
  {
    id: 1,
    patient_id: 1,
    patient_name: "Rajesh Kumar",
    doctor_id: 1,
    doctor_name: "Dr. Priya Sharma",
    department: "Cardiology",
    appointment_date: "2026-03-05",
    appointment_time: "10:00",
    status: "scheduled",
    type: "Consultation",
    notes: "Follow-up for hypertension",
  },
  {
    id: 2,
    patient_id: 2,
    patient_name: "Lakshmi N",
    doctor_id: 2,
    doctor_name: "Dr. Karthik R",
    department: "Surgery",
    appointment_date: "2026-03-05",
    appointment_time: "11:30",
    status: "confirmed",
    type: "Surgery",
    notes: "Appendectomy scheduled",
  },
  {
    id: 3,
    patient_id: 3,
    patient_name: "Suresh M",
    doctor_id: 1,
    doctor_name: "Dr. Priya Sharma",
    department: "Cardiology",
    appointment_date: "2026-03-06",
    appointment_time: "09:00",
    status: "pending",
    type: "Checkup",
    notes: "Annual cardiac checkup",
  },
]

export async function GET() {
  return NextResponse.json(mockAppointments)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newAppointment = {
    id: mockAppointments.length + 1,
    ...body,
    created_at: new Date().toISOString(),
  }
  mockAppointments.push(newAppointment)
  return NextResponse.json(newAppointment, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")
  const body = await request.json()

  const index = mockAppointments.findIndex((a) => a.id === id)
  if (index >= 0) {
    mockAppointments[index] = { ...mockAppointments[index], ...body }
    return NextResponse.json(mockAppointments[index])
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")

  const index = mockAppointments.findIndex((a) => a.id === id)
  if (index >= 0) {
    mockAppointments.splice(index, 1)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

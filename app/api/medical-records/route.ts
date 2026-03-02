import { NextRequest, NextResponse } from "next/server"

// Mock data for testing
const mockMedicalRecords = [
  {
    id: 1,
    patient_id: 1,
    patient_name: "Rajesh Kumar",
    doctor_id: 1,
    doctor_name: "Dr. Priya Sharma",
    diagnosis: "Hypertension",
    symptoms: "Headache, dizziness",
    prescription: "Tab. Amlodipine 5mg OD",
    notes: "Patient advised lifestyle modifications",
    record_date: "2026-03-02",
    follow_up_date: "2026-03-16",
    status: "active",
  },
  {
    id: 2,
    patient_id: 2,
    patient_name: "Lakshmi N",
    doctor_id: 2,
    doctor_name: "Dr. Karthik R",
    diagnosis: "Acute Appendicitis",
    symptoms: "Abdominal pain, fever",
    prescription: "Pre-surgery antibiotics",
    notes: "Scheduled for appendectomy",
    record_date: "2026-03-02",
    follow_up_date: "2026-03-05",
    status: "active",
  },
  {
    id: 3,
    patient_id: 3,
    patient_name: "Suresh M",
    doctor_id: 1,
    doctor_name: "Dr. Priya Sharma",
    diagnosis: "Annual Checkup",
    symptoms: "None",
    prescription: "Continue current medications",
    notes: "All vitals normal",
    record_date: "2026-03-01",
    follow_up_date: "2027-03-01",
    status: "completed",
  },
]

export async function GET() {
  return NextResponse.json(mockMedicalRecords)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newRecord = {
    id: mockMedicalRecords.length + 1,
    ...body,
    created_at: new Date().toISOString(),
  }
  mockMedicalRecords.push(newRecord)
  return NextResponse.json(newRecord, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")
  const body = await request.json()

  const index = mockMedicalRecords.findIndex((r) => r.id === id)
  if (index >= 0) {
    mockMedicalRecords[index] = { ...mockMedicalRecords[index], ...body }
    return NextResponse.json(mockMedicalRecords[index])
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")

  const index = mockMedicalRecords.findIndex((r) => r.id === id)
  if (index >= 0) {
    mockMedicalRecords.splice(index, 1)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

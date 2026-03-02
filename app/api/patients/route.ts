import { NextRequest, NextResponse } from "next/server"

// Mock data for testing
const mockPatients = [
  {
    id: 1,
    first_name: "Rajesh",
    last_name: "Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91 98765 43210",
    date_of_birth: "1985-06-15",
    gender: "male",
    address: "123 Anna Salai, Chennai",
    blood_group: "O+",
    emergency_contact: "+91 98765 43220",
    aadhaar_number: "123456789012",
    insurance_provider: "Star Health",
    insurance_id: "SH123456789",
    status: "active",
  },
  {
    id: 2,
    first_name: "Lakshmi",
    last_name: "N",
    email: "lakshmi.n@email.com",
    phone: "+91 98765 43211",
    date_of_birth: "1990-03-20",
    gender: "female",
    address: "45 T Nagar, Chennai",
    blood_group: "A+",
    emergency_contact: "+91 98765 43221",
    aadhaar_number: "234567890123",
    insurance_provider: "ICICI Lombard",
    insurance_id: "IC987654321",
    status: "active",
  },
  {
    id: 3,
    first_name: "Suresh",
    last_name: "M",
    email: "suresh.m@email.com",
    phone: "+91 98765 43212",
    date_of_birth: "1978-11-08",
    gender: "male",
    address: "78 Velachery, Chennai",
    blood_group: "B+",
    emergency_contact: "+91 98765 43222",
    aadhaar_number: "345678901234",
    insurance_provider: "Max Bupa",
    insurance_id: "MB456789012",
    status: "active",
  },
]

export async function GET() {
  return NextResponse.json(mockPatients)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newPatient = {
    id: mockPatients.length + 1,
    ...body,
    created_at: new Date().toISOString(),
  }
  mockPatients.push(newPatient)
  return NextResponse.json(newPatient, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")
  const body = await request.json()

  const index = mockPatients.findIndex((p) => p.id === id)
  if (index >= 0) {
    mockPatients[index] = { ...mockPatients[index], ...body }
    return NextResponse.json(mockPatients[index])
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")

  const index = mockPatients.findIndex((p) => p.id === id)
  if (index >= 0) {
    mockPatients.splice(index, 1)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

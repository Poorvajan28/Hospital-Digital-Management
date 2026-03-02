import { NextRequest, NextResponse } from "next/server"

// Mock data for testing
const mockDonors = [
  {
    id: 1,
    first_name: "Ramesh",
    last_name: "Kumar",
    email: "ramesh.kumar@email.com",
    phone: "+91 98765 43210",
    blood_group: "O+",
    date_of_birth: "1990-05-15",
    gender: "male",
    address: "123 Anna Salai, Chennai",
    last_donation_date: "2026-02-15",
    eligibility_status: "eligible",
    medical_history: "No known conditions",
  },
  {
    id: 2,
    first_name: "Priya",
    last_name: "Venkatesh",
    email: "priya.v@email.com",
    phone: "+91 98765 43211",
    blood_group: "A+",
    date_of_birth: "1985-08-22",
    gender: "female",
    address: "45 T Nagar, Chennai",
    last_donation_date: "2026-01-20",
    eligibility_status: "eligible",
    medical_history: "Healthy",
  },
  {
    id: 3,
    first_name: "Suresh",
    last_name: "Murugan",
    email: "suresh.m@email.com",
    phone: "+91 98765 43212",
    blood_group: "B-",
    date_of_birth: "1992-03-10",
    gender: "male",
    address: "78 Velachery, Chennai",
    last_donation_date: "2025-12-10",
    eligibility_status: "eligible",
    medical_history: "No issues",
  },
]

export async function GET() {
  return NextResponse.json(mockDonors)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newDonor = {
    id: mockDonors.length + 1,
    ...body,
    created_at: new Date().toISOString(),
  }
  mockDonors.push(newDonor)
  return NextResponse.json(newDonor, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")
  const body = await request.json()

  const index = mockDonors.findIndex((d) => d.id === id)
  if (index >= 0) {
    mockDonors[index] = { ...mockDonors[index], ...body }
    return NextResponse.json(mockDonors[index])
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")

  const index = mockDonors.findIndex((d) => d.id === id)
  if (index >= 0) {
    mockDonors.splice(index, 1)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

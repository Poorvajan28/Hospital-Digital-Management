import { NextRequest, NextResponse } from "next/server"

// Mock data for testing
const mockStaff = [
  {
    id: 1,
    first_name: "Priya",
    last_name: "Sharma",
    email: "priya.sharma@hospital.com",
    phone: "+91 98765 43210",
    role: "physician",
    department_id: 1,
    department_name: "Cardiology",
    specialization: "Cardiologist",
    salary: 250000,
    status: "active",
    joining_date: "2020-01-15",
  },
  {
    id: 2,
    first_name: "Karthik",
    last_name: "R",
    email: "karthik.r@hospital.com",
    phone: "+91 98765 43211",
    role: "physician",
    department_id: 2,
    department_name: "Surgery",
    specialization: "General Surgeon",
    salary: 220000,
    status: "active",
    joining_date: "2019-06-20",
  },
  {
    id: 3,
    first_name: "Lakshmi",
    last_name: "N",
    email: "lakshmi.n@hospital.com",
    phone: "+91 98765 43212",
    role: "nurse",
    department_id: 3,
    department_name: "General Medicine",
    specialization: "ICU Nurse",
    salary: 85000,
    status: "active",
    joining_date: "2021-03-10",
  },
  {
    id: 4,
    first_name: "Suresh",
    last_name: "M",
    email: "suresh.m@hospital.com",
    phone: "+91 98765 43213",
    role: "nurse",
    department_id: 1,
    department_name: "Cardiology",
    specialization: "Cardiac Care Nurse",
    salary: 75000,
    status: "on_leave",
    joining_date: "2022-01-05",
  },
  {
    id: 5,
    first_name: "Anitha",
    last_name: "K",
    email: "anitha.k@hospital.com",
    phone: "+91 98765 43214",
    role: "admin",
    department_id: null,
    department_name: "Administration",
    specialization: "Hospital Administrator",
    salary: 180000,
    status: "active",
    joining_date: "2018-11-12",
  },
]

export async function GET() {
  return NextResponse.json(mockStaff)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newStaff = {
    id: mockStaff.length + 1,
    ...body,
    created_at: new Date().toISOString(),
  }
  mockStaff.push(newStaff)
  return NextResponse.json(newStaff, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")
  const body = await request.json()

  const index = mockStaff.findIndex((s) => s.id === id)
  if (index >= 0) {
    mockStaff[index] = { ...mockStaff[index], ...body }
    return NextResponse.json(mockStaff[index])
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")

  const index = mockStaff.findIndex((s) => s.id === id)
  if (index >= 0) {
    mockStaff.splice(index, 1)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

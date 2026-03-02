import { NextResponse } from "next/server"

// Mock data for testing
const mockDepartments = [
  { id: 1, name: "Cardiology", description: "Heart and cardiovascular care", head_id: 1, status: "active" },
  { id: 2, name: "Surgery", description: "General and specialized surgery", head_id: 2, status: "active" },
  { id: 3, name: "General Medicine", description: "General healthcare services", head_id: null, status: "active" },
  { id: 4, name: "Emergency", description: "24/7 emergency services", head_id: null, status: "active" },
  { id: 5, name: "ICU", description: "Intensive Care Unit", head_id: null, status: "active" },
  { id: 6, name: "Radiology", description: "Diagnostic imaging", head_id: null, status: "active" },
  { id: 7, name: "Nephrology", description: "Kidney care and dialysis", head_id: null, status: "active" },
  { id: 8, name: "Pediatrics", description: "Children's healthcare", head_id: null, status: "active" },
]

export async function GET() {
  return NextResponse.json(mockDepartments)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newDepartment = {
    id: mockDepartments.length + 1,
    ...body,
    created_at: new Date().toISOString(),
  }
  mockDepartments.push(newDepartment)
  return NextResponse.json(newDepartment, { status: 201 })
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")
  const body = await request.json()

  const index = mockDepartments.findIndex((d) => d.id === id)
  if (index >= 0) {
    mockDepartments[index] = { ...mockDepartments[index], ...body }
    return NextResponse.json(mockDepartments[index])
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")

  const index = mockDepartments.findIndex((d) => d.id === id)
  if (index >= 0) {
    mockDepartments.splice(index, 1)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

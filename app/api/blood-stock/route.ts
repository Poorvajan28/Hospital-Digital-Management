import { NextResponse } from "next/server"

// Mock data for testing
const mockBloodStock = [
  { id: 1, blood_group: "A+", units_available: 25, status: "adequate" },
  { id: 2, blood_group: "A-", units_available: 8, status: "low" },
  { id: 3, blood_group: "B+", units_available: 32, status: "adequate" },
  { id: 4, blood_group: "B-", units_available: 5, status: "critical" },
  { id: 5, blood_group: "AB+", units_available: 12, status: "adequate" },
  { id: 6, blood_group: "AB-", units_available: 3, status: "critical" },
  { id: 7, blood_group: "O+", units_available: 45, status: "adequate" },
  { id: 8, blood_group: "O-", units_available: 10, status: "low" },
]

export async function GET() {
  return NextResponse.json(mockBloodStock)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newRecord = {
    id: mockBloodStock.length + 1,
    ...body,
    last_updated: new Date().toISOString(),
  }
  mockBloodStock.push(newRecord)
  return NextResponse.json(newRecord, { status: 201 })
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")
  const body = await request.json()

  const index = mockBloodStock.findIndex((s) => s.id === id)
  if (index >= 0) {
    mockBloodStock[index] = { ...mockBloodStock[index], ...body }
    return NextResponse.json(mockBloodStock[index])
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

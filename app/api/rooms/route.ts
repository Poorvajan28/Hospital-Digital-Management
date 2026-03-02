import { NextResponse } from "next/server"

// Mock data for testing
const mockRooms = [
  { id: 1, room_number: "A-101", ward: "General Ward A", type: "General", capacity: 2, occupied: 1, status: "available" },
  { id: 2, room_number: "A-102", ward: "General Ward A", type: "General", capacity: 2, occupied: 2, status: "occupied" },
  { id: 3, room_number: "ICU-01", ward: "ICU", type: "ICU", capacity: 1, occupied: 1, status: "occupied" },
  { id: 4, room_number: "ICU-02", ward: "ICU", type: "ICU", capacity: 1, occupied: 0, status: "available" },
  { id: 5, room_number: "OP-1", ward: "OPD", type: "Consultation", capacity: 1, occupied: 0, status: "available" },
  { id: 6, room_number: "OP-2", ward: "OPD", type: "Consultation", capacity: 1, occupied: 1, status: "occupied" },
]

export async function GET() {
  return NextResponse.json(mockRooms)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newRoom = {
    id: mockRooms.length + 1,
    ...body,
    created_at: new Date().toISOString(),
  }
  mockRooms.push(newRoom)
  return NextResponse.json(newRoom, { status: 201 })
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")
  const body = await request.json()

  const index = mockRooms.findIndex((r) => r.id === id)
  if (index >= 0) {
    mockRooms[index] = { ...mockRooms[index], ...body }
    return NextResponse.json(mockRooms[index])
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")

  const index = mockRooms.findIndex((r) => r.id === id)
  if (index >= 0) {
    mockRooms.splice(index, 1)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

import { NextRequest, NextResponse } from "next/server"

// Mock data for testing
const mockInventory = [
  {
    id: 1,
    item_name: "Surgical Gloves",
    category: "Consumables",
    quantity: 500,
    unit: "pairs",
    min_stock_level: 100,
    unit_price: 15,
    supplier: "MediSupplies India",
    expiry_date: "2027-12-31",
    location: "Storage A1",
    status: "adequate",
  },
  {
    id: 2,
    item_name: "Surgical Masks",
    category: "Consumables",
    quantity: 50,
    unit: "boxes",
    min_stock_level: 100,
    unit_price: 250,
    supplier: "MediSupplies India",
    expiry_date: "2027-06-30",
    location: "Storage A2",
    status: "low",
  },
  {
    id: 3,
    item_name: "Bandages",
    category: "Consumables",
    quantity: 200,
    unit: "rolls",
    min_stock_level: 50,
    unit_price: 45,
    supplier: "HealthCare Plus",
    expiry_date: "2028-01-15",
    location: "Storage B1",
    status: "adequate",
  },
  {
    id: 4,
    item_name: "Antiseptic Solution",
    category: "Pharmaceuticals",
    quantity: 30,
    unit: "bottles",
    min_stock_level: 20,
    unit_price: 180,
    supplier: "PharmaCare Ltd",
    expiry_date: "2026-08-20",
    location: "Pharmacy",
    status: "adequate",
  },
]

export async function GET() {
  return NextResponse.json(mockInventory)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newItem = {
    id: mockInventory.length + 1,
    ...body,
    created_at: new Date().toISOString(),
  }
  mockInventory.push(newItem)
  return NextResponse.json(newItem, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")
  const body = await request.json()

  const index = mockInventory.findIndex((i) => i.id === id)
  if (index >= 0) {
    mockInventory[index] = { ...mockInventory[index], ...body }
    return NextResponse.json(mockInventory[index])
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "0")

  const index = mockInventory.findIndex((i) => i.id === id)
  if (index >= 0) {
    mockInventory.splice(index, 1)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

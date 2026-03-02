import { NextResponse } from "next/server"
import { getTable } from "@/lib/db"

export async function GET() {
  try {
    const departments = await getTable('departments', {
      select: '*, staff(count)',
      order: 'name'
    })
    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

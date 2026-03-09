import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
    try {
        await query(`
            ALTER TABLE medical_records 
            ADD COLUMN IF NOT EXISTS signed_off_by INTEGER REFERENCES staff(id),
            ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP
        `)
        return NextResponse.json({ success: true, message: "Medical records schema updated" })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

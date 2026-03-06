import { NextRequest, NextResponse } from "next/server"
import { query, getTable, insert } from "@/lib/db"
import { addRegisteredPatient } from "@/lib/registered-users"

export async function GET() {
  try {
    const patients = await getTable("patients", {
      select: "*",
      order: "created_at.desc",
    })
    return NextResponse.json(patients)
  } catch (error) {
    console.error("Database error fetching patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const patientData: Record<string, any> = {
      patient_id: body.patient_id || body.patientId,
      first_name: body.first_name || body.firstName,
      last_name: body.last_name || body.lastName,
      email: body.email,
      phone: body.phone,
      date_of_birth: body.date_of_birth || body.dateOfBirth,
      gender: body.gender,
      address: body.address,
      blood_group: body.blood_group || body.bloodGroup,
      emergency_contact: body.emergency_contact || body.emergencyContact,
      insurance_id: body.insurance_id || body.insuranceId,
      status: "active",
    }

    // Remove undefined/null keys to avoid inserting NULLs for columns that don't exist
    Object.keys(patientData).forEach(key => {
      if (patientData[key] === undefined || patientData[key] === null) {
        delete patientData[key];
      }
    });

    const newPatient = await insert("patients", patientData);

    // Register the user in the users table for login
    if (body.password && newPatient.email) {
      await addRegisteredPatient({
        id: String(newPatient.id),
        email: newPatient.email,
        password: body.password,
        firstName: newPatient.first_name,
        lastName: newPatient.last_name,
        role: "patient",
      });
    }

    console.log("✅ Patient registered:", newPatient.email);
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error: any) {
    console.error("❌ Patient registration error:", error.message);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}

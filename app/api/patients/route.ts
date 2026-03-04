import { NextRequest, NextResponse } from "next/server"
import { getTable, insert } from "@/lib/db"
import { addRegisteredPatient } from "@/lib/registered-users"

// Mock data for testing (only used if database is unavailable)
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
    status: "active",
  },
]

export async function GET() {
  try {
    const patients = await getTable("patients", {
      select: "*",
      order: "created_at.desc",
    })
    return NextResponse.json(patients)
  } catch (error) {
    console.error("Database error, falling back to mock data:", error)
    return NextResponse.json(mockPatients)
  }
}

export async function POST(request: NextRequest) {
  let body: any = null;

  try {
    body = await request.json();

    const patientData = {
      patient_id: body.patientId || body.patient_id,
      first_name: body.firstName || body.first_name,
      last_name: body.lastName || body.last_name,
      email: body.email,
      phone: body.phone,
      date_of_birth: body.dateOfBirth || body.date_of_birth,
      gender: body.gender,
      address: body.address,
      blood_group: body.bloodGroup || body.blood_group,
      emergency_contact: body.emergencyContact || body.emergency_contact,
      aadhaar_number: body.aadhaarNumber || body.aadhaar_number,
      insurance_provider: body.insuranceProvider || body.insurance_provider,
      insurance_id: body.insuranceId || body.insurance_id,
      insurance_expiry: body.insuranceExpiry || body.insurance_expiry,
      status: "active",
      created_at: new Date().toISOString(),
    }

    const newPatient = await insert("patients", patientData);

    addRegisteredPatient({
      id: String(newPatient.id || newPatient.patient_id),
      email: newPatient.email,
      password: body.password || "",
      firstName: newPatient.first_name,
      lastName: newPatient.last_name
    });

    console.log("Patient registered in database:", newPatient);
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error: any) {
    console.error("Database error, using fallback:", error.message);

    const mockPatient = {
      id: mockPatients.length + 1,
      patient_id: body?.patientId || body?.patient_id || `PT-${Date.now()}`,
      first_name: body?.firstName || body?.first_name || "",
      last_name: body?.lastName || body?.last_name || "",
      email: body?.email || "",
      phone: body?.phone || "",
      date_of_birth: body?.dateOfBirth || body?.date_of_birth || "",
      gender: body?.gender || "",
      address: body?.address || "",
      blood_group: body?.bloodGroup || body?.blood_group || "",
      emergency_contact: body?.emergencyContact || body?.emergency_contact || "",
      created_at: new Date().toISOString(),
    };
    mockPatients.push(mockPatient as any);

    addRegisteredPatient({
      id: String(mockPatient.id),
      email: mockPatient.email,
      password: body?.password || "",
      firstName: body?.firstName || "",
      lastName: body?.lastName || ""
    });

    console.log("Using mock data fallback, patient registered:", mockPatient);
    return NextResponse.json(mockPatient, { status: 201 });
  }
}

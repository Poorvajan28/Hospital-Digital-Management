import { NextResponse } from "next/server";
import { getAllRegisteredPatients } from "@/lib/registered-users";

export async function GET() {
    const patients = getAllRegisteredPatients();
    return NextResponse.json({
        count: patients.length,
        patients: patients.map(p => ({
            email: p.email,
            name: p.name,
            hasPassword: !!p.password,
            passwordLength: p.password?.length || 0
        }))
    });
}

import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
    return NextResponse.json({
        message: "POST to this endpoint to reset and seed the database",
        method: "POST"
    })
}

export async function POST() {
    const log: string[] = []

    function addLog(msg: string) {
        log.push(msg)
        console.log(msg)
    }

    try {
        // Test connection
        addLog("Testing connection...")
        const timeResult = await query("SELECT NOW() as time")
        addLog(`Connected! Server time: ${timeResult[0]?.time}`)

        // Drop all tables
        addLog("Dropping all tables...")
        const dropTables = [
            'payments', 'invoice_items', 'invoices', 'billing_categories',
            'hospital_details', 'tamil_nadu_districts', 'medical_records',
            'appointments', 'blood_donors', 'blood_stock', 'inventory',
            'rooms', 'patients', 'staff', 'users', 'departments',
        ]
        for (const t of dropTables) {
            try { await query(`DROP TABLE IF EXISTS ${t} CASCADE`) } catch { }
        }
        addLog("Tables dropped")

        // Create departments table
        await query(`CREATE TABLE IF NOT EXISTS departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            head_doctor VARCHAR(100),
            phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT NOW()
        )`)

        // Create staff table
        await query(`CREATE TABLE IF NOT EXISTS staff (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE,
            phone VARCHAR(20),
            role VARCHAR(20) DEFAULT 'nurse',
            department_id INTEGER REFERENCES departments(id),
            specialization VARCHAR(100),
            salary DECIMAL(10,2),
            status VARCHAR(20) DEFAULT 'active',
            joining_date DATE,
            created_at TIMESTAMP DEFAULT NOW()
        )`)

        // Create patients table  
        await query(`CREATE TABLE IF NOT EXISTS patients (
            id SERIAL PRIMARY KEY,
            patient_id VARCHAR(20) UNIQUE,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(100),
            phone VARCHAR(20),
            date_of_birth DATE,
            gender VARCHAR(10),
            address TEXT,
            blood_group VARCHAR(5),
            emergency_contact VARCHAR(100),
            insurance_id VARCHAR(50),
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT NOW()
        )`)

        // Create users table
        await query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            role VARCHAR(20) DEFAULT 'patient',
            department VARCHAR(100),
            id_ref VARCHAR(50),
            created_at TIMESTAMP DEFAULT NOW()
        )`)

        // Create appointments table
        await query(`CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES patients(id),
            doctor_id INTEGER REFERENCES staff(id),
            department_id INTEGER REFERENCES departments(id),
            appointment_date DATE,
            appointment_time TIME,
            type VARCHAR(50) DEFAULT 'consultation',
            status VARCHAR(20) DEFAULT 'scheduled',
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )`)

        // Create rooms table
        await query(`CREATE TABLE IF NOT EXISTS rooms (
            id SERIAL PRIMARY KEY,
            room_number VARCHAR(20) NOT NULL,
            room_type VARCHAR(50),
            floor INTEGER DEFAULT 1,
            beds_total INTEGER DEFAULT 1,
            beds_occupied INTEGER DEFAULT 0,
            status VARCHAR(20) DEFAULT 'available',
            daily_rate DECIMAL(10,2),
            created_at TIMESTAMP DEFAULT NOW()
        )`)

        // Create blood_stock table
        await query(`CREATE TABLE IF NOT EXISTS blood_stock (
            id SERIAL PRIMARY KEY,
            blood_group VARCHAR(5) NOT NULL,
            units_available INTEGER DEFAULT 0,
            last_updated TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
        )`)

        // Create blood_donors table
        await query(`CREATE TABLE IF NOT EXISTS blood_donors (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(100),
            phone VARCHAR(20),
            blood_group VARCHAR(5),
            date_of_birth DATE,
            gender VARCHAR(10),
            last_donation_date DATE,
            total_donations INTEGER DEFAULT 0,
            status VARCHAR(20) DEFAULT 'active',
            address TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )`)

        // Create inventory table
        await query(`CREATE TABLE IF NOT EXISTS inventory (
            id SERIAL PRIMARY KEY,
            item_name VARCHAR(100) NOT NULL,
            category VARCHAR(50),
            quantity INTEGER DEFAULT 0,
            unit VARCHAR(20),
            min_stock_level INTEGER DEFAULT 10,
            unit_price DECIMAL(10,2),
            supplier VARCHAR(100),
            expiry_date DATE,
            status VARCHAR(20) DEFAULT 'in_stock',
            created_at TIMESTAMP DEFAULT NOW()
        )`)

        // Create medical_records table
        await query(`CREATE TABLE IF NOT EXISTS medical_records (
            id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES patients(id),
            doctor_id INTEGER REFERENCES staff(id),
            diagnosis TEXT,
            treatment TEXT,
            prescription TEXT,
            visit_date DATE,
            follow_up_date DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )`)

        addLog("All tables created")

        // Seed departments
        await query(`INSERT INTO departments (name, description, head_doctor, phone) VALUES
            ('Cardiology', 'Heart and cardiovascular care', 'Dr. Priya Sharma', '+91 44 2815 1001'),
            ('Surgery', 'General and specialized surgery', 'Dr. Karthik R', '+91 44 2815 1002'),
            ('General Medicine', 'General healthcare services', 'Dr. Lakshmi N', '+91 44 2815 1003'),
            ('Emergency', '24/7 emergency services', NULL, '+91 44 2815 1004'),
            ('ICU', 'Intensive Care Unit', NULL, '+91 44 2815 1005'),
            ('Radiology', 'Diagnostic imaging', NULL, '+91 44 2815 1006'),
            ('Nephrology', 'Kidney care and dialysis', NULL, '+91 44 2815 1007'),
            ('Pediatrics', 'Childrens healthcare', NULL, '+91 44 2815 1008')
        ON CONFLICT DO NOTHING`)

        // Seed staff  
        await query(`INSERT INTO staff (first_name, last_name, email, phone, role, department_id, specialization, salary, status) VALUES
            ('Priya', 'Sharma', 'priya.sharma@hospital.com', '+91 98765 43210', 'physician', 1, 'Cardiologist', 250000, 'active'),
            ('Karthik', 'R', 'karthik.r@hospital.com', '+91 98765 43211', 'physician', 2, 'General Surgeon', 220000, 'active'),
            ('Lakshmi', 'N', 'lakshmi.n@hospital.com', '+91 98765 43212', 'nurse', 3, 'ICU Nurse', 85000, 'active'),
            ('Suresh', 'M', 'suresh.m@hospital.com', '+91 98765 43213', 'nurse', 1, 'Cardiac Care Nurse', 75000, 'active'),
            ('Anitha', 'K', 'anitha.k@hospital.com', '+91 98765 43214', 'admin', NULL, 'Hospital Administrator', 180000, 'active')
        ON CONFLICT DO NOTHING`)

        // Seed patients
        await query(`INSERT INTO patients (patient_id, first_name, last_name, email, phone, date_of_birth, gender, address, blood_group, emergency_contact, status) VALUES
            ('PT-001', 'Rajesh', 'Kumar', 'rajesh.kumar@email.com', '+91 98765 43210', '1985-06-15', 'male', '123 Anna Salai, Chennai', 'O+', '+91 98765 43220', 'active'),
            ('PT-002', 'Lakshmi', 'N', 'lakshmi.patient@email.com', '+91 98765 43211', '1990-03-20', 'female', '45 T Nagar, Chennai', 'A+', '+91 98765 43221', 'active'),
            ('PT-003', 'Suresh', 'M', 'suresh.patient@email.com', '+91 98765 43212', '1978-11-08', 'male', '78 Velachery, Chennai', 'B+', '+91 98765 43222', 'active'),
            ('PT-004', 'Priya', 'V', 'priya.v@email.com', '+91 98765 43213', '1992-07-25', 'female', '56 Adyar, Chennai', 'AB+', '+91 98765 43223', 'active'),
            ('PT-005', 'Arun', 'S', 'arun.s@email.com', '+91 98765 43214', '1988-01-12', 'male', '89 Mylapore, Chennai', 'O-', '+91 98765 43224', 'active')
        ON CONFLICT DO NOTHING`)

        // Seed demo users
        await query(`INSERT INTO users (email, password, name, role, department) VALUES
            ('admin@example.com', 'admin123', 'Admin User', 'admin', 'Administration'),
            ('doctor@example.com', 'doctor123', 'Dr. Priya Sharma', 'physician', 'Cardiology'),
            ('nurse@example.com', 'nurse123', 'Lakshmi N', 'nurse', 'General Medicine'),
            ('patient@example.com', 'patient123', 'Rajesh Kumar', 'patient', NULL)
        ON CONFLICT (email) DO NOTHING`)

        // Seed rooms
        await query(`INSERT INTO rooms (room_number, room_type, floor, beds_total, beds_occupied, status, daily_rate) VALUES
            ('101', 'General', 1, 4, 2, 'available', 500),
            ('102', 'General', 1, 4, 4, 'occupied', 500),
            ('201', 'Semi-Private', 2, 2, 1, 'available', 1500),
            ('202', 'Private', 2, 1, 1, 'occupied', 3000),
            ('ICU-01', 'ICU', 1, 1, 1, 'occupied', 8000),
            ('ICU-02', 'ICU', 1, 1, 0, 'available', 8000),
            ('ER-1', 'Emergency', 1, 3, 2, 'available', 800),
            ('OP-1', 'OPD', 1, 1, 0, 'available', 200)
        ON CONFLICT DO NOTHING`)

        // Seed blood stock
        await query(`INSERT INTO blood_stock (blood_group, units_available) VALUES
            ('A+', 25), ('A-', 8), ('B+', 32), ('B-', 5),
            ('AB+', 12), ('AB-', 3), ('O+', 45), ('O-', 10)
        ON CONFLICT DO NOTHING`)

        // Seed inventory
        await query(`INSERT INTO inventory (item_name, category, quantity, unit, min_stock_level, unit_price, supplier, status) VALUES
            ('Surgical Gloves', 'Consumables', 500, 'pairs', 100, 15, 'MediSupplies India', 'in_stock'),
            ('Surgical Masks', 'Consumables', 50, 'boxes', 100, 250, 'MediSupplies India', 'low_stock'),
            ('Bandages', 'Consumables', 200, 'rolls', 50, 45, 'HealthCare Plus', 'in_stock'),
            ('Antiseptic Solution', 'Pharmaceuticals', 30, 'bottles', 20, 180, 'PharmaCare Ltd', 'in_stock'),
            ('Syringes (5ml)', 'Consumables', 1000, 'pieces', 200, 8, 'MediSupplies India', 'in_stock'),
            ('IV Fluid (NS)', 'Pharmaceuticals', 150, 'bottles', 50, 65, 'PharmaCare Ltd', 'in_stock')
        ON CONFLICT DO NOTHING`)

        // Seed blood donors
        await query(`INSERT INTO blood_donors (first_name, last_name, email, phone, blood_group, date_of_birth, gender, last_donation_date, total_donations, status, address) VALUES
            ('Ramesh', 'Kumar', 'ramesh.donor@email.com', '+91 98765 43210', 'O+', '1990-05-15', 'male', '2026-02-15', 5, 'active', '123 Anna Salai, Chennai'),
            ('Priya', 'Venkatesh', 'priya.donor@email.com', '+91 98765 43211', 'A+', '1985-08-22', 'female', '2026-01-20', 3, 'active', '45 T Nagar, Chennai'),
            ('Suresh', 'Murugan', 'suresh.donor@email.com', '+91 98765 43212', 'B-', '1992-03-10', 'male', '2025-12-10', 2, 'active', '78 Velachery, Chennai')
        ON CONFLICT DO NOTHING`)

        // Seed appointments
        await query(`INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, appointment_time, type, status, notes) VALUES
            (1, 1, 1, '2026-03-07', '10:00', 'Consultation', 'scheduled', 'Follow-up for hypertension'),
            (2, 2, 2, '2026-03-07', '11:30', 'Surgery', 'confirmed', 'Appendectomy scheduled'),
            (3, 1, 1, '2026-03-08', '09:00', 'Checkup', 'pending', 'Annual cardiac checkup')
        ON CONFLICT DO NOTHING`)

        addLog("All seed data inserted")

        // Verify counts
        const stats: Record<string, number> = {}
        for (const table of ['departments', 'staff', 'patients', 'users', 'appointments', 'rooms', 'blood_stock', 'blood_donors', 'inventory']) {
            try {
                const res = await query(`SELECT count(*) as count FROM ${table}`)
                stats[table] = parseInt(res[0]?.count || '0')
            } catch {
                stats[table] = -1
            }
        }

        const users = await query("SELECT email, role, department FROM users ORDER BY role")

        addLog("Database reset complete!")

        return NextResponse.json({
            success: true,
            message: "Database reset and seeded successfully",
            stats,
            demo_users: users,
            log
        })
    } catch (error: any) {
        addLog(`Error: ${error.message}`)
        return NextResponse.json({
            success: false,
            error: error.message,
            log
        }, { status: 500 })
    }
}

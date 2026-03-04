// Database initialization script
// Creates tables if they don't exist

import { pool } from './db'

const CREATE_TABLES_SQL = `
-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  head_doctor VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staff
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  specialization VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  join_date DATE DEFAULT CURRENT_DATE,
  salary NUMERIC(10, 2),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  blood_group VARCHAR(5),
  address TEXT,
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  medical_history TEXT,
  current_medications TEXT,
  allergies TEXT,
  insurance_provider VARCHAR(100),
  insurance_id VARCHAR(50),
  insurance_expiry DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  doctor_id INTEGER REFERENCES staff(id),
  department_id INTEGER REFERENCES departments(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  type VARCHAR(50) DEFAULT 'consultation',
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Medical Records
CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  doctor_id INTEGER REFERENCES staff(id),
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  prescription TEXT,
  visit_date DATE DEFAULT CURRENT_DATE,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blood Donors
CREATE TABLE IF NOT EXISTS blood_donors (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(20),
  blood_group VARCHAR(5) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10),
  last_donation_date DATE,
  total_donations INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blood Stock
CREATE TABLE IF NOT EXISTS blood_stock (
  id SERIAL PRIMARY KEY,
  blood_group VARCHAR(5) NOT NULL UNIQUE,
  units_available INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'pieces',
  min_stock_level INTEGER DEFAULT 10,
  unit_price NUMERIC(10, 2),
  supplier VARCHAR(200),
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'in_stock',
  last_restocked TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL UNIQUE,
  room_type VARCHAR(50) NOT NULL,
  floor INTEGER,
  beds_total INTEGER DEFAULT 1,
  beds_occupied INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available',
  daily_rate NUMERIC(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);
`

const SEED_DATA_SQL = `
-- Insert default departments
INSERT INTO departments (name, description, head_doctor, phone) VALUES
('Cardiology', 'Heart and cardiovascular care', 'Dr. Rajesh Kumar', '+91 98765 43210'),
('General Medicine', 'General healthcare and diagnostics', 'Dr. Priya Sharma', '+91 98765 43211'),
('Orthopedics', 'Bone and joint care', 'Dr. Suresh N', '+91 98765 43212'),
('Pediatrics', 'Child healthcare', 'Dr. Lakshmi R', '+91 98765 43213'),
('Emergency', '24/7 Emergency services', 'Dr. Michael C', '+91 98765 43214')
ON CONFLICT DO NOTHING;

-- Insert default blood stock
INSERT INTO blood_stock (blood_group, units_available) VALUES
('A+', 15), ('A-', 5),
('B+', 12), ('B-', 3),
('AB+', 8), ('AB-', 2),
('O+', 20), ('O-', 6)
ON CONFLICT (blood_group) DO NOTHING;

-- Insert default rooms
INSERT INTO rooms (room_number, room_type, floor, beds_total, beds_occupied, status, daily_rate) VALUES
('101', 'General', 1, 4, 2, 'available', 1500),
('102', 'General', 1, 4, 3, 'available', 1500),
('201', 'Private', 2, 1, 0, 'available', 5000),
('202', 'Private', 2, 1, 1, 'available', 5000),
('301', 'ICU', 3, 1, 1, 'available', 10000),
('302', 'ICU', 3, 1, 0, 'available', 10000)
ON CONFLICT (room_number) DO NOTHING;
`

export async function initializeDatabase() {
    console.log('🔄 Initializing database...')

    try {
        // Create tables
        await pool.query(CREATE_TABLES_SQL)
        console.log('✅ Database tables created successfully')

        // Seed initial data
        await pool.query(SEED_DATA_SQL)
        console.log('✅ Database seeded with initial data')

        return true
    } catch (error: any) {
        console.error('❌ Database initialization failed:', error.message)
        return false
    }
}

// Run initialization in development
if (process.env.NODE_ENV === 'development') {
    initializeDatabase()
}

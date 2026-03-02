-- Hospital Management System Schema

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
  role VARCHAR(50) NOT NULL, -- Doctor, Nurse, Technician, Admin, etc.
  department_id INTEGER REFERENCES departments(id),
  specialization VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active', -- active, on_leave, inactive
  join_date DATE DEFAULT CURRENT_DATE,
  salary NUMERIC(10, 2),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
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
  insurance_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Appointments / Bookings
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  doctor_id INTEGER REFERENCES staff(id),
  department_id INTEGER REFERENCES departments(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  type VARCHAR(50) DEFAULT 'consultation', -- consultation, follow_up, emergency, surgery
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Medical History
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
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, deferred
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blood Bank Stock
CREATE TABLE IF NOT EXISTS blood_stock (
  id SERIAL PRIMARY KEY,
  blood_group VARCHAR(5) NOT NULL UNIQUE,
  units_available INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Inventory / Stock Details
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL, -- Medicine, Equipment, Supplies, PPE
  quantity INTEGER DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'pieces',
  min_stock_level INTEGER DEFAULT 10,
  unit_price NUMERIC(10, 2),
  supplier VARCHAR(200),
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'in_stock', -- in_stock, low_stock, out_of_stock
  last_restocked TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rooms / Beds
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL UNIQUE,
  room_type VARCHAR(50) NOT NULL, -- General, ICU, Private, Semi-Private, Emergency
  floor INTEGER,
  beds_total INTEGER DEFAULT 1,
  beds_occupied INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available', -- available, occupied, maintenance
  daily_rate NUMERIC(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

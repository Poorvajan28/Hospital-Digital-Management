-- Seed Departments
INSERT INTO departments (name, description, head_doctor, phone) VALUES
  ('Cardiology', 'Heart and cardiovascular system', 'Dr. Sarah Mitchell', '+1-555-0101'),
  ('Neurology', 'Brain and nervous system disorders', 'Dr. James Chen', '+1-555-0102'),
  ('Orthopedics', 'Bone and joint care', 'Dr. Maria Garcia', '+1-555-0103'),
  ('Pediatrics', 'Child healthcare', 'Dr. Emily Roberts', '+1-555-0104'),
  ('Emergency', 'Emergency and trauma care', 'Dr. David Kim', '+1-555-0105'),
  ('Oncology', 'Cancer treatment and care', 'Dr. Rachel Adams', '+1-555-0106'),
  ('Dermatology', 'Skin conditions and treatment', 'Dr. Michael Brown', '+1-555-0107'),
  ('General Surgery', 'Surgical procedures', 'Dr. Lisa Wang', '+1-555-0108')
ON CONFLICT DO NOTHING;

-- Seed Staff
INSERT INTO staff (first_name, last_name, email, phone, role, department_id, specialization, status, join_date, salary) VALUES
  ('Sarah', 'Mitchell', 'sarah.mitchell@hospital.com', '+1-555-1001', 'Doctor', 1, 'Interventional Cardiology', 'active', '2020-03-15', 250000),
  ('James', 'Chen', 'james.chen@hospital.com', '+1-555-1002', 'Doctor', 2, 'Clinical Neurology', 'active', '2019-06-20', 260000),
  ('Maria', 'Garcia', 'maria.garcia@hospital.com', '+1-555-1003', 'Doctor', 3, 'Joint Replacement', 'active', '2018-01-10', 240000),
  ('Emily', 'Roberts', 'emily.roberts@hospital.com', '+1-555-1004', 'Doctor', 4, 'Neonatology', 'active', '2021-09-01', 220000),
  ('David', 'Kim', 'david.kim@hospital.com', '+1-555-1005', 'Doctor', 5, 'Trauma Surgery', 'active', '2017-11-30', 270000),
  ('Rachel', 'Adams', 'rachel.adams@hospital.com', '+1-555-1006', 'Doctor', 6, 'Medical Oncology', 'active', '2020-07-15', 255000),
  ('Michael', 'Brown', 'michael.brown@hospital.com', '+1-555-1007', 'Doctor', 7, 'Clinical Dermatology', 'on_leave', '2019-04-01', 230000),
  ('Lisa', 'Wang', 'lisa.wang@hospital.com', '+1-555-1008', 'Doctor', 8, 'Laparoscopic Surgery', 'active', '2018-08-22', 265000),
  ('Jennifer', 'Taylor', 'jennifer.taylor@hospital.com', '+1-555-1009', 'Nurse', 1, 'Cardiac Care', 'active', '2021-02-14', 85000),
  ('Robert', 'Johnson', 'robert.johnson@hospital.com', '+1-555-1010', 'Nurse', 5, 'Emergency Nursing', 'active', '2020-10-05', 82000),
  ('Amanda', 'Wilson', 'amanda.wilson@hospital.com', '+1-555-1011', 'Technician', 2, 'EEG Technician', 'active', '2022-01-15', 65000),
  ('Thomas', 'Lee', 'thomas.lee@hospital.com', '+1-555-1012', 'Admin', NULL, 'Hospital Administration', 'active', '2019-03-01', 75000),
  ('Susan', 'Clark', 'susan.clark@hospital.com', '+1-555-1013', 'Nurse', 4, 'Pediatric Nursing', 'active', '2021-06-10', 80000),
  ('Daniel', 'Martinez', 'daniel.martinez@hospital.com', '+1-555-1014', 'Technician', 3, 'Radiology', 'active', '2022-05-20', 68000),
  ('Patricia', 'Anderson', 'patricia.anderson@hospital.com', '+1-555-1015', 'Doctor', 1, 'Electrophysiology', 'active', '2020-11-01', 245000)
ON CONFLICT DO NOTHING;

-- Seed Patients
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, blood_group, address, emergency_contact, emergency_phone, insurance_id, status) VALUES
  ('John', 'Smith', 'john.smith@email.com', '+1-555-2001', '1985-04-12', 'Male', 'O+', '123 Oak Street, Springfield', 'Jane Smith', '+1-555-3001', 'INS-001234', 'active'),
  ('Mary', 'Johnson', 'mary.johnson@email.com', '+1-555-2002', '1990-08-25', 'Female', 'A+', '456 Maple Ave, Springfield', 'Bob Johnson', '+1-555-3002', 'INS-001235', 'active'),
  ('William', 'Davis', 'william.davis@email.com', '+1-555-2003', '1978-12-03', 'Male', 'B+', '789 Pine Road, Springfield', 'Linda Davis', '+1-555-3003', 'INS-001236', 'active'),
  ('Elizabeth', 'Wilson', 'elizabeth.wilson@email.com', '+1-555-2004', '1995-02-18', 'Female', 'AB+', '321 Elm Blvd, Springfield', 'Tom Wilson', '+1-555-3004', 'INS-001237', 'active'),
  ('James', 'Moore', 'james.moore@email.com', '+1-555-2005', '1982-07-30', 'Male', 'O-', '654 Cedar Lane, Springfield', 'Sarah Moore', '+1-555-3005', 'INS-001238', 'active'),
  ('Patricia', 'Taylor', 'patricia.taylor@email.com', '+1-555-2006', '1973-11-14', 'Female', 'A-', '987 Birch Dr, Springfield', 'Mike Taylor', '+1-555-3006', 'INS-001239', 'active'),
  ('Robert', 'Thomas', 'robert.thomas@email.com', '+1-555-2007', '1988-06-22', 'Male', 'B-', '147 Walnut St, Springfield', 'Karen Thomas', '+1-555-3007', 'INS-001240', 'active'),
  ('Linda', 'Jackson', 'linda.jackson@email.com', '+1-555-2008', '1992-01-09', 'Female', 'O+', '258 Ash Way, Springfield', 'Dan Jackson', '+1-555-3008', 'INS-001241', 'active'),
  ('Charles', 'White', 'charles.white@email.com', '+1-555-2009', '1968-09-27', 'Male', 'A+', '369 Spruce Ct, Springfield', 'Nancy White', '+1-555-3009', 'INS-001242', 'active'),
  ('Barbara', 'Harris', 'barbara.harris@email.com', '+1-555-2010', '2001-03-15', 'Female', 'AB-', '480 Redwood Pl, Springfield', 'Joe Harris', '+1-555-3010', 'INS-001243', 'active')
ON CONFLICT DO NOTHING;

-- Seed Appointments
INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, appointment_time, type, status, notes) VALUES
  (1, 1, 1, '2026-03-03', '09:00', 'consultation', 'scheduled', 'Routine heart checkup'),
  (2, 2, 2, '2026-03-03', '10:30', 'consultation', 'scheduled', 'Migraine follow-up'),
  (3, 3, 3, '2026-03-04', '11:00', 'follow_up', 'scheduled', 'Post knee surgery review'),
  (4, 4, 4, '2026-03-04', '14:00', 'consultation', 'scheduled', 'Pediatric wellness check'),
  (5, 5, 5, '2026-03-02', '08:00', 'emergency', 'completed', 'Chest pain assessment'),
  (6, 6, 6, '2026-03-02', '09:30', 'consultation', 'completed', 'Cancer screening results'),
  (7, 1, 1, '2026-03-05', '10:00', 'follow_up', 'scheduled', 'ECG review'),
  (8, 2, 2, '2026-03-05', '13:00', 'consultation', 'scheduled', 'Nerve conduction study'),
  (9, 8, 8, '2026-03-06', '15:00', 'surgery', 'scheduled', 'Appendectomy preparation'),
  (10, 7, 7, '2026-03-01', '11:30', 'consultation', 'completed', 'Skin biopsy results'),
  (1, 6, 6, '2026-02-28', '09:00', 'consultation', 'completed', 'Routine screening'),
  (3, 5, 5, '2026-02-25', '14:30', 'emergency', 'completed', 'Fractured wrist treatment')
ON CONFLICT DO NOTHING;

-- Seed Medical Records
INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, prescription, visit_date, follow_up_date, notes) VALUES
  (1, 1, 'Mild Arrhythmia', 'Medication and monitoring', 'Metoprolol 50mg daily', '2026-02-15', '2026-03-15', 'Patient responding well to treatment'),
  (2, 2, 'Chronic Migraine', 'Preventive medication', 'Sumatriptan 100mg as needed', '2026-02-10', '2026-03-10', 'Frequency of episodes decreasing'),
  (3, 3, 'Torn ACL - Right Knee', 'Surgical reconstruction', 'Ibuprofen 400mg, Physical therapy', '2026-01-20', '2026-03-20', 'Post-operative recovery on track'),
  (5, 5, 'Acute Chest Pain - Non-cardiac', 'Rest and anti-anxiety medication', 'Lorazepam 0.5mg as needed', '2026-03-02', '2026-03-16', 'Stress-related, cardiac tests normal'),
  (6, 6, 'Stage I Breast Cancer', 'Lumpectomy + Radiation', 'Tamoxifen 20mg daily', '2026-02-20', '2026-04-20', 'Early detection, good prognosis'),
  (9, 8, 'Acute Appendicitis', 'Appendectomy scheduled', 'Amoxicillin 500mg, NPO before surgery', '2026-03-01', '2026-03-15', 'Surgery scheduled for March 6'),
  (10, 7, 'Eczema', 'Topical steroid treatment', 'Hydrocortisone cream 1%, Cetirizine 10mg', '2026-03-01', '2026-04-01', 'Mild case, should resolve with treatment'),
  (4, 4, 'Common Cold', 'Rest and fluids', 'Acetaminophen as needed', '2026-02-28', NULL, 'No follow-up needed')
ON CONFLICT DO NOTHING;

-- Seed Blood Donors
INSERT INTO blood_donors (first_name, last_name, email, phone, blood_group, date_of_birth, gender, last_donation_date, total_donations, status, address) VALUES
  ('Alex', 'Thompson', 'alex.t@email.com', '+1-555-4001', 'O+', '1990-05-10', 'Male', '2026-02-01', 12, 'active', '111 River Rd, Springfield'),
  ('Samantha', 'Lee', 'samantha.l@email.com', '+1-555-4002', 'A+', '1988-09-22', 'Female', '2026-01-15', 8, 'active', '222 Lake St, Springfield'),
  ('Marcus', 'Williams', 'marcus.w@email.com', '+1-555-4003', 'B+', '1995-03-08', 'Male', '2025-12-20', 5, 'active', '333 Hill Ave, Springfield'),
  ('Diana', 'Patel', 'diana.p@email.com', '+1-555-4004', 'AB+', '1992-11-30', 'Female', '2026-02-10', 10, 'active', '444 Park Blvd, Springfield'),
  ('Kevin', 'O''Brien', 'kevin.o@email.com', '+1-555-4005', 'O-', '1985-07-14', 'Male', '2026-01-28', 20, 'active', '555 Forest Dr, Springfield'),
  ('Nina', 'Rodriguez', 'nina.r@email.com', '+1-555-4006', 'A-', '1997-01-25', 'Female', '2025-11-15', 3, 'deferred', '666 Valley Way, Springfield'),
  ('George', 'Baker', 'george.b@email.com', '+1-555-4007', 'B-', '1980-12-05', 'Male', '2026-02-20', 15, 'active', '777 Summit Ln, Springfield'),
  ('Helen', 'Nguyen', 'helen.n@email.com', '+1-555-4008', 'AB-', '1993-06-18', 'Female', '2026-01-05', 6, 'active', '888 Creek Rd, Springfield')
ON CONFLICT DO NOTHING;

-- Seed Blood Stock
INSERT INTO blood_stock (blood_group, units_available) VALUES
  ('O+', 45),
  ('O-', 12),
  ('A+', 38),
  ('A-', 8),
  ('B+', 25),
  ('B-', 6),
  ('AB+', 15),
  ('AB-', 4)
ON CONFLICT (blood_group) DO UPDATE SET units_available = EXCLUDED.units_available;

-- Seed Inventory
INSERT INTO inventory (item_name, category, quantity, unit, min_stock_level, unit_price, supplier, expiry_date, status) VALUES
  ('Surgical Masks (Box of 50)', 'PPE', 250, 'boxes', 50, 12.99, 'MedSupply Co.', '2027-06-15', 'in_stock'),
  ('Latex Gloves (Box of 100)', 'PPE', 180, 'boxes', 40, 9.99, 'MedSupply Co.', '2027-08-20', 'in_stock'),
  ('Paracetamol 500mg (Strip of 10)', 'Medicine', 500, 'strips', 100, 2.50, 'PharmaCare Ltd.', '2027-03-01', 'in_stock'),
  ('Amoxicillin 500mg (Strip of 10)', 'Medicine', 320, 'strips', 80, 5.75, 'PharmaCare Ltd.', '2027-01-15', 'in_stock'),
  ('Digital Thermometer', 'Equipment', 45, 'pieces', 10, 25.00, 'TechMed Inc.', NULL, 'in_stock'),
  ('Blood Pressure Monitor', 'Equipment', 30, 'pieces', 5, 89.99, 'TechMed Inc.', NULL, 'in_stock'),
  ('Syringes 5ml (Box of 100)', 'Supplies', 120, 'boxes', 30, 15.00, 'MedSupply Co.', '2028-01-01', 'in_stock'),
  ('IV Drip Sets', 'Supplies', 8, 'pieces', 20, 8.50, 'MedSupply Co.', '2027-05-10', 'low_stock'),
  ('Bandage Rolls (Pack of 12)', 'Supplies', 200, 'packs', 50, 6.99, 'HealthFirst', '2028-06-01', 'in_stock'),
  ('Hand Sanitizer 500ml', 'PPE', 90, 'bottles', 25, 4.99, 'CleanCare', '2027-09-30', 'in_stock'),
  ('Ibuprofen 400mg (Strip of 10)', 'Medicine', 15, 'strips', 80, 3.25, 'PharmaCare Ltd.', '2026-12-01', 'low_stock'),
  ('Stethoscope', 'Equipment', 20, 'pieces', 5, 120.00, 'TechMed Inc.', NULL, 'in_stock'),
  ('Oxygen Mask', 'Equipment', 3, 'pieces', 10, 35.00, 'TechMed Inc.', NULL, 'out_of_stock'),
  ('Wheelchair', 'Equipment', 12, 'pieces', 5, 450.00, 'MobilityPlus', NULL, 'in_stock'),
  ('Gauze Pads (Box of 100)', 'Supplies', 150, 'boxes', 40, 8.99, 'HealthFirst', '2027-12-15', 'in_stock')
ON CONFLICT DO NOTHING;

-- Seed Rooms
INSERT INTO rooms (room_number, room_type, floor, beds_total, beds_occupied, status, daily_rate) VALUES
  ('101', 'General', 1, 4, 3, 'available', 150.00),
  ('102', 'General', 1, 4, 4, 'occupied', 150.00),
  ('103', 'Semi-Private', 1, 2, 1, 'available', 250.00),
  ('201', 'Private', 2, 1, 1, 'occupied', 500.00),
  ('202', 'Private', 2, 1, 0, 'available', 500.00),
  ('203', 'Semi-Private', 2, 2, 2, 'occupied', 250.00),
  ('301', 'ICU', 3, 1, 1, 'occupied', 1200.00),
  ('302', 'ICU', 3, 1, 0, 'available', 1200.00),
  ('303', 'ICU', 3, 1, 1, 'occupied', 1200.00),
  ('ER-1', 'Emergency', 1, 3, 2, 'available', 800.00),
  ('ER-2', 'Emergency', 1, 3, 1, 'available', 800.00),
  ('104', 'General', 1, 4, 0, 'maintenance', 150.00)
ON CONFLICT DO NOTHING;

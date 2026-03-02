-- Indian Healthcare Migration Script for Tamil Nadu
-- This script adapts the hospital management system for Indian healthcare standards

-- ============================================================
-- 1. PATIENTS TABLE ENHANCEMENTS
-- ============================================================

-- Add Aadhaar number (12 digits, unique identifier)
ALTER TABLE patients ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(12) UNIQUE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS aadhaar_verified BOOLEAN DEFAULT FALSE;

-- Add Indian mobile format (+91 prefix)
ALTER TABLE patients ADD COLUMN IF NOT EXISTS mobile_india VARCHAR(15);

-- Update address structure for Indian format
ALTER TABLE patients ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Tamil Nadu';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS pincode VARCHAR(6);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';

-- Add UPI ID for digital payments
ALTER TABLE patients ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100);

-- Migrate existing address data to new structure
UPDATE patients SET 
  address_line1 = address,
  city = 'Chennai',
  district = 'Chennai',
  state = 'Tamil Nadu',
  pincode = '600001',
  country = 'India'
WHERE address_line1 IS NULL;

-- Drop old address column after migration (optional - keep for backward compatibility)
-- ALTER TABLE patients DROP COLUMN IF EXISTS address;

-- ============================================================
-- 2. STAFF TABLE ENHANCEMENTS (Indian Medical Council IDs)
-- ============================================================

-- Add Medical Council Registration Numbers
ALTER TABLE staff ADD COLUMN IF NOT EXISTS smc_registration_no VARCHAR(50); -- State Medical Council
ALTER TABLE staff ADD COLUMN IF NOT EXISTS nmc_registration_no VARCHAR(50); -- National Medical Commission
ALTER TABLE staff ADD COLUMN IF NOT EXISTS mobile_india VARCHAR(15);

-- Add qualification details
ALTER TABLE staff ADD COLUMN IF NOT EXISTS degree VARCHAR(100);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS university VARCHAR(100);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS year_of_passing INTEGER;

-- Add PAN for tax purposes
ALTER TABLE staff ADD COLUMN IF NOT EXISTS pan_number VARCHAR(10);

-- ============================================================
-- 3. DEPARTMENTS TABLE ENHANCEMENTS
-- ============================================================

-- Add department code as per Indian standards
ALTER TABLE departments ADD COLUMN IF NOT EXISTS department_code VARCHAR(20);
ALTER TABLE departments ADD COLUMN IF NOT EXISTS gst_applicable BOOLEAN DEFAULT FALSE;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5, 2) DEFAULT 0.00;

-- ============================================================
-- 4. NEW TABLE: HOSPITAL REGISTRATION DETAILS
-- ============================================================

CREATE TABLE IF NOT EXISTS hospital_details (
  id SERIAL PRIMARY KEY,
  hospital_name VARCHAR(200) NOT NULL DEFAULT 'Government Hospital',
  hospital_type VARCHAR(50) DEFAULT 'Public', -- Public, Private, Trust, Corporate
  
  -- Registration Numbers
  cin_number VARCHAR(25), -- Corporate Identification Number
  tan_number VARCHAR(10), -- Tax Deduction Account Number
  pan_number VARCHAR(10), -- Permanent Account Number
  
  -- Medical Establishment Registration
  me_registration_no VARCHAR(50), -- Medical Establishment Registration (Tamil Nadu)
  me_registration_date DATE,
  me_renewal_date DATE,
  
  -- GST Details
  gstin VARCHAR(15), -- GST Identification Number
  gst_registration_date DATE,
  gst_certificate_url TEXT,
  
  -- Contact Information
  phone_primary VARCHAR(15),
  phone_secondary VARCHAR(15),
  email VARCHAR(150),
  website VARCHAR(200),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100) DEFAULT 'Chennai',
  district VARCHAR(100) DEFAULT 'Chennai',
  state VARCHAR(100) DEFAULT 'Tamil Nadu',
  pincode VARCHAR(6) DEFAULT '600001',
  
  -- Authorized Signatory
  authorized_person_name VARCHAR(200),
  authorized_person_designation VARCHAR(100),
  authorized_person_phone VARCHAR(15),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default hospital record
INSERT INTO hospital_details (hospital_name, hospital_type, me_registration_no, gstin)
VALUES ('Tamil Nadu Government General Hospital', 'Public', 'TN-ME-001', '33AABCU9603R1ZX')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. NEW TABLE: BILLING AND INVOICING (GST Compliant)
-- ============================================================

CREATE TABLE IF NOT EXISTS billing_categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  category_code VARCHAR(20),
  hsn_code VARCHAR(10), -- Harmonized System of Nomenclature for GST
  gst_rate NUMERIC(5, 2) DEFAULT 0.00, -- GST percentage
  is_taxable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default billing categories with GST rates
INSERT INTO billing_categories (category_name, category_code, hsn_code, gst_rate, is_taxable) VALUES
  ('Consultation Fee', 'CONS', '999311', 18.00, TRUE),
  ('Room Charges (General)', 'ROOM-G', '996311', 12.00, TRUE),
  ('Room Charges (ICU)', 'ROOM-ICU', '996311', 12.00, TRUE),
  ('Surgery - Minor', 'SURG-MIN', '999311', 18.00, TRUE),
  ('Surgery - Major', 'SURG-MAJ', '999311', 18.00, TRUE),
  ('Laboratory Tests', 'LAB', '999311', 18.00, TRUE),
  ('Pharmacy - Medicines', 'PHARM', '3004', 12.00, TRUE),
  ('Medical Equipment', 'EQUIP', '9018', 18.00, TRUE),
  ('Ambulance Service', 'AMB', '996311', 18.00, TRUE),
  ('Registration Fee', 'REG', '999311', 0.00, FALSE),
  ('Emergency Charges', 'EMRG', '999311', 18.00, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. INVOICES TABLE (GST Compliant)
-- ============================================================

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id INTEGER REFERENCES patients(id),
  
  -- Invoice Dates
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_time TIME NOT NULL DEFAULT CURRENT_TIME,
  
  -- Financial Details
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12, 2) DEFAULT 0.00,
  
  -- GST Breakdown
  gst_type VARCHAR(10) DEFAULT 'CGST-SGST', -- CGST-SGST or IGST
  cgst_amount NUMERIC(12, 2) DEFAULT 0.00,
  sgst_amount NUMERIC(12, 2) DEFAULT 0.00,
  igst_amount NUMERIC(12, 2) DEFAULT 0.00,
  total_gst NUMERIC(12, 2) DEFAULT 0.00,
  
  -- Totals
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  advance_paid NUMERIC(12, 2) DEFAULT 0.00,
  balance_amount NUMERIC(12, 2) DEFAULT 0.00,
  
  -- Payment Details
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, partial, paid, refunded
  payment_method VARCHAR(50), -- cash, card, upi, insurance, emi
  
  -- Insurance (if applicable)
  insurance_claimed BOOLEAN DEFAULT FALSE,
  insurance_amount NUMERIC(12, 2) DEFAULT 0.00,
  insurance_tpa VARCHAR(100),
  
  -- Metadata
  created_by INTEGER REFERENCES staff(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 7. INVOICE ITEMS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Item Details
  item_description VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES billing_categories(id),
  hsn_code VARCHAR(10),
  
  -- Quantity and Rate
  quantity NUMERIC(10, 2) DEFAULT 1.00,
  unit VARCHAR(20) DEFAULT 'NOS',
  unit_price NUMERIC(12, 2) NOT NULL,
  
  -- Amounts
  taxable_value NUMERIC(12, 2) NOT NULL,
  
  -- GST per Item
  gst_rate NUMERIC(5, 2) DEFAULT 0.00,
  cgst_amount NUMERIC(12, 2) DEFAULT 0.00,
  sgst_amount NUMERIC(12, 2) DEFAULT 0.00,
  igst_amount NUMERIC(12, 2) DEFAULT 0.00,
  
  -- Total
  total_amount NUMERIC(12, 2) NOT NULL,
  
  -- Reference
  reference_type VARCHAR(50), -- appointment, procedure, pharmacy, lab
  reference_id INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 8. PAYMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id),
  
  -- Payment Details
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_time TIME NOT NULL DEFAULT CURRENT_TIME,
  amount NUMERIC(12, 2) NOT NULL,
  
  -- Payment Method (Indian Context)
  payment_mode VARCHAR(50) NOT NULL, -- Cash, Card, UPI, NEFT, RTGS, Cheque, Insurance
  
  -- UPI Specific
  upi_transaction_id VARCHAR(100),
  upi_app VARCHAR(50), -- GPay, PhonePe, Paytm, etc.
  
  -- Card Specific
  card_last_four VARCHAR(4),
  card_type VARCHAR(20), -- Visa, MasterCard, RuPay
  
  -- Bank Transfer
  bank_reference_no VARCHAR(100),
  bank_name VARCHAR(100),
  
  -- Cheque
  cheque_number VARCHAR(20),
  cheque_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'completed', -- completed, pending, failed, refunded
  
  -- Receipt
  receipt_number VARCHAR(50) UNIQUE,
  
  -- Metadata
  collected_by INTEGER REFERENCES staff(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 9. INVENTORY ENHANCEMENTS (For GST on medicines)
-- ============================================================

-- Check if inventory table exists and add GST fields
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(10);
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5, 2) DEFAULT 0.00;
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS mrp NUMERIC(10, 2); -- Maximum Retail Price
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS batch_number VARCHAR(50);
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS manufacturing_date DATE;
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS supplier_gstin VARCHAR(15);
  END IF;
END $$;

-- ============================================================
-- 10. CREATE FUNCTIONS FOR GST CALCULATION
-- ============================================================

-- Function to calculate GST for Tamil Nadu (CGST + SGST)
CREATE OR REPLACE FUNCTION calculate_gst_tamilnadu(
  taxable_amount NUMERIC,
  gst_rate NUMERIC
) RETURNS TABLE (
  cgst_amount NUMERIC,
  sgst_amount NUMERIC,
  total_gst NUMERIC,
  total_amount NUMERIC
) AS $$
BEGIN
  cgst_amount := ROUND((taxable_amount * (gst_rate / 2) / 100), 2);
  sgst_amount := ROUND((taxable_amount * (gst_rate / 2) / 100), 2);
  total_gst := cgst_amount + sgst_amount;
  total_amount := taxable_amount + total_gst;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to format currency in INR
CREATE OR REPLACE FUNCTION format_inr(amount NUMERIC)
RETURNS TEXT AS $$
BEGIN
  RETURN '₹' || TO_CHAR(amount, 'FM999,999,999,999.00');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 11. CREATE INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_patients_aadhaar ON patients(aadhaar_number);
CREATE INDEX IF NOT EXISTS idx_patients_mobile_india ON patients(mobile_india);
CREATE INDEX IF NOT EXISTS idx_patients_pincode ON patients(pincode);
CREATE INDEX IF NOT EXISTS idx_staff_smc ON staff(smc_registration_no);
CREATE INDEX IF NOT EXISTS idx_staff_nmc ON staff(nmc_registration_no);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- ============================================================
-- 12. CREATE VIEWS FOR REPORTING
-- ============================================================

-- View for GST Returns
CREATE OR REPLACE VIEW gst_return_summary AS
SELECT 
  i.invoice_date,
  i.invoice_number,
  p.aadhaar_number,
  p.first_name || ' ' || p.last_name as patient_name,
  i.subtotal as taxable_value,
  i.cgst_amount,
  i.sgst_amount,
  i.total_gst,
  i.total_amount,
  i.payment_status
FROM invoices i
JOIN patients p ON i.patient_id = p.id
WHERE i.invoice_date >= DATE_TRUNC('month', CURRENT_DATE);

-- View for Daily Collection Report
CREATE OR REPLACE VIEW daily_collection_report AS
SELECT 
  p.payment_date,
  p.payment_mode,
  COUNT(*) as transaction_count,
  SUM(p.amount) as total_collected
FROM payments p
WHERE p.status = 'completed'
GROUP BY p.payment_date, p.payment_mode
ORDER BY p.payment_date DESC, p.payment_mode;

-- ============================================================
-- 13. TAMIL NADU SPECIFIC CONFIGURATION
-- ============================================================

-- Create table for Tamil Nadu districts
CREATE TABLE IF NOT EXISTS tamil_nadu_districts (
  id SERIAL PRIMARY KEY,
  district_name VARCHAR(100) NOT NULL,
  district_code VARCHAR(10),
  zone VARCHAR(50), -- North, South, Central, West
  headquarter VARCHAR(100)
);

-- Insert Tamil Nadu districts
INSERT INTO tamil_nadu_districts (district_name, district_code, zone, headquarter) VALUES
  ('Ariyalur', 'ARI', 'Central', 'Ariyalur'),
  ('Chengalpattu', 'CGL', 'North', 'Chengalpattu'),
  ('Chennai', 'CHE', 'North', 'Chennai'),
  ('Coimbatore', 'COI', 'West', 'Coimbatore'),
  ('Cuddalore', 'CUD', 'North', 'Cuddalore'),
  ('Dharmapuri', 'DHA', 'West', 'Dharmapuri'),
  ('Dindigul', 'DIN', 'Central', 'Dindigul'),
  ('Erode', 'ERO', 'West', 'Erode'),
  ('Kallakurichi', 'KAL', 'North', 'Kallakurichi'),
  ('Kanchipuram', 'KAN', 'North', 'Kanchipuram'),
  ('Kanyakumari', 'KNY', 'South', 'Nagercoil'),
  ('Karur', 'KAR', 'Central', 'Karur'),
  ('Krishnagiri', 'KRI', 'West', 'Krishnagiri'),
  ('Madurai', 'MAD', 'South', 'Madurai'),
  ('Mayiladuthurai', 'MAY', 'North', 'Mayiladuthurai'),
  ('Nagapattinam', 'NAG', 'North', 'Nagapattinam'),
  ('Namakkal', 'NAM', 'West', 'Namakkal'),
  ('Nilgiris', 'NIL', 'West', 'Udhagamandalam'),
  ('Perambalur', 'PER', 'Central', 'Perambalur'),
  ('Pudukkottai', 'PUD', 'Central', 'Pudukkottai'),
  ('Ramanathapuram', 'RAM', 'South', 'Ramanathapuram'),
  ('Ranipet', 'RAN', 'North', 'Ranipet'),
  ('Salem', 'SAL', 'West', 'Salem'),
  ('Sivaganga', 'SIV', 'South', 'Sivaganga'),
  ('Tenkasi', 'TEN', 'South', 'Tenkasi'),
  ('Thanjavur', 'THA', 'Central', 'Thanjavur'),
  ('Theni', 'THE', 'South', 'Theni'),
  ('Thoothukudi', 'THO', 'South', 'Thoothukudi'),
  ('Tiruchirappalli', 'TRI', 'Central', 'Tiruchirappalli'),
  ('Tirunelveli', 'TIR', 'South', 'Tirunelveli'),
  ('Tirupathur', 'TPT', 'North', 'Tirupathur'),
  ('Tiruppur', 'TPR', 'West', 'Tiruppur'),
  ('Tiruvallur', 'TVE', 'North', 'Tiruvallur'),
  ('Tiruvannamalai', 'TVA', 'North', 'Tiruvannamalai'),
  ('Tiruvarur', 'TVR', 'North', 'Tiruvarur'),
  ('Vellore', 'VEL', 'North', 'Vellore'),
  ('Viluppuram', 'VIL', 'North', 'Viluppuram'),
  ('Virudhunagar', 'VIR', 'South', 'Virudhunagar')
ON CONFLICT DO NOTHING;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

COMMENT ON TABLE patients IS 'Patient records with Indian healthcare fields (Aadhaar, mobile +91, structured address)';
COMMENT ON TABLE staff IS 'Staff records with Medical Council registrations (SMC/NMC)';
COMMENT ON TABLE invoices IS 'GST-compliant invoices for Tamil Nadu (CGST + SGST)';
COMMENT ON TABLE payments IS 'Payment records with Indian payment methods (UPI, NEFT, etc.)';

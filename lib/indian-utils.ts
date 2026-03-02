/**
 * Indian Healthcare Utility Functions
 * For Tamil Nadu Hospital Resource Management
 */

/**
 * Format number as Indian Rupees (INR) with ₹ symbol
 */
export function formatINR(amount: number): string {
    if (isNaN(amount)) return '₹0.00'

    // Format with Indian numbering system (lakhs, crores)
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    return formatter.format(amount)
}

/**
 * Format number in Indian numbering system (with lakhs, crores)
 */
export function formatIndianNumber(num: number): string {
    if (isNaN(num)) return '0'

    const formatter = new Intl.NumberFormat('en-IN')
    return formatter.format(num)
}

/**
 * Format date to DD/MM/YYYY (Indian format)
 */
export function formatIndianDate(date: Date | string): string {
    if (!date) return ''

    const d = typeof date === 'string' ? new Date(date) : date

    if (isNaN(d.getTime())) return ''

    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()

    return `${day}/${month}/${year}`
}

/**
 * Format date with time in Indian format (DD/MM/YYYY HH:mm)
 */
export function formatIndianDateTime(date: Date | string): string {
    if (!date) return ''

    const d = typeof date === 'string' ? new Date(date) : date

    if (isNaN(d.getTime())) return ''

    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Parse date from Indian format (DD/MM/YYYY) to Date object
 */
export function parseIndianDate(dateStr: string): Date | null {
    if (!dateStr) return null

    const parts = dateStr.split('/')
    if (parts.length !== 3) return null

    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)

    const date = new Date(year, month, day)

    if (isNaN(date.getTime())) return null

    return date
}

/**
 * Validate Aadhaar number (12 digits, Verhoeff algorithm)
 */
export function validateAadhaar(aadhaar: string): boolean {
    if (!aadhaar) return false

    // Remove spaces
    const clean = aadhaar.replace(/\s/g, '')

    // Check if 12 digits
    if (!/^\d{12}$/.test(clean)) return false

    // Verhoeff algorithm checksum validation
    return validateVerhoeff(clean)
}

/**
 * Format Aadhaar number with spaces (XXXX XXXX XXXX)
 */
export function formatAadhaar(aadhaar: string): string {
    if (!aadhaar) return ''

    const clean = aadhaar.replace(/\s/g, '')

    if (!/^\d{12}$/.test(clean)) return aadhaar

    return clean.match(/.{1,4}/g)?.join(' ') || aadhaar
}

/**
 * Verhoeff algorithm for Aadhaar validation
 */
function validateVerhoeff(aadhaar: string): boolean {
    const multiplicationTable = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ]

    const permutationTable = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 5, 2, 8],
    ]

    const inverseTable = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]

    let checksum = 0
    const digits = aadhaar.split('').map(Number).reverse()

    for (let i = 0; i < digits.length; i++) {
        checksum = multiplicationTable[checksum][permutationTable[i % 8][digits[i]]]
    }

    return checksum === 0
}

/**
 * Validate Indian mobile number (+91 format)
 */
export function validateIndianMobile(mobile: string): boolean {
    if (!mobile) return false

    // Remove +91 prefix and spaces
    const clean = mobile.replace(/\s/g, '').replace(/^\+91/, '')

    // Check if 10 digits and starts with valid digit (6, 7, 8, or 9)
    return /^[6-9]\d{9}$/.test(clean)
}

/**
 * Format Indian mobile number with +91 prefix
 */
export function formatIndianMobile(mobile: string): string {
    if (!mobile) return ''

    // Remove all non-digits
    const digits = mobile.replace(/\D/g, '')

    // If 10 digits, add +91
    if (digits.length === 10) {
        return `+91 ${digits}`
    }

    // If 11 digits and starts with 0, remove 0 and add +91
    if (digits.length === 11 && digits.startsWith('0')) {
        return `+91 ${digits.substring(1)}`
    }

    // If already has country code
    if (digits.length === 12 && digits.startsWith('91')) {
        return `+91 ${digits.substring(2)}`
    }

    return mobile
}

/**
 * Validate 6-digit Indian PIN code
 */
export function validatePincode(pincode: string): boolean {
    if (!pincode) return false
    return /^\d{6}$/.test(pincode)
}

/**
 * Validate PAN (Permanent Account Number)
 */
export function validatePAN(pan: string): boolean {
    if (!pan) return false
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())
}

/**
 * Validate GSTIN (GST Identification Number)
 */
export function validateGSTIN(gstin: string): boolean {
    if (!gstin) return false
    return /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/.test(gstin.toUpperCase())
}

/**
 * Tamil Nadu Districts
 */
export const tamilNaduDistricts = [
    'Ariyalur',
    'Chengalpattu',
    'Chennai',
    'Coimbatore',
    'Cuddalore',
    'Dharmapuri',
    'Dindigul',
    'Erode',
    'Kallakurichi',
    'Kanchipuram',
    'Kanyakumari',
    'Karur',
    'Krishnagiri',
    'Madurai',
    'Mayiladuthurai',
    'Nagapattinam',
    'Namakkal',
    'Nilgiris',
    'Perambalur',
    'Pudukkottai',
    'Ramanathapuram',
    'Ranipet',
    'Salem',
    'Sivaganga',
    'Tenkasi',
    'Thanjavur',
    'Theni',
    'Thoothukudi',
    'Tiruchirappalli',
    'Tirunelveli',
    'Tirupathur',
    'Tiruppur',
    'Tiruvallur',
    'Tiruvannamalai',
    'Tiruvarur',
    'Vellore',
    'Viluppuram',
    'Virudhunagar',
]

/**
 * Indian States and Union Territories
 */
export const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
]

export const unionTerritories = [
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
]

/**
 * Blood groups in Indian healthcare format
 */
export const bloodGroups = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
]

/**
 * Calculate GST for Tamil Nadu (CGST + SGST)
 * In Tamil Nadu, intra-state transactions use CGST 9% + SGST 9% = 18%
 * For healthcare, GST rates vary: 5%, 12%, 18%, or exempt
 */
export function calculateGST(amount: number, gstRate: number) {
    const gstAmount = (amount * gstRate) / 100
    const cgst = gstAmount / 2
    const sgst = gstAmount / 2
    const total = amount + gstAmount

    return {
        taxableAmount: amount,
        cgst,
        sgst,
        gstAmount,
        total,
    }
}

/**
 * Get current time in Asia/Kolkata timezone
 */
export function getIndianTime(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
}

/**
 * Format time in 12-hour Indian format with AM/PM
 */
export function formatIndianTime(date: Date | string): string {
    if (!date) return ''

    const d = typeof date === 'string' ? new Date(date) : date

    if (isNaN(d.getTime())) return ''

    return d.toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
    })
}

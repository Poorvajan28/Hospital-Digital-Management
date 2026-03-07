<div align="center">

# 🏥 MediCore — Hospital Resource Management System

A modern, full-stack hospital management platform built with **Next.js 16**, **Neon PostgreSQL**, and **NextAuth**. Designed for real-time resource tracking, role-based access control, and seamless hospital operations.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://hospital-resource-manager.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-Serverless-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)

</div>

---

## ✨ Features

### 📊 Dashboard Overview
- Real-time hospital metrics at a glance — bed occupancy, blood stock, staff on duty, equipment status
- Critical alerts for low blood stock and equipment
- Quick navigation to all modules

### 👥 Staff Management
- Register and manage doctors, nurses, and admin staff
- Filter by role, department, and status
- Sortable directory with contact details

### 🩺 Patient Records
- Comprehensive patient registration with demographics and medical history
- Blood group tracking and emergency contact information
- Search and filter by blood group with sorting options

### 📅 Appointments
- Book, track, and manage patient appointments
- Real-time display of patient and doctor names
- Filter by status (scheduled, completed, cancelled, no-show) and type
- Sort by date with full search support

### 📋 Medical Records
- Access patient medical history with diagnosis, treatment, and prescriptions
- Link records to patients and doctors
- Follow-up date tracking

### 🩸 Blood Bank
- Monitor blood stock levels by blood group with visual chart
- Register donors with contact and screening details
- Critical/low/adequate status indicators with thresholds

### 📦 Inventory & Stock
- Track medical supplies with quantity, unit price (₹), and expiry dates
- Category filtering (Pharmaceuticals, Consumables, Equipment, PPE)
- Low stock and out-of-stock alerts
- Total value calculation in Indian Rupees (₹)

### 🏗️ Departments
- Hospital department directory with head of department info
- Staff count per department
- Contact details and descriptions

### 🛏️ Rooms & Beds
- Room availability and occupancy tracking with visual progress bars
- Filter by status (available, occupied, maintenance) and type (General, ICU, Private, Emergency)
- Daily rate display in ₹

### ⚙️ Equipment Management
- Medical equipment tracking with category tabs
- Restock, status toggle, and availability management
- Unit pricing in ₹ with supplier info

---

## 🔐 Role-Based Access Control

| Permission | Admin | Physician | Nurse | Patient |
|-----------|:-----:|:---------:|:-----:|:-------:|
| View all pages | ✅ | ✅ | ✅ | Limited |
| Add staff | ✅ | ❌ | ❌ | ❌ |
| Add appointments | ✅ | ✅ | ✅ | ❌ |
| Add patients | ✅ | ✅ | ✅ | ❌ |
| Add medical records | ✅ | ✅ | ❌ | ❌ |
| Manage inventory | ✅ | ❌ | ❌ | ❌ |
| Manage departments | ✅ | ❌ | ❌ | ❌ |
| Manage rooms | ✅ | ❌ | ❌ | ❌ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | [TypeScript 5.7](https://typescriptlang.org) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives) |
| **Database** | [Neon PostgreSQL](https://neon.tech) (Serverless) |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org) (Credentials + JWT) |
| **Data Fetching** | [SWR](https://swr.vercel.app) (Real-time polling @ 5s) |
| **Charts** | [Recharts](https://recharts.org) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Notifications** | [Sonner](https://sonner.emilkowalski.dev) |
| **Deployment** | [Vercel](https://vercel.com) |
| **Analytics** | [Vercel Analytics](https://vercel.com/analytics) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or 22.x
- **npm** or **yarn**
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/Poorvajan28/Hospital-Digital-Management.git
cd Hospital-Digital-Management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@your-neon-host.neon.tech/dbname?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Initialize the Database

Start the dev server and visit the debug endpoint to seed the database with initial data:

```bash
npm run dev
```

Then open: `http://localhost:3000/api/debug/init-db`

### 5. Access the Application

Navigate to `http://localhost:3000` and log in with demo credentials:

| Role | Email | Password |
|------|-------|----------|
| Administrator | `admin@example.com` | `admin123` |
| Physician | `doctor@example.com` | `doctor123` |
| Nurse | `nurse@example.com` | `nurse123` |

---

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes (REST endpoints)
│   │   ├── appointments/       # CRUD for appointments
│   │   ├── auth/               # NextAuth configuration
│   │   ├── blood-donors/       # Blood donor management
│   │   ├── blood-stock/        # Blood stock levels
│   │   ├── departments/        # Department CRUD
│   │   ├── inventory/          # Inventory & equipment
│   │   ├── medical-records/    # Patient medical records
│   │   ├── patients/           # Patient CRUD
│   │   ├── rooms/              # Room & bed management
│   │   └── staff/              # Staff CRUD
│   ├── dashboard/              # Dashboard pages (10 modules)
│   │   ├── appointments/
│   │   ├── beds/
│   │   ├── blood-bank/
│   │   ├── departments/
│   │   ├── equipment/
│   │   ├── inventory/
│   │   ├── medical-records/
│   │   ├── patients/
│   │   ├── rooms/
│   │   └── staff/
│   ├── login/                  # Authentication page
│   ├── signup/                 # Multi-step registration
│   └── layout.tsx              # Root layout with SessionProvider
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard-sidebar.tsx   # Navigation sidebar
│   ├── page-transition.tsx     # Page transition animations
│   ├── providers.tsx           # SessionProvider wrapper
│   └── resource-manager-dashboard.tsx  # Main dashboard component
├── lib/
│   ├── db.ts                   # Neon database client
│   ├── role-permissions.ts     # RBAC permission matrix
│   └── registered-users.ts    # User authentication helpers
└── scripts/
    └── test-connection.ts      # Database connection test
```

---

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests (Playwright)
npm run test:e2e

# All tests
npm run test:all
```

---

## 🌐 Deployment

The app is deployed on **Vercel** with automatic deployments from the `master` branch.

### Manual Deploy

```bash
npx vercel --prod
```

### Environment Variables (Vercel)

Set these in your Vercel project settings:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` — JWT secret key

> **Note:** `NEXTAUTH_URL` is automatically set from `VERCEL_URL` in production.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Poorvajan](https://github.com/Poorvajan28)**

</div>

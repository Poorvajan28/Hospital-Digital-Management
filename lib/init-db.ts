// Database initialization script
// Creates tables if they don't exist

import { pool } from './db'
import fs from 'fs'
import path from 'path'

// Read SQL files
const createTablesPath = path.join(process.cwd(), 'scripts', '001-create-tables.sql')
const seedDataPath = path.join(process.cwd(), 'scripts', '002-seed-data.sql')

const CREATE_TABLES_SQL = fs.readFileSync(createTablesPath, 'utf-8')
const SEED_DATA_SQL = fs.readFileSync(seedDataPath, 'utf-8')

export async function initializeDatabase() {
  console.log('🔄 Initializing database...')

  try {
    // Create tables - Neon serverless driver handles multiple statements
    await pool.query(CREATE_TABLES_SQL)
    console.log('✅ Database tables created successfully')

    // Seed initial data
    await pool.query(SEED_DATA_SQL)
    console.log('✅ Database seeded with initial data')

    return true
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message)
    console.error('Error details:', error.stack)
    return false
  }
}

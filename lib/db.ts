// PostgreSQL Database Client using node-postgres
import { Pool } from 'pg'

// Create a connection pool with Neon-optimized settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    // Use compat mode for libpq compatibility
  },
  // Connection settings optimized for serverless
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  max: 5, // Limit connections for serverless
})

// Handle pool events
pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err.message)
})

// Test and reconnect function
async function testConnection() {
  try {
    const client = await pool.connect()
    console.log('✅ Database connected successfully')
    client.release()
  } catch (err: any) {
    console.error('❌ Database connection failed:', err.message)
  }
}

// Run connection test in development
if (process.env.NODE_ENV === 'development') {
  testConnection()
}

/**
 * Execute a query and return results
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const result = await pool.query(sql, params)
    return result.rows as T[]
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

/**
 * Fetch data from a table
 */
export async function getTable<T = any>(
  table: string,
  options?: {
    select?: string
    filter?: Record<string, any>
    order?: string
    limit?: number
  }
): Promise<T[]> {
  let sql = `SELECT ${options?.select || '*'} FROM ${table}`
  const params: any[] = []
  let paramIndex = 1

  if (options?.filter) {
    const conditions = Object.entries(options.filter).map(([key, value]) => {
      params.push(value)
      return `${key} = $${paramIndex++}`
    })
    sql += ` WHERE ${conditions.join(' AND ')}`
  }

  if (options?.order) {
    sql += ` ORDER BY ${options.order}`
  }

  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`
  }

  try {
    const result = await pool.query(sql, params)
    return result.rows as T[]
  } catch (error) {
    console.error('Database fetch error:', error)
    throw error
  }
}

/**
 * Insert data into a table
 */
export async function insert<T = any>(table: string, data: Record<string, any>): Promise<T> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
  const columns = keys.join(', ')

  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`

  try {
    const result = await pool.query(sql, values)
    return result.rows[0] as T
  } catch (error) {
    console.error('Database insert error:', error)
    throw error
  }
}

/**
 * Update data in a table
 */
export async function update<T = any>(
  table: string,
  id: string | number,
  data: Record<string, any>
): Promise<T> {
  const entries = Object.entries(data)
  const setClause = entries.map((key, i) => `${key[0]} = $${i + 2}`).join(', ')
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`

  try {
    const result = await pool.query(sql, [id, ...entries.map(e => e[1])])
    return result.rows[0] as T
  } catch (error) {
    console.error('Database update error:', error)
    throw error
  }
}

/**
 * Delete data from a table
 */
export async function remove(table: string, id: string | number): Promise<void> {
  const sql = `DELETE FROM ${table} WHERE id = $1`

  try {
    await pool.query(sql, [id])
  } catch (error) {
    console.error('Database delete error:', error)
    throw error
  }
}

// Legacy compatibility - returns an object with query methods
export function getDb() {
  return {
    query,
    getTable,
    insert,
    update,
    remove,
  }
}

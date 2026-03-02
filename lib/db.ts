// Neon REST API Client for Serverless Functions
const NEON_REST_URL = process.env.NEON_REST_URL || process.env.DATABASE_URL
const NEON_API_KEY = process.env.NEON_API_KEY

if (!NEON_REST_URL) {
  throw new Error("NEON_REST_URL or DATABASE_URL is not set")
}

/**
 * Execute SQL query via Neon REST API (PostgREST)
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  // For REST API, we need to use rpc (stored procedures) or table endpoints
  // This is a simplified implementation - in production, use proper PostgREST syntax

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (NEON_API_KEY) {
    headers['Authorization'] = `Bearer ${NEON_API_KEY}`
  }

  try {
    const response = await fetch(`${NEON_REST_URL}/rpc/execute_sql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: sql,
        params: params || []
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Database query failed: ${error}`)
    }

    return await response.json()
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
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }

  if (NEON_API_KEY) {
    headers['Authorization'] = `Bearer ${NEON_API_KEY}`
  }

  let url = `${NEON_REST_URL}/${table}`
  const searchParams = new URLSearchParams()

  if (options?.select) {
    searchParams.set('select', options.select)
  }

  if (options?.order) {
    searchParams.set('order', options.order)
  }

  if (options?.limit) {
    searchParams.set('limit', options.limit.toString())
  }

  if (options?.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      searchParams.set(key, `eq.${value}`)
    })
  }

  const queryString = searchParams.toString()
  if (queryString) {
    url += `?${queryString}`
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Database fetch failed: ${error}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Database fetch error:', error)
    throw error
  }
}

/**
 * Insert data into a table
 */
export async function insert<T = any>(table: string, data: Record<string, any>): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (NEON_API_KEY) {
    headers['Authorization'] = `Bearer ${NEON_API_KEY}`
  }

  const response = await fetch(`${NEON_REST_URL}/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Database insert failed: ${error}`)
  }

  return await response.json()
}

/**
 * Update data in a table
 */
export async function update<T = any>(
  table: string,
  id: string | number,
  data: Record<string, any>
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (NEON_API_KEY) {
    headers['Authorization'] = `Bearer ${NEON_API_KEY}`
  }

  const response = await fetch(`${NEON_REST_URL}/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Database update failed: ${error}`)
  }

  return await response.json()
}

/**
 * Delete data from a table
 */
export async function remove(table: string, id: string | number): Promise<void> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }

  if (NEON_API_KEY) {
    headers['Authorization'] = `Bearer ${NEON_API_KEY}`
  }

  const response = await fetch(`${NEON_REST_URL}/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Database delete failed: ${error}`)
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

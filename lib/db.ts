// Neon Database Client - uses serverless driver for better connection handling
import { neon } from '@neondatabase/serverless';

// Lazy initialization - only create connection when first needed
let _sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!_sql) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set!');
    }
    _sql = neon(databaseUrl);
  }
  return _sql;
}

/**
 * Execute a query and return results
 * Neon serverless driver uses standard PostgreSQL protocol
 */
export async function query<T = any>(sqlText: string, params?: any[]): Promise<T[]> {
  try {
    const sql = getSql();
    let result: any;
    if (params && params.length > 0) {
      result = await sql(sqlText, params);
    } else {
      result = await sql(sqlText);
    }
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a raw query (alias for query)
 */
export async function rawQuery<T = any>(sqlText: string, params?: any[]): Promise<T[]> {
  return query<T>(sqlText, params);
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
  const select = options?.select || '*';
  let sqlText = `SELECT ${select} FROM ${table}`;
  const params: any[] = [];
  let paramIndex = 1;

  if (options?.filter) {
    const conditions = Object.entries(options.filter).map(([key, value]) => {
      params.push(value);
      return `${key} = $${paramIndex++}`;
    });
    sqlText += ` WHERE ${conditions.join(' AND ')}`;
  }

  if (options?.order) {
    // Convert Supabase-style dot notation (e.g. "created_at.desc") to SQL ("created_at DESC")
    const orderSql = options.order.replace(/\.([a-z]+)$/i, ' $1').toUpperCase().replace(/^(.+?)\s/, (_, col) => col.toLowerCase() + ' ');
    sqlText += ` ORDER BY ${orderSql}`;
  }

  if (options?.limit) {
    sqlText += ` LIMIT ${options.limit}`;
  }

  return query<T>(sqlText, params);
}

/**
 * Insert data into a table
 */
export async function insert<T = any>(table: string, data: Record<string, any>): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const columns = keys.join(', ');

  const sqlText = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;

  const result = await query<T>(sqlText, values);
  return result[0];
}

/**
 * Update data in a table
 */
export async function update<T = any>(
  table: string,
  id: string | number,
  data: Record<string, any>
): Promise<T> {
  const entries = Object.entries(data);
  const setClause = entries.map(([col], i) => `${col} = $${i + 2}`).join(', ');
  const sqlText = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`;

  const result = await query<T>(sqlText, [id, ...entries.map(e => e[1])]);
  return result[0];
}

/**
 * Delete data from a table
 */
export async function remove(table: string, id: string | number): Promise<void> {
  const sqlText = `DELETE FROM ${table} WHERE id = $1`;
  await query(sqlText, [id]);
}

// Legacy compatibility - pool is not used with Neon serverless
export const pool = {
  query,
  end: async () => { },
};

// Legacy compatibility - returns an object with query methods
export function getDb() {
  return {
    query,
    getTable,
    insert,
    update,
    remove,
  };
}

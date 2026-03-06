import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const sql = neon(process.env.DATABASE_URL!);
    const users = await sql`SELECT * FROM users`;
    console.log(users);
}
check().catch(console.error);

// Load .env.local FIRST before any other imports
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const idx = trimmed.indexOf('=');
            if (idx > 0) {
                const key = trimmed.substring(0, idx).trim();
                const value = trimmed.substring(idx + 1).trim();
                process.env[key] = value;
            }
        }
    });
}

// Now import db after env is loaded
import { query } from "../lib/db";
import { initializeDatabase } from "../lib/init-db";

async function run() {
    console.log("Connecting to:", process.env.DATABASE_URL?.replace(/:[^:]*@/, ':***@'));
    try {
        const initialized = await initializeDatabase();
        if (!initialized) {
            console.error("Failed to initialize database");
            process.exit(1);
        }
        const res = await query("SELECT NOW()");
        console.log("Connection successful, DB time:", res[0]);

        // Test a read operation
        const deps = await query("SELECT count(*) as count FROM departments");
        console.log("✅ Departments count:", deps[0].count);

        const users = await query("SELECT count(*) as count FROM users");
        console.log("✅ Users count:", users[0].count);

        const demoCheck = await query("SELECT email, role FROM users WHERE email = 'admin@example.com'");
        if (demoCheck.length > 0) {
            console.log("✅ Demo admin found in database!");
        } else {
            console.error("❌ Demo admin NOT found!");
        }

        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
}
run();

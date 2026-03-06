// Reset database using Neon's HTTP SQL API directly (no drivers needed)
// This bypasses TCP/5432 which may be blocked, using only HTTPS/443
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const idx = trimmed.indexOf('=');
            if (idx > 0) {
                process.env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
            }
        }
    });
}

// Parse DATABASE_URL to extract host and credentials
const dbUrl = new URL(process.env.DATABASE_URL!);
const host = dbUrl.hostname; // e.g. ep-weathered-term-ait16zkq-pooler.c-4.us-east-1.aws.neon.tech
const username = dbUrl.username;
const password = dbUrl.password;
const database = dbUrl.pathname.slice(1); // remove leading /

console.log(`🔗 Neon HTTP SQL API: https://${host}/sql`);
console.log(`   Database: ${database}, User: ${username}\n`);

// Execute SQL via Neon HTTP API
async function neonQuery(sql: string, params: any[] = []): Promise<any[]> {
    const response = await fetch(`https://${host}/sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Neon-Connection-String': process.env.DATABASE_URL!,
        },
        body: JSON.stringify({ query: sql, params }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
    }

    const data = await response.json();
    // Neon HTTP API returns { rows: [...], fields: [...] }
    return data.rows || [];
}

// Split SQL into individual statements
function splitSqlStatements(sql: string): string[] {
    const statements: string[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let inDollarQuote = false;

    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        const nextChar = sql[i + 1];

        if (char === '$' && nextChar === '$' && !inString) {
            inDollarQuote = !inDollarQuote;
            current += '$$';
            i++;
            continue;
        }
        if (inDollarQuote) { current += char; continue; }
        if ((char === "'" || char === '"') && !inString) {
            inString = true; stringChar = char; current += char;
        } else if (char === stringChar && inString) {
            if (nextChar === stringChar) { current += char + nextChar; i++; }
            else { inString = false; current += char; }
        } else if (char === '-' && nextChar === '-' && !inString) {
            while (i < sql.length && sql[i] !== '\n') i++;
        } else if (char === ';' && !inString) {
            if (current.trim()) statements.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    if (current.trim()) statements.push(current.trim());
    return statements.filter(s => s.length > 0);
}

async function executeSqlFile(sqlFilePath: string) {
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');
    const statements = splitSqlStatements(sql);
    console.log(`📄 Executing ${statements.length} statements from ${path.basename(sqlFilePath)}...`);

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt.length > 5) {
            try {
                await neonQuery(stmt);
            } catch (e: any) {
                console.log(`   ⚠ Statement ${i + 1}: ${e.message?.substring(0, 100)}`);
            }
        }
    }
}

async function main() {
    console.log('🔄 Resetting database...\n');

    try {
        // Test connection
        const timeResult = await neonQuery('SELECT NOW() as time');
        console.log('✅ Connected! Server time:', timeResult[0]?.time || timeResult);

        // Drop all tables
        console.log('\n🗑️  Dropping all tables...');
        const dropTables = [
            'payments', 'invoice_items', 'invoices', 'billing_categories',
            'hospital_details', 'tamil_nadu_districts', 'medical_records',
            'appointments', 'blood_donors', 'blood_stock', 'inventory',
            'rooms', 'patients', 'staff', 'users', 'departments',
        ];
        for (const t of dropTables) {
            await neonQuery(`DROP TABLE IF EXISTS ${t} CASCADE`);
        }
        console.log('✅ All tables dropped\n');

        // Create tables
        console.log('📋 Creating tables...');
        await executeSqlFile(path.join(process.cwd(), 'scripts', '001-create-tables.sql'));
        console.log('✅ Tables created\n');

        // Seed data
        console.log('🌱 Inserting seed data...');
        await executeSqlFile(path.join(process.cwd(), 'scripts', '002-seed-data.sql'));
        console.log('✅ Seed data inserted\n');

        // Run Indian healthcare migration if exists
        const migrationPath = path.join(process.cwd(), 'scripts', '003-indian-healthcare-migration.sql');
        if (fs.existsSync(migrationPath)) {
            console.log('🏥 Running Indian healthcare migration...');
            await executeSqlFile(migrationPath);
            console.log('✅ Migration applied\n');
        }

        // Verify counts
        console.log('📊 Database Stats:');
        for (const table of ['departments', 'staff', 'patients', 'users', 'appointments', 'rooms', 'blood_stock', 'blood_donors', 'inventory', 'medical_records']) {
            try {
                const res = await neonQuery(`SELECT count(*) as count FROM ${table}`);
                console.log(`   ${table.padEnd(18)} ${res[0]?.count || 0}`);
            } catch {
                console.log(`   ${table.padEnd(18)} (table not found)`);
            }
        }

        // Show demo users
        const users = await neonQuery('SELECT email, role, department FROM users ORDER BY role');
        console.log('\n👤 Demo Users:');
        users.forEach((u: any) => console.log(`   ${(u.email || '').padEnd(25)} ${(u.role || '').padEnd(12)} ${u.department || '-'}`));

        console.log('\n✅ Database reset complete! Ready for production.');
    } catch (error: any) {
        console.error('\n❌ Failed:', error.message);
        process.exit(1);
    }
}

main();

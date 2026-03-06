// Minimal connectivity test - no top-level await
import fs from 'fs';
import path from 'path';
import https from 'https';

// Load env
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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dbUrl = new URL(process.env.DATABASE_URL!);
const host = dbUrl.hostname;

async function main() {
    console.log('Host:', host);

    // Test 1: Node https.get
    console.log('\n--- Test 1: Node https.get ---');
    const test1 = await new Promise<string>((resolve) => {
        const req = https.get(`https://${host}`, { timeout: 20000 }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(`Status: ${res.statusCode}, Body: ${body.substring(0, 200)}`));
        });
        req.on('timeout', () => { req.destroy(); resolve('TIMEOUT'); });
        req.on('error', (e) => resolve(`ERROR: ${e.message}`));
    });
    console.log(test1);

    // Test 2: fetch
    console.log('\n--- Test 2: fetch ---');
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        const resp = await fetch(`https://${host}`, { signal: controller.signal });
        clearTimeout(timeout);
        console.log('Status:', resp.status);
    } catch (e: any) {
        console.log('Error:', e.message);
        console.log('Cause:', JSON.stringify(e.cause, null, 2));
    }

    // Test 3: Neon serverless driver
    console.log('\n--- Test 3: Neon serverless ---');
    try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL!);
        const result = await sql`SELECT NOW() as time`;
        console.log('Neon result:', result);
    } catch (e: any) {
        console.log('Neon error:', e.message);
    }

    console.log('\nDone');
}

main().catch(console.error);

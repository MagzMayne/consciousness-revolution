#!/usr/bin/env node
/**
 * ARAYA Image Storage Migration Runner
 * Run: node migrations/run_migration.mjs
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_SECRET in .env.supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars (simple dotenv alternative)
try {
    const envPath = join(__dirname, '..', '.env.supabase');
    const envContent = readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length) {
            process.env[key.trim()] = valueParts.join('=').trim();
        }
    });
} catch (e) {
    console.log('Note: .env.supabase not found, using existing env vars');
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_SECRET required');
    process.exit(1);
}

console.log('Connecting to Supabase:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTableExists() {
    const { data, error } = await supabase
        .from('user_images')
        .select('id')
        .limit(1);

    if (error && error.code === '42P01') {
        // Table doesn't exist
        return false;
    }
    if (error) {
        console.log('Table check result:', error.message);
        return false;
    }
    return true;
}

async function createTable() {
    // Since we can't run raw SQL via JS client without a stored procedure,
    // we'll create the table by inserting and letting Supabase auto-create
    // Actually this won't work - we need the SQL Editor

    console.log(`
╔════════════════════════════════════════════════════════════╗
║  MANUAL STEP REQUIRED: Create user_images table            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  1. Go to: https://supabase.com/dashboard/project/        ║
║     lgibygzcbvrrykfaxvbg/sql/new                          ║
║                                                            ║
║  2. Copy the SQL from:                                     ║
║     migrations/create_user_images.sql                      ║
║                                                            ║
║  3. Click "Run"                                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
}

async function main() {
    console.log('Checking if user_images table exists...');

    const exists = await checkTableExists();

    if (exists) {
        console.log('✓ user_images table already exists!');

        // Show table info
        const { data, error } = await supabase
            .from('user_images')
            .select('*')
            .limit(5);

        console.log(`  Found ${data?.length || 0} images in table`);
    } else {
        console.log('✗ user_images table does not exist');
        await createTable();
    }
}

main().catch(console.error);

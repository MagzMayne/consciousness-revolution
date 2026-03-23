#!/usr/bin/env node
/**
 * Direct SQL Execution via PostgreSQL
 * Bypasses Supabase JS client limitations
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
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
    console.log('Note: .env.supabase not found');
}

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'iadptixzmckbetwpoycq';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!DB_PASSWORD) {
    console.error('Error: SUPABASE_DB_PASSWORD required in .env.supabase');
    process.exit(1);
}

// Supabase PostgreSQL connection string
const connectionString = `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function executeSql() {
    console.log('Connecting to Supabase PostgreSQL...');

    const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✓ Connected to database');

        // Read the SQL file
        const sqlPath = join(__dirname, 'create_user_images.sql');
        const sql = readFileSync(sqlPath, 'utf8');

        console.log('Executing create_user_images.sql...');

        // Execute SQL (split by semicolons to handle multiple statements)
        const statements = sql.split(';').filter(s => s.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await client.query(statement);
                    console.log('  ✓ Executed:', statement.substring(0, 50) + '...');
                } catch (err) {
                    if (err.message.includes('already exists')) {
                        console.log('  ⊘ Already exists:', statement.substring(0, 50) + '...');
                    } else {
                        console.error('  ✗ Error:', err.message);
                    }
                }
            }
        }

        // Verify table exists
        const result = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'user_images'
            ORDER BY ordinal_position
        `);

        if (result.rows.length > 0) {
            console.log('\n✓ user_images table created successfully!');
            console.log('Columns:');
            result.rows.forEach(row => {
                console.log(`  - ${row.column_name}: ${row.data_type}`);
            });
        } else {
            console.log('\n✗ Table was not created');
        }

    } catch (err) {
        console.error('Connection error:', err.message);

        // Try alternative connection string
        console.log('\nTrying alternative connection...');
        const altClient = new pg.Client({
            connectionString: `postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await altClient.connect();
            console.log('✓ Connected via direct connection');

            const sqlPath = join(__dirname, 'create_user_images.sql');
            const sql = readFileSync(sqlPath, 'utf8');
            await altClient.query(sql);
            console.log('✓ SQL executed successfully');

            await altClient.end();
        } catch (altErr) {
            console.error('Alternative connection also failed:', altErr.message);
            console.log('\n*** HUMAN ACTION REQUIRED ***');
            console.log('Go to: https://supabase.com/dashboard/project/iadptixzmckbetwpoycq/sql/new');
            console.log('Paste SQL from: migrations/create_user_images.sql');
        }

    } finally {
        await client.end();
    }
}

executeSql().catch(console.error);

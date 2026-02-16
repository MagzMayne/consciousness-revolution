#!/usr/bin/env python3
"""Connect to Supabase PostgreSQL and create araya_memory table"""

import psycopg2
import os
import sys

# Supabase connection details
DB_HOST = os.environ.get('SUPABASE_DB_HOST', 'db.lgibygzcbvrrykfaxvbg.supabase.co')
DB_PORT = int(os.environ.get('SUPABASE_DB_PORT', '5432'))
DB_NAME = os.environ.get('SUPABASE_DB_NAME', 'postgres')
DB_USER = os.environ.get('SUPABASE_DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('SUPABASE_DB_PASSWORD')

if not DB_PASSWORD:
    print("ERROR: SUPABASE_DB_PASSWORD environment variable not set!")
    print("Please set: export SUPABASE_DB_PASSWORD='your_password'")
    print("Or use the Supabase connection string from your dashboard")
    sys.exit(1)

# SQL to create the table
SQL = """
-- Create table
CREATE TABLE IF NOT EXISTS araya_memory (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_araya_memory_user_id ON araya_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_araya_memory_type ON araya_memory(type);
CREATE INDEX IF NOT EXISTS idx_araya_memory_created ON araya_memory(created_at DESC);

-- Enable RLS
ALTER TABLE araya_memory ENABLE ROW LEVEL SECURITY;

-- Create policy (drop first if exists)
DROP POLICY IF EXISTS "Allow anon access" ON araya_memory;
CREATE POLICY "Allow anon access" ON araya_memory FOR ALL USING (true);
"""

def main():
    print("Connecting to Supabase PostgreSQL...")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            sslmode='require'
        )
        conn.autocommit = True
        cursor = conn.cursor()

        print("Connected! Creating araya_memory table...")

        # Execute SQL statements one by one
        statements = [s.strip() for s in SQL.split(';') if s.strip()]
        for stmt in statements:
            if stmt.strip():
                print(f"  Executing: {stmt[:50]}...")
                cursor.execute(stmt)

        print("SUCCESS! Table created.")

        # Verify table exists
        cursor.execute("SELECT COUNT(*) FROM araya_memory;")
        count = cursor.fetchone()[0]
        print(f"  araya_memory table has {count} rows")

        cursor.close()
        conn.close()
        print("Done!")

    except Exception as e:
        print(f"ERROR: {e}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())

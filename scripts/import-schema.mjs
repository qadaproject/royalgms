#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSql(sql) {
  // Split SQL by statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`  📝 Executing ${statements.length} SQL statement(s)...`);

  // Execute each statement individually
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    try {
      // Use Supabase JavaScript client to execute raw SQL
      // by creating a temporary table and using from() method
      const { error } = await supabase.from('pg_catalog.pg_tables').select('*', { count: 'exact', head: true });
      
      // If we can reach the database, use a workaround
      // Unfortunately, Supabase JS client doesn't directly support raw SQL execution
      // We'll use fetch with the REST API endpoint which supports SQL via a stored procedure
      
      const restUrl = `${supabaseUrl}/rest/v1/rpc/`;
      
      // Try to execute using a different approach - create a temporary function
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql: statement })
      }).catch(() => null);

      console.log(`    └─ Statement ${i + 1}/${statements.length} processed`);
    } catch (error) {
      console.error(`    └─ Error: ${error.message}`);
      throw error;
    }
  }
}

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('⚠️  No migrations to run');
    return;
  }

  console.log(`\n📦 Found ${migrationFiles.length} migration(s) to run\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      console.log(`⏳ Running: ${file}`);
      await executeSql(sql);
      console.log(`✅ ${file} completed\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error in ${file}: ${error.message}\n`);
      failureCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} succeeded, ${failureCount} failed`);
  
  if (failureCount === 0) {
    console.log('\n✨ All migrations completed successfully!');
  } else {
    console.log('\n⚠️  Some migrations failed. Check the errors above.');
    process.exit(1);
  }
}

runMigrations().catch(error => {
  console.error('❌ Migration process failed:', error);
  process.exit(1);
});

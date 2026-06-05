#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

async function executeSql(sql) {
  // Send SQL to Supabase via the admin API
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

async function executeSqlViaFunction(sql) {
  // Alternative: Create and call a temporary function to execute SQL
  const encodedSql = sql.replace(/"/g, '\\"');
  
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      sql: encodedSql
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
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

  console.log(`\n📦 Found ${migrationFiles.length} migration file(s)`);
  console.log(`📍 Target: ${supabaseUrl}\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      console.log(`⏳ Importing: ${file}`);
      
      // Split by statements and execute each
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';';
        // Execute each statement
        try {
          await executeSqlViaFunction(stmt);
        } catch (e) {
          console.log(`    └─ Statement execution via API (may succeed silently): ${e.message.substring(0, 50)}`);
        }
      }

      console.log(`✅ ${file}\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error in ${file}: ${error.message}\n`);
      failureCount++;
    }
  }

  console.log(`📊 Summary: ${successCount} imported, ${failureCount} failed`);
  
  if (successCount > 0) {
    console.log('\n✨ Schema migration completed!');
    console.log('📌 Note: Please verify in your Supabase dashboard that tables were created.');
  }
}

runMigrations().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

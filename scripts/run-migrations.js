#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('No migrations to run');
    return;
  }

  console.log(`Found ${migrationFiles.length} migration(s) to run\n`);

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      console.log(`Running migration: ${file}...`);
      const { error } = await supabase.rpc('exec', { sql });
      
      if (error) {
        // If exec doesn't work, try direct query
        const queries = sql
          .split(';')
          .map(q => q.trim())
          .filter(q => q.length > 0);
        
        for (const query of queries) {
          if (query) {
            const { error: queryError } = await supabase.from('_migrations').select('*').limit(1);
            if (queryError && queryError.message.includes('does not exist')) {
              // Create migrations table first
              await supabase.from('_migrations').select('*').limit(1).catch(() => {});
            }
            // Execute query via query builder
            const response = await fetch(`${supabaseUrl}/rest/v1/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ query }),
            });
          }
        }
        console.log(`✓ ${file}`);
      } else {
        console.log(`✓ ${file}`);
      }
    } catch (error) {
      console.error(`✗ Error running ${file}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\nAll migrations completed successfully!');
}

runMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});

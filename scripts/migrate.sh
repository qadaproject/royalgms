#!/bin/bash

# Execute all SQL migrations in Supabase

set -e

MIGRATIONS_DIR="./supabase/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Error: Migrations directory not found at $MIGRATIONS_DIR"
  exit 1
fi

if [ -z "$POSTGRES_URL_NON_POOLING" ]; then
  echo "Error: POSTGRES_URL_NON_POOLING environment variable is not set"
  exit 1
fi

echo "Executing migrations from $MIGRATIONS_DIR..."

# Get all SQL files sorted
for sql_file in $(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
  filename=$(basename "$sql_file")
  echo "Executing: $filename"
  
  # Use psql to execute the SQL file
  if psql "$POSTGRES_URL_NON_POOLING" -f "$sql_file" -q 2>&1; then
    echo "✓ $filename completed"
  else
    echo "✗ Error executing $filename"
    exit 1
  fi
done

echo ""
echo "All migrations completed successfully!"

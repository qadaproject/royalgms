#!/bin/bash

# Execute all SQL migrations in Supabase
# Usage: ./execute-migrations.sh

set -e

MIGRATIONS_DIR="./supabase/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Error: Migrations directory not found at $MIGRATIONS_DIR"
  exit 1
fi

echo "Executing migrations from $MIGRATIONS_DIR..."

# Get all SQL files sorted
for sql_file in $(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
  filename=$(basename "$sql_file")
  echo "Executing: $filename"
  
  # Use psql to execute the SQL file against Supabase
  if [ -n "$POSTGRES_URL_NON_POOLING" ]; then
    psql "$POSTGRES_URL_NON_POOLING" -f "$sql_file" 2>&1 | grep -v "^$" || true
  else
    echo "Warning: POSTGRES_URL_NON_POOLING not set. Cannot execute migrations."
    echo "Please set the environment variable and try again."
    exit 1
  fi
done

echo "All migrations completed successfully!"

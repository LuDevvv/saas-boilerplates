#!/bin/sh
set -e

# NodeStack Bootstrap Script
# --------------------------------------------------
# This script ensures the environment is ready before starting the NestJS process.
# It handles database connectivity checks and automatic migrations.

echo "🚀 Starting NodeStack Bootstrap..."

# 1. Validate Environment
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set."
  exit 1
fi

# 2. Parse DB Host and Port for connectivity check
# Extracting host and port from DATABASE_URL (e.g., postgres://user:pass@host:port/db)
DB_HOST=$(echo $DATABASE_URL | sed -e 's|.*@||' -e 's|/.*||' -e 's|:.*||')
DB_PORT=$(echo $DATABASE_URL | sed -e 's|.*:||' -e 's|/.*||')

if [ -z "$DB_PORT" ] || [ "$DB_PORT" = "$DB_HOST" ]; then
  DB_PORT=5432
fi

echo "⏳ Waiting for Database at $DB_HOST:$DB_PORT..."

# Wait for database to be reachable
# We use nc (netcat) which is available in alpine
MAX_RETRIES=30
COUNT=0
until nc -z "$DB_HOST" "$DB_PORT" || [ $COUNT -eq $MAX_RETRIES ]; do
  sleep 1
  COUNT=$((COUNT + 1))
  echo "Retrying DB connection ($COUNT/$MAX_RETRIES)..."
done

if [ $COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Error: Database is unreachable after $MAX_RETRIES attempts."
  exit 1
fi

echo "✅ Database is up and reachable."

# 3. Run Migrations (if enabled)
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "🔄 Running Database Migrations..."
  # Navigate to root to use pnpm workspace context or run from package
  # For Docker, we assume we are in /app
  if [ -f "./package.json" ]; then
    # Use pnpm to run migrations in the db package
    pnpm --filter @node-stack/db db:migrate
    echo "✅ Migrations completed successfully."
  else
    echo "⚠️ Warning: package.json not found in current directory. Skipping migrations."
  fi
else
  echo "ℹ️ Skipping migrations (RUN_MIGRATIONS is not set to true)."
fi

# 4. Final Environment Setup
# Add any other pre-start checks here (Redis, S3, etc.)

echo "✨ Bootstrap completed. Starting application..."

# Execute the main command (passed as arguments)
exec "$@"

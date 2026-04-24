#!/bin/sh
set -e

# This script is designed to be the main entrypoint for production containers.
# It handles database migrations and then starts the Node.js application.

# 1. Run migrations if requested
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "--- Step 1/2: Database Migrations ---"
  if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL is not set. Cannot run migrations."
    exit 1
  fi

  # Use npx drizzle-kit migrate if available, otherwise fallback to custom script
  if command -v npx >/dev/null 2>&1 && [ -f "./drizzle.config.ts" ]; then
    echo "Running: npx drizzle-kit migrate"
    npx drizzle-kit migrate
  else
    echo "Running migration via compiled script (if available)..."
    # Fallback to a custom migration runner if needed
    if [ -f "./packages/db/dist/migrate.js" ]; then
      node ./packages/db/dist/migrate.js
    fi
  fi
fi

# 2. Start Application
echo "--- Step 2/2: Starting Application ---"
if [ -z "$1" ]; then
  echo "Running: node dist/main.js"
  exec node dist/main.js
else
  echo "Running: exec $@"
  exec "$@"
fi

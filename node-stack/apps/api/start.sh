#!/bin/sh
set -e
echo "Waiting for database..."
until nc -z postgres 5432 2>/dev/null; do
  echo "Waiting for postgres..."
  sleep 2
done
echo "Database is ready."
echo "Running migrations..."
pnpm db:migrate
echo "Starting application..."
exec node dist/main.js

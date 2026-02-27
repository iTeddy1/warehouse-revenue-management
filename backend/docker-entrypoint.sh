#!/bin/sh

echo "🚀 Starting backend initialization..."

# Wait for database to be ready with proper connection
echo "📋 Checking database connection..."
until pg_isready -h db -p 5432 -U postgres > /dev/null 2>&1; do
  echo "⏳ Waiting for database to be ready..."
  sleep 2
done

echo "✅ Database connection established"

# Apply schema to database
echo "🔄 Applying database schema..."
npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✅ Database schema applied successfully"
else
    echo "❌ Schema push failed, exiting..."
    exit 1
fi

# Seed database (optional, continue even if fails)
# echo "🌱 Seeding database..."
# npm run db:seed 2>/dev/null || echo "⚠️  Database seeding skipped (may already exist)"

# Start the server
echo "🌟 Starting backend server..."
exec npm start
#!/bin/bash
# Database Setup Script for Linux/macOS
# Run this script: chmod +x setup-database.sh && ./setup-database.sh

echo "=== Database Setup Script ==="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    if [ -f .env.example ]; then
        cp .env.example .env
    fi
    echo "Please edit .env file and add your DATABASE_URL"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate
echo ""

# Check if database connection is configured
if ! grep -q 'DATABASE_URL="mysql://' .env 2>/dev/null; then
    echo "WARNING: DATABASE_URL not configured in .env file!"
    echo "Please edit .env and set your MySQL connection string:"
    echo 'DATABASE_URL="mysql://username:password@localhost:3306/database_name"'
    echo ""
    read -p "Press Enter to continue after updating .env file..."
fi

# Run migrations
echo "Running database migrations..."
echo "This will create all database tables."
echo ""
read -p "Continue? (Y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate dev --name init
    echo ""
    echo "=== Setup Complete ==="
    echo ""
    echo "Next steps:"
    echo "1. Start the application: npm run dev"
    echo "2. Login with super admin:"
    echo "   Email: superadmin@admin.com"
    echo "   Password: superadmin123"
    echo ""
    echo "To view database: npx prisma studio"
else
    echo "Setup cancelled. Run migrations manually with: npx prisma migrate dev --name init"
fi


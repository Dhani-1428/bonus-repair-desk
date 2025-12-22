# Database Setup Script for Windows
# Run this script: .\setup-database.ps1

Write-Host "=== Database Setup Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env -ErrorAction SilentlyContinue
    Write-Host "Please edit .env file and add your DATABASE_URL" -ForegroundColor Yellow
    Write-Host ""
}

# Check if node_modules exists
if (-not (Test-Path node_modules)) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
Write-Host ""

# Check if database connection is configured
$envContent = Get-Content .env -Raw
if ($envContent -notmatch 'DATABASE_URL="mysql://') {
    Write-Host "WARNING: DATABASE_URL not configured in .env file!" -ForegroundColor Red
    Write-Host "Please edit .env and set your MySQL connection string:" -ForegroundColor Yellow
    Write-Host 'DATABASE_URL="mysql://username:password@localhost:3306/database_name"' -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to continue after updating .env file..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Cyan
Write-Host "This will create all database tables." -ForegroundColor Yellow
Write-Host ""
$response = Read-Host "Continue? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    npx prisma migrate dev --name init
    Write-Host ""
    Write-Host "=== Setup Complete ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start the application: npm run dev" -ForegroundColor White
    Write-Host "2. Login with super admin:" -ForegroundColor White
    Write-Host "   Email: superadmin@admin.com" -ForegroundColor White
    Write-Host "   Password: superadmin123" -ForegroundColor White
    Write-Host ""
    Write-Host "To view database: npx prisma studio" -ForegroundColor Cyan
} else {
    Write-Host "Setup cancelled. Run migrations manually with: npx prisma migrate dev --name init" -ForegroundColor Yellow
}


# Automated Setup Script for Windows
# Run this: .\scripts\run-setup.ps1

Write-Host "=== Automated MySQL Setup ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check .env file
Write-Host "Step 1: Checking .env file..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=admin_panel_db
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "⚠️  Please edit .env and add your MySQL password!" -ForegroundColor Red
    Write-Host "   Then run this script again." -ForegroundColor Yellow
    exit
}

$envContent = Get-Content .env -Raw
if ($envContent -notmatch 'DB_PASSWORD=' -or $envContent -match 'DB_PASSWORD=\s*$') {
    Write-Host "⚠️  DB_PASSWORD not set in .env file!" -ForegroundColor Red
    Write-Host "   Please edit .env and add your MySQL password" -ForegroundColor Yellow
    exit
}

Write-Host "✅ .env file configured" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "Step 2: Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path node_modules)) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Step 3: Run setup script
Write-Host "Step 3: Running database setup..." -ForegroundColor Yellow
Write-Host "   This will test the connection and create super admin" -ForegroundColor Gray
Write-Host ""

node scripts/setup-mysql.js

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. If tables don't exist, run SQL script in MySQL:" -ForegroundColor White
Write-Host "   mysql -u root -p admin_panel_db < scripts/init-database.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the application:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray


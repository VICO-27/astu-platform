# ASTU Platform — Quick Start Setup Script (Windows PowerShell)
# This script automates the setup process for development

Write-Host "🚀 ASTU Platform Quick Start Setup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan

# Check Python
$pythonCheck = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python 3 not found. Please install Python 3.10+" -ForegroundColor Red
    exit 1
}
Write-Host "✓ $pythonCheck" -ForegroundColor Green

# Check Node
$nodeCheck = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node $nodeCheck" -ForegroundColor Green

# Check npm
$npmCheck = npm --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}
Write-Host "✓ npm $npmCheck" -ForegroundColor Green
Write-Host ""

# Backend Setup
Write-Host "⚙️  Setting up Backend..." -ForegroundColor Cyan
Set-Location backend

# Copy .env if it doesn't exist
if (-not (Test-Path .env)) {
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "⚠️  Created .env from .env.example" -ForegroundColor Yellow
        Write-Host "   Please edit backend\.env with your configuration" -ForegroundColor Yellow
    }
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path venv)) {
    Write-Host "Creating Python virtual environment..."
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
& "venv\Scripts\Activate.ps1"
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

# Install backend dependencies
Write-Host "Installing Python dependencies..."
pip install -q -r requirements.txt
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Run migrations
Write-Host "Running database migrations..."
python manage.py migrate --noinput
Write-Host "✓ Migrations completed" -ForegroundColor Green

Write-Host "✓ Backend setup complete" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Frontend Setup
Write-Host "🎨 Setting up Frontend..." -ForegroundColor Cyan
Set-Location frontend

# Install frontend dependencies
Write-Host "Installing npm packages..."
npm install --silent
Write-Host "✓ Packages installed" -ForegroundColor Green

Write-Host "✓ Frontend setup complete" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Final instructions
Write-Host "====================================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Configure Backend (if needed):" -ForegroundColor Yellow
Write-Host "   - Edit backend\.env with your settings"
Write-Host "   - Set GROQ_API_KEY if you have one"
Write-Host "   - Set GROQ_AI_MOCK=True to mock AI (no key needed)"
Write-Host ""
Write-Host "2️⃣  Start Backend:" -ForegroundColor Yellow
Write-Host "   cd backend"
Write-Host "   venv\Scripts\Activate.ps1"
Write-Host "   python manage.py runserver"
Write-Host "   Backend will run at http://localhost:8000"
Write-Host ""
Write-Host "3️⃣  Start Frontend (in another terminal):" -ForegroundColor Yellow
Write-Host "   cd frontend"
Write-Host "   npm run dev"
Write-Host "   Frontend will run at http://localhost:5173"
Write-Host ""
Write-Host "4️⃣  Open http://localhost:5173 in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "Full guide: See SETUP.md" -ForegroundColor Cyan
Write-Host ""

#!/bin/bash
# ASTU Platform — Quick Start Setup Script (macOS/Linux)
# This script automates the setup process for development

set -e  # Exit on error

echo "🚀 ASTU Platform Quick Start Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.10+${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python $(python3 --version | cut -d' ' -f2)${NC}"
echo -e "${GREEN}✓ Node $(node --version)${NC}"
echo -e "${GREEN}✓ npm $(npm --version)${NC}"
echo ""

# Backend Setup
echo "⚙️  Setting up Backend..."
cd backend

# Copy .env if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Created .env from .env.example${NC}"
        echo -e "${YELLOW}   Please edit backend/.env with your configuration${NC}"
    fi
fi

# Create virtual environment if it doesn't exist
if [ ! -d venv ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"

# Install backend dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput
echo -e "${GREEN}✓ Migrations completed${NC}"

echo -e "${GREEN}✓ Backend setup complete${NC}"
cd ..
echo ""

# Frontend Setup
echo "🎨 Setting up Frontend..."
cd frontend

# Install frontend dependencies
echo "Installing npm packages..."
npm install --silent
echo -e "${GREEN}✓ Packages installed${NC}"

echo -e "${GREEN}✓ Frontend setup complete${NC}"
cd ..
echo ""

# Final instructions
echo "════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "════════════════════════════════════════════════════"
echo ""
echo "📝 Next steps:"
echo ""
echo "1️⃣  Configure Backend (if needed):"
echo "   - Edit backend/.env with your settings"
echo "   - Set GROQ_API_KEY if you have one"
echo "   - Set GROQ_AI_MOCK=True to mock AI (no key needed)"
echo ""
echo "2️⃣  Start Backend:"
echo "   cd backend && source venv/bin/activate"
echo "   python manage.py runserver"
echo "   Backend will run at http://localhost:8000"
echo ""
echo "3️⃣  Start Frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo "   Frontend will run at http://localhost:5173"
echo ""
echo "4️⃣  Open http://localhost:5173 in your browser"
echo ""
echo "📚 Full guide: See SETUP.md"
echo ""

#!/bin/bash

# ============================================================================
# AQUA Guardian - Complete Setup Script (Linux/Mac)
# ============================================================================

echo "=========================================="
echo "AQUA Guardian - Complete Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "${GREEN}✓${NC} Python: $PYTHON_VERSION"
else
    echo "${RED}✗${NC} Python 3 not found. Please install Python 3.9+"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "${GREEN}✓${NC} npm: $NPM_VERSION"
else
    echo "${RED}✗${NC} npm not found"
    exit 1
fi

echo ""

# ============================================================================
# BACKEND SETUP
# ============================================================================
echo "🔧 Setting up Backend..."
cd backend || exit

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "  Creating Python virtual environment..."
    python3 -m venv .venv
    echo "${GREEN}✓${NC} Virtual environment created"
fi

# Activate virtual environment
echo "  Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "  Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "${GREEN}✓${NC} Backend dependencies installed"

# Check for .env
if [ ! -f ".env" ]; then
    echo "${YELLOW}⚠${NC} No .env file found"
    echo "  Please create backend/.env with your Supabase credentials"
    echo "  See backend/.env.example for template"
else
    echo "${GREEN}✓${NC} Environment file exists"
fi

cd ..
echo ""

# ============================================================================
# FRONTEND SETUP
# ============================================================================
echo "🎨 Setting up Frontend..."
cd frontend || exit

# Install dependencies
echo "  Installing npm dependencies..."
npm install --silent
echo "${GREEN}✓${NC} Frontend dependencies installed"

# Check for .env
if [ ! -f ".env" ]; then
    echo "${YELLOW}⚠${NC} No .env file found"
    echo "  Please create frontend/.env with your configuration"
    echo "  See frontend/.env.example for template"
else
    echo "${GREEN}✓${NC} Environment file exists"
fi

cd ..
echo ""

# ============================================================================
# BLOCKCHAIN SETUP (Optional)
# ============================================================================
echo "⛓️  Setting up Blockchain (optional)..."
if [ -d "blockchain" ]; then
    cd blockchain || exit
    
    if [ ! -d "node_modules" ]; then
        echo "  Installing Hardhat dependencies..."
        npm install --silent
        echo "${GREEN}✓${NC} Blockchain dependencies installed"
    else
        echo "${GREEN}✓${NC} Blockchain already set up"
    fi
    
    cd ..
else
    echo "${YELLOW}⚠${NC} No blockchain directory found (optional)"
fi

echo ""

# ============================================================================
# VERIFICATION
# ============================================================================
echo "🔍 Verifying setup..."

# Backend check
cd backend
source .venv/bin/activate
python -c "import fastapi; import torch; print('${GREEN}✓${NC} Backend imports OK')" 2>/dev/null || echo "${RED}✗${NC} Backend imports failed"
cd ..

# Frontend check
cd frontend
if [ -d "node_modules" ]; then
    echo "${GREEN}✓${NC} Frontend modules OK"
else
    echo "${RED}✗${NC} Frontend modules missing"
fi
cd ..

echo ""

# ============================================================================
# NEXT STEPS
# ============================================================================
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure Environment Variables:"
echo "   - backend/.env (Supabase, SMTP, Blockchain)"
echo "   - frontend/.env (Supabase, API URL)"
echo ""
echo "2. Start Backend:"
echo "   cd backend"
echo "   source .venv/bin/activate"
echo "   uvicorn main:app --reload"
echo ""
echo "3. Start Frontend (new terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "=========================================="

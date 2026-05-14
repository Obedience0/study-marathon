#!/bin/bash

# Study Marathon Deployment Script
# This script helps deploy the application to production

set -e

echo "🚀 Study Marathon Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "backend/app.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

if ! command_exists pip; then
    echo "❌ pip is not installed"
    exit 1
fi

# Setup virtual environment
echo "🐍 Setting up virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r backend/requirements.txt

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your production values"
fi

# Run database migrations
echo "🗄️  Setting up database..."
cd backend
python -c "from app import db; db.create_all(); print('✅ Database tables created')"

# Test the application
echo "🧪 Testing application..."
timeout 10s python app.py &
APP_PID=$!
sleep 5

if kill -0 $APP_PID 2>/dev/null; then
    echo "✅ Application started successfully"
    kill $APP_PID
else
    echo "❌ Application failed to start"
    exit 1
fi

cd ..

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your production configuration"
echo "2. Set up your production database (PostgreSQL recommended)"
echo "3. Configure your web server (nginx, apache, etc.)"
echo "4. Set up SSL certificates"
echo "5. Deploy to your hosting platform"
echo ""
echo "For detailed deployment instructions, see backend/README.md"
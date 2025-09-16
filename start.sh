#!/bin/bash

# FloatChat Startup Script
# This script starts both the backend and frontend servers

echo "🌊 Starting FloatChat - Ocean Data AI Assistant"
echo "=============================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if backend dependencies are installed
echo "🔍 Checking backend dependencies..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from template..."
    cp .env.template .env
    echo "🔑 Please edit backend/.env and add your DEEPSEEK_API_KEY"
    echo "💡 You can get an API key from: https://platform.deepseek.com/"
    read -p "Press Enter after you've added your API key to continue..."
fi

echo "🚀 Starting backend server..."
uvicorn app:app --reload &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Setup frontend
echo "🔍 Setting up frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "🚀 Starting frontend server..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ FloatChat is starting!"
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "👋 FloatChat stopped. Goodbye!"
    exit 0
}

# Set trap to catch Ctrl+C
trap cleanup INT

# Wait for either process to finish
wait
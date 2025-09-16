@echo off
echo 🌊 Starting FloatChat - Ocean Data AI Assistant
echo ==============================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    pause
    exit /b 1
)

echo 🔍 Setting up backend...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Creating .env file from template...
    copy .env.template .env
    echo 🔑 Please edit backend\.env and add your DEEPSEEK_API_KEY
    echo 💡 You can get an API key from: https://platform.deepseek.com/
    pause
)

echo 🚀 Starting backend server...
start "FloatChat Backend" cmd /k "venv\Scripts\activate.bat && uvicorn app:app --reload"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

echo 🔍 Setting up frontend...
cd ..\frontend

if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

echo 🚀 Starting frontend server...
start "FloatChat Frontend" cmd /k "npm start"

echo.
echo ✅ FloatChat is starting!
echo 🔗 Frontend: http://localhost:3000
echo 🔗 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit this window (servers will continue running)
pause >nul
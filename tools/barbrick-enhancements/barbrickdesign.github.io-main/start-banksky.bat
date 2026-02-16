@echo off
REM BankSky Local Development Launcher
REM Automatically sets up and starts BankSky backend services

echo 🚀 BankSky Local Development Launcher
echo ======================================

REM Check if Node.js is installed
echo 📦 Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    echo 📥 Please install Node.js from: https://nodejs.org/
    echo Press any key to open download page...
    pause >nul
    start https://nodejs.org/
    exit /b 1
)

echo ✅ Node.js found
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found!
    echo Please reinstall Node.js (npm is included)
    pause
    exit /b 1
)

echo ✅ npm found

REM Check if backend directory exists
if not exist "backend" (
    echo 📁 Creating backend directory...
    mkdir backend
)

cd backend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Dependency installation failed!
        echo Try running: npm install --force
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies already installed
)

echo 🚀 Starting BankSky backend services...
echo.
echo Services will be available at:
echo - Micro-tx:     http://localhost:3000
echo - Anchor:       http://localhost:3001
echo - Affiliate:    http://localhost:3002
echo - Relayer:      http://localhost:3003
echo - Command Exec: http://localhost:3005
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start services
npm run dev

pause

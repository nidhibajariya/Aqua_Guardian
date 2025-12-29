@echo off
REM AQUA Guardian - Frontend Startup Script for Windows
REM This script starts the Vite development server for the React frontend

echo ==========================================
echo AQUA Guardian - Starting Frontend Server
echo ==========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo WARNING: node_modules not found!
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Vite development server...
echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start Vite dev server
npm run dev

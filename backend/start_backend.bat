@echo off
REM AQUA Guardian - Backend Startup Script for Windows
REM This script activates the virtual environment and starts the FastAPI backend server

echo ==========================================
echo AQUA Guardian - Starting Backend Server
echo ==========================================
echo.

REM Check if virtual environment exists
if not exist ".venv\Scripts\python.exe" (
    echo ERROR: Virtual environment not found!
    echo Please run the setup first:
    echo   python -m venv .venv
    echo   .venv\Scripts\pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

REM Activate virtual environment and start server
echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Starting FastAPI server on http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start uvicorn server in a separate window to keep logs visible
echo Starting Uvicorn...
start "AQUA Guardian Backend" cmd /k "call .venv\Scripts\activate.bat && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload > startup_log.txt 2>&1"

echo Waiting for server to initialize...
:loop
timeout /t 2 >nul
powershell -Command "try { $res = Invoke-RestMethod -Uri http://127.0.0.1:8000/health; if ($res.status -eq 'healthy') { exit 0 } else { exit 1 } } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo Still waiting...
    goto loop
)

echo.
echo ✅ Backend is UP and Healthy!
echo API Documentation: http://127.0.0.1:8000/docs
echo.

REM Deactivate on exit
deactivate

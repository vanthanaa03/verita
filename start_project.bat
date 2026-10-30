@echo off
title Verita - Anonymous College Grievance System Launcher
cd /d "%~dp0"

echo ============================================================
echo   🚀 Starting Verita Development Server...
echo   --------------------------------------------------------
echo   Frontend URL: http://localhost:3000
echo   Backend API:  http://localhost:5000
echo ============================================================
echo.

:: Wait 5 seconds for Express & Vite servers to start, then open browser automatically
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

:: Start the project's development server (runs both Express server and Vite frontend)
call npm run dev

:: Keep the terminal window open if the process stops
pause

@echo off
title Brainyfy — Launcher
echo Starting Brainyfy...
echo.

:: Start backend in a new terminal
start "Brainyfy Backend" cmd /k ""%~dp0start-backend.bat""

:: Small delay so backend starts first
timeout /t 3 /nobreak >nul

:: Start frontend in a new terminal
start "Brainyfy Frontend" cmd /k ""%~dp0start-frontend.bat""

echo Both servers are starting in separate windows.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
pause

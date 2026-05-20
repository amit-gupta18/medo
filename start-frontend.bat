@echo off
title Brainyfy — Frontend
cd /d "%~dp0client"

:: Install dependencies if node_modules is missing
if not exist "node_modules" (
    echo [1/2] Installing npm dependencies...
    npm install
)

:: Start dev server
echo [2/2] Starting Next.js dev server on http://localhost:3000
echo.
npm run dev

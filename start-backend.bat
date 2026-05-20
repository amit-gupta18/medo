@echo off
title Brainyfy — Backend
cd /d "%~dp0server"

:: Create venv if it doesn't exist
if not exist "venv" (
    echo [1/4] Creating Python virtual environment...
    python -m venv venv
)

:: Activate venv
call venv\Scripts\activate

:: Install / update dependencies
echo [2/4] Installing dependencies...
pip install -r requirements.txt --quiet

:: Run Alembic migrations
echo [3/4] Running database migrations...
alembic upgrade head

:: Start server
echo [4/4] Starting FastAPI server on http://localhost:8000
echo.
uvicorn app.main:app --reload --port 8100

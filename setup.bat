@echo off
echo ========================================
echo AI Resume Matcher - Quick Setup
echo ========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from python.org
    pause
    exit /b 1
)

echo [1/4] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/4] Activating virtual environment...
call venv\Scripts\activate

echo [3/4] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [4/4] Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo.
    echo ========================================
    echo IMPORTANT: Setup your API key!
    echo ========================================
    echo.
    echo 1. Open the .env file
    echo 2. Replace 'your_groq_api_key_here' with your actual Groq API key
    echo 3. Get your API key from: https://console.groq.com/keys
    echo.
    echo After setting up your API key, run: python app.py
    echo ========================================
    pause
) else (
    echo .env file already exists, skipping...
    echo.
    echo ========================================
    echo Setup Complete!
    echo ========================================
    echo.
    echo Run the application with: python app.py
    echo Then open: http://localhost:5000
    echo ========================================
)

pause

@echo off
echo Starting AI Resume Matcher...
echo.

:: Activate virtual environment
if exist venv\Scripts\activate (
    call venv\Scripts\activate
) else (
    echo ERROR: Virtual environment not found!
    echo Please run setup.bat first
    pause
    exit /b 1
)

:: Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file with your GROQ_API_KEY
    echo You can copy .env.example to .env and add your key
    pause
    exit /b 1
)

:: Start the application
echo.
echo ========================================
echo Application starting...
echo Open your browser at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python app.py

pause

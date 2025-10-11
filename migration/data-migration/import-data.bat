@echo off
echo Italian Quiz App - Data Import Helper
echo ======================================
echo.

REM Check if PowerShell is available
powershell -Command "Write-Host 'PowerShell is available'" >nul 2>&1
if %errorlevel% neq 0 (
    echo PowerShell is not available on this system
    pause
    exit /b 1
)

echo Please provide the path to your exported JSON file:
echo    Example: C:\Users\YourName\Downloads\italian-vocab-export.json
echo.
set /p "importFile=Enter path: "

if not exist "%importFile%" (
    echo File not found: %importFile%
    pause
    exit /b 1
)

echo.
echo Would you like to do a dry run first? (y/n)
set /p "dryRun=Dry run: "

if /i "%dryRun%"=="y" (
    echo.
    echo Running dry run...
    powershell -ExecutionPolicy Bypass -File "import-data.ps1" -ImportFilePath "%importFile%" -DryRun
    echo.
    echo Dry run completed. Run again without dry run to apply changes.
) else (
    echo.
    echo This will modify your application data files!
    echo A backup will be created automatically.
    echo.
    echo Press any key to continue or Ctrl+C to cancel...
    pause >nul
    
    echo.
    echo Importing data...
    powershell -ExecutionPolicy Bypass -File "import-data.ps1" -ImportFilePath "%importFile%"
)

echo.
echo Press any key to exit...
pause >nul
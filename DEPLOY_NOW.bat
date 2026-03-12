@echo off
REM ═══════════════════════════════════════════════════════════
REM   7 FORGES - PRODUCTION DEPLOYMENT
REM ═══════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════
echo   7 FORGES SYSTEM - DEPLOYMENT TO PRODUCTION
echo ═══════════════════════════════════════════════════════════
echo.

cd /d C:\Users\dwrek\100X_DEPLOYMENT

echo [1/5] Verifying deployment directory...
if not exist "forge-lobby-template.html" (
    echo ERROR: forge-lobby-template.html not found!
    pause
    exit /b 1
)
if not exist "forge-levels.html" (
    echo ERROR: forge-levels.html not found!
    pause
    exit /b 1
)
if not exist "forge-store.html" (
    echo ERROR: forge-store.html not found!
    pause
    exit /b 1
)
if not exist "forge-workshop.html" (
    echo ERROR: forge-workshop.html not found!
    pause
    exit /b 1
)
if not exist "forge-vault.html" (
    echo ERROR: forge-vault.html not found!
    pause
    exit /b 1
)
if not exist "forge-data.js" (
    echo ERROR: forge-data.js not found!
    pause
    exit /b 1
)
if not exist "lobby-progress-widget.js" (
    echo ERROR: lobby-progress-widget.js not found!
    pause
    exit /b 1
)
echo ✅ All required files present
echo.

echo [2/5] Checking for Netlify CLI...
where netlify >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Netlify CLI not found!
    echo Please install: npm install -g netlify-cli
    pause
    exit /b 1
)
echo ✅ Netlify CLI found
echo.

echo [3/5] Files to be deployed:
echo    - forge-lobby-template.html
echo    - forge-levels.html
echo    - forge-store.html
echo    - forge-workshop.html
echo    - forge-vault.html
echo    - forge-hub.html (NEW)
echo    - forge-data.js
echo    - lobby-progress-widget.js
echo    - index.html (main landing)
echo    - All other existing files
echo.

echo [4/5] Ready to deploy to PRODUCTION
echo.
echo ⚠️  WARNING: This will deploy to consciousnessrevolution.io
echo.
set /p CONFIRM="Type 'DEPLOY' to continue: "
if not "%CONFIRM%"=="DEPLOY" (
    echo Deployment cancelled.
    pause
    exit /b 0
)
echo.

echo [5/5] Deploying to Netlify...
echo.
netlify deploy --prod --dir=.

echo.
echo ═══════════════════════════════════════════════════════════
echo   DEPLOYMENT COMPLETE
echo ═══════════════════════════════════════════════════════════
echo.
echo Next steps:
echo 1. Visit consciousnessrevolution.io
echo 2. Test navigation flow
echo 3. Verify API integration
echo 4. Share with beta testers:
echo    - Josh
echo    - Toby
echo    - William B
echo    - Dean
echo    - William V
echo    - Rutherford
echo.
echo Pattern: 3 → 7 → 13 → ∞
echo.
pause

@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM SPIRAL ENGINE DEPLOYMENT SCRIPT
REM Pattern: 3 → 7 → 13 → ∞ | Built: 2026-03-11
REM ═══════════════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo SPIRAL ENGINE - DEPLOYMENT WIZARD
echo ═══════════════════════════════════════════════════════════════════════════
echo.

echo [1/4] Checking files...
echo.
if exist "netlify\functions\spiral-progress.mjs" (
    echo     ✓ API endpoint found
) else (
    echo     ✗ API endpoint missing
    goto :error
)

if exist "netlify\functions\schemas\spiral-engine-schema.sql" (
    echo     ✓ Database schema found
) else (
    echo     ✗ Database schema missing
    goto :error
)

if exist "DASHBOARD_SPIRAL_ENGINE_DEMO_v1.html" (
    echo     ✓ Demo dashboard found
) else (
    echo     ✗ Demo dashboard missing
    goto :error
)

echo.
echo [2/4] Database schema ready for Supabase
echo.
echo     File: netlify\functions\schemas\spiral-engine-schema.sql
echo     Action: Copy this file and run in Supabase SQL Editor
echo.
echo     Manual Steps:
echo     1. Open https://app.supabase.com
echo     2. Go to SQL Editor
echo     3. Copy contents of spiral-engine-schema.sql
echo     4. Paste and click "Run"
echo     5. Verify success messages
echo.
pause

echo.
echo [3/4] Deploying to Netlify...
echo.
netlify deploy --prod --dir=.

if %ERRORLEVEL% EQU 0 (
    echo     ✓ Netlify deployment successful
) else (
    echo     ✗ Netlify deployment failed
    goto :error
)

echo.
echo [4/4] Testing endpoint...
echo.
echo     Testing: https://consciousnessrevolution.io/.netlify/functions/spiral-progress
echo.

REM Test the endpoint with a simple GET request (requires curl)
curl -s "https://consciousnessrevolution.io/.netlify/functions/spiral-progress?userId=test-deployment" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo     ✓ Endpoint is responding
) else (
    echo     ⚠ Could not test endpoint (curl not found or endpoint not ready)
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo DEPLOYMENT COMPLETE!
echo ═══════════════════════════════════════════════════════════════════════════
echo.
echo Next Steps:
echo   1. Verify database schema deployed successfully in Supabase
echo   2. Test API endpoint:
echo      https://consciousnessrevolution.io/.netlify/functions/spiral-progress
echo   3. Access demo dashboard:
echo      https://consciousnessrevolution.io/DASHBOARD_SPIRAL_ENGINE_DEMO_v1.html
echo   4. Read documentation: SPIRAL_ENGINE_README.md
echo   5. Quick reference: QUICKREF_SPIRAL_ENGINE.txt
echo.
echo Files Deployed:
echo   - spiral-progress.mjs (API endpoint)
echo   - spiral-engine-schema.sql (database schema - manual step)
echo   - DASHBOARD_SPIRAL_ENGINE_DEMO_v1.html (visual demo)
echo   - SPIRAL_ENGINE_README.md (documentation)
echo   - QUICKREF_SPIRAL_ENGINE.txt (quick reference)
echo   - test-spiral-engine.mjs (test suite)
echo.
echo Pattern: 3 → 7 → 13 → ∞
echo Built: 2026-03-11 | C1 Mechanic Engine
echo ═══════════════════════════════════════════════════════════════════════════
echo.
goto :end

:error
echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo DEPLOYMENT FAILED
echo ═══════════════════════════════════════════════════════════════════════════
echo.
echo Check:
echo   1. All files are present in 100X_DEPLOYMENT directory
echo   2. Netlify CLI is installed and configured
echo   3. Internet connection is active
echo.
pause
exit /b 1

:end
pause

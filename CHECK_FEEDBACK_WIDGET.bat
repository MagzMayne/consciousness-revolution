@echo off
REM Feedback Widget Deployment Verification
REM Run this after deploying to Netlify

echo.
echo ========================================
echo   FEEDBACK WIDGET DEPLOYMENT CHECK
echo ========================================
echo.

REM Check if widget file exists
if exist "components\feedback-widget.js" (
    echo [OK] Widget file exists: components/feedback-widget.js
) else (
    echo [ERROR] Widget file missing!
    exit /b 1
)

REM Check if backend function exists
if exist "netlify\functions\araya-feedback.mjs" (
    echo [OK] Backend function exists: netlify/functions/araya-feedback.mjs
) else (
    echo [ERROR] Backend function missing!
    exit /b 1
)

REM Check if test page exists
if exist "test-feedback-widget.html" (
    echo [OK] Test page exists: test-feedback-widget.html
) else (
    echo [WARNING] Test page missing (optional)
)

echo.
echo ========================================
echo   FILE VERIFICATION COMPLETE
echo ========================================
echo.

REM Instructions
echo NEXT STEPS:
echo.
echo 1. Deploy to Netlify:
echo    cd %CD%
echo    netlify deploy --prod --dir=.
echo.
echo 2. Add to pages (before closing ^</body^> tag):
echo    ^<script src="/components/feedback-widget.js"^>^</script^>
echo.
echo 3. Test on live site:
echo    Visit: https://consciousnessrevolution.io/test-feedback-widget.html
echo    Look for 📝 button in bottom-left corner
echo    Submit test feedback
echo.
echo 4. Verify in Supabase:
echo    Check araya_feedback table for new entries
echo.

pause

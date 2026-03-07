@echo off
REM ═══════════════════════════════════════════════════════════════
REM ARAYA Auth & Paywall Deployment Script
REM Built: March 6, 2026 by C1 Mechanic
REM ═══════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════
echo  ARAYA AUTH DEPLOYMENT
echo ═══════════════════════════════════════════════════════════════
echo.

cd /d C:\Users\dwrek\100X_DEPLOYMENT

echo [1/6] Checking git status...
git status --short

echo.
echo [2/6] New files created:
echo   - netlify/functions/araya-session.mjs (JWT sessions)
echo   - beta-signup.html (Beta signup page)
echo   - ARAYA_COMMANDER_DETECTION_PATCH.js (Integration guide)
echo   - Desktop/1_COMMAND/ARAYA_AUTH_IMPLEMENTATION_ROADMAP.md (Full docs)
echo.

echo [3/6] MANUAL STEPS REQUIRED:
echo.
echo   A. Add to Netlify Environment Variables:
echo      - COMMANDER_SECRET=Kill50780630#
echo      - JWT_SECRET=(generate: openssl rand -hex 32)
echo.
echo   B. Apply Commander Detection Patch:
echo      - Open: netlify/functions/araya-chat.mjs
echo      - Follow: ARAYA_COMMANDER_DETECTION_PATCH.js instructions
echo.
echo   C. Update beta-signup.html:
echo      - Replace: YOUR_STRIPE_PUBLISHABLE_KEY_HERE
echo      - With your actual Stripe publishable key
echo.
echo   D. Create Stripe Price (if not exists):
echo      - stripe prices create --product prod_XXX --unit-amount 900 --currency usd --recurring[interval]=month
echo      - Save price ID for beta-signup.html
echo.

echo [4/6] Ready to commit? (Y/N)
set /p COMMIT_CONFIRM="> "

if /i "%COMMIT_CONFIRM%" NEQ "Y" (
    echo Deployment cancelled.
    pause
    exit /b
)

echo.
echo [5/6] Committing changes...
git add netlify/functions/araya-session.mjs
git add beta-signup.html
git add ARAYA_COMMANDER_DETECTION_PATCH.js
git add Desktop/1_COMMAND/ARAYA_AUTH_IMPLEMENTATION_ROADMAP.md
git commit -m "ARAYA: Auth infrastructure - Session management + Beta signup + Commander multi-detection"

echo.
echo [6/6] Deploying to Netlify...
echo.
echo OPTION 1: Deploy to production (recommended after testing):
echo   netlify deploy --prod --dir=.
echo.
echo OPTION 2: Deploy to preview first:
echo   netlify deploy --dir=.
echo.

pause

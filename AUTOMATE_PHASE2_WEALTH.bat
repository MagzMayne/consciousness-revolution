@echo off
REM PHASE 2 AUTOMATION - WEALTH.HTML STANDARDIZATION
REM C1 MECHANIC - Batch operation for speed

echo ========================================
echo PHASE 2: WEALTH.HTML STANDARDIZATION
echo ========================================
echo.
echo This script will:
echo 1. Backup current Wealth.html
echo 2. Show you what needs to be replaced
echo 3. Guide you through each section
echo.
pause

REM Backup
echo Creating backup...
copy Wealth.html Wealth.html.backup
echo ✓ Backup created: Wealth.html.backup
echo.

echo ========================================
echo MANUAL STEPS REQUIRED
echo ========================================
echo.
echo STEP 1: ADD CSS CLASSES
echo ------------------------
echo Location: After line 303 (before closing style tag)
echo.
echo Action: Open Wealth.html in editor
echo        Copy ALL CSS from: standard_css_blocks.txt
echo        Paste after line 303
echo        Find-Replace: #e74c3c → #f1c40f
echo        Find-Replace: rgba(231, 76, 60 → rgba(241, 196, 15
echo.
pause

echo.
echo STEP 2: JOURNEY TRIPTYCH
echo ------------------------
echo Location: Lines 458-478
echo Action: Replace inline-styled journey section
echo        See: SPEED_RUN_PHASE2_FORGE_STANDARDIZATION.md (Section 1B)
echo.
pause

echo.
echo STEP 3: WORLD ENGINE
echo ------------------------
echo Location: Lines 481-512
echo Action: Upgrade to Problem/Shift/Vision structure
echo        See: SPEED_RUN_PHASE2_FORGE_STANDARDIZATION.md (Section 1C)
echo.
pause

echo.
echo STEP 4: NEWS PULSE
echo ------------------------
echo Location: Lines 514-538
echo Action: Add category-based news structure
echo        See: SPEED_RUN_PHASE2_FORGE_STANDARDIZATION.md (Section 1D)
echo.
pause

echo.
echo STEP 5: WHAT BELONGS
echo ------------------------
echo Location: Lines 657-686
echo Action: Replace with tiered Free/Team/Personal structure
echo        See: SPEED_RUN_PHASE2_FORGE_STANDARDIZATION.md (Section 1E)
echo.
pause

echo.
echo ========================================
echo VERIFICATION
echo ========================================
echo.
echo Starting local server for testing...
netlify dev

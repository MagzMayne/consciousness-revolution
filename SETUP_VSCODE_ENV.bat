@echo off
REM ═══════════════════════════════════════════════════════════════════════════════
REM GEMBOT UNIVERSE KEY - VS CODE ENVIRONMENT SETUP
REM ═══════════════════════════════════════════════════════════════════════════════
REM Automatically downloads and configures VS Code with required extensions
REM Copyright © 2024-2025 Ryan Barbrick / Barbrick Design
REM ═══════════════════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo  GEMBOT UNIVERSE KEY - VS CODE ENVIRONMENT SETUP
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo  This script will:
echo  1. Download VS Code portable edition (if not found)
echo  2. Install required extensions (GitHub Copilot, Python, Arduino)
echo  3. Configure workspace settings for GemBot development
echo  4. Open the project in VS Code
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo.

REM Get USB drive letter
set USB_DRIVE=%~d0
set USB_ROOT=%USB_DRIVE%\
set VSCODE_DIR=%USB_ROOT%VSCode-Portable
set PROJECT_DIR=%USB_ROOT%GEMBOT_PROJECT

echo [INFO] USB Drive: %USB_DRIVE%
echo [INFO] VS Code Location: %VSCODE_DIR%
echo [INFO] Project Location: %PROJECT_DIR%
echo.

REM Check if VS Code already exists
if exist "%VSCODE_DIR%\Code.exe" (
    echo [OK] VS Code found at %VSCODE_DIR%
    goto :LAUNCH_VSCODE
)

echo [INFO] VS Code not found. Starting download...
echo.

REM Create temp directory
set TEMP_DIR=%USB_ROOT%temp
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Download VS Code portable
echo [DOWNLOAD] Fetching VS Code portable edition...
echo [INFO] Download URL: https://code.visualstudio.com/sha/download?build=stable^&os=win32-x64-archive
echo.

REM Use PowerShell to download (built into Windows 10+)
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-archive' -OutFile '%TEMP_DIR%\vscode.zip'}"

if errorlevel 1 (
    echo [ERROR] Download failed. Check internet connection.
    echo [INFO] You can manually download from: https://code.visualstudio.com/download
    echo [INFO] Extract to: %VSCODE_DIR%
    pause
    exit /b 1
)

echo [OK] Download complete!
echo.

REM Extract VS Code
echo [EXTRACT] Extracting VS Code...
powershell -Command "Expand-Archive -Path '%TEMP_DIR%\vscode.zip' -DestinationPath '%VSCODE_DIR%' -Force"

if errorlevel 1 (
    echo [ERROR] Extraction failed.
    pause
    exit /b 1
)

echo [OK] VS Code extracted successfully!
echo.

REM Clean up
echo [CLEANUP] Removing temporary files...
del /Q "%TEMP_DIR%\vscode.zip"
rmdir /Q "%TEMP_DIR%"
echo.

:LAUNCH_VSCODE
echo [INFO] Launching VS Code...
echo.

REM Create data directory for portable mode
if not exist "%VSCODE_DIR%\data" mkdir "%VSCODE_DIR%\data"

REM Install extensions
echo [EXTENSIONS] Installing recommended extensions...
echo.

REM GitHub Copilot
echo [1/5] GitHub.copilot
"%VSCODE_DIR%\bin\code.cmd" --install-extension GitHub.copilot --force

REM Python
echo [2/5] ms-python.python
"%VSCODE_DIR%\bin\code.cmd" --install-extension ms-python.python --force

REM Arduino
echo [3/5] vsciot-vscode.vscode-arduino
"%VSCODE_DIR%\bin\code.cmd" --install-extension vsciot-vscode.vscode-arduino --force

REM Prettier (Code formatter)
echo [4/5] esbenp.prettier-vscode
"%VSCODE_DIR%\bin\code.cmd" --install-extension esbenp.prettier-vscode --force

REM Live Server
echo [5/5] ritwickdey.LiveServer
"%VSCODE_DIR%\bin\code.cmd" --install-extension ritwickdey.LiveServer --force

echo.
echo [OK] Extensions installed!
echo.

REM Create workspace settings
set SETTINGS_DIR=%PROJECT_DIR%\.vscode
if not exist "%SETTINGS_DIR%" mkdir "%SETTINGS_DIR%"

echo [CONFIG] Creating workspace settings...

REM Create settings.json
(
echo {
echo   "editor.formatOnSave": true,
echo   "editor.tabSize": 4,
echo   "files.autoSave": "afterDelay",
echo   "files.autoSaveDelay": 1000,
echo   "liveServer.settings.port": 8080,
echo   "liveServer.settings.root": "/",
echo   "arduino.path": "%USB_ROOT%Arduino",
echo   "arduino.commandPath": "arduino_debug.exe",
echo   "python.defaultInterpreterPath": "python",
echo   "github.copilot.enable": {
echo     "*": true,
echo     "plaintext": true,
echo     "markdown": true
echo   }
echo }
) > "%SETTINGS_DIR%\settings.json"

REM Create extensions.json (recommendations)
(
echo {
echo   "recommendations": [
echo     "github.copilot",
echo     "ms-python.python",
echo     "vsciot-vscode.vscode-arduino",
echo     "esbenp.prettier-vscode",
echo     "ritwickdey.liveserver"
echo   ]
echo }
) > "%SETTINGS_DIR%\extensions.json"

echo [OK] Workspace configured!
echo.

REM Open project in VS Code
echo [LAUNCH] Opening GemBot project in VS Code...
echo.
start "" "%VSCODE_DIR%\Code.exe" "%PROJECT_DIR%"

echo ═══════════════════════════════════════════════════════════════════════════════
echo  VS CODE SETUP COMPLETE!
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo  VS Code is now running with your GemBot project.
echo.
echo  Quick Tips:
echo  - Press Ctrl+` to open terminal
echo  - Press F5 to run/debug
echo  - Right-click HTML file ^> Open with Live Server
echo  - GitHub Copilot: Start typing for AI suggestions
echo.
echo  Project Location: %PROJECT_DIR%
echo  VS Code Location: %VSCODE_DIR%
echo.
echo ═══════════════════════════════════════════════════════════════════════════════

timeout /t 5
exit /b 0

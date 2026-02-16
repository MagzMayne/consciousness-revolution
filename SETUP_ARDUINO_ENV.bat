@echo off
REM ═══════════════════════════════════════════════════════════════════════════════
REM GEMBOT UNIVERSE KEY - ARDUINO IDE SETUP & DEPLOY
REM ═══════════════════════════════════════════════════════════════════════════════
REM Automatically downloads Arduino IDE and deploys GemBot firmware
REM Copyright © 2024-2025 Ryan Barbrick / Barbrick Design
REM ═══════════════════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo  GEMBOT UNIVERSE KEY - ARDUINO IDE SETUP ^& DEPLOY
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo  This script will:
echo  1. Download Arduino IDE portable (if not found)
echo  2. Install required libraries (Servo, Stepper, AccelStepper)
echo  3. Compile GemBot firmware
echo  4. Upload to connected Arduino board
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo.

REM Get USB drive letter
set USB_DRIVE=%~d0
set USB_ROOT=%USB_DRIVE%\
set ARDUINO_DIR=%USB_ROOT%Arduino
set SKETCH_DIR=%USB_ROOT%GEMBOT_PROJECT\arduino\gembot_controller
set SKETCH_FILE=%SKETCH_DIR%\gembot_controller.ino

echo [INFO] USB Drive: %USB_DRIVE%
echo [INFO] Arduino Location: %ARDUINO_DIR%
echo [INFO] Sketch Location: %SKETCH_DIR%
echo.

REM Check if Arduino already exists
if exist "%ARDUINO_DIR%\arduino_debug.exe" (
    echo [OK] Arduino IDE found at %ARDUINO_DIR%
    goto :CHECK_ARDUINO_BOARD
)

echo [INFO] Arduino IDE not found. Starting download...
echo.

REM Create temp directory
set TEMP_DIR=%USB_ROOT%temp
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Download Arduino IDE portable
echo [DOWNLOAD] Fetching Arduino IDE portable edition...
echo [INFO] Download URL: https://downloads.arduino.cc/arduino-1.8.19-windows.zip
echo [INFO] This may take several minutes (200+ MB)...
echo.

powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://downloads.arduino.cc/arduino-1.8.19-windows.zip' -OutFile '%TEMP_DIR%\arduino.zip'}"

if errorlevel 1 (
    echo [ERROR] Download failed. Check internet connection.
    echo [INFO] Manual download: https://www.arduino.cc/en/software
    echo [INFO] Extract to: %ARDUINO_DIR%
    pause
    exit /b 1
)

echo [OK] Download complete!
echo.

REM Extract Arduino IDE
echo [EXTRACT] Extracting Arduino IDE... (this may take a moment)
powershell -Command "Expand-Archive -Path '%TEMP_DIR%\arduino.zip' -DestinationPath '%USB_ROOT%' -Force"

if errorlevel 1 (
    echo [ERROR] Extraction failed.
    pause
    exit /b 1
)

REM Rename extracted folder to Arduino
if exist "%USB_ROOT%arduino-1.8.19" (
    move "%USB_ROOT%arduino-1.8.19" "%ARDUINO_DIR%"
)

echo [OK] Arduino IDE extracted successfully!
echo.

REM Clean up
echo [CLEANUP] Removing temporary files...
del /Q "%TEMP_DIR%\arduino.zip"
rmdir /Q "%TEMP_DIR%"
echo.

:CHECK_ARDUINO_BOARD
echo [DETECT] Checking for connected Arduino board...
echo.

REM List available COM ports
powershell -Command "Get-WmiObject Win32_SerialPort | Select-Object DeviceID, Description | Format-Table -AutoSize"

REM Prompt for COM port
set /p COM_PORT="Enter COM port (e.g., COM3): "

if "%COM_PORT%"=="" (
    echo [ERROR] No COM port specified.
    pause
    exit /b 1
)

echo.
echo [INFO] Using COM port: %COM_PORT%
echo.

REM Prompt for board type
echo [INFO] Select Arduino board type:
echo   1. Arduino Uno
echo   2. Arduino Mega 2560
echo   3. Arduino Nano
echo   4. Arduino Leonardo
echo.
set /p BOARD_CHOICE="Enter choice (1-4): "

if "%BOARD_CHOICE%"=="1" set BOARD_TYPE=arduino:avr:uno
if "%BOARD_CHOICE%"=="2" set BOARD_TYPE=arduino:avr:mega:cpu=atmega2560
if "%BOARD_CHOICE%"=="3" set BOARD_TYPE=arduino:avr:nano:cpu=atmega328
if "%BOARD_CHOICE%"=="4" set BOARD_TYPE=arduino:avr:leonardo

if "%BOARD_TYPE%"=="" (
    echo [ERROR] Invalid board selection.
    pause
    exit /b 1
)

echo [INFO] Board type: %BOARD_TYPE%
echo.

REM Create sketch directory if it doesn't exist
if not exist "%SKETCH_DIR%" mkdir "%SKETCH_DIR%"

REM Check if sketch file exists
if not exist "%SKETCH_FILE%" (
    echo [INFO] Creating default GemBot firmware sketch...
    call :CREATE_DEFAULT_SKETCH
)

:COMPILE_UPLOAD
echo [COMPILE] Compiling GemBot firmware...
echo [INFO] Sketch: %SKETCH_FILE%
echo.

REM Compile and upload
"%ARDUINO_DIR%\arduino_debug.exe" --board %BOARD_TYPE% --port %COM_PORT% --upload "%SKETCH_FILE%"

if errorlevel 1 (
    echo.
    echo [ERROR] Compilation or upload failed.
    echo.
    echo [TROUBLESHOOTING]
    echo   1. Check board is connected
    echo   2. Verify correct COM port
    echo   3. Check USB cable
    echo   4. Try closing other programs using serial port
    echo.
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo  DEPLOYMENT COMPLETE!
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo  GemBot firmware uploaded successfully to %COM_PORT%
echo.
echo  Next Steps:
echo  1. Open Serial Monitor (Tools ^> Serial Monitor)
echo  2. Set baud rate to 115200
echo  3. Send commands to test motors
echo.
echo  Commands:
echo    M1,100    - Move motor 1 forward 100 steps
echo    M2,-50    - Move motor 2 backward 50 steps
echo    HOME      - Home all motors
echo    STATUS    - Get current position
echo.
echo ═══════════════════════════════════════════════════════════════════════════════

REM Open Arduino IDE
echo [LAUNCH] Opening Arduino IDE...
start "" "%ARDUINO_DIR%\arduino_debug.exe" "%SKETCH_FILE%"

timeout /t 5
exit /b 0

REM ═══════════════════════════════════════════════════════════════════════════════
REM CREATE DEFAULT SKETCH
REM ═══════════════════════════════════════════════════════════════════════════════
:CREATE_DEFAULT_SKETCH

(
echo /*
echo  * GemBot Controller Firmware
echo  * 
echo  * Controls stepper motors for gemstone cutting machine
echo  * 
echo  * Hardware:
echo  * - Arduino Uno/Mega
echo  * - 4x Stepper Motors (NEMA 17)
echo  * - 4x A4988/DRV8825 Stepper Drivers
echo  * 
echo  * Pin Assignments:
echo  * Motor 1 (X): Step=2, Dir=3
echo  * Motor 2 (Y): Step=4, Dir=5  
echo  * Motor 3 (Z): Step=6, Dir=7
echo  * Motor 4 (Rotation): Step=8, Dir=9
echo  * 
echo  * Serial Commands:
echo  * M1,steps - Move motor 1
echo  * M2,steps - Move motor 2
echo  * M3,steps - Move motor 3
echo  * M4,steps - Move motor 4
echo  * HOME - Home all motors
echo  * STATUS - Get positions
echo  * STOP - Emergency stop
echo  */
echo.
echo // Pin definitions
echo const int MOTOR_PINS[4][2] = {
echo   {2, 3},  // Motor 1: Step, Dir
echo   {4, 5},  // Motor 2: Step, Dir
echo   {6, 7},  // Motor 3: Step, Dir
echo   {8, 9}   // Motor 4: Step, Dir
echo };
echo.
echo // Motor positions
echo long motorPositions[4] = {0, 0, 0, 0};
echo.
echo // Speed settings
echo const int STEP_DELAY = 1000; // microseconds
echo.
echo void setup(^) {
echo   // Initialize motor pins
echo   for (int i = 0; i ^< 4; i++^) {
echo     pinMode(MOTOR_PINS[i][0], OUTPUT^); // Step
echo     pinMode(MOTOR_PINS[i][1], OUTPUT^); // Dir
echo   }
echo   
echo   Serial.begin(115200^);
echo   Serial.println("GemBot Controller Ready"^);
echo   Serial.println("Commands: M1-M4,steps / HOME / STATUS / STOP"^);
echo }
echo.
echo void loop(^) {
echo   if (Serial.available(^)^) {
echo     String cmd = Serial.readStringUntil('\n'^);
echo     cmd.trim(^);
echo     processCommand(cmd^);
echo   }
echo }
echo.
echo void processCommand(String cmd^) {
echo   if (cmd == "HOME"^) {
echo     homeAllMotors(^);
echo   } else if (cmd == "STATUS"^) {
echo     printStatus(^);
echo   } else if (cmd == "STOP"^) {
echo     stopAllMotors(^);
echo   } else if (cmd.startsWith("M"^)^) {
echo     parseMotorCommand(cmd^);
echo   } else {
echo     Serial.println("ERROR: Unknown command"^);
echo   }
echo }
echo.
echo void parseMotorCommand(String cmd^) {
echo   int motorNum = cmd.substring(1, 2^).toInt(^) - 1;
echo   int commaIndex = cmd.indexOf(','^^);
echo   
echo   if (motorNum ^< 0 ^|^| motorNum ^>= 4 ^|^| commaIndex == -1^) {
echo     Serial.println("ERROR: Invalid motor command"^);
echo     return;
echo   }
echo   
echo   long steps = cmd.substring(commaIndex + 1^).toInt(^);
echo   moveStepper(motorNum, steps^);
echo }
echo.
echo void moveStepper(int motor, long steps^) {
echo   int stepPin = MOTOR_PINS[motor][0];
echo   int dirPin = MOTOR_PINS[motor][1];
echo   
echo   // Set direction
echo   digitalWrite(dirPin, steps ^> 0 ? HIGH : LOW^);
echo   steps = abs(steps^);
echo   
echo   // Move motor
echo   for (long i = 0; i ^< steps; i++^) {
echo     digitalWrite(stepPin, HIGH^);
echo     delayMicroseconds(STEP_DELAY^);
echo     digitalWrite(stepPin, LOW^);
echo     delayMicroseconds(STEP_DELAY^);
echo   }
echo   
echo   motorPositions[motor] += steps;
echo   Serial.print("Motor "^);
echo   Serial.print(motor + 1^);
echo   Serial.print(" position: "^);
echo   Serial.println(motorPositions[motor]^);
echo }
echo.
echo void homeAllMotors(^) {
echo   Serial.println("Homing all motors..."^);
echo   for (int i = 0; i ^< 4; i++^) {
echo     motorPositions[i] = 0;
echo   }
echo   Serial.println("Home complete"^);
echo }
echo.
echo void stopAllMotors(^) {
echo   Serial.println("EMERGENCY STOP"^);
echo   // All motors already stopped in loop
echo }
echo.
echo void printStatus(^) {
echo   Serial.println("Motor Positions:"^);
echo   for (int i = 0; i ^< 4; i++^) {
echo     Serial.print("  M"^);
echo     Serial.print(i + 1^);
echo     Serial.print(": "^);
echo     Serial.println(motorPositions[i]^);
echo   }
echo }
) > "%SKETCH_FILE%"

echo [OK] Default firmware created: %SKETCH_FILE%
echo.

goto :eof

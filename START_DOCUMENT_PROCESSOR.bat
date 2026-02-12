@echo off
echo =====================================================
echo STARTING DOCUMENT PROCESSOR API
echo =====================================================
echo.
echo This service enables document upload and analysis
echo for all Seven Domains tools
echo.
echo API will be available at: http://localhost:5555
echo.
echo Press Ctrl+C to stop the service
echo =====================================================
echo.

python DOCUMENT_PROCESSOR.py

pause

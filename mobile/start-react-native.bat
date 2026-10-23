@echo off
echo ========================================================
echo   Starting RevGOAT Pure React Native Mobile App
echo ========================================================
echo.
cd /d "%~dp0"
echo Starting Expo React Native bundler...
echo Scan the QR code with 'Expo Go' app on your phone!
echo.
call npx expo start
pause

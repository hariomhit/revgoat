@echo off
echo ========================================================
echo   RevGOAT - Building Standalone Android APK (No Studio)
echo ========================================================
echo.

echo [1/3] Building Web Distribution Files...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Web build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Syncing Capacitor Native Android Project...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo Error: Capacitor sync failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Compiling Native Android APK with Gradle...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo Error: Gradle APK compilation failed.
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "RevGOAT-App.apk" >nul
    echo.
    echo ========================================================
    echo   SUCCESS! Android APK Generated Successfully!
    echo   File Location: RevGOAT-App.apk (In this root folder)
    echo ========================================================
    echo.
    echo Aap is "RevGOAT-App.apk" file ko WhatsApp, Drive ya Cable
    echo se phone me send karke 1-click me install kar sakte hain!
    echo.
) else (
    echo Error: APK file could not be found.
)

pause

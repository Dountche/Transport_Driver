@echo off
echo ========================================
echo   Transport Driver - Application Chauffeur
echo ========================================
echo.
echo Demarrage de l'application...
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installe!
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si npm est installé
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: npm n'est pas installe!
    pause
    exit /b 1
)

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo Installation des dependances...
    npm install
    if %errorlevel% neq 0 (
        echo ERREUR: Echec de l'installation des dependances!
        pause
        exit /b 1
    )
)

echo.
echo Demarrage de l'application Expo...
echo.
echo Options disponibles:
echo 1. Android
echo 2. iOS (nécessite macOS)
echo 3. Web
echo 4. Tunnel (pour test sur appareil physique)
echo.

set /p choice="Choisissez une option (1-4): "

if "%choice%"=="1" (
    echo Demarrage pour Android...
    npm run android
) else if "%choice%"=="2" (
    echo Demarrage pour iOS...
    npm run ios
) else if "%choice%"=="3" (
    echo Demarrage pour Web...
    npm run web
) else if "%choice%"=="4" (
    echo Demarrage en mode tunnel...
    npx expo start --tunnel
) else (
    echo Option invalide!
    pause
    exit /b 1
)

echo.
echo Application demarree!
echo.
pause

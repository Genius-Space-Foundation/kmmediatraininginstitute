@echo off
REM Firebase Setup Script for KM Media Application (Windows)
REM This script helps automate the Firebase project setup process

echo.
echo 🔥 Firebase Setup Script for KM Media Application
echo =================================================
echo.

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [SUCCESS] Node.js is installed
node --version

REM Check if Firebase CLI is installed
echo.
echo [INFO] Checking Firebase CLI installation...
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Firebase CLI is not installed
    echo Please install it using: npm install -g firebase-tools
    pause
    exit /b 1
)
echo [SUCCESS] Firebase CLI is installed
firebase --version

REM Install Firebase dependencies
echo.
echo [INFO] Installing Firebase dependencies...

REM Backend dependencies
if exist "server" (
    echo [INFO] Installing backend dependencies...
    cd server
    npm install firebase-admin
    cd ..
    echo [SUCCESS] Backend dependencies installed
) else (
    echo [WARNING] Server directory not found, skipping backend dependencies
)

REM Frontend dependencies
if exist "client" (
    echo [INFO] Installing frontend dependencies...
    cd client
    npm install firebase
    cd ..
    echo [SUCCESS] Frontend dependencies installed
) else (
    echo [WARNING] Client directory not found, skipping frontend dependencies
)

REM Create environment files
echo.
echo [INFO] Creating environment configuration files...

REM Backend environment file
if exist "server" (
    if not exist "server\.env" (
        copy "server\env.firebase.example" "server\.env" >nul
        echo [SUCCESS] Created server\.env from template
        echo [WARNING] Please update server\.env with your Firebase credentials
    ) else (
        echo [WARNING] server\.env already exists, skipping creation
    )
)

REM Frontend environment file
if exist "client" (
    if not exist "client\.env" (
        copy "client\env.firebase.example" "client\.env" >nul
        echo [SUCCESS] Created client\.env from template
        echo [WARNING] Please update client\.env with your Firebase credentials
    ) else (
        echo [WARNING] client\.env already exists, skipping creation
    )
)

REM Initialize Firebase project
echo.
echo [INFO] Initializing Firebase project...
if exist "firebase.json" (
    echo [WARNING] firebase.json already exists, skipping initialization
) else (
    firebase init firestore --project default
    echo [SUCCESS] Firebase project initialized
)

REM Deploy security rules
echo.
echo [INFO] Deploying Firestore security rules...
if exist "firestore.rules" (
    firebase deploy --only firestore:rules
    echo [SUCCESS] Security rules deployed
) else (
    echo [WARNING] firestore.rules not found, skipping deployment
    echo Please copy the rules from server\migration\firestore-security-rules.rules to firestore.rules
)

REM Test Firebase connection
echo.
echo [INFO] Testing Firebase connection...
if exist "server\test-firebase-connection.js" (
    cd server
    node test-firebase-connection.js
    cd ..
    echo [SUCCESS] Firebase connection test completed
) else (
    echo [WARNING] Firebase connection test script not found
)

echo.
echo [SUCCESS] Firebase setup completed!
echo.
echo Next steps:
echo 1. Update your environment files with Firebase credentials
echo 2. Run the data migration scripts
echo 3. Test your application
echo.
echo For detailed instructions, see FIREBASE_SETUP_GUIDE.md
echo.
pause


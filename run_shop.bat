@echo off
TITLE Gojo Void Shop - Deployment Script
echo ==========================================
echo    INITIALIZING GOJO VOID SHOP SYSTEM
echo ==========================================

:: Step 1: Install Backend Dependencies & Setup Database
echo [1/4] Setting up Backend...
cd backend
call npm install
echo [2/4] Generating Cursed Energy (Database)...
call npx prisma generate
call npx prisma db push --accept-data-loss
echo [3/4] Seeding Special Grade Artifacts...
call npm run seed
cd ..

:: Step 2: Install Frontend Dependencies
echo [4/4] Setting up Frontend...
cd frontend
call npm install
cd ..

echo ==========================================
echo    SETUP COMPLETE! OPENING PROJECT...
echo ==========================================

:: Step 3: Launch Backend in a new window
start cmd /k "title Gojo Backend API && cd backend && npm run dev"

:: Step 4: Launch Frontend in a new window
start cmd /k "title Gojo Frontend UI && cd frontend && npm run dev"

echo System is running!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause

@echo off
TITLE Gojo Void Shop - Start Servers
echo ==========================================
echo    STARTING GOJO VOID SHOP
echo ==========================================

:: Step 1: Launch Backend in a new window
echo [1/3] Starting Backend API...
start cmd /k "title Gojo Backend API && cd backend && npm run dev"

:: Step 2: Launch Frontend in a new window
echo [2/3] Starting Frontend UI...
start cmd /k "title Gojo Frontend UI && cd frontend && npm run dev"

:: Step 3: Launch Cloudflare Tunnel
echo [3/3] Starting Cloudflare Tunnel...
start cmd /k "title Cloudflare Tunnel && cloudflared tunnel run goroforums"

echo ==========================================
echo System is running!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ==========================================
pause

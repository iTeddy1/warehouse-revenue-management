@echo off
echo ================================
echo Dang khoi dong phan mem Quan Ly kho va doanh thu...
echo ================================

docker compose up -d

timeout /t 5 >nul
start http://localhost:3000

echo ✅ Phan mem da san sang tai http://localhost:3000
echo De dung ung dung, chay file stop_app.bat
pause

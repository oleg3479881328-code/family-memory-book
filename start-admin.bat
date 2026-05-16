@echo off
cd /d "%~dp0"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":8765 .*LISTENING"') do (
  taskkill /PID %%p /F >nul 2>nul
)
start "" http://127.0.0.1:8765/
start "" http://127.0.0.1:8765/admin/
python tools\admin_server.py

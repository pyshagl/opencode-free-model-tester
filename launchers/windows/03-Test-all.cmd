@echo off
chcp 65001 >nul
cd /d "%~dp0..\.."
node src\cli.mjs --run --limit=200
if errorlevel 1 echo ERROR: Check Node.js 20+ and OpenCode CLI. See docs.
pause

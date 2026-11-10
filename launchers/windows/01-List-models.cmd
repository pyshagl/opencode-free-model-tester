@echo off
chcp 65001 >nul
cd /d "%~dp0..\.."
node src\cli.mjs
if errorlevel 1 echo ERROR: Please install Node.js 20+ and OpenCode CLI. See README.ru.md / README.md
pause

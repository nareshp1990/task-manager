@echo off
title Task Manager Launcher
echo =========================================
echo       Starting Task Manager Server
echo =========================================

:: Wait for a split second and open browser
timeout /t 1 /nobreak >nul
start "" http://localhost:5173

:: Run local development server
npm run dev

pause

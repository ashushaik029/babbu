@echo off
title TrustHire AI - Fake Job Detection System Launcher
echo =====================================================================
echo           TrustHire AI - Fake Job Detection System
echo           AI & Machine Learning Recruitment Fraud Prevention
echo =====================================================================
echo.
echo [1/2] Starting Backend REST API Server on http://localhost:5000...
start "TrustHire AI Backend" node server.js
timeout /t 2 /nobreak > nul
echo.
echo [2/2] Opening Connected Frontend in Default Web Browser...
start http://localhost:5000
echo.
echo =====================================================================
echo [SUCCESS] System is now running!
echo - Frontend Web Interface: http://localhost:5000
echo - Backend Health API:    http://localhost:5000/api/health
echo - AI Analysis Endpoint:   http://localhost:5000/api/analyze
echo.
echo Close this window or the backend console window anytime to stop.
echo =====================================================================
pause

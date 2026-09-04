@echo off
REM Start the live local API before opening Chrome so location and mandi search work.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Run-FarmRoute-Live.ps1"

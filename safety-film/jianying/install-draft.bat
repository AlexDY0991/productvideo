@echo off
rem Install the JianYing draft: relink media paths to this folder, then copy the draft into JianYing.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\install-draft.ps1"
if errorlevel 1 pause

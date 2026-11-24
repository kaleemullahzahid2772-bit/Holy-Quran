@echo off
cd /d "%~dp0"
echo ========================================================
echo  Deploying Holy Quran App to GitHub Pages...
echo ========================================================
echo.
git push origin main
echo.
echo ========================================================
pause

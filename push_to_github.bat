@echo off
echo =======================================================
echo Antigravity's GitHub Auto-Push Script
echo =======================================================
echo.

echo [1/4] Initializing Git repository...
git init
echo.

echo [2/4] Staging all files...
git add .
echo.

echo [3/4] Committing code...
git commit -m "Initial commit: Set up project and added team members"
echo.

echo [4/4] Creating GitHub repository and pushing...
gh repo create "Operating-System-and-Computer-Networks-Virtual-Lab" --public --source=. --remote=origin --push
echo.

echo =======================================================
echo SUCCESS! Your codebase has been uploaded to GitHub.
echo =======================================================
pause

@echo off
title Khoi dong Trang Web Ca Nhan
chcp 65001 > nul
echo ====================================================
echo   ĐANG MỞ TRANG WEB CÁ NHÂN CỦA BẠN...
echo ====================================================
start http://localhost:3000
node server.js
pause

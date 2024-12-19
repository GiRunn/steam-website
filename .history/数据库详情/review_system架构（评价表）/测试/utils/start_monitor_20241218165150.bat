@echo off
setlocal

:: 设置标题
title 数据库监控系统

:: 切换到脚本所在目录
cd /d "%~dp0"

:: 检查Python是否安装
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 未检测到Python环境，请先安装Python
    pause
    exit /b 1
)

:: 检查必要的Python库
python -c "import curses" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 正在安装必要的Python库...
    pip install windows-curses psycopg2
)

:: 启动监控系统
echo 正在启动监控系统...
python realtime_monitor.py

:: 如果程序异常退出，等待用户确认
if %ERRORLEVEL% neq 0 (
    echo.
    echo 程序异常退出，错误代码：%ERRORLEVEL%
    pause
)

endlocal 
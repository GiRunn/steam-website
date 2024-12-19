@echo off
setlocal

:: 设置标题
title 数据库监控系统

:: 切换到脚本所在目录
cd /d "%~dp0"

:: 检查Python是否安装
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python未安装，请先安装Python...
    pause
    exit /b 1
)

:: 检查并安装必要的包
python -c "import colorama" 2>nul || python -m pip install colorama
python -c "import psycopg2" 2>nul || python -m pip install psycopg2-binary
python -c "import curses" 2>nul || python -m pip install windows-curses

:: 设置控制台属性
reg add HKCU\Console /v QuickEdit /t REG_DWORD /d 0 /f
reg add HKCU\Console /v InsertMode /t REG_DWORD /d 0 /f
reg add HKCU\Console /v ScreenBufferSize /t REG_DWORD /d 0x0bb80078 /f
reg add HKCU\Console /v WindowSize /t REG_DWORD /d 0x00280078 /f

:: 运行监控程序
echo 正在启动监控系统...
python realtime_monitor.py

:: 如果程序异常退出，等待用户确认
if %ERRORLEVEL% neq 0 (
    echo.
    echo 程序异常退出，错误代码：%ERRORLEVEL%
    pause
)

endlocal 
@echo off
REM 转换所有SQL文件为UTF-8编码（带BOM）
powershell -Command "Get-ChildItem -Filter *.sql | ForEach-Object { $content = Get-Content $_.FullName; $utf8 = New-Object System.Text.UTF8Encoding $true; [System.IO.File]::WriteAllLines($_.FullName, $content, $utf8) }"
echo 所有SQL文件已转换为UTF-8编码。
pause 
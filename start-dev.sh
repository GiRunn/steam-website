# 在项目根目录创建 start-dev.sh (Windows 用户创建 start-dev.bat)
# Linux/Mac:
#!/bin/bash
cd server && npm run dev &
cd .. && npm start

# Windows (start-dev.bat):
start cmd /k "cd server && npm run dev"
start cmd /k "npm start"


const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'app.log');
    
    // 确保日志目录存在
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}\n`;
    
    // 输出到控制台
    console.log(logMessage);
    
    // 写入文件
    fs.appendFileSync(this.logFile, logMessage);
  }

  info(message) {
    this.log(message, 'INFO');
  }

  error(message) {
    this.log(message, 'ERROR');
  }

  debug(message) {
    this.log(message, 'DEBUG');
  }
}

export const logger = new Logger(); 
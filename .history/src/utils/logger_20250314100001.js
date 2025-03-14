class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // 最多保存1000条日志
  }

  formatMessage(message, type) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${type}] ${message}`;
  }

  log(message, type = 'INFO') {
    const formattedMessage = this.formatMessage(message, type);
    
    // 在控制台输出不同颜色的日志
    switch (type) {
      case 'ERROR':
        console.error(formattedMessage);
        break;
      case 'DEBUG':
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }

    // 保存日志到内存
    this.logs.push({
      timestamp: new Date(),
      type,
      message,
      formattedMessage
    });

    // 如果日志超过最大数量，删除最旧的日志
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 保存到 localStorage（可选）
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs.slice(-100))); // 只保存最近100条
    } catch (e) {
      console.warn('无法保存日志到 localStorage:', e);
    }
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

  // 获取所有日志
  getLogs() {
    return this.logs;
  }

  // 获取最近的n条日志
  getRecentLogs(n = 10) {
    return this.logs.slice(-n);
  }

  // 清除日志
  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('app_logs');
    } catch (e) {
      console.warn('无法清除 localStorage 中的日志:', e);
    }
  }

  // 导出日志
  exportLogs() {
    const logsText = this.logs.map(log => log.formattedMessage).join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const logger = new Logger(); 
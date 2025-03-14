class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // 最多保存100条日志
  }

  formatMessage(type, message) {
    const timestamp = new Date().toLocaleString();
    return `[${timestamp}] [${type}] ${message}`;
  }

  log(type, message) {
    const formattedMessage = this.formatMessage(type, message);
    const logEntry = { type, message, formattedMessage, timestamp: new Date() };
    
    // 添加到内存中的日志数组
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // 根据日志类型使用不同的颜色输出到控制台
    const styles = {
      INFO: 'color: #3b82f6',
      ERROR: 'color: #ef4444',
      DEBUG: 'color: #6b7280'
    };
    console.log(`%c${formattedMessage}`, styles[type] || '');

    // 保存到localStorage
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to save logs to localStorage:', e);
    }
  }

  info(message) {
    this.log('INFO', message);
  }

  error(message) {
    this.log('ERROR', message);
  }

  debug(message) {
    this.log('DEBUG', message);
  }

  // 获取最近的日志
  getRecentLogs() {
    return this.logs;
  }

  // 清除日志
  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('app_logs');
    } catch (e) {
      console.error('Failed to clear logs from localStorage:', e);
    }
  }

  // 导出日志
  exportLogs() {
    const logsText = this.logs
      .map(log => log.formattedMessage)
      .join('\n');
    
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

  // 从localStorage加载日志
  loadLogsFromStorage() {
    try {
      const storedLogs = localStorage.getItem('app_logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (e) {
      console.error('Failed to load logs from localStorage:', e);
    }
  }
}

export const logger = new Logger();
logger.loadLogsFromStorage(); // 初始化时加载已存储的日志 
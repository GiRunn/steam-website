// server/src/middleware/performanceMonitor.js
const winston = require('winston');
const { performance } = require('perf_hooks');

// 创建Winston日志记录器
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// 性能监控中间件
const performanceMonitor = (req, res, next) => {
  const start = performance.now();
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);

  // 记录请求开始
  logger.info('Request started', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  // 监控响应时间
  res.on('finish', () => {
    const duration = performance.now() - start;
    const logData = {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: duration,
      timestamp: new Date().toISOString()
    };

    // 根据响应时间进行告警分级
    if (duration > 1000) {
      logger.error('P1 - Response time alert', {
        ...logData,
        alertLevel: 'P1',
        alertReason: 'Response time > 1000ms'
      });
    } else if (duration > 500) {
      logger.warn('P2 - Response time warning', {
        ...logData,
        alertLevel: 'P2',
        alertReason: 'Response time > 500ms'
      });
    } else {
      logger.info('Request completed', logData);
    }
  });

  // 错误监控
  res.on('close', () => {
    if (!res.finished) {
      logger.error('P0 - Connection closed', {
        requestId,
        method: req.method,
        url: req.url,
        alertLevel: 'P0',
        alertReason: 'Connection closed prematurely'
      });
    }
  });

  next();
};

// CPU使用率监控
const cpuMonitor = () => {
  const os = require('os');
  setInterval(() => {
    const cpuUsage = os.loadavg()[0] * 100 / os.cpus().length;
    
    if (cpuUsage > 90) {
      logger.error('P0 - High CPU usage', {
        alertLevel: 'P0',
        cpuUsage,
        alertReason: 'CPU usage > 90%'
      });
    } else if (cpuUsage > 85) {
      logger.warn('P1 - Elevated CPU usage', {
        alertLevel: 'P1',
        cpuUsage,
        alertReason: 'CPU usage > 85%'
      });
    } else if (cpuUsage > 80) {
      logger.info('P2 - Moderate CPU usage', {
        alertLevel: 'P2',
        cpuUsage,
        alertReason: 'CPU usage > 80%'
      });
    }
  }, 60000); // 每分钟检查一次
};

// 错误率监控
let requestCount = 0;
let errorCount = 0;

const errorRateMonitor = () => {
  setInterval(() => {
    if (requestCount > 0) {
      const errorRate = (errorCount / requestCount) * 100;
      
      if (errorRate > 10) {
        logger.error('P0 - High error rate', {
          alertLevel: 'P0',
          errorRate,
          alertReason: 'Error rate > 10%'
        });
      } else if (errorRate > 5) {
        logger.warn('P1 - Elevated error rate', {
          alertLevel: 'P1',
          errorRate,
          alertReason: 'Error rate > 5%'
        });
      } else if (errorRate > 1) {
        logger.info('P2 - Moderate error rate', {
          alertLevel: 'P2',
          errorRate,
          alertReason: 'Error rate > 1%'
        });
      }
    }
    
    // 重置计数器
    requestCount = 0;
    errorCount = 0;
  }, 300000); // 每5分钟计算一次错误率
};

// 导出模块
module.exports = {
  performanceMonitor,
  cpuMonitor,
  errorRateMonitor,
  logger
};
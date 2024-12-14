// src/pages/OnlineSupport/constants/chatConstants.js

// 聊天状态枚举
export const ChatState = {
  CONNECTING: 'connecting',    // 正在连接
  BOT: 'bot',                 // 机器人对话
  TRANSFERRING: 'transferring',// 正在转人工
  QUEUING: 'queuing',         // 排队中
  CONNECTED: 'connected',      // 已连接客服
  ENDED: 'ended'              // 会话结束
};

// 系统消息类型
export const SystemMessageType = {
  WELCOME: 'welcome',           // 欢迎消息
  TRANSFER: 'transfer',         // 转人工通知
  QUEUE: 'queue',              // 排队更新
  CONNECTED: 'connected',       // 连接成功
  DISCONNECTED: 'disconnected', // 断开连接
  END: 'end'                   // 会话结束
};

// 机器人回复模板
export const BotResponses = {
  DEFAULT: '抱歉，我可能没有完全理解您的问题。您可以换个方式描述，或选择转接人工客服。',
  TRANSFER: '正在为您转接人工客服，请稍候...',
  QUEUE: '前面还有 {number} 位用户在等待，请耐心等候...',
  ERROR: '非常抱歉，系统遇到了一些问题。请稍后重试或选择其他服务方式。'
};

// 获取系统消息内容
export const getSystemMessage = (type, data = {}) => {
  switch (type) {
    case SystemMessageType.WELCOME:
      return '欢迎使用Steam在线客服系统';
    case SystemMessageType.TRANSFER:
      return '正在为您转接人工客服，请稍候...';
    case SystemMessageType.QUEUE:
      return `前面还有 ${data.queuePosition} 位用户在等待，请耐心等候...`;
    case SystemMessageType.CONNECTED:
      return `已为您接通客服 ${data.agentName}，请描述您的问题`;
    case SystemMessageType.DISCONNECTED:
      return '与客服的连接已断开，您可以重新发起会话';
    case SystemMessageType.END:
      return '本次会话已结束，感谢您的使用';
    default:
      return '';
  }
};

// 问题类型和答案配置
export const BotQuestions = {
  ACCOUNT: {
    id: 'account',
    icon: '👤',
    text: '账号相关问题',
    description: '处理账号安全、密码重置等问题',
    answers: [
      { text: '忘记密码', icon: '🔑' },
      { text: '账号被盗', icon: '🚫' },
      { text: '修改邮箱', icon: '📧' },
      { text: '其他账号问题', icon: '❓' }
    ]
  },
  PAYMENT: {
    id: 'payment',
    icon: '💳',
    text: '支付相关问题',
    description: '解决支付流程和订单相关问题',
    answers: [
      { text: '支付失败', icon: '❌' },
      { text: '退款问题', icon: '💰' },
      { text: '订单查询', icon: '🔍' },
      { text: '其他支付问题', icon: '❓' }
    ]
  },
  GAME: {
    id: 'game',
    icon: '🎮',
    text: '游戏相关问题',
    description: '处理游戏运行和技术问题',
    answers: [
      { text: '游戏无法启动', icon: '🚫' },
      { text: '游戏内bug', icon: '🐛' },
      { text: '游戏更新问题', icon: '⚡' },
      { text: '其他游戏问题', icon: '❓' }
    ]
  }
};

// 预设的机器人回答
export const BotAnswers = {
  account: {
    '忘记密码': '您可以通过以下步骤重置密码：\n1. 访问Steam登录页面\n2. 点击"忘记密码？"\n3. 输入您的Steam账号名称或邮箱\n4. 按照邮件中的提示进行操作\n\n如果您在操作过程中遇到问题，可以选择转接人工客服协助您。',
    '账号被盗': '发现账号被盗，请立即：\n1. 更改密码\n2. 检查邮箱安全\n3. 开启Steam令牌\n4. 检查交易记录\n\n需要我为您转接人工客服进行处理吗？',
    '修改邮箱': '修改邮箱需要验证您的身份，请准备：\n1. 当前邮箱的访问权限\n2. 手机验证码\n3. 新的邮箱地址\n\n是否需要了解具体的操作步骤？',
    '其他账号问题': '好的，为了更好地帮助您，请描述您遇到的具体问题。建议包含：\n- 问题发生的具体情况\n- 错误提示（如果有）\n- 您已尝试的解决方法'
  },
  payment: {
    '支付失败': '对于支付失败的问题，请提供：\n1. 支付方式\n2. 错误提示信息\n3. 订单号（如果有）\n\n这样我们能更好地帮您解决问题。',
    '退款问题': '关于退款，请提供：\n1. 订单号\n2. 购买时间\n3. 退款原因\n\n我可以帮您查询退款状态或提交退款申请。',
    '订单查询': '请提供以下信息之一：\n1. 订单号\n2. 交易时间\n3. 商品名称\n\n我会帮您查询订单详情。',
    '其他支付问题': '请详细描述您的支付问题：\n- 具体的操作步骤\n- 遇到的错误提示\n- 支付环境（PC/手机）\n\n这样我能更好地协助您。'
  },
  game: {
    '游戏无法启动': '请提供以下信息：\n1. 游戏名称\n2. 错误提示信息\n3. 系统配置\n4. 已尝试的解决方法\n\n这样我们能更准确地诊断问题。',
    '游戏内bug': '请说明：\n1. 游戏名称\n2. Bug具体表现\n3. 复现步骤\n4. 发生时间\n\n如果可能，请提供截图或录像。',
    '游戏更新问题': '更新问题通常与以下因素有关：\n1. 网络连接\n2. 磁盘空间\n3. 文件完整性\n\n请告诉我具体的错误提示，我会协助您解决。',
    '其他游戏问题': '请提供：\n1. 游戏名称\n2. 问题描述\n3. 发生时间\n4. 已尝试的解决方法\n\n这样我能更好地帮助您。'
  }
};
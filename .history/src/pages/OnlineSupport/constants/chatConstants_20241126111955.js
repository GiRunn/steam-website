// src/pages/OnlineSupport/constants/chatConstants.js

export const ChatState = {
  INITIAL: 'initial',
  BOT: 'bot',
  CATEGORY_SELECTING: 'category_selecting',
  DETAIL_SELECTING: 'detail_selecting',
  INFO_COLLECTING: 'info_collecting',
  TRANSFERRING: 'transferring',
  QUEUING: 'queuing',
  CONNECTED: 'connected',
  ENDED: 'ended'
};

export const MessageType = {
  SYSTEM: 'system',
  BOT: 'bot',
  USER: 'user',
  QUICK_REPLY: 'quick_reply',
  TRANSFER: 'transfer'
};

export const SystemMessageType = {
  WELCOME: 'welcome',
  CATEGORY: 'category',
  DETAIL: 'detail',
  COLLECT: 'collect',
  TRANSFER: 'transfer',
  QUEUE: 'queue',
  CONNECTED: 'connected',
  END: 'end'
};

// 转人工触发条件配置
export const TransferConditions = {
  // 关键词匹配
  KEYWORDS: {
    URGENT: ['紧急', '急需', '立即'],
    COMPLAINT: ['投诉', '不满', '失望'],
    COMPLEX: ['被盗', '异常', '故障'],
    REFUND: ['退款', '赔偿', '补偿']
  },
  // 阈值设置
  THRESHOLDS: {
    REPEAT_QUESTIONS: 3,  // 重复提问次数
    CONVERSATION_TIME: 5 * 60 * 1000,  // 会话时长阈值
    TRANSFER_SCORE: 0.7  // 转人工分数阈值
  }
};

// 系统消息模板
export const getSystemMessage = (type, data = {}) => {
  const templates = {
    [SystemMessageType.WELCOME]: '您好！欢迎使用Steam客服系统，请问有什么可以帮您？',
    [SystemMessageType.TRANSFER]: '正在为您转接人工客服...',
    [SystemMessageType.QUEUE]: `当前排队人数：${data.queuePosition}`,
    [SystemMessageType.CONNECTED]: `已为您接通客服 ${data.agentName}`,
    [SystemMessageType.END]: '本次会话已结束，感谢您的使用！'
  };
  return templates[type];
};

// 快捷回复配置
export const QuickReplies = {
  COMMON: [
    '谢谢',
    '好的明白了',
    '这个问题还没解决',
    '需要更多帮助'
  ],
  CONTEXTUAL: {
    ACCOUNT: [
      '我需要更多安全建议',
      '这个方法没有解决我的问题',
      '如何防止再次发生'
    ],
    PAYMENT: [
      '订单还没有收到退款',
      '我想了解具体的支付流程',
      '能加快处理吗'
    ],
    GAME: [
      '游戏还是无法启动',
      '我需要技术支持',
      '问题依然存在'
    ]
  }
};
// E:\Steam\steam-website\src\pages\OnlineSupport\constants\chatConstants.js
// 聊天相关的常量定义

// 聊天状态枚举
export const ChatState = {
    BOT: 'BOT',                 // 机器人模式
    TRANSFERRING: 'TRANSFERRING', // 正在转接
    QUEUING: 'QUEUING',         // 排队中
    CONNECTED: 'CONNECTED',     // 已连接
    ENDED: 'ENDED'             // 会话结束
  };
  
  // 系统消息类型
  export const SystemMessageType = {
    WELCOME: 'WELCOME',
    BOT_INTRO: 'BOT_INTRO',
    TRANSFER: 'TRANSFER',
    QUEUE: 'QUEUE',
    CONNECTED: 'CONNECTED',
    END: 'END'
  };
  
  // 机器人回复内容
  export const BotResponses = {
    账号问题: '您遇到了账号相关的问题，我来为您解答...',
    支付问题: '关于支付的问题，我们建议您先检查...',
    游戏问题: '对于游戏相关的问题，您可以尝试...',
    // 可以添加更多预设回复
  };
  
  // 获取系统消息内容
  export const getSystemMessage = (type, data = {}) => {
    switch (type) {
      case SystemMessageType.WELCOME:
        return '欢迎使用Steam在线客服系统';
      case SystemMessageType.BOT_INTRO:
        return '我是您的智能客服助手，请问有什么可以帮您？';
      case SystemMessageType.TRANSFER:
        return '正在为您转接人工客服，请稍候...';
      case SystemMessageType.QUEUE:
        return `您前面还有 ${data.queuePosition} 位用户正在等待...`;
      case SystemMessageType.CONNECTED:
        return `已为您接通客服 ${data.agentName}，开始会话`;
      case SystemMessageType.END:
        return '会话已结束，感谢您的使用';
      default:
        return '';
    }
  };
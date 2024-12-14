// E:\Steam\steam-website\src\pages\OnlineSupport\constants.js
// 聊天相关常量配置

// 客服会话状态枚举
export const ChatState = {
    BOT: 'bot',           // 机器人对话
    TRANSFERRING: 'transferring', // 正在转人工
    QUEUING: 'queuing',   // 排队等待
    CONNECTED: 'connected', // 已连接人工
    ENDED: 'ended'        // 会话结束
  };
  
  // 系统消息类型枚举
  export const SystemMessageType = {
    WELCOME: 'welcome',
    BOT_INTRO: 'bot_intro',
    TRANSFER: 'transfer',
    QUEUE: 'queue',
    CONNECTED: 'connected',
    END: 'end',
    ERROR: 'error'
  };
  
  // 机器人回复配置
  export const BotResponses = {
    "账号相关问题": `建议您先尝试以下方式：
  1. 使用"忘记密码"功能重置
  2. 确认注册邮箱是否正确
  3. 检查是否被异地登录
  
  如果问题仍未解决，建议转接人工客服处理。`,
  
    "支付相关问题": `请您先核实以下信息：
  1. 银行卡是否有效
  2. 账户余额是否充足
  3. 是否有充值限制
  
  如需具体帮助，建议转接人工客服。`,
  
    "游戏相关问题": `建议您先尝试：
  1. 验证游戏完整性
  2. 更新显卡驱动
  3. 清理游戏缓存
  
  如果问题持续，请转接人工客服。`
  };
  
  // 获取系统消息内容
  export const getSystemMessage = (type, extraData = {}) => {
    const { queuePosition = 0, agentName = '' } = extraData;
    
    switch (type) {
      case SystemMessageType.WELCOME:
        return "欢迎来到Steam在线客服！";
      case SystemMessageType.BOT_INTRO:
        return "我是Steam智能助手，请选择您遇到的问题类型，我会为您提供解答。如果需要更专业的帮助，随时可以转接人工客服。";
      case SystemMessageType.TRANSFER:
        return "正在为您转接人工客服，请稍候...";
      case SystemMessageType.QUEUE:
        return `正在排队等候人工客服，前方还有${queuePosition}位用户...`;
      case SystemMessageType.CONNECTED:
        return `已为您接通人工客服${agentName ? ` ${agentName}` : ''}，很高兴为您服务。`;
      case SystemMessageType.END:
        return "本次会话已结束，感谢您的使用。";
      case SystemMessageType.ERROR:
        return "抱歉，系统遇到了一些问题。请稍后再试。";
      default:
        return "";
    }
  };
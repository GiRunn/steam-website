// src/pages/OnlineSupport/hooks/useChat.js
// 聊天功能的核心Hook - 优化重构版本

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../../../components/ui/Toast';
import { 
  ChatState, 
  SystemMessageType, 
  BotResponses, 
  getSystemMessage 
} from '../constants/chatConstants';

// 客服数据接口
const mockServiceAgent = {
  name: "Alice Wang",
  status: "在线",
  statusMessage: "随时为您服务",
  verified: true,
  satisfaction: 98,
  responseTime: "<1分钟",
  resolutionRate: 95,
  specialties: ["账号问题", "支付问题", "游戏问题"],
  currentLoad: {
    current: 3,
    queue: 2
  }
};

// 生成唯一消息ID
const generateMessageId = (prefix) => 
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 创建消息对象
const createMessage = ({
  content,
  type = 'text',
  isUser = false,
  isBot = false,
  isSystem = false,
  isAgent = false,
  attachments = [],
  replyTo = null,
  metadata = {}
}) => ({
  id: generateMessageId(type),
  content,
  type,
  isUser,
  isBot,
  isSystem,
  isAgent,
  attachments,
  replyTo,
  metadata,
  timestamp: new Date().toISOString(),
  status: isUser ? 'sending' : 'sent'
});

export const useChat = () => {
  // 基础状态
  const [loading, setLoading] = useState(true);
  const [chatState, setChatState] = useState(ChatState.BOT);
  const [messages, setMessages] = useState([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [queuePosition, setQueuePosition] = useState(0);
  const [serviceAgent, setServiceAgent] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [lastMessageTime, setLastMessageTime] = useState(0);

  // Refs
  const messageContainerRef = useRef(null);
  const soundRef = useRef(new Audio('/sounds/message.mp3'));
  const queueIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  const { toast } = useToast();

  // 清理函数
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (queueIntervalRef.current) {
        clearInterval(queueIntervalRef.current);
      }
    };
  }, []);

  // 消息排序函数
  const sortMessages = useCallback((msgs) => {
    return [...msgs].sort((a, b) => {
      // 确保初始消息和系统消息在前
      if (a.isSystem && !b.isSystem) return -1;
      if (!a.isSystem && b.isSystem) return 1;
      if (a.metadata?.isInitial && !b.metadata?.isInitial) return -1;
      if (!a.metadata?.isInitial && b.metadata?.isInitial) return 1;
      
      // 按时间戳排序
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
  }, []);

  // 消息播放声音
  const playMessageSound = useCallback(() => {
    if (!isSoundEnabled || !soundRef.current) return;
    
    soundRef.current.play().catch(err => {
      console.error('Sound play failed:', err);
      setIsSoundEnabled(false);
      toast({
        title: "提示音播放失败",
        description: "已自动关闭声音提示",
        type: "warning"
      });
    });
  }, [isSoundEnabled, toast]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (!messageContainerRef.current) return;
    
    const scrollOptions = {
      top: messageContainerRef.current.scrollHeight,
      behavior: 'smooth'
    };
    
    requestAnimationFrame(() => {
      messageContainerRef.current?.scrollTo(scrollOptions);
    });
  }, []);

  // 添加消息
  const addMessage = useCallback((messageData) => {
    const message = createMessage(messageData);
    
    setMessages(prev => {
      const updated = [...prev, message];
      return sortMessages(updated);
    });

    scrollToBottom();
    return message;
  }, [sortMessages, scrollToBottom]);

  // 更新消息状态
  const updateMessageStatus = useCallback((messageId, status) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      )
    );
  }, []);

  // 发送消息处理
  const handleSendMessage = useCallback(async (messageData) => {
    const { text, attachments = [], isBot = false } = messageData;
    
    // 发送频率限制
    const now = Date.now();
    if (!isBot && now - lastMessageTime < 1000) {
      toast({
        title: "发送太快",
        description: "请稍后再试",
        type: "warning"
      });
      return;
    }

    // 消息长度限制
    if (text.length > 500) {
      toast({
        title: "消息过长",
        description: "单条消息不能超过500字",
        type: "warning"
      });
      return;
    }

    try {
      if (chatState === ChatState.BOT) {
        // 机器人对话模式
        const userMessage = addMessage({
          content: text,
          isUser: true,
          attachments
        });

        // 匹配问题类型并生成回复
        const questionType = Object.keys(BotResponses).find(type => 
          text.toLowerCase().includes(type.toLowerCase())
        );

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!mountedRef.current) return;

        addMessage({
          content: questionType 
            ? BotResponses[questionType]
            : "抱歉，我可能没有完全理解您的问题。您可以换个方式描述，或者选择转接人工客服获得帮助。",
          isBot: true,
          replyTo: userMessage.id
        });

        playMessageSound();

      } else if (chatState === ChatState.CONNECTED) {
        // 人工客服模式
        const userMessage = addMessage({
          content: text,
          isUser: true,
          attachments
        });

        setIsAgentTyping(true);
        updateMessageStatus(userMessage.id, 'sent');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (!mountedRef.current) return;

        updateMessageStatus(userMessage.id, 'delivered');
        
        const agentMessage = addMessage({
          content: `收到您的问题，我来为您处理...`,
          isAgent: true,
          metadata: { agentName: serviceAgent?.name },
          replyTo: userMessage.id
        });

        setIsAgentTyping(false);
        playMessageSound();

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!mountedRef.current) return;
        
        updateMessageStatus(userMessage.id, 'read');
      }

      setLastMessageTime(now);

    } catch (error) {
      console.error('Message send error:', error);
      toast({
        title: "发送失败",
        description: "请稍后重试",
        type: "error"
      });
    }
  }, [
    chatState, 
    lastMessageTime, 
    serviceAgent, 
    addMessage, 
    updateMessageStatus,
    playMessageSound,
    toast
  ]);

  // 转人工处理
  const handleTransferToAgent = useCallback(async () => {
    try {
      setChatState(ChatState.TRANSFERRING);
      addMessage({
        content: getSystemMessage(SystemMessageType.TRANSFER),
        isSystem: true
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!mountedRef.current) return;
      
      setChatState(ChatState.QUEUING);
      
      let position = 3;
      queueIntervalRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        
        position--;
        setQueuePosition(position);
        
        addMessage({
          content: getSystemMessage(SystemMessageType.QUEUE, { queuePosition: position }),
          isSystem: true
        });
        
        if (position <= 0) {
          clearInterval(queueIntervalRef.current);
          setServiceAgent(mockServiceAgent);
          setChatState(ChatState.CONNECTED);
          
          addMessage({
            content: getSystemMessage(SystemMessageType.CONNECTED, { 
              agentName: mockServiceAgent.name 
            }),
            isSystem: true
          });
        }
      }, 2000);
      
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "转接失败",
        description: "请稍后重试",
        type: "error"
      });
    }
  }, [addMessage, toast]);

  // 结束会话处理
  const handleEndChat = useCallback(async () => {
    try {
      addMessage({
        content: getSystemMessage(SystemMessageType.END),
        isSystem: true
      });
      
      setChatState(ChatState.ENDED);
      setServiceAgent(null);
      
      toast({
        title: "会话已结束",
        description: "感谢您的使用",
        type: "success"
      });
      
    } catch (error) {
      console.error('End chat error:', error);
      toast({
        title: "操作失败",
        description: "请重试",
        type: "error"
      });
    }
  }, [addMessage, toast]);

  // 初始化
 // 初始化
  useEffect(() => {
    const initialize = async () => {
      if (!isFirstLoad || !mountedRef.current) return;

      try {
        setLoading(true); // 确保初始loading状态

        // 添加初始欢迎消息
        const welcomeMessages = [
          {
            content: "欢迎使用Steam在线客服系统",
            isSystem: true,
            metadata: { isInitial: true }
          },
          {
            content: "我是您的智能客服助手，请问有什么可以帮您？",
            isSystem: true,
            metadata: { isInitial: true }
          }
        ];

        // 直接设置初始消息，而不是循环添加
        setMessages(sortMessages(welcomeMessages.map(msg => createMessage(msg))));
        
        // 稍微延迟以展示欢迎消息
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!mountedRef.current) return;

        // 添加机器人问候
        const botGreeting = createMessage({
          content: "您好！我是Steam智能助手，请问遇到了什么问题？\n\n请选择问题类型：\n\n👤\n账号相关问题\n处理账号安全、密码重置等问题\n\n💳\n支付相关问题\n解决支付流程和订单相关问题\n\n🎮\n游戏相关问题\n处理游戏运行和技术问题",
          isBot: true,
          metadata: { isInitial: true }
        });

        setMessages(prev => sortMessages([...prev, botGreeting]));
        setIsFirstLoad(false);
        setLoading(false); // 完成初始化，关闭loading状态
        
      } catch (error) {
        console.error('Chat initialization failed:', error);
        toast({
          title: "初始化失败",
          description: "请刷新重试",
          type: "error"
        });
        setLoading(false); // 确保错误时也关闭loading状态
      }
    };

    initialize();
  }, [isFirstLoad, addMessage, handleSendMessage, toast]);

  // 网络状态监听
  useEffect(() => {
    const handleOnline = () => {
      toast({
        title: "网络已恢复",
        type: "success"
      });
    };

    const handleOffline = () => {
      toast({
        title: "网络已断开",
        description: "请检查网络连接",
        type: "error"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return {
    loading,
    chatState,
    messages,
    isAgentTyping,
    isSoundEnabled,
    queuePosition,
    serviceAgent,
    messageContainerRef,
    setIsSoundEnabled,
    handleSendMessage,
    handleTransferToAgent,
    handleEndChat,
  };
};
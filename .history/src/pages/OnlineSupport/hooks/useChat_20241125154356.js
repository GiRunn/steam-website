// E:\Steam\steam-website\src\pages\OnlineSupport\hooks\useChat.js
// 聊天功能的核心Hook，处理聊天相关的状态和逻辑

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../../../components/ui/Toast';
import { 
  ChatState, 
  SystemMessageType, 
  BotResponses, 
  getSystemMessage 
} from '../constants/chatConstants';

// 模拟客服数据
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

// 引用消息配置
const QUOTED_MESSAGES = [
  {
    title: "账号相关问题",
    icon: "👤",
    description: "处理账号安全、密码重置等问题"
  },
  {
    title: "支付相关问题",
    icon: "💳", 
    description: "解决支付流程和订单相关问题"
  },
  {
    title: "游戏相关问题", 
    icon: "🎮",
    description: "处理游戏运行和技术问题"
  }
];

export const useChat = () => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [chatState, setChatState] = useState(ChatState.BOT);
  const [messages, setMessages] = useState([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [queuePosition, setQueuePosition] = useState(0);
  const [serviceAgent, setServiceAgent] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [hasShownQuotedMessages, setHasShownQuotedMessages] = useState(false);

  const messageContainerRef = useRef(null);
  const { toast } = useToast();

  // 音效播放功能
  const playMessageSound = useCallback(() => {
    if (isSoundEnabled) {
      const audio = new Audio('/sounds/message.mp3');
      audio.play().catch(err => console.log('Sound play failed:', err));
    }
  }, [isSoundEnabled]);

  // 优化的滚动处理
  const scrollToBottom = useCallback((smooth = true) => {
    if (messageContainerRef.current) {
      const scrollOptions = {
        top: messageContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      };
      
      requestAnimationFrame(() => {
        messageContainerRef.current.scrollTo(scrollOptions);
      });
    }
  }, []);

  // 添加系统消息
  const addSystemMessage = useCallback((type, extraData = {}) => {
    const systemMessage = {
      id: Date.now(),
      content: getSystemMessage(type, extraData),
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    
    setMessages(prev => [...prev, systemMessage]);
    scrollToBottom();
  }, [scrollToBottom]);

  // 添加引用消息
  const addQuotedMessages = useCallback(() => {
    if (hasShownQuotedMessages) return;

    const quotedMessagesContent = QUOTED_MESSAGES.map(msg => (
      `${msg.icon}\n${msg.title}\n${msg.description}`
    )).join('\n\n');

    const message = {
      id: Date.now(),
      content: quotedMessagesContent,
      timestamp: new Date().toISOString(),
      isBot: true,
      isQuoted: true,
      quotedMessages: QUOTED_MESSAGES
    };

    setMessages(prev => [...prev, message]);
    setHasShownQuotedMessages(true);
    scrollToBottom();
  }, [hasShownQuotedMessages, scrollToBottom]);

  // 发送消息处理
  const handleSendMessage = useCallback(async (messageData) => {
    const { text, attachments = [], isBot = false, isGreeting = false } = messageData;
    
    try {
      if (chatState === ChatState.BOT && !isBot) {
        // 用户消息处理
        const userMessage = {
          id: Date.now(),
          content: text,
          attachments,
          isUser: true,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();

        // 机器人回复逻辑
        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsAgentTyping(false);

        const questionType = Object.keys(BotResponses).find(type => 
          text.toLowerCase().includes(type.toLowerCase())
        );

        const botResponse = {
          id: Date.now() + 1,
          content: questionType 
            ? BotResponses[questionType]
            : "抱歉，我可能没有完全理解您的问题。您可以换个方式描述，或者选择转接人工客服获得帮助。",
          isBot: true,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, botResponse]);
        playMessageSound();
        scrollToBottom();

      } else if (isGreeting) {
        // 问候消息处理
        const greetingMessage = {
          id: Date.now(),
          content: text,
          isBot: true,
          isGreeting: true,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, greetingMessage]);
        scrollToBottom();
        
        // 延迟显示引用消息
        setTimeout(() => {
          addQuotedMessages();
        }, 1000);

      } else if (chatState === ChatState.CONNECTED) {
        // 人工客服消息处理
        const userMessage = {
          id: Date.now(),
          content: text,
          attachments,
          isUser: true,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };

        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();

        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const agentMessage = {
          id: Date.now() + 1,
          content: `收到您的问题，我来为您处理...`,
          isAgent: true,
          agentName: serviceAgent?.name,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };

        setMessages(prev => [...prev, agentMessage]);
        playMessageSound();
        setIsAgentTyping(false);
        scrollToBottom();

        // 消息状态更新
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === userMessage.id 
                ? { ...msg, status: 'delivered' }
                : msg
            )
          );
        }, 1000);

        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === userMessage.id 
                ? { ...msg, status: 'read' }
                : msg
            )
          );
        }, 2000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        type: "error",
        duration: 3000
      });
    }
  }, [chatState, playMessageSound, scrollToBottom, serviceAgent, toast, addQuotedMessages]);

  // 初始化加载
  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!isFirstLoad) return;
        
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 欢迎消息
        setMessages([{
          id: Date.now(),
          content: "欢迎使用Steam在线客服系统",
          type: 'system',
          timestamp: new Date().toISOString()
        }]);

        setLoading(false);
        setIsFirstLoad(false);
        
        // 延迟发送问候消息
        setTimeout(() => {
          handleSendMessage({
            text: "您好！我是Steam智能助手，请问遇到了什么问题？",
            isBot: true,
            isGreeting: true
          });
        }, 800);

      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "连接失败",
          description: "无法连接到客服系统，请刷新页面重试",
          type: "error",
          duration: 3000
        });
        setLoading(false);
      }
    };

    initializeChat();
  }, [isFirstLoad, handleSendMessage, toast]);

  // 转人工处理
  const handleTransferToAgent = useCallback(async () => {
    try {
      setChatState(ChatState.TRANSFERRING);
      addSystemMessage(SystemMessageType.TRANSFER);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setChatState(ChatState.QUEUING);
      
      let position = 3;
      const queueInterval = setInterval(() => {
        position--;
        setQueuePosition(position);
        addSystemMessage(SystemMessageType.QUEUE, { queuePosition: position });
        
        if (position <= 0) {
          clearInterval(queueInterval);
          setServiceAgent(mockServiceAgent);
          setChatState(ChatState.CONNECTED);
          addSystemMessage(SystemMessageType.CONNECTED, { 
            agentName: mockServiceAgent.name 
          });
        }
      }, 2000);
      
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "转接失败",
        description: "无法转接人工客服，请稍后重试",
        type: "error",
        duration: 3000
      });
    }
  }, [addSystemMessage, toast]);

  // 结束会话处理
  const handleEndChat = useCallback(async () => {
    try {
      addSystemMessage(SystemMessageType.END);
      setChatState(ChatState.ENDED);
      setServiceAgent(null);
      toast({
        title: "会话已结束",
        description: "感谢您的使用，欢迎下次再来",
        type: "success",
        duration: 3000
      });
    } catch (error) {
      console.error('Error ending chat:', error);
      toast({
        title: "操作失败",
        description: "结束会话失败，请重试",
        type: "error",
        duration: 3000
      });
    }
  }, [addSystemMessage, toast]);

  // 消息自动滚动
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

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
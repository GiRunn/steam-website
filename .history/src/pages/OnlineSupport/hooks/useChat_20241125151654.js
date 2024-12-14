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

// 模拟客服数据 - 实际项目中应该从服务端获取
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

  const messageContainerRef = useRef(null);
  const { toast } = useToast();

  // 音效播放功能
  const playMessageSound = useCallback(() => {
    if (isSoundEnabled) {
      const audio = new Audio('/sounds/message.mp3');
      audio.play().catch(err => console.log('Sound play failed:', err));
    }
  }, [isSoundEnabled]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth'
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

  // 发送消息处理
  const handleSendMessage = useCallback(async (messageData) => {
    const { text, attachments = [], isBot = false } = messageData;
    
    try {
      if (chatState === ChatState.BOT && !isBot) {
        // 机器人对话模式
        // 1. 添加用户消息
        const userMessage = {
          id: Date.now(),
          content: text,
          attachments,
          isUser: true,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();

        // 2. 查找匹配的问题类型
        const questionType = Object.keys(BotResponses).find(type => 
          text.toLowerCase().includes(type.toLowerCase())
        );

        // 3. 添加机器人回复
        await new Promise(resolve => setTimeout(resolve, 1000));
        const botResponse = {
          id: Date.now() + 1,
          content: questionType 
            ? BotResponses[questionType]
            : "抱歉，我可能没有完全理解您的问题。您可以换个方式描述，或者选择转接人工客服获得帮助。",
          isBot: true,
          isResponse: true,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botResponse]);
        playMessageSound();
        scrollToBottom();

      } else if (chatState === ChatState.CONNECTED) {
        // 人工客服模式
        // 1. 添加用户消息
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

        // 2. 显示客服正在输入状态
        setIsAgentTyping(true);
        
        // 3. 模拟客服输入延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 4. 添加客服回复
        const agentMessage = {
          id: Date.now() + 1,
          content: `收到您的问题，我来为您处理...`,
          isBot: false,
          isAgent: true,
          agentName: serviceAgent?.name,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };

        setMessages(prev => [...prev, agentMessage]);
        playMessageSound();
        setIsAgentTyping(false);
        scrollToBottom();

        // 5. 更新消息状态
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
  }, [chatState, playMessageSound, scrollToBottom, serviceAgent, toast]);

  // 处理转人工
  const handleTransferToAgent = useCallback(async () => {
    try {
      setChatState(ChatState.TRANSFERRING);
      addSystemMessage(SystemMessageType.TRANSFER);
      
      // 模拟排队
      await new Promise(resolve => setTimeout(resolve, 1500));
      setChatState(ChatState.QUEUING);
      
      // 模拟队列更新
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

  // 初始化加载
  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!isFirstLoad) return;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 设置初始消息
        const initialMessages = [
          {
            id: Date.now(),
            content: "欢迎使用Steam在线客服系统",
            type: 'system',
            timestamp: new Date().toISOString()
          },
          {
            id: Date.now() + 1,
            content: "我是您的智能客服助手，请问有什么可以帮您？",
            type: 'system',
            timestamp: new Date().toISOString()
          },
          {
            id: Date.now() + 2,
            content: "您好！我是Steam智能助手，请问遇到了什么问题？",
            isBot: true,
            isInitial: true,
            timestamp: new Date().toISOString()
          }
        ];

        setMessages(initialMessages);
        setLoading(false);
        setIsFirstLoad(false);
        
        // 确保初始消息显示后滚动到底部
        setTimeout(scrollToBottom, 100);

      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "连接失败",
          description: "无法连接到客服系统，请刷新页面重试",
          type: "error",
          duration: 3000
        });
      }
    };

    initializeChat();
  }, [isFirstLoad, scrollToBottom, toast]);

  // 监听消息变化，自动滚动
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
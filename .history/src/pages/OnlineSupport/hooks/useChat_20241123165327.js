// E:\Steam\steam-website\src\pages\OnlineSupport\hooks\useChat.js
// 聊天功能的核心Hook，处理聊天相关的状态和逻辑

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../components/ui/Toast';
import { ChatState, SystemMessageType, BotResponses } from '../constants';

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

export const useChat = () => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [chatState, setChatState] = useState(ChatState.BOT);
  const [messages, setMessages] = useState([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [queuePosition, setQueuePosition] = useState(0);
  const [serviceAgent, setServiceAgent] = useState(null);
  const { toast } = useToast();

  // 音效播放功能
  const playMessageSound = useCallback(() => {
    if (isSoundEnabled) {
      const audio = new Audio('/sounds/message.mp3');
      audio.play().catch(err => console.log('Sound play failed:', err));
    }
  }, [isSoundEnabled]);

  // 添加系统消息
  const addSystemMessage = useCallback((type, extraData = {}) => {
    const systemMessage = {
      id: Date.now(),
      content: getSystemMessage(type, extraData),
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  // 机器人回复逻辑
  const handleBotResponse = useCallback(async (message) => {
    const questionType = Object.keys(BotResponses).find(type => 
      message.toLowerCase().includes(type.toLowerCase())
    );

    if (!questionType) return;

    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = {
      id: Date.now(),
      content: BotResponses[questionType],
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setMessages(prev => [...prev, response]);
    playMessageSound();
  }, [playMessageSound]);

  // 处理转人工
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
        type: "error"
      });
    }
  }, [addSystemMessage, toast]);

  // 发送消息处理
  const handleSendMessage = useCallback(async (messageData) => {
    const { text, attachments = [], isBot = false } = messageData;
    
    try {
      const newMessage = {
        id: Date.now(),
        content: text,
        attachments,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: 'sent'
      };

      setMessages(prev => [...prev, newMessage]);

      if (chatState === ChatState.BOT && !isBot) {
        await handleBotResponse(text);
      } else if (chatState === ChatState.CONNECTED) {
        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const agentMessage = {
          id: Date.now(),
          content: `收到您的问题，我来为您处理...`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'sent'
        };

        setMessages(prev => [...prev, agentMessage]);
        playMessageSound();
        setIsAgentTyping(false);
      }

      // 更新消息状态
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        );
      }, 1000);

      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'read' }
              : msg
          )
        );
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        type: "error"
      });
    }
  }, [chatState, handleBotResponse, playMessageSound, toast]);

  // 结束会话处理
  const handleEndChat = useCallback(async () => {
    try {
      addSystemMessage(SystemMessageType.END);
      setChatState(ChatState.ENDED);
      setServiceAgent(null);
      toast({
        title: "会话已结束",
        description: "感谢您的使用，欢迎下次再来",
        type: "success"
      });
    } catch (error) {
      console.error('Error ending chat:', error);
      toast({
        title: "操作失败",
        description: "结束会话失败，请重试",
        type: "error"
      });
    }
  }, [addSystemMessage, toast]);

  // 初始化加载
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        addSystemMessage(SystemMessageType.WELCOME);
        addSystemMessage(SystemMessageType.BOT_INTRO);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "连接失败",
          description: "无法连接到客服系统，请刷新页面重试",
          type: "error"
        });
      }
    };

    initializeChat();
  }, [addSystemMessage, toast]);

  return {
    loading,
    chatState,
    messages,
    isAgentTyping,
    isSoundEnabled,
    queuePosition,
    serviceAgent,
    setIsSoundEnabled,
    handleSendMessage,
    handleTransferToAgent,
    handleEndChat,
  };
};
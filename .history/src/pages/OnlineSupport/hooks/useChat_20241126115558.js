// src/pages/OnlineSupport/hooks/useChat.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../../../components/ui/Toast';  // 使用相对路径
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
  avatar: "/images/agent-avatar.png",
  satisfaction: 98,
  responseTime: "<1分钟",
};

export const useChat = () => {
  // 基础状态
  const [loading, setLoading] = useState(true);
  const [chatState, setChatState] = useState(ChatState.BOT);
  const [messages, setMessages] = useState([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [serviceAgent, setServiceAgent] = useState(null);
  const [queuePosition, setQueuePosition] = useState(0);

  // refs
  const messageContainerRef = useRef(null);
  const { toast } = useToast();

  // 播放消息音效
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
      isSystem: true
    };
    
    setMessages(prev => [...prev, systemMessage]);
    scrollToBottom();
  }, [scrollToBottom]);

  // 转人工处理
  const handleTransferToAgent = useCallback(async () => {
    try {
      setChatState(ChatState.TRANSFERRING);
      addSystemMessage(SystemMessageType.TRANSFER);
      
      // 模拟转接延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 开始排队
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
      setChatState(ChatState.BOT);
    }
  }, [addSystemMessage, toast]);

  // 发送消息处理
  const handleSendMessage = useCallback(async (messageData) => {
    const { 
      text, 
      attachments = [], 
      isBot = false, 
      isQuestionSelect = false, 
      isAnswerSelect = false 
    } = messageData;
    
    try {
      // 1. 添加用户或机器人消息
      const newMessage = {
        id: Date.now(),
        content: text,
        attachments,
        isUser: !isBot,
        isBot,
        timestamp: new Date().toISOString(),
        ...(serviceAgent && isBot ? { agent: serviceAgent } : {})
      };
      
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();

      // 2. 如果是机器人状态下的用户消息，添加机器人回复
      if (!isBot && chatState === ChatState.BOT && !isQuestionSelect && !isAnswerSelect) {
        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsAgentTyping(false);

        const botResponse = {
          id: Date.now() + 1,
          content: BotResponses.DEFAULT,
          isBot: true,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botResponse]);
        playMessageSound();
      }
      
      // 3. 如果是已连接客服状态下的用户消息，模拟客服回复
      else if (!isBot && chatState === ChatState.CONNECTED) {
        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsAgentTyping(false);

        const agentResponse = {
          id: Date.now() + 1,
          content: '收到您的问题，让我来帮您处理。',
          isBot: true,
          timestamp: new Date().toISOString(),
          agent: serviceAgent
        };
        
        setMessages(prev => [...prev, agentResponse]);
        playMessageSound();
      }

      // 所有情况都滚动到底部
      scrollToBottom();
      
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        type: "error"
      });
    }
  }, [chatState, serviceAgent, playMessageSound, scrollToBottom, toast]);

  // 结束会话
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
      console.error('End chat error:', error);
      toast({
        title: "结束失败",
        description: "结束会话失败，请重试",
        type: "error"
      });
    }
  }, [addSystemMessage, toast]);

  // 初始化
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const initialMessages = [
          {
            id: Date.now(),
            content: getSystemMessage(SystemMessageType.WELCOME),
            isSystem: true,
            timestamp: new Date().toISOString()
          }
        ];

        setMessages(initialMessages);
        setLoading(false);
        scrollToBottom();
        
      } catch (error) {
        console.error('Initialize error:', error);
        toast({
          title: "连接失败",
          description: "无法连接到客服系统，请刷新重试",
          type: "error"
        });
      }
    };

    initializeChat();
  }, [scrollToBottom, toast]);

  // 自动滚动
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
    serviceAgent,
    queuePosition,
    messageContainerRef,
    setIsSoundEnabled,
    handleSendMessage,
    handleTransferToAgent,
    handleEndChat,
  };
};
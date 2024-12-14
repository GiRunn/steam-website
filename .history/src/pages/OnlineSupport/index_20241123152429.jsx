// E:\Steam\steam-website\src\pages\OnlineSupport\index.jsx
// 在线客服页面主入口 - 整合智能机器人和人工客服功能的主页面

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Phone, Clock, MinusCircle, 
  Volume2, VolumeX, Robot
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import { Tooltip } from '../../components/ui/Tooltip';
import { useToast } from '../../components/ui/Toast';

// 导入常量和工具函数
import { 
  ChatState, 
  SystemMessageType, 
  BotResponses,
  getSystemMessage 
} from './constants';

// 导入子组件
const BotChat = React.lazy(() => import('./components/BotChat'));
const QuickReplies = React.lazy(() => import('./components/QuickReplies'));
const MessageList = React.lazy(() => import('./components/MessageList'));
const MessageInput = React.lazy(() => import('./components/MessageInput'));
const UserInfo = React.lazy(() => import('./components/UserInfo'));

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

const OnlineSupportPage = () => {
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
    // 提取问题类型
    const questionType = Object.keys(BotResponses).find(type => 
      message.toLowerCase().includes(type.toLowerCase())
    );

    if (!questionType) return;

    // 模拟回复延迟
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

      // 根据当前状态处理回复
      if (chatState === ChatState.BOT && !isBot) {
        await handleBotResponse(text);
      } else if (chatState === ChatState.CONNECTED) {
        // 处理已经存在的人工客服逻辑
        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const agentMessage = {
          id: Date.now(),
          content: `收到您的问题，我来为您处理...`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit
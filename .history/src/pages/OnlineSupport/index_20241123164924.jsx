// E:\Steam\steam-website\src\pages\OnlineSupport\index.jsx
// 在线客服页面主入口 - 整合智能机器人和人工客服功能的主页面

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Clock, MinusCircle, Volume2, VolumeX, Bot } from 'lucide-react';
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
const Header = React.lazy(() => import('./components/Header'));
const ChatControls = React.lazy(() => import('./components/ChatControls'));

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

// 声音控制钩子
const useSoundEffect = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const playMessageSound = useCallback(() => {
    if (isSoundEnabled) {
      const audio = new Audio('/sounds/message.mp3');
      audio.play().catch(err => console.log('Sound play failed:', err));
    }
  }, [isSoundEnabled]);

  return { isSoundEnabled, setIsSoundEnabled, playMessageSound };
};

// 消息管理钩子
const useMessages = ({ playMessageSound }) => {
  const [messages, setMessages] = useState([]);

  const addSystemMessage = useCallback((type, extraData = {}) => {
    const systemMessage = {
      id: Date.now(),
      content: getSystemMessage(type, extraData),
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  const addMessage = useCallback((messageData) => {
    const { text, isUser, isBot, attachments = [] } = messageData;
    const newMessage = {
      id: Date.now(),
      content: text,
      attachments,
      isUser,
      isBot,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    if (!isUser) {
      playMessageSound();
    }

    return newMessage.id;
  }, [playMessageSound]);

  const updateMessageStatus = useCallback((messageId, status) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status } 
          : msg
      )
    );
  }, []);

  return { messages, addMessage, addSystemMessage, updateMessageStatus };
};

// 主组件
const OnlineSupportPage = () => {
  // 基础状态
  const [loading, setLoading] = useState(true);
  const [chatState, setChatState] = useState(ChatState.BOT);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [serviceAgent, setServiceAgent] = useState(null);
  const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  
  // 引用和自定义钩子
  const messageListRef = useRef(null);
  const quickRepliesRef = useRef(null);
  const { toast } = useToast();
  const { isSoundEnabled, setIsSoundEnabled, playMessageSound } = useSoundEffect();
  const { messages, addMessage, addSystemMessage, updateMessageStatus } = useMessages({ 
    playMessageSound 
  });

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

  // 消息滚动效果
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // 机器人回复处理
  const handleBotResponse = useCallback(async (message) => {
    const questionType = Object.keys(BotResponses).find(type => 
      message.toLowerCase().includes(type.toLowerCase())
    );

    if (!questionType) return;

    setIsAgentTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const messageId = addMessage({
      text: BotResponses[questionType],
      isBot: true,
      isUser: false
    });

    setTimeout(() => updateMessageStatus(messageId, 'delivered'), 1000);
    setTimeout(() => updateMessageStatus(messageId, 'read'), 2000);
    
    setIsAgentTyping(false);
  }, [addMessage, updateMessageStatus]);

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
        type: "error"
      });
    }
  }, [addSystemMessage, toast]);

  // 发送消息处理
  const handleSendMessage = useCallback(async (messageData) => {
    try {
      const messageId = addMessage({
        ...messageData,
        isUser: true
      });

      if (chatState === ChatState.BOT && !messageData.isBot) {
        await handleBotResponse(messageData.text);
      } else if (chatState === ChatState.CONNECTED) {
        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        addMessage({
          text: "收到您的问题，我来为您处理...",
          isUser: false
        });
        
        setIsAgentTyping(false);
      }

      setTimeout(() => updateMessageStatus(messageId, 'delivered'), 1000);
      setTimeout(() => updateMessageStatus(messageId, 'read'), 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        type: "error"
      });
    }
  }, [chatState, handleBotResponse, addMessage, updateMessageStatus, toast]);

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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <Header 
          chatState={chatState}
          isSoundEnabled={isSoundEnabled}
          onSoundToggle={setIsSoundEnabled}
          onEndChat={handleEndChat}
        />

        <Suspense fallback={<LoadingScreen />}>
          <div className="flex-1 overflow-hidden flex flex-col relative">
            {serviceAgent && chatState === ChatState.CONNECTED && (
              <UserInfo user={serviceAgent} />
            )}

            <div 
              ref={messageListRef}
              className="flex-1 overflow-y-auto scroll-smooth"
              style={{
                scrollBehavior: 'smooth',
                transition: 'padding-bottom 0.3s ease'
              }}
            >
              <MessageList messages={messages} />
              
              {chatState === ChatState.BOT && (
                <BotChat 
                  onTransferToAgent={handleTransferToAgent}
                  onSendMessage={handleSendMessage}
                />
              )}
            </div>

            <ChatControls
              chatState={chatState}
              isAgentTyping={isAgentTyping}
              onSendMessage={handleSendMessage}
            />
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default OnlineSupportPage;
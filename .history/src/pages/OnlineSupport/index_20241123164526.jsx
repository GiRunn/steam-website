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
  const messageEndRef = useRef(null);

  // 添加系统消息
  const addSystemMessage = useCallback((type, extraData = {}) => {
    const systemMessage = {
      id: Date.now(),
      content: getSystemMessage(type, extraData),
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  // 修改后的消息添加逻辑
  const addMessage = useCallback((messageData) => {
    const { text, isUser, isBot, attachments = [] } = messageData;
    
    // 创建新消息对象
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

  // 更新消息状态
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
  // ===== 状态管理 =====
  const [loading, setLoading] = useState(true);
  const [chatState, setChatState] = useState(ChatState.BOT);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [serviceAgent, setServiceAgent] = useState(null);
  const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  // ===== Refs =====
  const messageListRef = useRef(null);
  const quickRepliesRef = useRef(null);

  // ===== Hooks =====
  const { toast } = useToast();
  const { messages, addMessage, addSystemMessage, updateMessageStatus } = useMessages({ 
    playMessageSound: () => {
      if (isSoundEnabled) {
        const audio = new Audio('/sounds/message.mp3');
        audio.play().catch(err => console.log('Sound play failed:', err));
      }
    }
  });

  // ===== 滚动处理 =====
  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      const scrollOptions = {
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth'
      };
      
      requestAnimationFrame(() => {
        try {
          messageListRef.current.scrollTo(scrollOptions);
        } catch (error) {
          console.error('Scroll error:', error);
          // 如果平滑滚动失败，尝试直接滚动
          messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
      });
    }
  }, []);

  // 监听消息变化时滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ===== 初始化加载 =====
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // 模拟初始化延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 添加欢迎消息和机器人介绍
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

  // ===== 机器人回复处理 =====
  const handleBotResponse = useCallback(async (message) => {
    try {
      const questionType = Object.keys(BotResponses).find(type => 
        message.toLowerCase().includes(type.toLowerCase())
      );

      if (!questionType) {
        addMessage({
          text: "抱歉，我没有理解您的问题。请尝试选择问题类型或转接人工客服。",
          isBot: true,
          isUser: false
        });
        return;
      }

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
    } catch (error) {
      console.error('Bot response error:', error);
      toast({
        title: "响应失败",
        description: "机器人响应出错，请重试",
        type: "error"
      });
      setIsAgentTyping(false);
    }
  }, [addMessage, updateMessageStatus, toast]);

  // ===== 转人工处理 =====
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
      setChatState(ChatState.BOT);
    }
  }, [addSystemMessage, toast]);

  // ===== 发送消息处理 =====
  const handleSendMessage = useCallback(async (messageData) => {
    try {
      const { text, isBot } = messageData;

      // 如果是机器人消息，先发送它
      if (isBot) {
        const botMessageId = addMessage({
          text,
          isBot: true,
          isUser: false
        });

        setTimeout(() => updateMessageStatus(botMessageId, 'delivered'), 1000);
        setTimeout(() => updateMessageStatus(botMessageId, 'read'), 2000);
        return;
      }

      // 发送用户消息
      const userMessageId = addMessage({
        text,
        isBot: false,
        isUser: true
      });

      setTimeout(() => updateMessageStatus(userMessageId, 'delivered'), 500);

      // 根据聊天状态处理回复
      if (chatState === ChatState.BOT) {
        await handleBotResponse(text);
      } else if (chatState === ChatState.CONNECTED) {
        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const agentMessageId = addMessage({
          text: "好的，我来帮您处理这个问题...",
          isBot: false,
          isUser: false
        });
        
        setTimeout(() => updateMessageStatus(agentMessageId, 'delivered'), 500);
        setIsAgentTyping(false);
      }

      scrollToBottom();
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        type: "error"
      });
    }
  }, [chatState, handleBotResponse, addMessage, updateMessageStatus, toast, scrollToBottom]);

  // ===== 结束会话处理 =====
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
        title: "操作失败",
        description: "结束会话失败，请重试",
        type: "error"
      });
    }
  }, [addSystemMessage, toast]);

  // ===== Loading 状态渲染 =====
  if (loading) {
    return <LoadingScreen />;
  }

  // ===== 主页面渲染 =====
  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* 页面头部 */}
        <Header 
          chatState={chatState}
          isSoundEnabled={isSoundEnabled}
          onSoundToggle={setIsSoundEnabled}
          onEndChat={handleEndChat}
        />

        {/* 主要内容区域 */}
        <Suspense fallback={<LoadingScreen />}>
          <div className="flex-1 overflow-hidden flex flex-col relative">
            {/* 客服信息 */}
            {serviceAgent && chatState === ChatState.CONNECTED && (
              <UserInfo user={serviceAgent} />
            )}

            {/* 消息列表区域 */}
            <div 
              ref={messageListRef}
              className="flex-1 overflow-y-auto scroll-smooth px-4 py-2"
              style={{
                scrollBehavior: 'smooth',
                overscrollBehavior: 'contain'
              }}
            >
              {/* 消息列表 */}
              <MessageList messages={messages} />
              
              {/* 机器人对话区域 */}
              {chatState === ChatState.BOT && (
                <BotChat 
                  onTransferToAgent={handleTransferToAgent}
                  onSendMessage={handleSendMessage}
                />
              )}
            </div>

            {/* 对话控制区域 */}
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
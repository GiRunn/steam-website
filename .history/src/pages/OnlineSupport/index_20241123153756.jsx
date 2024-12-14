// E:\Steam\steam-website\src\pages\OnlineSupport\index.jsx
// 在线客服页面主入口 - 整合智能机器人和人工客服功能的主页面

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Phone, Clock, MinusCircle, 
  Volume2, VolumeX, Bot
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
  
  const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
  const quickRepliesRef = useRef(null);
  const messageListRef = useRef(null);

// 监听快捷回复容器的高度变化
  useEffect(() => {
    if (!quickRepliesRef.current || !messageListRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const quickReplyHeight = entry.target.querySelector('.quick-reply-dropdown')?.offsetHeight || 0;
        
        // 动态调整消息列表的底部边距
        messageListRef.current.style.paddingBottom = isQuickReplyOpen ? 
          `${quickReplyHeight + 80}px` : // 80px 是基础边距
          '80px';

        // 滚动到底部
        if (isQuickReplyOpen) {
          setTimeout(() => {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
          }, 100); // 给动画一点时间
        }
      }
    });  

  

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
        {/* 头部导航 */}
        <header className="bg-gray-900/50 backdrop-blur-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {chatState === ChatState.BOT ? (
              <Bot className="w-6 h-6 text-blue-500" />
            ) : (
              <MessageCircle className="w-6 h-6 text-blue-500" />
            )}
            <h1 className="text-xl font-semibold">
              Steam在线客服
              {chatState !== ChatState.BOT && (
                <span className="text-sm text-gray-400 ml-2">
                  {chatState === ChatState.QUEUING ? '排队中' : 
                   chatState === ChatState.TRANSFERRING ? '转接中' : 
                   chatState === ChatState.CONNECTED ? '已连接' : ''}
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {chatState === ChatState.CONNECTED && (
              <>
                <Tooltip content="语音通话">
                  <button className="p-2 hover:bg-gray-800 rounded-full">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </button>
                </Tooltip>

                <Tooltip content="会话历史">
                  <button className="p-2 hover:bg-gray-800 rounded-full">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </button>
                </Tooltip>
              </>
            )}

            <Tooltip content={isSoundEnabled ? "关闭声音" : "开启声音"}>
              <button 
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="p-2 hover:bg-gray-800 rounded-full"
              >
                {isSoundEnabled 
                  ? <Volume2 className="w-5 h-5 text-gray-400" />
                  : <VolumeX className="w-5 h-5 text-gray-400" />
                }
              </button>
            </Tooltip>

            {chatState !== ChatState.BOT && chatState !== ChatState.ENDED && (
              <Tooltip content="结束会话">
                <button 
                  onClick={handleEndChat}
                  className="p-2 hover:bg-gray-800 rounded-full"
                >
                  <MinusCircle className="w-5 h-5 text-gray-400" />
                </button>
              </Tooltip>
            )}
          </div>
        </header>

        {/* 主要内容区域 */}
        <Suspense fallback={<LoadingScreen />}>
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* 客服信息 */}
            {serviceAgent && chatState === ChatState.CONNECTED && (
              <UserInfo user={serviceAgent} />
            )}

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto">
              <MessageList messages={messages} />
              
              {/* 机器人问答界面 */}
              {chatState === ChatState.BOT && (
                <BotChat 
                  onTransferToAgent={handleTransferToAgent}
                  onSendMessage={handleSendMessage}
                />
              )}
            </div>

            {/* 快捷回复 */}
            {chatState === ChatState.CONNECTED && (
              <QuickReplies onSelect={text => handleSendMessage({ text })} />
            )}

            {/* 消息输入 */}
            {(chatState === ChatState.CONNECTED || chatState === ChatState.BOT) && (
              <MessageInput 
                onSend={handleSendMessage} 
                disabled={isAgentTyping || chatState === ChatState.ENDED} 
                placeholder={
                  isAgentTyping ? "客服正在输入中..." : 
                  chatState === ChatState.BOT ? "输入您的问题..." :
                  "输入消息..."
                }
              />
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default OnlineSupportPage;
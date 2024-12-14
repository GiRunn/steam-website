// E:\Steam\steam-website\src\pages\OnlineSupport\index.jsx
// 在线客服页面主入口 - 整合所有在线客服功能的主页面

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Phone, Clock, MinusCircle, 
  Volume2, VolumeX, AlertCircle
} from 'lucide-react';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '@/components/ui/Toast';

// 导入子组件
import QuickReplies from './components/QuickReplies';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import UserInfo from './components/UserInfo';

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

// 系统消息类型枚举
const SystemMessageType = {
  WELCOME: 'welcome',
  TRANSFER: 'transfer',
  END: 'end',
  ERROR: 'error'
};

const OnlineSupportPage = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [serviceAgent, setServiceAgent] = useState(mockServiceAgent);
  const { toast } = useToast();

  // 音效播放功能
  const playMessageSound = useCallback(() => {
    if (isSoundEnabled) {
      // 这里可以添加消息提示音
      const audio = new Audio('/sounds/message.mp3');
      audio.play().catch(err => console.log('Sound play failed:', err));
    }
  }, [isSoundEnabled]);

  // 添加系统消息
  const addSystemMessage = useCallback((type, content) => {
    const systemMessage = {
      id: Date.now(),
      content: content || getDefaultSystemMessage(type),
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  // 获取默认系统消息
  const getDefaultSystemMessage = (type) => {
    switch (type) {
      case SystemMessageType.WELCOME:
        return `欢迎来到Steam在线客服！我是${serviceAgent.name}，很高兴为您服务。`;
      case SystemMessageType.TRANSFER:
        return "正在为您转接更专业的客服人员，请稍候...";
      case SystemMessageType.END:
        return "本次会话已结束，感谢您的使用。";
      case SystemMessageType.ERROR:
        return "抱歉，系统遇到了一些问题。请稍后再试。";
      default:
        return "";
    }
  };

  // 模拟客服回复
  const simulateAgentResponse = useCallback(async (userMessage) => {
    setIsAgentTyping(true);
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 根据用户消息内容生成回复
      let response = "我正在查看您的问题，请稍候...";
      if (userMessage.toLowerCase().includes('账号')) {
        response = "关于账号问题，请告诉我您遇到的具体情况，我会帮您检查并解决。";
      } else if (userMessage.toLowerCase().includes('支付')) {
        response = "对于支付问题，首先请确认您的支付方式和交易记录，我们一起来核实具体情况。";
      }

      const agentMessage = {
        id: Date.now(),
        content: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: 'sent'
      };

      setMessages(prev => [...prev, agentMessage]);
      playMessageSound();
      
    } catch (error) {
      console.error('Error in agent response:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        type: "error"
      });
    } finally {
      setIsAgentTyping(false);
    }
  }, [playMessageSound, toast]);

  // 发送消息处理
  const handleSendMessage = useCallback(async (messageData) => {
    const { text, attachments = [] } = messageData;
    
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

      // 触发客服回复
      await simulateAgentResponse(text);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        type: "error"
      });
    }
  }, [simulateAgentResponse, toast]);

  // 初始化加载
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        addSystemMessage(SystemMessageType.WELCOME);
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

  // 结束会话
  const handleEndChat = async () => {
    try {
      addSystemMessage(SystemMessageType.END);
      // 这里可以添加结束会话的其他逻辑
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
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* 头部导航 */}
        <header className="bg-gray-900 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold">Steam在线客服</h1>
          </div>
          <div className="flex items-center space-x-4">
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

            <Tooltip content="结束会话">
              <button 
                onClick={handleEndChat}
                className="p-2 hover:bg-gray-800 rounded-full"
              >
                <MinusCircle className="w-5 h-5 text-gray-400" />
              </button>
            </Tooltip>
          </div>
        </header>
        
        {/* 客服信息 */}
        <UserInfo user={serviceAgent} />

        {/* 快捷回复 */}
        <QuickReplies onSelect={text => handleSendMessage({ text })} />

        {/* 消息列表 */}
        <MessageList messages={messages} />

        {/* 消息输入 */}
        <MessageInput 
          onSend={handleSendMessage} 
          disabled={isAgentTyping} 
          placeholder={isAgentTyping ? "客服正在输入中..." : "输入消息..."}
        />
      </div>
    </div>
  );
};

export default OnlineSupportPage;
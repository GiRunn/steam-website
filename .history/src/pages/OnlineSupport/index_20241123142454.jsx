// E:\Steam\steam-website\src\pages\OnlineSupport\index.jsx
// 在线客服支持页面 - 提供实时客服咨询服务

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, User, Phone, Clock, Paperclip, 
  Image, Smile, Send, Loader, MinusCircle, 
  Volume2, VolumeX
} from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';
import { Tooltip } from '@/components/ui/Tooltip';

// 快捷回复选项组件
const QuickReplies = ({ onSelect }) => {
  const quickReplies = [
    "您好，请问有什么可以帮助您？",
    "账号相关问题",
    "支付相关问题",
    "游戏相关问题",
    "其他问题"
  ];

  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-4 bg-gray-900/50">
      {quickReplies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onSelect(reply)}
          className="whitespace-nowrap px-3 py-1 rounded-full text-sm
            bg-gray-800 hover:bg-gray-700 text-gray-300
            transition-colors duration-200"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

// 消息列表组件
const MessageList = ({ messages }) => {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((message, index) => (
        <Message key={index} {...message} />
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

// 单条消息组件
const Message = ({ content, isUser, timestamp, status, type = 'text' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`
        max-w-[70%] 
        ${isUser ? 'bg-blue-600' : 'bg-gray-800'} 
        rounded-lg px-4 py-2 text-white
        ${type === 'system' ? 'bg-gray-700/50 text-center max-w-full w-full' : ''}
      `}>
        <p className="text-sm">{content}</p>
        <div className="flex items-center justify-end mt-1 space-x-2">
          <span className="text-xs text-gray-400">{timestamp}</span>
          {isUser && status && (
            <span className="text-xs text-gray-400">
              {status === 'sent' && '✓'}
              {status === 'delivered' && '✓✓'}
              {status === 'read' && (
                <span className="text-blue-400">✓✓</span>
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// 消息输入组件
const MessageInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-800 p-4 space-y-2">
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-2 bg-gray-800 rounded-lg"
          >
            {/* 简单的表情选择器 */}
            <div className="grid grid-cols-8 gap-2">
              {['😊', '👍', '🎮', '❤️', '😄', '🎯', '💡', '✨'].map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(prev => prev + emoji)}
                  className="text-xl hover:bg-gray-700 p-1 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "客服正在输入中..." : "输入消息..."}
              disabled={disabled}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                resize-none min-h-[44px] max-h-[120px]"
              rows={1}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Tooltip content="添加表情">
              <button
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 
                  hover:text-gray-300 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
            </Tooltip>

            <Tooltip content="添加附件">
              <button
                type="button"
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 
                  hover:text-gray-300 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </Tooltip>

            <Tooltip content="发送图片">
              <button
                type="button"
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 
                  hover:text-gray-300 transition-colors"
              >
                <Image className="w-5 h-5" />
              </button>
            </Tooltip>

            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="bg-blue-600 text-white p-2 rounded-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-blue-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// 用户信息组件
const UserInfo = ({ user }) => {
  return (
    <div className="border-b border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{user.name}</h3>
            <p className="text-sm text-gray-400 flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span>{user.status}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">满意度 98%</span>
          <div className="w-1 h-1 bg-gray-600 rounded-full" />
          <span className="text-sm text-gray-400">响应时间 &lt;1分钟</span>
        </div>
      </div>
    </div>
  );
};

// 主页面组件
const OnlineSupportPage = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [user, setUser] = useState({
    name: '客服专员 Alice',
    status: '在线',
  });

  useEffect(() => {
    // 模拟加载初始数据
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages([
        {
          content: '欢迎来到Steam在线客服！我是您的专属客服Alice。',
          isUser: false,
          timestamp: '14:00',
          status: 'read',
          type: 'system'
        },
        {
          content: '请问有什么可以帮助您的吗？',
          isUser: false,
          timestamp: '14:00',
          status: 'read'
        },
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const simulateAgentResponse = async () => {
    setIsAgentTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newMessage = {
      content: '正在为您处理，请稍后...',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'read'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsAgentTyping(false);
  };

  const handleSendMessage = (content) => {
    const newMessage = {
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, newMessage]);
    simulateAgentResponse();

    // 模拟消息状态更新
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg === newMessage 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg === newMessage 
            ? { ...msg, status: 'read' }
            : msg
        )
      );
    }, 2000);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
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
            <Tooltip content="结束会话">
              <button className="p-2 hover:bg-gray-800 rounded-full">
                <MinusCircle className="w-5 h-5 text-gray-400" />
              </button>
            </Tooltip>
          </div>
        </header>
        
        <UserInfo user={user} />
        <QuickReplies onSelect={handleSendMessage} />
        <MessageList messages={messages} />
        <MessageInput onSend={handleSendMessage} disabled={isAgentTyping} />
      </div>
    </div>
  );
};

export default OnlineSupportPage;
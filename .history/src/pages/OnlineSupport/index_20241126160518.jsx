// src/pages/OnlineSupport/index.jsx
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useChat } from './hooks/useChat';
import { ChatState } from './constants/chatConstants';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorBoundary from '../../components/ErrorBoundary';
import { BOT_INFO } from './constants/botConfig';

// 侧边栏导航组件
const Sidebar = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { id: 'account', icon: '👤', label: '账号相关问题' },
    { id: 'payment', icon: '💰', label: '支付相关问题' },
    { id: 'game', icon: '🎮', label: '游戏相关问题' },
    { id: 'technical', icon: '⚙️', label: '技术支持' },
    { id: 'other', icon: '📌', label: '其他问题' }
  ];

  return (
    <div className="w-64 bg-[#0d1420] border-r border-gray-800/30">
      <div className="p-4 border-b border-gray-800/30">
        <h2 className="text-lg font-medium text-white">在线客服</h2>
      </div>
      <nav className="p-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center space-x-3 transition-colors
              ${activeCategory === category.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'}`}
          >
            <span className="text-xl">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// 顶部状态栏组件
const StatusBar = ({ agent, metrics }) => (
  <div className="bg-[#0d1420] border-b border-gray-800/30 p-4">
    <div className="flex items-center justify-between max-w-3xl mx-auto">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-400">在线</span>
        </div>
        <div className="text-sm text-gray-400">
          响应时间 &lt; 1s
        </div>
      </div>
      <div className="flex space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">满意度</span>
          <span className="text-sm text-blue-400">98%</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">解决率</span>
          <span className="text-sm text-blue-400">95%</span>
        </div>
      </div>
    </div>
  </div>
);

// 快捷功能栏组件
const QuickActions = () => (
  <div className="w-64 bg-[#0d1420] border-l border-gray-800/30 p-4">
    <h3 className="text-sm font-medium text-gray-400 mb-4">快捷功能</h3>
    <div className="space-y-3">
      <button className="w-full px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg text-sm text-gray-300 transition-colors">
        查看常见问题
      </button>
      <button className="w-full px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg text-sm text-gray-300 transition-colors">
        提交工单
      </button>
      <button className="w-full px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg text-sm text-gray-300 transition-colors">
        系统设置
      </button>
    </div>
  </div>
);

// 主聊天界面组件
const ChatInterface = React.memo(({ 
  messages, 
  isTyping, 
  chatState,
  onSendMessage,
  onTransferToAgent,
  messageContainerRef,
  isQuickReplyOpen,
  quickRepliesRef,
  onQuickReplySelect,
  serviceAgent
}) => (
  <div className="flex-1 flex flex-col h-full">
    {serviceAgent && (
      <div className="p-4 border-b border-gray-800/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            {serviceAgent.name[0]}
          </div>
          <div>
            <h3 className="font-medium text-white">{serviceAgent.name}</h3>
            <p className="text-sm text-gray-400">{serviceAgent.title}</p>
          </div>
        </div>
      </div>
    )}
    
    <div 
      ref={messageContainerRef}
      className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800/50 scrollbar-track-transparent p-4"
    >
      <Suspense fallback={<LoadingScreen />}>
        <MessageList 
          messages={messages}
          isTyping={isTyping}
          chatState={chatState}
          onTransferToAgent={onTransferToAgent}
          onSendMessage={onSendMessage}
        />
      </Suspense>
    </div>

    <div ref={quickRepliesRef}>
      <Suspense fallback={<div className="h-12" />}>
        <QuickReplies 
          isOpen={isQuickReplyOpen}
          onSelect={onQuickReplySelect}
          className="border-t border-gray-800/30"
        />
      </Suspense>
    </div>

    <div className="border-t border-gray-800/30 p-4">
      <Suspense fallback={<div className="h-12" />}>
        <MessageInput 
          onSend={onSendMessage}
          disabled={isTyping || chatState === ChatState.ENDED}
          placeholder={isTyping ? "AI助手正在思考..." : "请输入您的问题..."}
        />
      </Suspense>
    </div>
  </div>
));

// 主页面组件
const OnlineSupportPage = () => {
  const {
    loading,
    chatState,
    messages,
    isAgentTyping,
    serviceAgent,
    handleSendMessage,
    handleTransferToAgent,
    handleEndChat,
    messageContainerRef,
  } = useChat();

  const [activeCategory, setActiveCategory] = useState('account');
  const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
  const quickRepliesRef = useRef(null);

  const handleQuickReplySelect = (reply) => {
    handleSendMessage({ text: reply, isUser: true });
    setIsQuickReplyOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f16] flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <StatusBar 
        agent={serviceAgent || BOT_INFO}
        metrics={{
          responseTime: '< 1s',
          satisfaction: '98%',
          resolution: '95%'
        }}
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <ChatInterface 
            messages={messages}
            isTyping={isAgentTyping}
            chatState={chatState}
            onSendMessage={handleSendMessage}
            onTransferToAgent={handleTransferToAgent}
            messageContainerRef={messageContainerRef}
            isQuickReplyOpen={isQuickReplyOpen}
            quickRepliesRef={quickRepliesRef}
            onQuickReplySelect={handleQuickReplySelect}
            serviceAgent={serviceAgent}
          />
        </ErrorBoundary>
        
        <QuickActions />
      </div>
    </div>
  );
};

export default OnlineSupportPage;
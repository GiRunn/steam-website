// src/pages/OnlineSupport/components/BotChat.jsx
// 机器人对话组件 - 处理智能问答和问题分类

import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import Message from './Message';

// 机器人问题类型配置
export const BotQuestions = {
  ACCOUNT: {
    id: 'account',
    icon: '👤',
    text: '账号相关问题',
    description: '处理账号安全、密码重置等问题',
    answers: [
      { text: '忘记密码', icon: '🔑' },
      { text: '账号被盗', icon: '🚫' },
      { text: '修改邮箱', icon: '📧' },
      { text: '其他账号问题', icon: '❓' }
    ]
  },
  PAYMENT: {
    id: 'payment',
    icon: '💳',
    text: '支付相关问题',
    description: '解决支付流程和订单相关问题',
    answers: [
      { text: '支付失败', icon: '❌' },
      { text: '退款问题', icon: '💰' },
      { text: '订单查询', icon: '🔍' },
      { text: '其他支付问题', icon: '❓' }
    ]
  },
  GAME: {
    id: 'game',
    icon: '🎮',
    text: '游戏相关问题',
    description: '处理游戏运行和技术问题',
    answers: [
      { text: '游戏无法启动', icon: '🚫' },
      { text: '游戏内bug', icon: '🐛' },
      { text: '游戏更新问题', icon: '⚡' },
      { text: '其他游戏问题', icon: '❓' }
    ]
  }
};

const BotChat = ({ onTransferToAgent, onSendMessage }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const botName = "Steam智能助手";

  // 问题类型选择处理
  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
  };

  // 具体问题选择处理
  const handleAnswerSelect = (answer) => {
    onSendMessage({
      text: `${selectedQuestion.text} - ${answer.text}`,
      isUser: true
    });
  };

  const renderQuestionOptions = () => (
    <div className="space-y-2">
      {Object.values(BotQuestions).map((question) => (
        <button
          key={question.id}
          className={`w-full text-left p-3 rounded-lg border 
            transition-all duration-200 flex items-center gap-3 group
            ${selectedQuestion?.id === question.id 
              ? 'border-blue-500/50 bg-blue-500/10' 
              : 'border-gray-700 hover:border-blue-500/30 hover:bg-blue-500/5'}`}
          onClick={() => handleQuestionSelect(question)}
        >
          <span className="text-xl group-hover:scale-110 transition-transform">
            {question.icon}
          </span>
          <div>
            <div className="text-gray-200">{question.text}</div>
            <div className="text-gray-500 text-sm">{question.description}</div>
          </div>
        </button>
      ))}
    </div>
  );

  const renderAnswerOptions = () => (
    <div className="space-y-2">
      {selectedQuestion?.answers.map((answer, index) => (
        <button
          key={index}
          className="w-full p-3 rounded-lg border border-gray-700
            hover:border-blue-500/30 hover:bg-blue-500/5
            text-gray-200 transition-all duration-200
            flex items-center gap-2 group"
          onClick={() => handleAnswerSelect(answer)}
        >
          <span className="group-hover:scale-110 transition-transform">
            {answer.icon}
          </span>
          <span>{answer.text}</span>
        </button>
      ))}
      <button
        onClick={onTransferToAgent}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 
          hover:from-blue-500 hover:to-blue-400
          rounded-lg text-white text-sm transition-all duration-300
          flex items-center justify-center gap-2"
      >
        <Bot className="w-4 h-4" />
        转接人工客服
      </button>
    </div>
  );

  // 只渲染问题选择界面
  return (
    <div className="space-y-4 p-4">
      {/* 问题类型选择 */}
      <Message
        content={(
          <div className="space-y-3">
            <p className="text-gray-300 mb-3">请选择问题类型：</p>
            {renderQuestionOptions()}
          </div>
        )}
        isBot={true}
        timestamp={new Date().toISOString()}
        userName={botName}
      />

      {/* 显示具体问题选项 */}
      {selectedQuestion && (
        <Message
          content={(
            <div className="space-y-3">
              <p className="text-gray-300 mb-2">请选择具体问题：</p>
              {renderAnswerOptions()}
            </div>
          )}
          isBot={true}
          timestamp={new Date().toISOString()}
          userName={botName}
        />
      )}
    </div>
  );
};

export default React.memo(BotChat);
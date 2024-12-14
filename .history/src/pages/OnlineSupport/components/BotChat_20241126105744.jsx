// src/pages/OnlineSupport/components/BotChat.jsx
// 机器人对话组件 - 作为消息流的一部分

import React, { useState } from 'react';
import { Bot } from 'lucide-react';

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

const QuestionOptions = ({ onSelect }) => (
  <div className="space-y-2">
    {Object.values(BotQuestions).map((question) => (
      <button
        key={question.id}
        className="w-full text-left p-3 rounded-lg border border-gray-700
          hover:border-blue-500/30 hover:bg-blue-500/5
          transition-all duration-200 flex items-center gap-3 group"
        onClick={() => onSelect(question)}
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

const AnswerOptions = ({ question, onSelect, onTransferToAgent }) => (
  <div className="space-y-2">
    {question.answers.map((answer, index) => (
      <button
        key={index}
        className="w-full p-3 rounded-lg border border-gray-700
          hover:border-blue-500/30 hover:bg-blue-500/5
          text-gray-200 transition-all duration-200
          flex items-center gap-2 group"
        onClick={() => onSelect(answer)}
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

const BotChat = ({ onTransferToAgent, onSendMessage, selectedQuestion, onQuestionSelect }) => {
  // 问题类型选择处理
  const handleQuestionSelect = (question) => {
    onQuestionSelect?.(question);
    // 发送用户选择的问题类型作为消息
    onSendMessage({
      text: question.text,
      isUser: true,
      isQuestionSelect: true
    });
  };

  // 具体问题选择处理
  const handleAnswerSelect = (answer) => {
    // 发送用户选择的具体问题作为消息
    onSendMessage({
      text: `${selectedQuestion.text} - ${answer.text}`,
      isUser: true,
      isAnswerSelect: true
    });
  };

  return selectedQuestion ? (
    <AnswerOptions 
      question={selectedQuestion}
      onSelect={handleAnswerSelect}
      onTransferToAgent={onTransferToAgent}
    />
  ) : (
    <QuestionOptions onSelect={handleQuestionSelect} />
  );
};

export default React.memo(BotChat);
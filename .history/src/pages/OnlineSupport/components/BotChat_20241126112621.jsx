import React, { useState, useCallback, memo } from 'react';
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
  // 修改：移除外层 div，改用 section
  <section className="space-y-2">
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
  </section>
);

const AnswerOptions = ({ question, onSelect, onTransferToAgent }) => (
  // 修改：移除外层 div，改用 section
  <section className="space-y-2">
    <div className="mb-3 text-gray-400">
      已选择：{question.text}
    </div>
    {question.answers.map((answer, index) => (
      <button
        key={`${question.id}-answer-${index}`}
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
  </section>
);

const BotChat = memo(({ onTransferToAgent, onSendMessage, selectedQuestion, onQuestionSelect }) => {
  // 问题类型选择处理
  const handleQuestionSelect = useCallback((question) => {
    onQuestionSelect?.(question);
    onSendMessage({
      text: question.text,
      isUser: true,
      isQuestionSelect: true,
      question: question
    });
  }, [onQuestionSelect, onSendMessage]);

  // 具体问题选择处理
  const handleAnswerSelect = useCallback((answer) => {
    if (!selectedQuestion) return;
    
    onSendMessage({
      text: `${selectedQuestion.text} - ${answer.text}`,
      isUser: true,
      isAnswerSelect: true
    });
  }, [selectedQuestion, onSendMessage]);

  return (
    <div className="flex flex-col transition-all duration-300">
      {selectedQuestion ? (
        <AnswerOptions 
          question={selectedQuestion}
          onSelect={handleAnswerSelect}
          onTransferToAgent={onTransferToAgent}
        />
      ) : (
        <QuestionOptions onSelect={handleQuestionSelect} />
      )}
    </div>
  );
});

BotChat.displayName = 'BotChat';

export default BotChat;

export default memo(BotChat);
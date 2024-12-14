// E:\Steam\steam-website\src\pages\OnlineSupport\components\BotChat.jsx
// 机器人对话组件 - 修复消息顺序显示问题

import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import Message from './Message';

// 机器人问题类型配置保持不变...
export const BotQuestions = {
  // ... 保持原有配置不变
};

const BotChat = ({ onTransferToAgent, onSendMessage }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const botAvatar = null;
  const botName = "Steam智能助手";

  // 问题类型选择处理
  const handleQuestionSelect = (question) => {
    // 先发送机器人的问题类型确认消息
    onSendMessage({
      text: `您选择了"${question.text}"，请选择具体的问题类型：`,
      isBot: true,
      isUser: false
    });
    
    // 然后再发送用户的选择
    onSendMessage({
      text: question.text,
      isBot: false,
      isUser: true
    });
    
    setSelectedQuestion(question);
  };

  // 具体问题选择处理
  const handleAnswerSelect = (answer) => {
    const fullQuestion = `${selectedQuestion.text} - ${answer.text}`;
    
    // 先发送用户选择
    onSendMessage({
      text: fullQuestion,
      isBot: false,
      isUser: true
    });
    
    // 延迟发送机器人回复，模拟真实对话节奏
    setTimeout(() => {
      onSendMessage({
        text: `我会帮您处理"${fullQuestion}"的问题。`,
        isBot: true,
        isUser: false
      });
    }, 500);
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

  return (
    <div className="space-y-4 p-4">
      {/* 欢迎消息 */}
      <Message
        content="您好！我是Steam智能助手，请问遇到了什么问题？"
        isUser={false}
        timestamp={new Date().toISOString()}
        avatar={botAvatar}
        userName={botName}
      />

      {/* 问题类型选择 */}
      <Message
        content={(
          <div className="space-y-3">
            <p className="text-gray-300 mb-3">请选择问题类型：</p>
            {renderQuestionOptions()}
          </div>
        )}
        isUser={false}
        timestamp={new Date().toISOString()}
        avatar={botAvatar}
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
          isUser={false}
          timestamp={new Date().toISOString()}
          avatar={botAvatar}
          userName={botName}
        />
      )}
    </div>
  );
};

export default BotChat;
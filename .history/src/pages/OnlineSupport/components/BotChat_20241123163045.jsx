// E:\Steam\steam-website\src\pages\OnlineSupport\components\BotChat.jsx
// 机器人对话组件 - 对话式自动问答逻辑

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot } from 'lucide-react';

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

const BotMessage = ({ children, isUser = false }) => (
  <div className={`flex items-start gap-3 px-6 py-4 ${isUser ? 'flex-row-reverse' : ''}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
      ${isUser ? 'bg-blue-500' : 'bg-gradient-to-br from-purple-500 to-blue-500'}`}>
      {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
    </div>
    <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
      {children}
    </div>
  </div>
);

const BotChat = ({ onTransferToAgent, onSendMessage }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    onSendMessage({
      text: `${question.text}`,
      isBot: true,
      isUser: true
    });
  };

  const handleAnswerSelect = (answer) => {
    onSendMessage({
      text: `${selectedQuestion.text} - ${answer.text}`,
      isBot: true,
      isUser: true
    });
  };

  return (
    <div className="space-y-2">
      {/* 欢迎消息 */}
      <BotMessage>
        <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-white">您好！我是Steam智能助手，请问遇到了什么问题？</p>
        </div>
      </BotMessage>

      {/* 问题类型选择 */}
      <BotMessage>
        <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm space-y-3">
          <p className="text-gray-300 text-sm mb-3">请选择问题类型：</p>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(BotQuestions).map((question) => (
              <motion.button
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200
                  ${selectedQuestion?.id === question.id 
                    ? 'border-blue-500/50 bg-blue-500/10' 
                    : 'border-gray-700 hover:border-blue-500/30 hover:bg-blue-500/5'}`}
                onClick={() => handleQuestionSelect(question)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{question.icon}</span>
                  <div>
                    <div className="text-gray-200">{question.text}</div>
                    <div className="text-gray-500 text-sm">{question.description}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </BotMessage>

      {/* 选择具体问题 */}
      <AnimatePresence>
        {selectedQuestion && (
          <>
            {/* 用户选择的问题类型 */}
            <BotMessage isUser>
              <div className="bg-blue-500/20 border border-blue-500/20 rounded-lg p-3">
                <p className="text-white">{selectedQuestion.text}</p>
              </div>
            </BotMessage>

            {/* 具体问题选项 */}
            <BotMessage>
              <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm space-y-3">
                <p className="text-gray-300 text-sm mb-2">请选择具体问题：</p>
                <div className="grid grid-cols-1 gap-2">
                  {selectedQuestion.answers.map((answer, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-3 rounded-lg border border-gray-700
                        hover:border-blue-500/30 hover:bg-blue-500/5
                        text-gray-200 transition-all duration-200"
                      onClick={() => handleAnswerSelect(answer)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{answer.icon}</span>
                        <span>{answer.text}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="pt-3">
                  <button
                    onClick={onTransferToAgent}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 
                      hover:from-blue-500 hover:to-blue-400
                      rounded-lg text-white text-sm transition-all duration-300
                      flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    转接人工客服
                  </button>
                </div>
              </div>
            </BotMessage>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BotChat;
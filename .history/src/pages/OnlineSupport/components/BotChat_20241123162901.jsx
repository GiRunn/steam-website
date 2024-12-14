// E:\Steam\steam-website\src\pages\OnlineSupport\components\BotChat.jsx
// 机器人对话组件 - 处理自动问答逻辑

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, ChevronRight, HelpCircle } from 'lucide-react';

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

  // 问题选择处理
  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    onSendMessage({
      text: `选择问题类型: ${question.text}`,
      isBot: true,
      isUser: true
    });
  };

  // 具体问题选择处理
  const handleAnswerSelect = (answer) => {
    onSendMessage({
      text: `${selectedQuestion.text} - ${answer.text}`,
      isBot: true,
      isUser: true
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-[#0f172a] to-[#0a0f16] border-b border-gray-800/30"
    >
      {/* 机器人助手头部 */}
      <div className="px-6 py-4 border-b border-gray-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">智能助手</h3>
            <p className="text-sm text-gray-400">24/7 在线为您服务</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 选择提示 */}
        <div className="flex items-center gap-2 text-gray-400 text-sm border border-gray-800/50 rounded-lg p-3 bg-gray-900/30">
          <HelpCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>请选择您遇到的问题类型，智能助手将为您提供解答</span>
        </div>
        
        {/* 问题类型选择 */}
        <div className="grid grid-cols-1 gap-4">
          {Object.values(BotQuestions).map((question) => (
            <motion.button
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative p-4 rounded-lg border 
                transition-all duration-300 ease-out
                ${selectedQuestion?.id === question.id 
                  ? 'border-blue-500/50 bg-blue-500/10' 
                  : 'border-gray-800 hover:border-blue-500/30 hover:bg-blue-500/5'
                }`}
              onClick={() => handleQuestionSelect(question)}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{question.icon}</span>
                <div className="flex-1 text-left">
                  <div className="text-gray-200 font-medium">{question.text}</div>
                  <div className="text-sm text-gray-500 mt-1">{question.description}</div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform duration-300
                  ${selectedQuestion?.id === question.id ? 'rotate-90 text-blue-400' : 'text-gray-600'}`} 
                />
              </div>
            </motion.button>
          ))}
        </div>

        {/* 具体问题选择区域 */}
        <AnimatePresence>
          {selectedQuestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-gray-800/30"
            >
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                请选择具体问题：
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {selectedQuestion.answers.map((answer, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-3 rounded-lg border border-gray-800 
                      hover:border-blue-500/30 hover:bg-blue-500/5
                      text-gray-300 transition-all duration-200"
                    onClick={() => handleAnswerSelect(answer)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{answer.icon}</span>
                      <span>{answer.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* 转人工按钮 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-6"
              >
                <button
                  onClick={onTransferToAgent}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 
                    hover:from-blue-500 hover:to-blue-400
                    rounded-lg text-white transition-all duration-300
                    flex items-center justify-center gap-2 
                    shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                >
                  <User className="w-5 h-5" />
                  转接人工客服
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BotChat;
// E:\Steam\steam-website\src\pages\OnlineSupport\components\BotChat.jsx
// 机器人对话组件 - 处理自动问答逻辑

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react'; // 确保使用User图标

// 机器人问题类型配置
export const BotQuestions = {
  ACCOUNT: {
    id: 'account',
    text: '账号相关问题',
    answers: [
      '忘记密码',
      '账号被盗',
      '修改邮箱',
      '其他账号问题'
    ]
  },
  PAYMENT: {
    id: 'payment',
    text: '支付相关问题',
    answers: [
      '支付失败',
      '退款问题',
      '订单查询',
      '其他支付问题'
    ]
  },
  GAME: {
    id: 'game',
    text: '游戏相关问题',
    answers: [
      '游戏无法启动',
      '游戏内bug',
      '游戏更新问题',
      '其他游戏问题'
    ]
  }
};

const BotChat = ({ onTransferToAgent, onSendMessage }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // 问题选择处理
  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    // 发送用户选择的问题类型消息
    onSendMessage({
      text: `选择问题类型: ${question.text}`,
      isBot: true,
      isUser: true
    });
  };

  // 具体问题选择处理
  const handleAnswerSelect = (answer) => {
    onSendMessage({
      text: `${selectedQuestion.text} - ${answer}`,
      isBot: true,
      isUser: true
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="text-center text-gray-400 text-sm">
        请选择您遇到的问题类型，智能助手将为您提供解答
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {Object.values(BotQuestions).map((question) => (
          <motion.button
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border border-gray-800 
              hover:border-blue-500/50 hover:bg-blue-500/10 
              transition-all duration-200
              ${selectedQuestion?.id === question.id ? 'border-blue-500 bg-blue-500/20' : ''}`}
            onClick={() => handleQuestionSelect(question)}
          >
            <span className="text-gray-200">{question.text}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedQuestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="text-sm text-gray-400 mt-4">
              请选择具体问题：
            </div>
            <div className="grid grid-cols-2 gap-2">
              {selectedQuestion.answers.map((answer, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-lg border border-gray-800 
                    hover:border-blue-500/50 hover:bg-blue-500/10
                    text-sm text-gray-300"
                  onClick={() => handleAnswerSelect(answer)}
                >
                  {answer}
                </motion.button>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-6"
            >
              <button
                onClick={onTransferToAgent}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 
                  rounded-full text-sm text-white transition-colors
                  flex items-center justify-center gap-2 mx-auto"
              >
                <User className="w-4 h-4" />
                转接人工客服
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BotChat;
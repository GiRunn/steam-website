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

const handleSendMessage = useCallback(async (messageData) => {
  const { 
    text, 
    attachments = [], 
    isBot = false, 
    isQuestionSelect = false, 
    isAnswerSelect = false,
    question = null  // 新增参数，用于传递选中的问题对象
  } = messageData;
  
  try {
    if (isQuestionSelect) {
      // 添加用户选择的消息
      const userMessage = {
        id: Date.now(),
        content: text,
        isUser: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      scrollToBottom();
      
      // 更新选中的问题状态，这会触发 BotChat 显示二级菜单
      setSelectedQuestion(question);
      
    } else if (isAnswerSelect) {
      // 用户选择了具体问题
      const userMessage = {
        id: Date.now(),
        content: text,
        isUser: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      scrollToBottom();

      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 添加机器人的回复
      const botResponse = {
        id: Date.now() + 1,
        content: "好的，我来帮您解决这个问题。在此之前，您能详细描述一下具体情况吗？",
        isBot: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botResponse]);
      playMessageSound();
      scrollToBottom();
      
      // 重置选中的问题，为下一次交互做准备
      setSelectedQuestion(null);

    } else if (chatState === ChatState.BOT && !isBot) {
      // 处理普通消息...
      const userMessage = {
        id: Date.now(),
        content: text,
        attachments,
        isUser: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      scrollToBottom();

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const questionType = Object.keys(BotResponses).find(type => 
        text.toLowerCase().includes(type.toLowerCase())
      );

      const botResponse = {
        id: Date.now() + 1,
        content: questionType 
          ? BotResponses[questionType]
          : "抱歉，我可能没有完全理解您的问题。您可以换个方式描述，或者选择转接人工客服获得帮助。",
        isBot: true,
        isResponse: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botResponse]);
      playMessageSound();
      scrollToBottom();
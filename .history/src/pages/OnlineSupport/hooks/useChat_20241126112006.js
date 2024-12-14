// src/pages/OnlineSupport/hooks/useChat.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';
import {
  ChatState,
  MessageType,
  SystemMessageType,
  TransferConditions,
  getSystemMessage
} from '../constants/chatConstants';

// 消息队列管理器
class MessageQueueManager {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(message) {
    this.queue.push(message);
    if (!this.processing) {
      await this.process();
    }
  }

  async process() {
    this.processing = true;
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      await new Promise(resolve => setTimeout(resolve, 500));
      this.onMessage?.(message);
    }
    this.processing = false;
  }

  setMessageHandler(handler) {
    this.onMessage = handler;
  }
}

export const useChat = () => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [chatState, setChatState] = useState(ChatState.INITIAL);
  const [messages, setMessages] = useState([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [queuePosition, setQueuePosition] = useState(0);
  const [serviceAgent, setServiceAgent] = useState(null);
  const [transferScore, setTransferScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // refs
  const messageContainerRef = useRef(null);
  const messageQueueRef = useRef(new MessageQueueManager());
  const lastUserMessageRef = useRef(null);
  const userMessageCountRef = useRef(0);
  const conversationStartTimeRef = useRef(Date.now());

  const { toast } = useToast();

  // 音效播放
  const playMessageSound = useCallback(() => {
    if (isSoundEnabled) {
      const audio = new Audio('/sounds/message.mp3');
      audio.play().catch(err => console.log('Sound play failed:', err));
    }
  }, [isSoundEnabled]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // 分析是否需要转人工
  const analyzeTransferNeed = useCallback((message) => {
    let score = 0;
    const text = message.content.toLowerCase();

    // 关键词检查
    Object.values(TransferConditions.KEYWORDS).forEach(keywords => {
      if (keywords.some(keyword => text.includes(keyword))) {
        score += 0.3;
      }
    });

    // 重复问题检查
    if (lastUserMessageRef.current === text) {
      score += 0.2;
    }

    // 会话时长检查
    const conversationTime = Date.now() - conversationStartTimeRef.current;
    if (conversationTime > TransferConditions.THRESHOLDS.CONVERSATION_TIME) {
      score += 0.2;
    }

    // 消息频率检查
    userMessageCountRef.current += 1;
    if (userMessageCountRef.current >= TransferConditions.THRESHOLDS.REPEAT_QUESTIONS) {
      score += 0.1;
    }

    lastUserMessageRef.current = text;
    return score;
  }, []);

  // 处理消息发送
  const handleSendMessage = useCallback(async (messageData) => {
    const {
      text,
      attachments = [],
      isBot = false,
      isQuestionSelect = false,
      isAnswerSelect = false,
      type = MessageType.USER
    } = messageData;

    try {
      const newMessage = {
        id: Date.now(),
        content: text,
        attachments,
        timestamp: new Date().toISOString(),
        type,
        isBot
      };

      // 添加到消息队列
      await messageQueueRef.current.add(newMessage);

      // 分析是否需要转人工
      if (type === MessageType.USER) {
        const score = analyzeTransferNeed(newMessage);
        setTransferScore(prev => {
          const newScore = prev + score;
          if (newScore >= TransferConditions.THRESHOLDS.TRANSFER_SCORE) {
            handleTransferToAgent();
          }
          return newScore;
        });
      }

      // 处理问题选择逻辑
      if (isQuestionSelect || isAnswerSelect) {
        handleQuestionFlow(messageData);
      }

      playMessageSound();
      scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        type: "error",
        duration: 3000
      });
    }
  }, [analyzeTransferNeed, playMessageSound, scrollToBottom, toast]);

  // 处理问题流程
  const handleQuestionFlow = useCallback((messageData) => {
    const { isQuestionSelect, isAnswerSelect, question } = messageData;

    if (isQuestionSelect) {
      setSelectedCategory(question);
      setChatState(ChatState.DETAIL_SELECTING);
    } else if (isAnswerSelect) {
      setChatState(ChatState.INFO_COLLECTING);
      // 检查是否是复杂问题需要直接转人工
      if (TransferConditions.KEYWORDS.COMPLEX.some(keyword => 
        messageData.text.includes(keyword)
      )) {
        handleTransferToAgent();
      }
    }
  }, []);

  // 转人工处理
  const handleTransferToAgent = useCallback(async () => {
    try {
      setChatState(ChatState.TRANSFERRING);
      await messageQueueRef.current.add({
        id: Date.now(),
        content: getSystemMessage(SystemMessageType.TRANSFER),
        type: MessageType.SYSTEM,
        timestamp: new Date().toISOString()
      });

      // 模拟排队
      let position = 3;
      const queueInterval = setInterval(() => {
        position--;
        setQueuePosition(position);
        
        if (position <= 0) {
          clearInterval(queueInterval);
          setServiceAgent(mockServiceAgent);
          setChatState(ChatState.CONNECTED);
          messageQueueRef.current.add({
            id: Date.now(),
            content: getSystemMessage(SystemMessageType.CONNECTED, {
              agentName: mockServiceAgent.name
            }),
            type: MessageType.SYSTEM,
            timestamp: new Date().toISOString()
          });
        }
      }, 2000);

    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "转接失败",
        description: "无法转接人工客服，请稍后重试",
        type: "error",
        duration: 3000
      });
    }
  }, [toast]);

  // 初始化
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // 设置消息处理器
        messageQueueRef.current.setMessageHandler((message) => {
          setMessages(prev => [...prev, message]);
        });

        // 添加欢迎消息
        await messageQueueRef.current.add({
          id: Date.now(),
          content: getSystemMessage(SystemMessageType.WELCOME),
          type: MessageType.SYSTEM,
          timestamp: new Date().toISOString()
        });

        setChatState(ChatState.BOT);
        setLoading(false);

      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "连接失败",
          description: "无法连接到客服系统，请刷新页面重试",
          type: "error",
          duration: 3000
        });
      }
    };

    initializeChat();
  }, [toast]);

  return {
    loading,
    chatState,
    messages,
    isAgentTyping,
    isSoundEnabled,
    queuePosition,
    serviceAgent,
    messageContainerRef,
    selectedCategory,
    setIsSoundEnabled,
    handleSendMessage,
    handleTransferToAgent,
    scrollToBottom
  };
};
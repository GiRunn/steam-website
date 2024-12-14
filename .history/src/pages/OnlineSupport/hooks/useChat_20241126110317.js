import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../../../components/ui/Toast';
import { 
  ChatState, 
  SystemMessageType, 
  BotResponses, 
  getSystemMessage 
} from '../constants/chatConstants';
import BotChat from '../components/BotChat';

// 消息类型常量
const MessageType = {
  SYSTEM: 'system',
  USER: 'user',
  BOT: 'bot',
  AGENT: 'agent'
};

// 消息状态常量
const MessageStatus = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  ERROR: 'error'
};

// 模拟客服数据
const mockServiceAgent = {
  name: "Alice Wang",
  status: "在线",
  statusMessage: "随时为您服务",
  verified: true,
  satisfaction: 98,
  responseTime: "<1分钟",
  resolutionRate: 95,
  specialties: ["账号问题", "支付问题", "游戏问题"],
  currentLoad: {
    current: 3,
    queue: 2
  }
};

// 消息工具函数组件
const MessageUtils = {
  // 创建基础消息对象
  createBaseMessage: (content, type) => ({
    id: Date.now(),
    content,
    timestamp: new Date().toISOString(),
    type
  }),

  // 创建系统消息
  createSystemMessage: (content) => ({
    ...MessageUtils.createBaseMessage(content, MessageType.SYSTEM),
    isInitialMessage: true
  }),

  // 创建用户消息
  createUserMessage: (content, attachments = []) => ({
    ...MessageUtils.createBaseMessage(content, MessageType.USER),
    attachments,
    isUser: true,
    status: MessageStatus.SENT
  }),

  // 创建机器人消息
  createBotMessage: (content) => ({
    ...MessageUtils.createBaseMessage(content, MessageType.BOT),
    isBot: true
  }),

  // 创建客服消息
  createAgentMessage: (content, agentName) => ({
    ...MessageUtils.createBaseMessage(content, MessageType.AGENT),
    isAgent: true,
    agentName,
    status: MessageStatus.SENT
  })
};

// 状态处理函数组件
const StateHandlers = {
  // 处理消息状态更新
  updateMessageStatus: (messages, messageId, newStatus) => 
    messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: newStatus }
        : msg
    ),

  // 处理客服状态变更
  handleAgentStateChange: (setChatState, addSystemMessage) => {
    setChatState(ChatState.CONNECTED);
    addSystemMessage(SystemMessageType.CONNECTED);
  }
};

// 队列处理函数组件
const QueueHandlers = {
  // 模拟队列进度更新
  simulateQueueProgress: (
    setQueuePosition, 
    addSystemMessage, 
    onComplete
  ) => {
    let position = 3;
    const interval = setInterval(() => {
      position--;
      setQueuePosition(position);
      addSystemMessage(SystemMessageType.QUEUE, { queuePosition: position });
      
      if (position <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 2000);
    
    return interval;
  }
};

// 主Hook实现
export const useChat = () => {
  // 状态定义
  const [loading, setLoading] = useState(true);
  const [chatState, setChatState] = useState(ChatState.BOT);
  const [messages, setMessages] = useState([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [queuePosition, setQueuePosition] = useState(0);
  const [serviceAgent, setServiceAgent] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  // Refs和Hooks
  const messageContainerRef = useRef(null);
  const { toast } = useToast();

  // 工具函数
  const scrollToBottom = useCallback(() => {
    if (!messageContainerRef.current) return;
    messageContainerRef.current.scrollTo({
      top: messageContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, []);

  const playMessageSound = useCallback(() => {
    if (isSoundEnabled) {
      const audio = new Audio('/sounds/message.mp3');
      audio.play().catch(err => console.log('Sound play failed:', err));
    }
  }, [isSoundEnabled]);

  const addSystemMessage = useCallback((type, extraData = {}) => {
    const message = MessageUtils.createSystemMessage(
      getSystemMessage(type, extraData)
    );
    setMessages(prev => [...prev, message]);
    scrollToBottom();
  }, [scrollToBottom]);

  // 转人工处理
  const handleTransferToAgent = useCallback(async () => {
    try {
      setChatState(ChatState.TRANSFERRING);
      addSystemMessage(SystemMessageType.TRANSFER);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setChatState(ChatState.QUEUING);
      
      QueueHandlers.simulateQueueProgress(
        setQueuePosition,
        addSystemMessage,
        () => {
          setServiceAgent(mockServiceAgent);
          StateHandlers.handleAgentStateChange(setChatState, addSystemMessage);
        }
      );
      
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "转接失败",
        description: "无法转接人工客服，请稍后重试",
        type: "error",
        duration: 3000
      });
    }
  }, [addSystemMessage, toast]);

  // 消息发送处理
  const handleSendMessage = useCallback(async (messageData) => {
    const { 
      text, 
      attachments = [], 
      isBot = false, 
      isQuestionSelect = false, 
      isAnswerSelect = false,
      question = null
    } = messageData;
    
    try {
      if (isQuestionSelect) {
        const userMessage = MessageUtils.createUserMessage(text, attachments);
        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();
        setSelectedQuestion(question);
        
      } else if (isAnswerSelect) {
        const userMessage = MessageUtils.createUserMessage(text, attachments);
        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();

        await new Promise(resolve => setTimeout(resolve, 500));
        
        const botResponse = MessageUtils.createBotMessage(
          "好的，我来帮您解决这个问题。在此之前，您能详细描述一下具体情况吗？"
        );
        setMessages(prev => [...prev, botResponse]);
        playMessageSound();
        scrollToBottom();
        setSelectedQuestion(null);

      } else if (chatState === ChatState.BOT && !isBot) {
        const userMessage = MessageUtils.createUserMessage(text, attachments);
        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const questionType = Object.keys(BotResponses).find(type => 
          text.toLowerCase().includes(type.toLowerCase())
        );

        const botResponse = MessageUtils.createBotMessage(
          questionType 
            ? BotResponses[questionType]
            : "抱歉，我可能没有完全理解您的问题。您可以换个方式描述，或者选择转接人工客服获得帮助。"
        );
        
        setMessages(prev => [...prev, botResponse]);
        playMessageSound();
        scrollToBottom();

      } else if (chatState === ChatState.CONNECTED) {
        const userMessage = MessageUtils.createUserMessage(text, attachments);
        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();

        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const agentMessage = MessageUtils.createAgentMessage(
          `收到您的问题，我来为您处理...`,
          serviceAgent?.name
        );

        setMessages(prev => [...prev, agentMessage]);
        playMessageSound();
        setIsAgentTyping(false);
        scrollToBottom();

        // 更新消息状态
        setTimeout(() => {
          setMessages(prev => 
            StateHandlers.updateMessageStatus(prev, userMessage.id, MessageStatus.DELIVERED)
          );
        }, 1000);

        setTimeout(() => {
          setMessages(prev => 
            StateHandlers.updateMessageStatus(prev, userMessage.id, MessageStatus.READ)
          );
        }, 2000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        type: "error",
        duration: 3000
      });
    }
  }, [chatState, playMessageSound, scrollToBottom, serviceAgent, toast]);

  // 结束会话处理
  const handleEndChat = useCallback(async () => {
    try {
      addSystemMessage(SystemMessageType.END);
      setChatState(ChatState.ENDED);
      setServiceAgent(null);
      toast({
        title: "会话已结束",
        description: "感谢您的使用，欢迎下次再来",
        type: "success",
        duration: 3000
      });
    } catch (error) {
      console.error('Error ending chat:', error);
      toast({
        title: "操作失败",
        description: "结束会话失败，请重试",
        type: "error",
        duration: 3000
      });
    }
  }, [addSystemMessage, toast]);

  // 初始化处理
  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!isFirstLoad) return;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const initialMessages = [
          MessageUtils.createSystemMessage("欢迎使用Steam在线客服系统"),
          {
            ...MessageUtils.createBotMessage(
              <BotChat 
                onTransferToAgent={handleTransferToAgent}
                onSendMessage={handleSendMessage}
                onQuestionSelect={setSelectedQuestion}
                selectedQuestion={selectedQuestion}
                key="initial-bot-chat"
              />
            ),
            isBotInterface: true
          }
        ];

        setMessages(initialMessages);
        setLoading(false);
        setIsFirstLoad(false);

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
  }, [
    isFirstLoad,
    handleTransferToAgent,
    handleSendMessage,
    toast,
    selectedQuestion
  ]);

  // 返回hook接口
  return {
    // 状态
    loading,
    chatState,
    messages,
    isAgentTyping,
    isSoundEnabled,
    queuePosition,
    serviceAgent,
    messageContainerRef,
    // 动作
    setIsSoundEnabled,
    handleSendMessage,
    handleTransferToAgent,
    handleEndChat,
    // 问题选择
    selectedQuestion,
    setSelectedQuestion
  };
};
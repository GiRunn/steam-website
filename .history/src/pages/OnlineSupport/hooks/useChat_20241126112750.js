// src/pages/OnlineSupport/hooks/useChat.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../../../components/ui/Toast';
import { 
  ChatState, 
  SystemMessageType, 
  BotResponses, 
  getSystemMessage 
} from '../constants/chatConstants';

// 移动 BotChat 组件的引入到需要的地方
import BotChat from '../components/BotChat';

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

export const useChat = () => {
  const [loading, setLoading] = useState(true);
  const [chatState, setChatState] = useState(ChatState.BOT);
  const [messages, setMessages] = useState([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [queuePosition, setQueuePosition] = useState(0);
  const [serviceAgent, setServiceAgent] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const messageContainerRef = useRef(null);
  const { toast } = useToast();

  // 音效播放功能
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

  // 添加系统消息
  const addSystemMessage = useCallback((type, extraData = {}) => {
    const systemMessage = {
      id: Date.now(),
      content: getSystemMessage(type, extraData),
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    
    setMessages(prev => [...prev, systemMessage]);
    scrollToBottom();
  }, [scrollToBottom]);

  // 处理转人工 - 移到 handleSendMessage 之前
  const handleTransferToAgent = useCallback(async () => {
    try {
      setChatState(ChatState.TRANSFERRING);
      addSystemMessage(SystemMessageType.TRANSFER);
      
      // 模拟排队
      await new Promise(resolve => setTimeout(resolve, 1500));
      setChatState(ChatState.QUEUING);
      
      // 模拟队列更新
      let position = 3;
      const queueInterval = setInterval(() => {
        position--;
        setQueuePosition(position);
        addSystemMessage(SystemMessageType.QUEUE, { queuePosition: position });
        
        if (position <= 0) {
          clearInterval(queueInterval);
          setServiceAgent(mockServiceAgent);
          setChatState(ChatState.CONNECTED);
          addSystemMessage(SystemMessageType.CONNECTED, { 
            agentName: mockServiceAgent.name 
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
  }, [addSystemMessage, toast]);

  // 发送消息处理
// src/pages/OnlineSupport/hooks/useChat.js
const handleSendMessage = useCallback(async (messageData) => {
  const { 
    text, 
    attachments = [], 
    isBot = false, 
    isQuestionSelect = false, 
    isAnswerSelect = false,
    question  // 添加 question 参数接收
  } = messageData;
  
  try {
    // 用户选择问题类型的处理
    if (isQuestionSelect) {
      // 1. 更新选中的问题状态
      setSelectedQuestion(question);
      
      // 2. 添加用户消息
      const userMessage = {
        id: `user-msg-${Date.now()}`, // 确保ID唯一
        content: text,
        isUser: true,
        timestamp: new Date().toISOString(),
        type: 'question-select'  // 标记消息类型
      };
      setMessages(prev => [...prev, userMessage]);
      scrollToBottom();

      // 3. 模拟延迟,增加对话自然感
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 4. 添加机器人响应消息
      const botResponse = {
        id: `bot-msg-${Date.now()}`, // 确保ID唯一
        content: <BotChat 
          selectedQuestion={question}
          onTransferToAgent={handleTransferToAgent}
          onSendMessage={handleSendMessage}
          onQuestionSelect={setSelectedQuestion}
          key={`bot-chat-${Date.now()}`}
        />,
        isBot: true,
        timestamp: new Date().toISOString(),
        type: 'bot-interface'  // 标记消息类型
      };
      setMessages(prev => [...prev, botResponse]);
      playMessageSound();
      scrollToBottom();
    } 
    // 用户选择具体问题的处理
    else if (isAnswerSelect) {
      // 1. 添加用户选择的具体问题消息
      const userMessage = {
        id: `user-answer-${Date.now()}`, // 确保ID唯一
        content: text,
        isUser: true,
        timestamp: new Date().toISOString(),
        type: 'answer-select'  // 标记消息类型
      };
      setMessages(prev => [...prev, userMessage]);
      scrollToBottom();

      // 2. 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 3. 添加机器人引导性回复
      const botResponse = {
        id: `bot-response-${Date.now()}`, // 确保ID唯一
        content: "好的,我来帮您解决这个问题。在此之前,您能详细描述一下具体情况吗?",
        isBot: true,
        timestamp: new Date().toISOString(),
        type: 'bot-text'  // 标记消息类型
      };
      setMessages(prev => [...prev, botResponse]);
      playMessageSound();
      scrollToBottom();
    }
    // 用户发送普通文本消息的处理 
    else {
      // 1. 检查消息内容是否为空
      if (!text.trim() && (!attachments || attachments.length === 0)) {
        throw new Error('消息内容不能为空');
      }

      // 2. 添加用户消息
      const userMessage = {
        id: `user-text-${Date.now()}`, // 确保ID唯一
        content: text,
        attachments,
        isUser: true,
        timestamp: new Date().toISOString(),
        type: 'text'  // 标记消息类型
      };
      setMessages(prev => [...prev, userMessage]);
      scrollToBottom();

      // 3. 根据聊天状态处理不同的回复逻辑
      if (chatState === ChatState.BOT) {
        // 机器人模式下的自动回复
        await new Promise(resolve => setTimeout(resolve, 1000));
        const botResponse = {
          id: `bot-auto-${Date.now()}`, // 确保ID唯一
          content: "很抱歉,我可能需要更多信息才能帮助您解决问题。您可以选择上方的问题类型,或者点击'转接人工客服'获取更专业的帮助。",
          isBot: true,
          timestamp: new Date().toISOString(),
          type: 'bot-text'  // 标记消息类型
        };
        setMessages(prev => [...prev, botResponse]);
        playMessageSound();
      } else if (chatState === ChatState.CONNECTED) {
        // 人工客服模式下设置输入状态
        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 
          Math.random() * 2000 + 1000  // 随机延迟1-3秒
        ));
        setIsAgentTyping(false);

        // 模拟客服回复
        const agentResponse = {
          id: `agent-${Date.now()}`, // 确保ID唯一
          content: "收到您的问题,请稍等,我正在为您处理...",
          isBot: true,
          timestamp: new Date().toISOString(),
          type: 'agent-text'  // 标记消息类型
        };
        setMessages(prev => [...prev, agentResponse]);
        playMessageSound();
      }
      scrollToBottom();
    }
  } catch (error) {
    console.error('Error sending message:', error);
    
    // 错误提示
    toast({
      title: "发送失败",
      description: error.message || "消息发送失败,请重试",
      type: "error",
      duration: 3000
    });
  }
}, [
  chatState, 
  playMessageSound, 
  scrollToBottom, 
  setIsAgentTyping,
  serviceAgent, 
  toast, 
  selectedQuestion, 
  handleTransferToAgent
]);



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

  // 初始化加载
  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!isFirstLoad) return;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 修改初始消息，移除重复的Bot消息
        const initialMessages = [
          {
            id: Date.now(),
            content: "欢迎使用Steam在线客服系统",
            type: 'system',
            timestamp: new Date().toISOString(),
            isInitialMessage: true
          },
          {
            id: Date.now() + 1,
            content: <BotChat 
              onTransferToAgent={handleTransferToAgent}
              onSendMessage={handleSendMessage}
              onQuestionSelect={setSelectedQuestion}
              key="initial-bot-chat"
            />,
            isBot: true,
            isBotInterface: true,
            timestamp: new Date().toISOString()
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
  }, [isFirstLoad, handleTransferToAgent, handleSendMessage, toast]);

  // 监听消息变化，自动滚动
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  return {
    loading,
    chatState,
    messages,
    isAgentTyping,
    isSoundEnabled,
    queuePosition,
    serviceAgent,
    messageContainerRef,
    setIsSoundEnabled,
    handleSendMessage,
    handleTransferToAgent,
    handleEndChat,
  };
};
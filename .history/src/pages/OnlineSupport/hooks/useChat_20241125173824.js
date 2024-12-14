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
  // 状态管理
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
  const handleSendMessage = useCallback(async (messageData) => {
    const { 
      text, 
      attachments = [], 
      isBot = false, 
      isQuestionSelect = false, 
      isAnswerSelect = false 
    } = messageData;
    
    try {
      if (isQuestionSelect || isAnswerSelect) {
        const userMessage = {
          id: Date.now(),
          content: text,
          isUser: true,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();

        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (isQuestionSelect) {
          const botResponse = {
            id: Date.now() + 1,
            content: <BotChat 
              selectedQuestion={selectedQuestion}
              onTransferToAgent={handleTransferToAgent}
              onSendMessage={handleSendMessage}
              onQuestionSelect={setSelectedQuestion}
            />,
            isBot: true,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, botResponse]);
        } else {
          const botResponse = {
            id: Date.now() + 1,
            content: "好的，我来帮您解决这个问题。在此之前，您能详细描述一下具体情况吗？",
            isBot: true,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, botResponse]);
        }
        playMessageSound();
        scrollToBottom();

      } else if (chatState === ChatState.BOT && !isBot) {
        const userMessage = {
          id: Date.now(),
          content: text,
          attachments,
          isUser: true,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();

        // 机器人回复
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

      } else if (chatState === ChatState.CONNECTED) {
        // 添加用户消息
        const userMessage = {
          id: Date.now(),
          content: text,
          attachments,
          isUser: true,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        
        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();

        // 显示客服正在输入状态
        setIsAgentTyping(true);
        
        // 模拟客服输入延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 添加客服回复
        const agentMessage = {
          id: Date.now() + 1,
          content: `收到您的问题，我来为您处理...`,
          isBot: false,
          isAgent: true,
          agentName: serviceAgent?.name,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };

        setMessages(prev => [...prev, agentMessage]);
        playMessageSound();
        setIsAgentTyping(false);
        scrollToBottom();

        // 更新消息状态
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === userMessage.id 
                ? { ...msg, status: 'delivered' }
                : msg
            )
          );
        }, 1000);

        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === userMessage.id 
                ? { ...msg, status: 'read' }
                : msg
            )
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
  }, [chatState, playMessageSound, scrollToBottom, serviceAgent, toast, selectedQuestion, handleTransferToAgent]);

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
            content: "我是您的智能客服助手，请问有什么可以帮您？",
            type: 'system',
            timestamp: new Date().toISOString(),
            isInitialMessage: true
          },
          {
            id: Date.now() + 2,
            content: "您好！我是Steam智能助手，请问遇到了什么问题？",
            isBot: true,
            timestamp: new Date().toISOString()
          }
        ];

        setMessages(initialMessages);
        
        // 延迟添加 BotChat 组件
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 3,
            content: <BotChat 
              onTransferToAgent={handleTransferToAgent}
              onSendMessage={handleSendMessage}
              onQuestionSelect={setSelectedQuestion}
            />,
            isBot: true,
            isBotInterface: true,
            timestamp: new Date().toISOString()
          }]);
        }, 100);

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
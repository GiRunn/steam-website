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
  Z
系统消息可以加入消息流吗？让其保持如果所有内容都根据最新的排在最下面


可以的,我们需要修改一下 useChat.js 中的处理逻辑,把系统消息也加入到消息流中:

文件路径：src/pages/OnlineSupport/hooks/useChat.js

javascript

Copy
// addSystemMessage 函数修改
const addSystemMessage = useCallback((type, extraData = {}) => {
  const systemMessage = {
    id: Date.now(),
    content: getSystemMessage(type, extraData),
    timestamp: new Date().toISOString(),
    type: 'system',
    isSystem: true  // 添加标记，用于样式区分
  };
  
  setMessages(prev => [...prev, systemMessage]);

  // 如果是连接成功的系统消息，添加新的 BotChat 界面
  if (type === SystemMessageType.CONNECTED) {
    const newBotChatMessage = {
      id: Date.now() + 1,
      content: <BotChat 
        onTransferToAgent={handleTransferToAgent}
        onSendMessage={handleSendMessage}
        onQuestionSelect={setSelectedQuestion}
        key={`bot-chat-${Date.now()}`}
      />,
      isBot: true,
      isBotInterface: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newBotChatMessage]);
  }

  scrollToBottom();
}, [handleTransferToAgent, handleSendMessage, scrollToBottom]);

// handleSendMessage 函数修改中的二级菜单处理部分
if (isAnswerSelect && question && answer) {
  // 添加用户的选择消息
  const userMessage = {
    id: Date.now(),
    content: text,
    isUser: true,
    timestamp: new Date().toISOString(),
    questionType: question.id,
    answerType: answer.text
  };
  setMessages(prev => [...prev, userMessage]);
  
  // 模拟机器人思考时间
  setIsAgentTyping(true);
  await new Promise(resolve => setTimeout(resolve, 800));
  setIsAgentTyping(false);
  
  // 获取预设的回答内容
  const botResponseContent = getBotResponseForAnswer(question.id, answer.text);
  
  // 添加机器人的回答消息
  const botResponse = {
    id: Date.now() + 1,
    content: botResponseContent,
    isBot: true,
    timestamp: new Date().toISOString()
  };
  setMessages(prev => [...prev, botResponse]);
  playMessageSound();

  // 添加一个延时，让用户能看到答案
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 添加系统提示信息
  const systemMessage = {
    id: Date.now() + 2,
    content: "您可以继续选择其他问题，或输入详细描述",
    isSystem: true,
    timestamp: new Date().toISOString()
  };
  setMessages(prev => [...prev, systemMessage]);

  // 添加新的 BotChat 组件消息
  const newBotChatMessage = {
    id: Date.now() + 3,
    content: <BotChat 
      onTransferToAgent={handleTransferToAgent}
      onSendMessage={handleSendMessage}
      onQuestionSelect={setSelectedQuestion}
      key={`bot-chat-${Date.now()}`}
    />,
    isBot: true,
    isBotInterface: true,
    timestamp: new Date().toISOString()
  };
  setMessages(prev => [...prev, newBotChatMessage]);
  
  setSelectedQuestion(null);
  scrollToBottom();
  return;
}

// 初始化聊天的 useEffect 修改
useEffect(() => {
  const initializeChat = async () => {
    try {
      if (!isFirstLoad) return;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 修改初始消息，添加系统消息
      const initialMessages = [
        {
          id: Date.now(),
          content: "欢迎使用Steam在线客服系统",
          isSystem: true,
          timestamp: new Date().toISOString()
        },
        {
          id: Date.now() + 1,
          content: "您可以选择以下问题类型，或直接输入您的问题",
          isSystem: true,
          timestamp: new Date().toISOString()
        },
        {
          id: Date.now() + 2,
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
}, [isFirstLoad, handleTransferToAgent, handleSendMessage, setSelectedQuestion, toast]);

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
  // handleSendMessage 函数部分
  const handleSendMessage = useCallback(async (messageData) => {
    const { 
      text, 
      attachments = [], 
      isBot = false, 
      isQuestionSelect = false, 
      isAnswerSelect = false,
      question = null,
      answer = null,
      questionId = null
    } = messageData;
    
    try {
      // 1. 处理问题类型选择（一级菜单）
      if (isQuestionSelect && question) {
        setSelectedQuestion(question);
        return;
      }
      
      // 2. 处理具体问题选择（二级菜单）
      if (isAnswerSelect && question && answer) {
        // 添加用户的选择消息
        const userMessage = {
          id: Date.now(),
          content: text,
          isUser: true,
          timestamp: new Date().toISOString(),
          questionType: question.id,
          answerType: answer.text
        };
        setMessages(prev => [...prev, userMessage]);
        
        // 模拟机器人思考时间
        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsAgentTyping(false);
        
        // 获取预设的回答内容
        const botResponseContent = getBotResponseForAnswer(question.id, answer.text);
        
        // 添加机器人的回答消息
        const botResponse = {
          id: Date.now() + 1,
          content: botResponseContent,
          isBot: true,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botResponse]);
        playMessageSound();

        // 添加一个延时，让用户能看到答案
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 添加新的 BotChat 组件消息
        const newBotChatMessage = {
          id: Date.now() + 2,
          content: <BotChat 
            onTransferToAgent={handleTransferToAgent}
            onSendMessage={handleSendMessage}
            onQuestionSelect={setSelectedQuestion}
            key={`bot-chat-${Date.now()}`}  // 添加key确保组件重新渲染
          />,
          isBot: true,
          isBotInterface: true,  // 标记这是一个界面组件
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newBotChatMessage]);
        
        setSelectedQuestion(null);
        scrollToBottom();
        return;
      }
    
    // 3. 处理普通用户消息
    if (!isBot) {
      const userMessage = {
        id: Date.now(),
        content: text,
        attachments,
        isUser: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      scrollToBottom();

      // 根据当前状态处理回复
      if (chatState === ChatState.BOT) {
        setIsAgentTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsAgentTyping(false);

        const botResponse = {
          id: Date.now() + 1,
          content: BotResponses.DEFAULT,
          isBot: true,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botResponse]);
        playMessageSound();
      }
      else if (chatState === ChatState.CONNECTED && serviceAgent) {
        setIsAgentTyping(true);
        await new Promise(resolve => 
          setTimeout(resolve, Math.random() * 2000 + 1000)
        );
        setIsAgentTyping(false);

        const agentResponse = {
          id: Date.now() + 1,
          content: getAgentResponse(text),
          isBot: true,
          timestamp: new Date().toISOString(),
          agent: serviceAgent
        };
        setMessages(prev => [...prev, agentResponse]);
        playMessageSound();
      }
    }
    // 4. 处理机器人/客服消息
    else if (isBot) {
      const botMessage = {
        id: Date.now(),
        content: text,
        attachments,
        isBot: true,
        timestamp: new Date().toISOString(),
        ...(serviceAgent && { agent: serviceAgent })
      };
      setMessages(prev => [...prev, botMessage]);
      playMessageSound();
    }

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
}, [
  chatState,
  selectedQuestion,
  serviceAgent,
  playMessageSound,
  scrollToBottom,
  toast
]);

// 辅助函数：根据问题类型和答案获取机器人回复
const getBotResponseForAnswer = (questionType, answerText) => {
  const responses = {
    account: {
      '忘记密码': '您可以通过以下步骤重置密码：\n1. 点击登录页面的"忘记密码"\n2. 输入您的注册邮箱\n3. 按照邮件提示完成重置\n\n需要我为您详细说明某个步骤吗？',
      '账号被盗': '非常抱歉听到您的账号遇到问题。为了保护您的账号安全，请您：\n1. 立即修改密码\n2. 开启两步验证\n3. 检查账号活动记录\n\n需要我协助您执行这些步骤吗？',
      '修改邮箱': '修改邮箱需要验证您的身份，请准备好：\n1. 当前邮箱的访问权限\n2. 手机验证码\n3. 新的邮箱地址\n\n您准备好了吗？我可以引导您完成修改。',
      '其他账号问题': '好的，为了更好地帮助您，请您详细描述遇到的账号问题，比如：\n- 具体的错误提示\n- 问题发生的时间\n- 之前是否正常使用'
    },
    payment: {
      '支付失败': '很抱歉您遇到支付问题。请告诉我：\n1. 使用的支付方式\n2. 错误提示信息\n3. 订单号（如果有）\n\n这样我能更好地协助您解决问题。',
      '退款问题': '关于退款问题，我需要了解：\n1. 订单号\n2. 退款申请时间\n3. 当前退款状态\n\n您能提供这些信息吗？',
      '订单查询': '好的，请提供以下信息之一：\n1. 订单号\n2. 交易时间\n3. 商品名称\n\n我会帮您查询订单详情。',
      '其他支付问题': '请您详细描述遇到的支付问题：\n- 具体的操作步骤\n- 错误提示信息\n- 支付环境（PC/手机）\n\n这将帮助我更好地解决您的问题。'
    },
    game: {
      '游戏无法启动': '对于游戏无法启动的问题，请告诉我：\n1. 游戏名称\n2. 错误提示信息\n3. 您的系统配置\n\n这样我能更准确地诊断问题。',
      '游戏内bug': '关于游戏bug，请提供：\n1. 游戏名称\n2. 发生bug的具体场景\n3. 复现步骤\n\n如果有截图更好，这将帮助我们快速定位问题。',
      '游戏更新问题': '遇到更新问题，请检查：\n1. 网络连接\n2. 磁盘空间\n3. 更新错误提示\n\n您能告诉我具体的更新错误信息吗？',
      '其他游戏问题': '请详细描述您遇到的游戏问题：\n- 游戏名称\n- 问题表现\n- 发生时间\n- 之前是否正常\n\n这将帮助我更好地协助您。'
    }
  };

  return responses[questionType]?.[answerText] || 
    '好的，我来帮您解决这个问题。能否详细描述一下具体情况？';
};

// 辅助函数：获取客服回复
const getAgentResponse = (userMessage) => {
  // 这里可以根据用户消息内容生成更智能的回复
  const defaultResponses = [
    '我理解您的问题，让我来帮您处理。',
    '好的，我看到了您的问题，请稍等。',
    '感谢您的耐心等待，我正在查询相关信息。',
    '我明白您的需求，让我为您找到最佳解决方案。'
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

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
import React, { useState, useCallback, memo } from 'react';
import { Bot } from 'lucide-react';
import { BotQuestions, BotAnswers } from '../constants/chatConstants';

// 一级问题选项组件
const QuestionOptions = ({ onSelect }) => (
  <section className="space-y-2">
    {Object.values(BotQuestions).map((question) => (
      <button
        key={question.id}
        className="w-full text-left p-3 rounded-lg border border-gray-700
          hover:border-blue-500/30 hover:bg-blue-500/5
          transition-all duration-200 flex items-center gap-3 group"
        onClick={() => onSelect(question)}
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
  </section>
);

// 二级问题选项组件
const AnswerOptions = ({ question, onSelect, onTransferToAgent, onBack }) => (
  <section className="space-y-2">
    <div className="flex items-center justify-between mb-3">
      <div className="text-gray-400">
        已选择：{question.text}
      </div>
      <button 
        onClick={onBack}
        className="text-blue-500 hover:text-blue-400 text-sm"
      >
        返回上级
      </button>
    </div>
    {question.answers.map((answer, index) => (
      <button
        key={`${question.id}-answer-${index}`}
        className="w-full p-3 rounded-lg border border-gray-700
          hover:border-blue-500/30 hover:bg-blue-500/5
          text-gray-200 transition-all duration-200
          flex items-center gap-2 group"
        onClick={() => onSelect(answer)}  // 修改这里，移除 question.id
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
  </section>
);

const BotChat = memo(({ onSendMessage, onTransferToAgent }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  // 处理一级问题选择
  const handleQuestionSelect = useCallback((question) => {
    setSelectedQuestion(question);
  }, []); 

  // 处理二级问题选择 - 修改这里的数据传递
  const handleAnswerSelect = useCallback((answer, questionId) => {
    // 发送更完整的信息到父组件
    onSendMessage({
      text: `${selectedQuestion.text} - ${answer.text}`,
      isUser: true,
      isAnswerSelect: true,
      question: selectedQuestion,
      answer: answer,
      questionId: questionId  // 添加问题ID的传递
    });
    
    setSelectedQuestion(null);
  }, [selectedQuestion, onSendMessage]);

  const handleBack = useCallback(() => {
    setSelectedQuestion(null);
  }, []);

  return (
    <div className="flex flex-col transition-all duration-300">
      {selectedQuestion ? (
        <AnswerOptions 
          question={selectedQuestion}
          onSelect={handleAnswerSelect}
          onTransferToAgent={onTransferToAgent}
          onBack={handleBack}
        />
      ) : (
        <QuestionOptions onSelect={handleQuestionSelect} />
      )}
    </div>
  );
});

BotChat.displayName = 'BotChat';

export default BotChat;
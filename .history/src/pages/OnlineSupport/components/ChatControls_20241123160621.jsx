// E:\Steam\steam-website\src\pages\OnlineSupport\components\ChatControls.jsx
// 聊天控制组件 - 包含消息输入框

import React from 'react';
import { ChatState } from '../constants';
import MessageInput from './MessageInput';

const ChatControls = ({ 
  chatState, 
  isAgentTyping,
  onSendMessage
}) => {
  return (
    <div className="sticky bottom-0 left-0 right-0">
      {/* 消息输入框 */}
      {(chatState === ChatState.CONNECTED || chatState === ChatState.BOT) && (
        <div className="bg-[#0a0f16]/95 backdrop-blur-sm p-4 border-t border-gray-800/50">
          <div className="max-w-2xl mx-auto">
            <MessageInput 
              onSend={onSendMessage} 
              disabled={isAgentTyping || chatState === ChatState.ENDED} 
              placeholder={
                isAgentTyping ? "客服正在输入中..." : 
                chatState === ChatState.BOT ? "输入您的问题..." :
                "输入消息..."
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatControls;
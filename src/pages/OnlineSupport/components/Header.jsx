// E:\Steam\steam-website\src\pages\OnlineSupport\components\Header.jsx
// 聊天头部组件 - 包含标题和控制按钮

import React from 'react';
import { 
  MessageCircle, Phone, Clock, MinusCircle, 
  Volume2, VolumeX, Bot
} from 'lucide-react';
import { Tooltip } from '../../../components/ui/Tooltip';
import { ChatState } from '../constants';

const Header = ({ 
  chatState, 
  isSoundEnabled, 
  onSoundToggle, 
  onEndChat 
}) => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {chatState === ChatState.BOT ? (
          <Bot className="w-6 h-6 text-blue-500" />
        ) : (
          <MessageCircle className="w-6 h-6 text-blue-500" />
        )}
        <h1 className="text-xl font-semibold">
          Steam在线客服
          {chatState !== ChatState.BOT && (
            <span className="text-sm text-gray-400 ml-2">
              {chatState === ChatState.QUEUING ? '排队中' : 
               chatState === ChatState.TRANSFERRING ? '转接中' : 
               chatState === ChatState.CONNECTED ? '已连接' : ''}
            </span>
          )}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {chatState === ChatState.CONNECTED && (
          <>
            <Tooltip content="语音通话">
              <button className="p-2 hover:bg-gray-800 rounded-full">
                <Phone className="w-5 h-5 text-gray-400" />
              </button>
            </Tooltip>

            <Tooltip content="会话历史">
              <button className="p-2 hover:bg-gray-800 rounded-full">
                <Clock className="w-5 h-5 text-gray-400" />
              </button>
            </Tooltip>
          </>
        )}

        <Tooltip content={isSoundEnabled ? "关闭声音" : "开启声音"}>
          <button 
            onClick={() => onSoundToggle(!isSoundEnabled)}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            {isSoundEnabled 
              ? <Volume2 className="w-5 h-5 text-gray-400" />
              : <VolumeX className="w-5 h-5 text-gray-400" />
            }
          </button>
        </Tooltip>
        {chatState !== ChatState.BOT && chatState !== ChatState.ENDED && (
          <Tooltip content="结束会话">
            <button 
              onClick={onEndChat}
              className="p-2 hover:bg-gray-800 rounded-full"
            >
              <MinusCircle className="w-5 h-5 text-gray-400" />
            </button>
          </Tooltip>
        )}
      </div>
    </header>
  );
};

export default Header;
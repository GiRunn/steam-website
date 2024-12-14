import React from 'react';
import { ChatState } from '../constants/chatConstants';

interface StatusIndicatorProps {
  status: ChatState;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => (
  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800/30 rounded-full">
    <div
      className={`w-2 h-2 rounded-full ${
        status === ChatState.CONNECTED
          ? 'bg-green-500 animate-pulse'
          : status === ChatState.BOT
          ? 'bg-blue-500 animate-pulse'
          : 'bg-gray-500'
      }`}
    />
    <span className="text-sm font-medium">
      {status === ChatState.CONNECTED
        ? '已连接'
        : status === ChatState.BOT
        ? 'AI 助手模式'
        : '未连接'}
    </span>
  </div>
);

export default StatusIndicator;
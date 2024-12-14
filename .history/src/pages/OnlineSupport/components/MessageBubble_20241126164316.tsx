import React from 'react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: {
    text: string;
    timestamp: number | string;
  };
  isUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
  >
    <div
      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
        isUser
          ? 'bg-blue-600 text-white ml-auto'
          : 'bg-gray-800/60 backdrop-blur-sm'
      } shadow-lg`}
    >
      <p className="text-sm leading-relaxed">{message.text}</p>
      <div className="mt-1 text-xs opacity-60">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  </motion.div>
));

export default MessageBubble;
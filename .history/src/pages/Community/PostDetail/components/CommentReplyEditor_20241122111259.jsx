// src/pages/Community/PostDetail/components/CommentReplyEditor.jsx
// 评论回复编辑器 - 简约设计
import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

const CommentReplyEditor = ({
  onSubmit,
  maxLength = 500,
  placeholder = "写下你的回复..."
}) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || content.length > maxLength || isLoading) return;
    try {
      setIsLoading(true);
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Reply submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-[#0a0f16] p-4 rounded">
      <textarea
        value={content}
        onChange={(e) => {
          const newContent = e.target.value;
          if (newContent.length <= maxLength) {
            setContent(newContent);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="w-full bg-transparent text-gray-200 placeholder-gray-600
          resize-none outline-none min-h-[100px] text-sm"
      />
      
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>按 Enter 发送</span>
        <div className="flex items-center gap-2">
          <span>{content.length} / {maxLength}</span>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || content.length > maxLength || isLoading}
            className="text-blue-400 hover:text-blue-300 disabled:text-gray-600 
              flex items-center gap-1 px-2"
          >
            <span>发送回复</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentReplyEditor;
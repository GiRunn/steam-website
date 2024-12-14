export default ReplyList;

// src/pages/Community/PostDetail/components/AdminActions.jsx
// 管理操作组件(删除、置顶)
import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';

const AdminActions = ({ isPinned, postId }) => (
  <div className="flex space-x-4 mt-4 pt-4 border-t border-gray-700/50">
    <button
      className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors
        ${isPinned 
          ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' 
          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      <span>{isPinned ? '取消置顶' : '置顶'}</span>
    </button>
 
    <button className="px-4 py-2 rounded-lg flex items-center space-x-2 bg-red-500/10 
                       text-red-500 hover:bg-red-500/20 transition-colors">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span>删除</span>
    </button>
  </div>
 );

export default AdminActions;
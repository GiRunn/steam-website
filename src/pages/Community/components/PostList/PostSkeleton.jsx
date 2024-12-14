// src/pages/Community/components/PostList/PostSkeleton.jsx

import React from 'react';

const PostSkeleton = () => {
  return (
    <div className="bg-[#0f1724] rounded-xl p-6 animate-pulse">
      {/* 头部骨架 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-xl"></div>
          <div>
            <div className="w-24 h-4 bg-gray-700 rounded mb-2"></div>
            <div className="w-32 h-3 bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
      
      {/* 内容骨架 */}
      <div className="mb-4">
        <div className="w-3/4 h-6 bg-gray-700 rounded mb-2"></div>
        <div className="w-full h-4 bg-gray-700 rounded mb-2"></div>
        <div className="w-2/3 h-4 bg-gray-700 rounded"></div>
      </div>
      
      {/* 标签和统计骨架 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-16 h-6 bg-gray-700 rounded-full"></div>
          <div className="w-16 h-6 bg-gray-700 rounded-full"></div>
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-4 bg-gray-700 rounded"></div>
          <div className="w-12 h-4 bg-gray-700 rounded"></div>
          <div className="w-12 h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;
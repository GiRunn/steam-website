// src/pages/Community/components/PostList/index.jsx

import React, { useState } from 'react';
import { Clock, Flame } from 'lucide-react';
import PostItem from './PostItem';
import PostSkeleton from './PostSkeleton';
import { Tooltip } from '../../../../components/ui/Tooltip';

const PostList = ({ posts, isLoading }) => {
  const [activeTab, setActiveTab] = useState('latest');

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((item) => (
          <PostSkeleton key={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* 内容过滤和排序 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tooltip content="按发布时间排序">
            <button
              onClick={() => setActiveTab('latest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'latest'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>最新</span> 
            </button>
          </Tooltip>
          
          <Tooltip content="按热度排序">
            <button
              onClick={() => setActiveTab('hot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'hot'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`} 
            >
              <Flame className="w-5 h-5" /> 
              <span>热门</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="space-y-6">
        {posts.map(post => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default PostList;
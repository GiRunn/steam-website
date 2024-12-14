// src/pages/Community/PostDetail/index.jsx
// 社区帖子详情页 - 包含主要内容展示和互动功能

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Share2, Bookmark, Flag, Eye, Clock } from 'lucide-react';
import { MOCK_POSTS } from '../constants';
import PostContent from './components/PostContent';
import UserInfo from './components/UserInfo';
import Interactions from './components/Interactions';
import ReplyEditor from './components/ReplyEditor';
import ReplyList from './components/PostDetail/ReplyList';
import AdminActions from './components/AdminActions';
import RelatedPosts from './components/RelatedPosts';

// 新增的子组件: 帖子元数据展示
const PostMetadata = ({ views, lastActive, readTime }) => (
  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
    <div className="flex items-center">
      <Eye className="w-4 h-4 mr-1" />
      <span>{views} 次浏览</span>
    </div>
    <div className="flex items-center">
      <Clock className="w-4 h-4 mr-1" />
      <span>阅读时间 {readTime} 分钟</span>
    </div>
    <div className="flex items-center">
      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
      <span>最后活跃 {lastActive}</span>
    </div>
  </div>
);

// 新增的子组件: 快捷操作栏
const QuickActions = ({ onShare, onBookmark, onReport, isBookmarked }) => (
  <div className="flex items-center justify-end space-x-4 mb-4">
    <button className="flex items-center text-gray-400 hover:text-blue-400 transition-colors">
      <Share2 className="w-5 h-5 mr-1" />
      <span>分享</span>
    </button>
    <button 
      className={`flex items-center transition-colors ${
        isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
      }`}
    >
      <Bookmark className="w-5 h-5 mr-1" />
      <span>{isBookmarked ? '已收藏' : '收藏'}</span>
    </button>
    <button className="flex items-center text-gray-400 hover:text-red-400 transition-colors">
      <Flag className="w-5 h-5 mr-1" />
      <span>举报</span>
    </button>
  </div>
);

// 新增的子组件: 标签列表
const TagList = ({ tags }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {tags.map((tag, index) => (
      <span 
        key={index}
        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
      >
        {tag}
      </span>
    ))}
  </div>
);

// 新增的子组件: 帖子导航
const PostNavigation = ({ prevPost, nextPost }) => (
  <div className="grid grid-cols-2 gap-4 mt-8 border-t border-gray-800/50 pt-6">
    <button 
      onClick={() => prevPost && navigate(`/community/post/${prevPost.id}`)}
      className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
        prevPost 
          ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300' 
          : 'bg-gray-800/20 text-gray-600 cursor-not-allowed'
      }`}
      disabled={!prevPost}
    >
      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      上一篇
    </button>
    
    <button 
      onClick={() => nextPost && navigate(`/community/post/${nextPost.id}`)}
      className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
        nextPost 
          ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300' 
          : 'bg-gray-800/20 text-gray-600 cursor-not-allowed'
      }`}
      disabled={!nextPost}
    >
      下一篇
      <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const post = MOCK_POSTS.find(p => p.id === Number(id));

  if (!post) return <div>帖子不存在</div>;

  // 模拟数据
  const mockTags = ['游戏更新', '官方公告', '重要'];
  const mockMetadata = {
    views: 12500,
    lastActive: '10分钟前',
    readTime: 5
  };
  const mockNavigation = {
    prevPost: { id: 1, title: '上一个帖子标题' },
    nextPost: { id: 3, title: '下一个帖子标题' }
  };

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <button
          onClick={() => navigate('/community')}
          className="mb-6 flex items-center text-blue-400 hover:text-blue-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回社区
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <QuickActions 
                isBookmarked={isBookmarked}
                onBookmark={() => setIsBookmarked(!isBookmarked)}
              />
              <UserInfo author={post.author} createdAt={post.createdAt} />
              <TagList tags={mockTags} />
              <PostMetadata {...mockMetadata} />
              <PostContent post={post} />
              <Interactions stats={post.stats} />
              {post.author.type === 'official' && (
                <AdminActions isPinned={post.pinned} postId={post.id} />
              )}
            </div>
            
            <ReplyList replies={post.replies} />
            <ReplyEditor postId={post.id} />
            <PostNavigation {...mockNavigation} />
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">作者信息</h3>
              <UserInfo author={post.author} createdAt={post.createdAt} />
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>发帖总数</span>
                  <span>128</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>获赞总数</span>
                  <span>3.2k</span>
                </div>
              </div>
            </div>
            <RelatedPosts currentPostId={post.id} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PostDetail;
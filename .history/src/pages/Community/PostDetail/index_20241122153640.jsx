// src/pages/Community/PostDetail/index.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_POSTS } from '../constants';

// 导入所有子组件
import ActiveUsers from './components/ActiveUsers';
import CommunityActivities from './components/CommunityActivities';
import HotTopics from './components/HotTopics';
import PostMetadata from './components/PostMetadata';
import PostNavigation from './components/PostNavigation';
import PostStats from './components/PostStats';
import QuickActions from './components/QuickActions';
import RecentEvents from './components/RecentEvents';
import SubscribeNotification from './components/SubscribeNotification';
import TagList from './components/TagList';

// 导入原有的组件
import PostContent from '../components/PostContent';
import UserInfo from '../components/UserInfo';
import Interactions from '../components/Interactions';
import ReplyEditor from '../components/ReplyEditor';
import ReplyList from '../components/ReplyList';
import AdminActions from '../components/AdminActions';
import RelatedPosts from '../components/RelatedPosts';

const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const post = MOCK_POSTS.find(p => p.id === Number(id));

  if (!post) return (
    <div className="min-h-screen bg-[#0a0f16] flex items-center justify-center text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">帖子不存在</h2>
        <button
          onClick={() => navigate('/community')}
          className="text-blue-400 hover:text-blue-300 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回社区
        </button>
      </div>
    </div>
  );

  // 模拟数据
  const mockData = {
    tags: ['游戏更新', '官方公告', '重要'],
    metadata: {
      views: 12500,
      lastActive: '10分钟前',
      readTime: 5
    },
    stats: {
      views: 12500,
      likes: 3200,
      comments: 856,
      bookmarks: 420
    },
    navigation: {
      prevPost: { id: 1 },
      nextPost: { id: 3 }
    }
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
            <PostStats stats={mockData.stats} />
            <div className="bg-gray-800/50 rounded-lg p-6">
              <QuickActions 
                isBookmarked={isBookmarked}
                onBookmark={() => setIsBookmarked(!isBookmarked)}
              />
              <UserInfo author={post.author} createdAt={post.createdAt} />
              <TagList tags={mockData.tags} />
              <PostMetadata {...mockData.metadata} />
              <PostContent post={post} />
              <Interactions stats={post.stats} />
              {post.author.type === 'official' && (
                <AdminActions isPinned={post.pinned} postId={post.id} />
              )}
            </div>
            
            <ReplyList replies={post.replies} />
            <ReplyEditor postId={post.id} />
            <PostNavigation {...mockData.navigation} />
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <SubscribeNotification />
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
            <HotTopics />
            <ActiveUsers />
            <CommunityActivities />
            <RecentEvents />
            <RelatedPosts currentPostId={post.id} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PostDetail;
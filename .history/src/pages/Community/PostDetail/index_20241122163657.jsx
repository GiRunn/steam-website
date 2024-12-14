// src/pages/Community/PostDetail/index.jsx

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_POSTS } from '../constants';

// 导入所有本地组件
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
import PostContent from './components/PostContent';
import UserInfo from './components/UserInfo';
import Interactions from './components/Interactions';
import ReplyEditor from './components/ReplyEditor';
import ReplyList from './components/PostDetail/ReplyList';
import AdminActions from './components/AdminActions';
import RelatedPosts from './components/RelatedPosts';
import ReadingProgress from './components/ReadingProgress';
import ShareDrawer from './components/ShareDrawer';
import Navbar from '....//components/Navbar';
import Footer from '..../components/Footer';

const PostDetail = () => {
  // 路由相关
  const navigate = useNavigate();
  const { id } = useParams();

  // 状态管理
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);

  // 获取帖子数据
  const post = MOCK_POSTS.find(p => p.id === Number(id));

  // 404状态处理
  if (!post) {
    return (
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
  }

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

  // 交互处理函数
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // 这里可以添加实际的收藏/取消收藏逻辑
  };

  const handleShare = () => {
    setIsShareDrawerOpen(true);
  };

  const handleBackToCommunity = () => {
    navigate('/community');
  };

  return (
    <>
      {/* 导航栏 */}
      <Navbar />

      <div className="min-h-screen bg-[#0a0f16] text-white relative">
        {/* 左侧固定操作栏 */}
        <div className="hidden lg:flex fixed left-0 top-1/4 z-30 flex-col gap-4 px-4 py-6 bg-gray-800/30 rounded-r-lg border-r border-gray-800/50">
          <button
            onClick={() => setIsShareDrawerOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-gray-300 transition-all group"
            title="分享"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <button
            onClick={handleBookmark}
            className={`p-2 rounded-lg transition-all ${
              isBookmarked 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
            }`}
            title={isBookmarked ? "取消收藏" : "收藏"}
          >
            {isBookmarked ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => {/* 举报处理函数 */}}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-gray-300 transition-all group"
            title="举报"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </button>
        </div>

        {/* 阅读进度条 */}
        <ReadingProgress />

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* 返回按钮 */}
          <button
            onClick={handleBackToCommunity}
            className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回社区
          </button>

          {/* 主要内容网格布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 中间主要内容 */}
            <div className="lg:col-span-8 space-y-6">
              <PostStats stats={mockData.stats} />
              
              <div className="bg-gray-800/50 rounded-lg p-6 space-y-6">
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

            {/* 右侧边栏 */}
            <aside className="lg:col-span-4 space-y-6">
              <SubscribeNotification />
              
              {/* 作者信息卡片 */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4 font-['SF_Pro_Display']">作者信息</h3>
                <UserInfo author={post.author} createdAt={post.createdAt} />
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-sm text-gray-400 font-['SF_Pro_Text']">
                    <span>发帖总数</span>
                    <span>128</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-2 font-['SF_Pro_Text']">
                    <span>获赞总数</span>
                    <span>3.2k</span>
                  </div>
                </div>
              </div>

              {/* 其他侧边栏组件 */}
              <HotTopics />
              <ActiveUsers />
              <CommunityActivities />
              <RecentEvents />
              <RelatedPosts currentPostId={post.id} />
            </aside>
          </div>
        </main>

        {/* 分享抽屉 */}
        <ShareDrawer
          isOpen={isShareDrawerOpen}
          onClose={() => setIsShareDrawerOpen(false)}
          postId={id}
          title={post.title}
        />
      </div>

      {/* 底部页脚 */}
      <Footer />
    </>
  );
};

export default PostDetail;
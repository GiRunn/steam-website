// src/pages/Community/PostDetail/index.jsx
// 帖子详情页主组件，负责整体布局和数据协调
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import { usePostData } from './hooks/usePostData';
import PostContent from './components/PostContent';
import UserInfo from './components/UserInfo';
import Interactions from './components/Interactions';
import ReplyEditor from './components/ReplyEditor';
import ReplyList from './components/ReplyList';
import AdminActions from './components/AdminActions';
import RelatedPosts from './components/RelatedPosts';

const PostDetail = () => {
  const navigate = useNavigate();
  const { 
    post, 
    loading, 
    handleLike, 
    handleReply, 
    handleDelete, 
    handlePin 
  } = usePostData();

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/community')}
          className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回社区
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 主内容区 */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <UserInfo user={post.user} createdAt={post.createdAt} />
              <PostContent content={post.content} />
              <Interactions
                likes={post.likes}
                replies={post.replyCount}
                onLike={handleLike}
              />
              <AdminActions
                isPinned={post.isPinned}
                onDelete={handleDelete}
                onPin={handlePin}
              />
            </div>
            
            <ReplyEditor onSubmit={handleReply} />
            <ReplyList replies={post.replies} />
          </div>

          {/* 侧边栏 */}
          <aside className="lg:col-span-4">
            <RelatedPosts currentPostId={post.id} />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostDetail;
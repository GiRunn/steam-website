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

// 更正导入路径为本地组件
import PostContent from './components/PostContent';
import UserInfo from './components/UserInfo';
import Interactions from './components/Interactions';
import ReplyEditor from './components/ReplyEditor';
import ReplyList from './components/PostDetail/ReplyList'; // 注意这个路径
import AdminActions from './components/AdminActions';
import RelatedPosts from './components/RelatedPosts';

import ShareDrawer from './components/ShareDrawer';
import ImagePreview from './components/ImagePreview';
import AnchorNavigation from './components/AnchorNavigation';
import ReadingProgress from './components/ReadingProgress';


const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const post = MOCK_POSTS.find(p => p.id === Number(id));

  if (!post) return (/* ... 原有的404展示 ... */);

  // 处理分享事件
  const handleShare = () => {
    setIsShareDrawerOpen(true);
  };

  // 处理图片预览
  const handleImagePreview = (src) => {
    setPreviewImage(src);
  };

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      {/* 阅读进度条 */}
      <ReadingProgress />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 返回按钮部分保持不变 */}
        <button onClick={() => navigate('/community')} className="mb-6 flex items-center text-blue-400 hover:text-blue-300">
          {/* ... */}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左侧主内容区 */}
          <div className="lg:col-span-8 space-y-6">
            {/* 原有的主要内容组件保持不变 */}
            <PostStats stats={mockData.stats} />
            <div className="bg-gray-800/50 rounded-lg p-6">
              <QuickActions 
                isBookmarked={isBookmarked}
                onBookmark={() => setIsBookmarked(!isBookmarked)}
                onShare={handleShare}
              />
              {/* ... 其他内容组件 ... */}
            </div>
            
            <ReplyList replies={post.replies} />
            <ReplyEditor postId={post.id} />
            <PostNavigation {...mockData.navigation} />
          </div>

          {/* 右侧侧边栏 */}
          <aside className="lg:col-span-4 space-y-6">
            {/* 添加文章导航组件 */}
            <AnchorNavigation content={post.content} />
            
            {/* 原有的侧边栏组件 */}
            <SubscribeNotification />
            {/* ... 其他侧边栏组件 ... */}
          </aside>
        </div>
      </main>

      {/* 分享抽屉 */}
      <ShareDrawer
        isOpen={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        postId={post.id}
        postTitle={post.title}
      />

      {/* 图片预览 */}
      {previewImage && (
        <ImagePreview
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};

export default PostDetail;
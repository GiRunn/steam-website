// src/pages/Community/PostDetail/index.jsx
// 帖子详情页 - 包含帖子内容、评论、相关推荐等功能
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_POSTS } from '../constants';
import PostContent from './components/PostContent';
import UserInfo from './components/UserInfo';
import Interactions from './components/Interactions';
import ReplyEditor from './components/ReplyEditor';
import ReplyList from './components/PostDetail/ReplyList';

import AdminActions from './components/AdminActions';
import RelatedPosts from './components/RelatedPosts';

const PostDetail = () => {
 const navigate = useNavigate();
 const { id } = useParams();
 const post = MOCK_POSTS.find(p => p.id === Number(id));

// 子组件: 加载状态
const LoadingState = () => (
  <div className="animate-pulse space-y-4 p-6 bg-gray-800/50 rounded-lg">
    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

// 子组件: 错误状态
const ErrorState = ({ error, resetErrorBoundary }) => (
  <div className="text-center p-6 bg-gray-800/50 rounded-lg">
    <h3 className="text-xl font-semibold text-red-400 mb-2">加载失败</h3>
    <p className="text-gray-400 mb-4">{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors"
    >
      重试
    </button>
  </div>
);

// 子组件: 返回按钮
const BackButton = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition-colors"
  >
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    返回社区
  </motion.button>
);

// 主组件
const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { post, isLoading, error, refetch } = usePostDetail(id);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  if (error) {
    return <ErrorState error={error} resetErrorBoundary={refetch} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <BackButton onClick={() => navigate('/community')} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 space-y-6"
          >
            <ErrorBoundary FallbackComponent={ErrorState} onReset={refetch}>
              <Suspense fallback={<LoadingState />}>
                {isLoading ? (
                  <LoadingState />
                ) : (
                  <>
                    <PostContent post={post} onShare={() => setIsShareModalOpen(true)} />
                    <CommentSection postId={id} />
                  </>
                )}
              </Suspense>
            </ErrorBoundary>
          </motion.div>

          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <Suspense fallback={<LoadingState />}>
              <RelatedPosts currentPostId={id} />
            </Suspense>
          </motion.aside>
        </div>
      </main>

      <AnimatePresence>
        {isShareModalOpen && (
          <ShareModal 
            postId={id} 
            onClose={() => setIsShareModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostDetail;
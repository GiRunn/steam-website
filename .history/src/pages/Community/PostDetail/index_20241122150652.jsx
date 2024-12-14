// src/pages/Community/PostDetail/index.jsx
// 帖子详情页 - 包含帖子内容、评论、相关推荐等功能
import React, { Suspense, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import usePostDetail from './hooks/usePostDetail';

// 保持原有的组件导入
const PostContent = lazy(() => import('./components/PostContent'));
const CommentSection = lazy(() => import('./components/CommentSection'));
const RelatedPosts = lazy(() => import('./components/RelatedPosts'));
const ShareModal = lazy(() => import('./components/ShareModal'));

// 优化原有的 LoadingState 组件
const LoadingState = () => (
  <div className="animate-pulse space-y-4 p-6 bg-gray-800/50 rounded-lg">
    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

// 增强原有的 BackButton 组件
const BackButton = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="group flex items-center space-x-2 mb-6 text-blue-400 
      hover:text-blue-300 transition-colors"
  >
    <svg 
      className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
      />
    </svg>
    <span>返回社区</span>
  </motion.button>
);

// 主组件 - 保持原有结构，增加视觉效果
const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { post, isLoading, error } = usePostDetail(id);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [hasScrolled, setHasScrolled] = React.useState(false);

  // 监听滚动
  React.useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-[300px] overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-[#0a0f16]" />
      </div>

      {/* 固定顶栏 */}
      <AnimatePresence>
        {hasScrolled && (
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md 
              bg-[#0a0f16]/80 border-b border-white/10"
          >
            <div className="container mx-auto px-4 py-4">
              <BackButton onClick={() => navigate('/community')} />
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <BackButton onClick={() => navigate('/community')} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 主内容区 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 space-y-6"
          >
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
          </motion.div>

          {/* 侧边栏 */}
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <Suspense fallback={<LoadingState />}>
              <div className="sticky top-8 space-y-6">
                <RelatedPosts currentPostId={id} />
              </div>
            </Suspense>
          </motion.aside>
        </div>
      </main>

      {/* 返回顶部按钮 */}
      <AnimatePresence>
        {hasScrolled && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed right-8 bottom-8 p-3 rounded-full 
              bg-white/5 hover:bg-white/10 backdrop-blur-sm
              transition-colors"
          >
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 10l7-7m0 0l7 7m-7-7v18" 
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 分享模态框 */}
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
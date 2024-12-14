// src/pages/Community/PostDetail/index.jsx
// 帖子详情页 - 增强版设计，包含更多视觉效果和交互体验
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { ArrowLeft, Share2, Heart, MessageCircle, Eye, Bookmark } from 'lucide-react';
import usePostDetail from './hooks/usePostDetail';

// 懒加载组件
const PostContent = lazy(() => import('./components/PostContent'));
const CommentSection = lazy(() => import('./components/CommentSection'));
const RelatedPosts = lazy(() => import('./components/RelatedPosts'));
const ShareModal = lazy(() => import('./components/ShareModal'));

// 子组件: 页面顶部背景
const PageBackground = () => (
  <div className="absolute top-0 left-0 w-full h-[300px] overflow-hidden z-0">
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-[#0a0f16]" />
    <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
  </div>
);

// 子组件: 文章元信息展示
const PostMeta = ({ author, date, tags }) => (
  <div className="flex items-center space-x-4 text-sm text-gray-400">
    <div className="flex items-center space-x-2">
      <img 
        src={author.avatar} 
        alt={author.name}
        className="w-8 h-8 rounded-full ring-2 ring-blue-500/30"
      />
      <span className="font-medium text-gray-300">{author.name}</span>
    </div>
    <span className="text-gray-500">•</span>
    <time>{date}</time>
    {tags && tags.length > 0 && (
      <>
        <span className="text-gray-500">•</span>
        <div className="flex gap-2">
          {tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </>
    )}
  </div>
);

// 子组件: 文章统计信息
const PostStats = ({ likes, comments, views }) => (
  <div className="flex items-center space-x-6 text-sm text-gray-400">
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center space-x-2 hover:text-pink-400 transition-colors"
    >
      <Heart className="w-4 h-4" />
      <span>{likes}</span>
    </motion.button>
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
    >
      <MessageCircle className="w-4 h-4" />
      <span>{comments}</span>
    </motion.button>
    <div className="flex items-center space-x-2">
      <Eye className="w-4 h-4" />
      <span>{views}</span>
    </div>
  </div>
);

// 子组件: 加载状态
const LoadingState = () => (
  <div className="animate-pulse space-y-6 p-6 rounded-lg backdrop-blur-sm bg-white/5">
    <div className="h-8 bg-gray-700/50 rounded-lg w-3/4" />
    <div className="space-y-4">
      <div className="h-4 bg-gray-700/50 rounded w-full" />
      <div className="h-4 bg-gray-700/50 rounded w-5/6" />
      <div className="h-4 bg-gray-700/50 rounded w-4/6" />
    </div>
    <div className="flex justify-between">
      <div className="h-10 bg-gray-700/50 rounded w-32" />
      <div className="h-10 bg-gray-700/50 rounded w-32" />
    </div>
  </div>
);

// 子组件: 错误状态
const ErrorState = ({ error, resetErrorBoundary }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center p-8 rounded-lg backdrop-blur-sm bg-white/5"
  >
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 
      flex items-center justify-center">
      <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24">
        <path 
          stroke="currentColor" 
          strokeLinecap="round" 
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-red-400 mb-2">加载失败</h3>
    <p className="text-gray-400 mb-6">{error.message}</p>
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={resetErrorBoundary}
      className="px-6 py-2 bg-red-500 hover:bg-red-400 rounded-lg 
        transition-colors shadow-lg shadow-red-500/20"
    >
      重试加载
    </motion.button>
  </motion.div>
);

// 子组件: 返回按钮
const BackButton = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="group flex items-center space-x-2 px-4 py-2 rounded-lg 
      bg-white/5 hover:bg-white/10 transition-all duration-200
      backdrop-blur-sm text-gray-400 hover:text-white"
  >
    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
    <span>返回社区</span>
  </motion.button>
);

// 子组件: 浮动工具栏
const FloatingToolbar = ({ onShare, onBookmark, isBookmarked }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col space-y-4"
  >
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onShare}
      className="p-3 rounded-full bg-white/5 hover:bg-white/10 
        backdrop-blur-sm transition-colors"
    >
      <Share2 className="w-5 h-5 text-gray-400 hover:text-white" />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onBookmark}
      className={`p-3 rounded-full backdrop-blur-sm transition-colors
        ${isBookmarked 
          ? 'bg-blue-500/20 text-blue-400' 
          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
        }`}
    >
      <Bookmark className="w-5 h-5" />
    </motion.button>
  </motion.div>
);

// 子组件: 相关文章卡片
const RelatedPostCard = ({ post }) => (
  <motion.article
    whileHover={{ scale: 1.02 }}
    className="p-4 rounded-lg backdrop-blur-sm bg-white/5 
      hover:bg-white/10 transition-all cursor-pointer"
  >
    <h3 className="font-medium text-gray-200 mb-2">{post.title}</h3>
    <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-gray-500">{post.date}</span>
      <PostStats 
        likes={post.likes} 
        comments={post.comments} 
        views={post.views} 
      />
    </div>
  </motion.article>
);

// 主组件
const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { post, isLoading, error, refetch } = usePostDetail(id);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (error) {
    return <ErrorState error={error} resetErrorBoundary={refetch} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white relative">
      <PageBackground />
      
      <AnimatePresence>
        {hasScrolled && (
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0a0f16]/80 
              border-b border-white/10 transition-all duration-300"
          >
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <BackButton onClick={() => navigate('/community')} />
              <PostStats 
                likes={post?.likes} 
                comments={post?.comments} 
                views={post?.views}
              />
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="mb-8">
          <BackButton onClick={() => navigate('/community')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 space-y-8"
          >
            <ErrorBoundary FallbackComponent={ErrorState} onReset={refetch}>
              <Suspense fallback={<LoadingState />}>
                {isLoading ? (
                  <LoadingState />
                ) : (
                  <>
                    <div className="space-y-6">
                      <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold leading-tight"
                      >
                        {post.title}
                      </motion.h1>
                      
                      <PostMeta 
                        author={post.author}
                        date={post.date}
                        tags={post.tags}
                      />
                      
                      <PostContent post={post} />
                      
                      <div className="flex items-center justify-between pt-6 
                        border-t border-white/10">
                        <PostStats 
                          likes={post.likes}
                          comments={post.comments}
                          views={post.views}
                        />
                      </div>
                    </div>

                    <CommentSection postId={id} />
                  </>
                )}
              </Suspense>
            </ErrorBoundary>
          </motion.div>

          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-8"
          >
            <Suspense fallback={<LoadingState />}>
              <div className="sticky top-8 space-y-8">
                <section className="rounded-lg backdrop-blur-sm bg-white/5 p-6">
                  <h2 className="text-lg font-semibold mb-4">关于作者</h2>
                  {post?.author && (
                    <div className="flex items-start space-x-4">
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full ring-2 ring-blue-500/30"
                      />
                      <div>
                        <h3 className="font-medium text-gray-200">
                          {post.author.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {post.author.bio}
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-4">相关文章</h2>
                  <div className="space-y-4">
                    <RelatedPosts currentPostId={id} />
                  </div>
                </section>
              </div>
            </Suspense>
          </motion.aside>
        </div>
      </main>

      <FloatingToolbar 
        onShare={() => setIsShareModalOpen(true)}
        onBookmark={() => setIsBookmarked(!isBookmarked)}
        isBookmarked={isBookmarked}
      />
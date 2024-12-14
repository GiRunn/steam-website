// src/components/GameCard/index.jsx
import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, ChevronDown, Play, Heart, Share2, Info } from 'lucide-react';
import { MOCK_GAMES, GAME_FILTERS } from '../../pages/home/constants';
import { Tooltip } from '../../components/ui/Tooltip'; // 修改这一行
import './styles.css';

// 头部搜索和筛选组件
const ShowcaseHeader = memo(({ searchQuery, onSearchChange, selectedFilter, onFilterChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // 监听滚动来改变header样式
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0a0f16]/95 backdrop-blur-lg shadow-lg' : ''
      }`}
    >
      <div className="relative flex flex-col gap-4 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <h2 className="text-2xl font-bold text-[#e6e7e8]">
              探索游戏
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '48px' }}
                className="h-1 bg-gradient-to-r from-[#3c89e8] to-[#1b5eb8] mt-2 rounded-full"
                transition={{ delay: 0.2, duration: 0.5 }}
              />
            </h2>
            <span className="text-sm text-[#4d5969] bg-[#141c28] px-3 py-1 rounded-full">
              {MOCK_GAMES.length} 款精选
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            <Tooltip content="搜索游戏、开发商或标签">
              <div className="relative group">
                <motion.div 
                  className="absolute inset-0 bg-[#3c89e8]/5 rounded-full blur"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="relative flex items-center">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3c89e8] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="发现新游戏..."
                    className="w-80 h-12 pl-12 pr-4 bg-[#141c28]/80 rounded-full text-[#e6e7e8] {/* 增加宽度和高度 */}
                             placeholder-[#4d5969] outline-none border border-[#1b2736]
                             focus:border-[#3c89e8]/50 focus:ring-2 focus:ring-[#3c89e8]/20
                             transition-all duration-300"
                    value={searchQuery}
                    onChange={onSearchChange}
                  />
                </div>
              </div>
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {GAME_FILTERS.map(filter => (
            <motion.button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                        ${selectedFilter === filter.id 
                          ? 'bg-gradient-to-r from-[#3c89e8] to-[#1b5eb8] text-white shadow-lg shadow-[#3c89e8]/20' 
                          : 'bg-[#141c28]/80 text-[#4d5969] hover:bg-[#1b2736] hover:text-[#8f98a0]'
                        } whitespace-nowrap`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.name}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

// 游戏卡片组件
// 游戏卡片组件
const GameCard = memo(({ game, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef(null);

  // 处理视频预加载
  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isHovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative rounded-2xl overflow-hidden bg-[#141c28]/80 border border-[#1b2736]
                 hover:border-[#3c89e8]/30 transition-all duration-300
                 hover:shadow-2xl hover:shadow-[#3c89e8]/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 图片/视频容器 */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* 视频预览 */}
        <AnimatePresence>
          {isHovered && game.videoUrl && (
            <motion.video
              ref={videoRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full object-cover"
              src={game.videoUrl}
              muted
              loop
              playsInline
            />
          )}
        </AnimatePresence>

        {/* 主图片 */}
        <motion.img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover"
          animate={{
            scale: isHovered ? 1.1 : 1,
            filter: isHovered ? 'brightness(0.3) blur(2px)' : 'brightness(1)'
          }}
          transition={{ duration: 0.4 }}
          onLoad={() => setIsImageLoaded(true)}
        />

        {/* 图片加载骨架屏 */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-[#141c28] animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-[#141c28] via-[#1b2736] to-[#141c28] 
                          animate-shimmer" />
          </div>
        )}

        {/* 顶部标签 */}
        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            {/* 评分标签 */}
    {game.rating && (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 bg-[#0a0f16]/90 backdrop-blur-sm 
                   rounded-full px-4 py-2"
      >
        <Star className="w-5 h-5 text-[#3c89e8] fill-current" />
        <span className="text-lg font-medium text-[#e6e7e8]">{game.rating}</span>
      </motion.div>
    )}
            
            {/* 新品标签 */}
            {game.isNew && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-[#3c89e8] to-[#1b5eb8] text-white 
                         rounded-full px-4 py-2 text-base font-medium"
              >
                新品
              </motion.div>
            )}
          </div>
          
            {/* 折扣标签 */}
            {game.discount > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center bg-[#3c89e8] text-white font-bold 
                        rounded-full px-4 py-2 text-lg"
              >
                -{game.discount}%
              </motion.div>
            )}
          </div>

        {/* 悬浮信息层 */}
        <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 flex flex-col justify-end
                      bg-gradient-to-t from-[#0a0f16] via-[#0a0f16]/90 to-transparent" // 调整渐变
          >
            {/* 增加上部分的内容容器 */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start">
              <div className="flex items-center gap-3">
                {game.rating && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 bg-[#0a0f16]/90 backdrop-blur-sm 
                            rounded-full px-4 py-2"
                  >
                    <Star className="w-5 h-5 text-[#3c89e8] fill-current" />
                    <span className="text-lg font-medium text-[#e6e7e8]">{game.rating}</span>
                  </motion.div>
                )}
                
                {game.isNew && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-r from-[#3c89e8] to-[#1b5eb8] text-white 
                            rounded-full px-4 py-2 text-base font-medium"
                  >
                    新品
                  </motion.div>
                )}
              </div>
              
              {game.discount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center bg-[#3c89e8] text-white font-bold 
                          rounded-full px-4 py-2 text-lg"
                >
                  -{game.discount}%
                </motion.div>
              )}
            </div>

            {/* 底部内容容器调整上边距 */}
            <div className="relative px-8 pb-8 pt-20"> {/* 增加顶部内边距 */}
              <div className="space-y-6">
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-[#e6e7e8]"
                >
                  {game.title}
                </motion.h3>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-base leading-relaxed text-[#8f98a0] line-clamp-2"
                >
                  {game.description}
                </motion.p>

                <motion.div 
                  className="flex flex-wrap gap-3"
                >
                  {game.tags.map(tag => (
                    <span 
                      key={tag.id}
                      className="px-4 py-2 text-sm font-medium text-[#3c89e8] 
                              rounded-full bg-[#1b2736]/80 backdrop-blur-sm
                              hover:bg-[#3c89e8] hover:text-white transition-colors"
                    >
                      {tag.name}
                    </span>
                  ))}
                </motion.div>

                <div className="flex items-center gap-6 mt-auto pt-4">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex items-center gap-2 text-[#8f98a0] 
                            hover:text-[#3c89e8] transition-colors"
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        isLiked ? 'fill-[#3c89e8] text-[#3c89e8]' : ''
                      }`} 
                    />
                    <span>收藏</span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-[#8f98a0] 
                                hover:text-[#3c89e8] transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>分享</span>
                  </button>

                  {game.videos?.length > 0 && (
                    <button 
                      className="flex items-center gap-2 text-[#3c89e8] 
                              hover:text-[#66a7ed] transition-colors ml-auto"
                    >
                      <Play className="w-5 h-5" />
                      <span>预告片</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* 卡片底部信息 */}
      <div className="p-8 border-t border-[#1b2736]">
        {/* 游戏信息 */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-xl font-semibold text-[#e6e7e8] mb-3 line-clamp-1">
              {game.title}
            </h3>
            <div className="text-base text-[#8f98a0]">{game.developer}</div>
          </div>
          <div className="text-right">
            {game.discount > 0 && (
              <div className="text-base text-[#8f98a0] line-through mb-2">
                ¥{game.originalPrice.toFixed(2)}
              </div>
            )}
            <div className="text-2xl font-bold text-[#3c89e8]">
              ¥{game.currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <motion.button 
            className="flex-1 py-4 px-6 bg-gradient-to-r from-[#3c89e8] to-[#1b5eb8] 
                       text-white rounded-xl font-medium text-lg
                       shadow-lg shadow-[#3c89e8]/10 transition-all duration-300 
                       hover:shadow-[#3c89e8]/20 group/btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="group-hover/btn:translate-x-0.5 transition-transform inline-block">
              立即购买
            </span>
          </motion.button>

          <Tooltip content="了解更多">
            <motion.button
              className="p-4 bg-[#1b2736] text-[#3c89e8] rounded-xl
                         hover:bg-[#3c89e8] hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info className="w-6 h-6" />
            </motion.button>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
});


// 主展示组件
const GameShowcase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const filteredGames = useMemo(() => {
    return MOCK_GAMES.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = selectedFilter === 'all' || game.sectionId === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

  return (
    <section className="py-16 bg-[#0a0f16] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <ShowcaseHeader
          searchQuery={searchQuery}
          onSearchChange={(e) => {
            setSearchQuery(e.target.value);
            setIsLoading(true);
            // 模拟搜索延迟
            setTimeout(() => setIsLoading(false), 500);
          }}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="rounded-xl overflow-hidden bg-[#141c28]/80 border border-[#1b2736]"
                >
                  <div className="aspect-[16/9] bg-[#1b2736] animate-pulse" />
                  <div className="p-4 space-y-4">
                    <div className="h-4 bg-[#1b2736] rounded animate-pulse" />
                    <div className="h-4 bg-[#1b2736] rounded w-2/3 animate-pulse" />
                    <div className="h-10 bg-[#1b2736] rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" /* 每行最多3张,增加间距 */
            >
              {filteredGames.length > 0 ? (
                filteredGames.map((game, index) => (
                  <GameCard key={game.id} game={game} index={index} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[#4d5969]"
                  >
                    <Search className="w-16 h-16 mb-4 mx-auto" />
                    <h3 className="text-xl font-medium mb-2">未找到相关游戏</h3>
                    <p>试试其他关键词或浏览全部游戏</p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default memo(GameShowcase);

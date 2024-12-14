import React, { useState, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, ChevronDown, Play } from 'lucide-react';
import { MOCK_GAMES, GAME_FILTERS } from '../../pages/home/constants';
import './styles.css';



// 头部搜索和筛选组件
const ShowcaseHeader = memo(({ searchQuery, onSearchChange, selectedFilter, onFilterChange }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col gap-4 mb-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="relative text-2xl font-bold">
          <span className="bg-gradient-title bg-clip-text text-transparent">探索游戏</span>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '48px' }}
            className="h-0.5 bg-gradient-decoration mt-2"
            transition={{ delay: 0.2, duration: 0.5 }}
          />
        </h2>

        <div className="flex items-center gap-4">
          {/* 搜索框容器 */}
          <div className="relative group">
            {/* 发光效果 */}
            <div className="absolute inset-0 bg-gradient-glow rounded-xl blur opacity-0 
                          group-hover:opacity-100 transition-all duration-300" />
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-blue w-4 h-4" />
              <input
                type="text"
                placeholder="寻找你的下一个冒险..."
                className="w-64 h-10 pl-10 pr-4 bg-interactive-default rounded-xl 
                         text-neutral-50 placeholder-neutral-700
                         border border-transparent outline-none
                         focus:border-primary-blue transition-all duration-300"
                value={searchQuery}
                onChange={onSearchChange}
              />
            </div>
          </div>

          <div className="text-sm text-neutral-700">
            发现 {MOCK_GAMES.length} 款精选游戏
          </div>
        </div>
      </div>

      {/* 分类过滤器 */}
      <div className="flex items-center gap-2">
        {GAME_FILTERS.map(filter => (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                      ${selectedFilter === filter.id 
                        ? 'bg-primary-blue text-neutral-50' 
                        : 'bg-interactive-default text-neutral-700 hover:bg-interactive-hover'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filter.name}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
});

// 游戏卡片组件
const GameCard = memo(({ game, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative rounded-xl overflow-hidden bg-primary-dark
                 border border-neutral-200/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 卡片封面区域 */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <motion.img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover"
          animate={{
            scale: isHovered ? 1.1 : 1,
            filter: isHovered ? 'brightness(0.3) blur(1px)' : 'brightness(1)'
          }}
          transition={{ duration: 0.4 }}
          onLoad={() => setIsImageLoaded(true)}
        />

        {/* 加载占位 */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-primary-dark animate-pulse">
            <div className="absolute inset-0 bg-gradient-shine animate-shimmer" />
          </div>
        )}

        {/* 评分和折扣标签 */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start">
          {game.rating && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 bg-primary-dark/90 backdrop-blur-sm 
                       rounded-xl px-3 py-1.5"
            >
              <Star className="w-4 h-4 text-primary-blue fill-current" />
              <span className="text-neutral-50 font-medium">{game.rating}</span>
            </motion.div>
          )}
          
          {game.discount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center bg-feedback-success text-neutral-50 
                       font-bold rounded-xl px-3 py-1.5"
            >
              -{game.discount}%
            </motion.div>
          )}
        </div>

        {/* 悬浮内容 */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 flex flex-col justify-end p-6 
                       bg-gradient-card"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-neutral-50">{game.title}</h3>
                <p className="text-sm text-neutral-700 line-clamp-2">
                  {game.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {game.tags.map(tag => (
                    <span key={tag.id} 
                          className="px-2.5 py-1 text-xs font-medium
                                   text-primary-blue bg-interactive-default 
                                   rounded-lg backdrop-blur-sm">
                      {tag.name}
                    </span>
                  ))}
                </div>

                {game.videos?.length > 0 && (
                  <motion.button 
                    className="flex items-center gap-2 text-primary-blue 
                             hover:text-neutral-50 transition-colors"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-5 h-5" />
                    <span>观看预告片</span>
                  </motion.button>
                )}

                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <span>{game.publisher}</span>
                  <span>•</span>
                  <span>{game.releaseDate}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 卡片信息区域 */}
      <div className="p-4 border-t border-neutral-200/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-medium text-neutral-50 mb-1">
              {game.title}
            </h3>
            <div className="text-sm text-neutral-700">{game.developer}</div>
          </div>
          <div className="text-right">
            {game.discount > 0 && (
              <div className="text-sm text-neutral-700 line-through">
                ¥{game.originalPrice.toFixed(2)}
              </div>
            )}
            <div className="text-lg font-bold text-primary-blue">
              ¥{game.currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <motion.button 
          className="w-full py-2 bg-interactive-default text-neutral-50 
                     rounded-xl transition-all duration-300
                     hover:bg-interactive-hover active:bg-interactive-active"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          了解更多
        </motion.button>
      </div>
    </motion.div>
  );
});




// 主组件导出
const GameShowcase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredGames = useMemo(() => {
    return MOCK_GAMES.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || game.sectionId === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ShowcaseHeader
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(GameShowcase);
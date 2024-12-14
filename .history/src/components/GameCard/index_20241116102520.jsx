import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, ChevronDown } from 'lucide-react';
import { MOCK_GAMES } from '../../constants';
import { GAME_FILTERS } from '../../constants';
import './styles.css';

// 头部搜索和筛选组件
const ShowcaseHeader = memo(({ searchQuery, onSearchChange, selectedFilter, onFilterChange }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col gap-6 mb-8"
    >
      {/* 标题和搜索栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-bold text-white">
            探索游戏
            <div className="h-1 w-12 bg-gradient-to-r from-[#45b5ff] to-[#0082ff] mt-2 rounded-full" />
          </h2>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#45b5ff]/20 to-[#0082ff]/20 
                          rounded-lg blur-lg group-hover:opacity-100 opacity-0 transition-opacity" />
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="寻找你的下一个冒险..."
                className="w-64 h-10 pl-10 pr-4 bg-white/5 rounded-lg text-white 
                         placeholder-gray-400 outline-none border border-white/5
                         focus:border-[#0082ff]/50 transition-all duration-300"
                value={searchQuery}
                onChange={onSearchChange}
              />
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          发现 {MOCK_GAMES.length} 款精选游戏
        </div>
      </div>

      {/* 分类过滤器 */}
      <div className="flex items-center gap-4">
        {GAME_FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                      ${selectedFilter === filter.id 
                        ? 'bg-gradient-to-r from-[#45b5ff] to-[#0082ff] text-white' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            {filter.name}
          </button>
        ))}
      </div>
    </motion.div>
  );
});

// 调整游戏卡片组件以适应新的数据结构
const GameCard = memo(({ game, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative rounded-xl overflow-hidden bg-white/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 游戏封面 */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <motion.img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover transition-all duration-500"
          animate={{
            scale: isHovered ? 1.1 : 1,
            filter: isHovered ? 'brightness(0.3) blur(2px)' : 'brightness(1)'
          }}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* 标签 */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start">
          {game.rating && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 bg-black/50 backdrop-blur-sm 
                       rounded-lg px-3 py-1.5"
            >
              <Star className="w-4 h-4 text-[#45b5ff] fill-current" />
              <span className="text-white font-medium">{game.rating}</span>
            </motion.div>
          )}
          
          {game.discount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center bg-[#0082ff] text-white font-bold 
                       rounded-lg px-3 py-1.5"
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
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col justify-end p-6 
                       bg-gradient-to-t from-black/90 to-transparent"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">{game.title}</h3>
                <p className="text-sm text-gray-300 line-clamp-2">{game.description}</p>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map(tag => (
                    <span key={tag.id} 
                          className="px-2.5 py-1 text-xs font-medium text-white/90 
                                   rounded-full bg-white/10 backdrop-blur-sm">
                      {tag.name}
                    </span>
                  ))}
                </div>
                {game.videos?.length > 0 && (
                  <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                    <Play className="w-5 h-5" />
                    <span>观看预告片</span>
                  </button>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>发行商: {game.publisher}</span>
                  <span>•</span>
                  <span>发布日期: {game.releaseDate}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 游戏信息 */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-medium text-white mb-1">{game.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{game.developer}</span>
            </div>
          </div>
          <div className="text-right">
            {game.discount > 0 && (
              <div className="text-sm text-gray-400 line-through">
                ¥{game.originalPrice.toFixed(2)}
              </div>
            )}
            <div className="text-lg font-bold text-[#45b5ff]">
              ¥{game.currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <button className="w-full py-2 bg-gradient-to-r from-[#45b5ff] to-[#0082ff]
                         text-white rounded-lg transition-all duration-300 
                         hover:opacity-90 transform hover:scale-[1.02]">
          了解更多
        </button>
      </div>
    </motion.div>
  );
});


// 主组件和过滤逻辑
const GameShowcase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // 根据筛选和搜索条件过滤游戏
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
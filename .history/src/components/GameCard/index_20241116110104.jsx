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
        <h2 className="text-2xl font-bold text-[#e6e7e8]">
          探索游戏
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '48px' }}
            className="h-0.5 bg-[#3c89e8] mt-2"
            transition={{ delay: 0.2, duration: 0.5 }}
          />
        </h2>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#3c89e8]/5 rounded-md blur opacity-0 
                          group-hover:opacity-100 transition-all duration-300" />
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4d5969] w-4 h-4" />
              <input
                type="text"
                placeholder="寻找你的下一个冒险..."
                className="w-64 h-10 pl-10 pr-4 bg-[#141c28] rounded-md text-[#e6e7e8] 
                          placeholder-[#4d5969] outline-none border border-[#1b2736]
                          focus:border-[#3f85e7] transition-all duration-300"
                value={searchQuery}
                onChange={onSearchChange}
              />
            </div>

          <div className="text-sm text-[#4d5969]">
            发现 {MOCK_GAMES.length} 款精选游戏
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {GAME_FILTERS.map(filter => (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
                      ${selectedFilter === filter.id 
                        ? 'bg-[#3c89e8] text-white' 
                        : 'bg-[#141c28]/80 text-[#4d5969] hover:bg-[#1b2736] hover:text-[#8f98a0]'}`}
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
      className="group relative rounded-md overflow-hidden bg-[#141c28]/80 border border-[#1b2736]
                 hover:border-[#3c89e8]/30 transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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

        {!isImageLoaded && (
          <div className="absolute inset-0 bg-[#141c28] animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-[#141c28] via-[#1b2736] to-[#141c28] 
                          animate-shimmer" />
          </div>
        )}

        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start">
          {game.rating && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 bg-[#0a0f16]/90 backdrop-blur-sm 
                       rounded-md px-2.5 py-1"
            >
              <Star className="w-4 h-4 text-[#3c89e8] fill-current" />
              <span className="text-[#e6e7e8] font-medium">{game.rating}</span>
            </motion.div>
          )}
          
          {game.discount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center bg-[#3c89e8] text-white font-bold 
                       rounded-md px-2.5 py-1"
            >
              -{game.discount}%
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 flex flex-col justify-end p-4 
                       bg-gradient-to-t from-[#0a0f16] to-transparent"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#e6e7e8]">{game.title}</h3>
                <p className="text-sm text-[#8f98a0] line-clamp-2">{game.description}</p>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map(tag => (
                    <span key={tag.id} 
                          className="px-2 py-1 text-xs font-medium text-[#3c89e8] 
                                   rounded-md bg-[#1b2736] backdrop-blur-sm">
                      {tag.name}
                    </span>
                  ))}
                </div>
                {game.videos?.length > 0 && (
                  <motion.button 
                    className="flex items-center gap-2 text-[#3c89e8] hover:text-[#66a7ed] transition-colors"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-5 h-5" />
                    <span>观看预告片</span>
                  </motion.button>
                )}
                <div className="flex items-center gap-2 text-sm text-[#8f98a0]">
                  <span>{game.publisher}</span>
                  <span>•</span>
                  <span>{game.releaseDate}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-[#1b2736]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-medium text-[#e6e7e8] mb-1">{game.title}</h3>
            <div className="text-sm text-[#8f98a0]">{game.developer}</div>
          </div>
          <div className="text-right">
            {game.discount > 0 && (
              <div className="text-sm text-[#8f98a0] line-through">
                ¥{game.originalPrice.toFixed(2)}
              </div>
            )}
            <div className="text-lg font-bold text-[#3c89e8]">
              ¥{game.currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <motion.button 
          className="w-full py-2 bg-gradient-to-br from-[#3c89e8] to-[#1b5eb8] text-white rounded-md 
                     shadow-lg shadow-[#3c89e8]/10 transition-all duration-300 
                     hover:shadow-[#3c89e8]/20"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          了解更多
        </motion.button>
      </div>
    </motion.div>
  );
});




// 主组件
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
    <section className="py-12 bg-[#0a0f16]">
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
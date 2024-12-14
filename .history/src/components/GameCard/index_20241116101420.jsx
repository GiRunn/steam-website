import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play, Search, ChevronDown } from 'lucide-react';

// 头部组件
const ShowcaseHeader = memo(({ searchQuery, onSearchChange, selectedFilter, onFilterChange }) => {
  return (
    <div className="relative flex items-center justify-between mb-8">
      {/* 左侧标题 */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-white">
          热门游戏
          <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 mt-2 rounded-full" />
        </h2>
      </div>

      {/* 右侧搜索和筛选 */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索游戏..."
            className="w-64 h-10 pl-10 pr-4 bg-white/10 rounded-lg text-white 
                     placeholder-gray-400 outline-none border border-transparent
                     focus:border-purple-500/50 transition-all duration-300"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
        
        <div className="relative">
          <select 
            value={selectedFilter}
            onChange={onFilterChange}
            className="h-10 pl-4 pr-10 bg-white/10 rounded-lg text-white 
                     outline-none appearance-none border border-transparent
                     focus:border-purple-500/50 transition-all duration-300"
          >
            <option value="all">全部</option>
            <option value="new">新品</option>
            <option value="trending">热门</option>
            <option value="sale">特惠</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>
    </div>
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
      className="group relative rounded-xl overflow-hidden bg-gradient-to-b from-white/5 to-white/10"
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
        
        {/* 加载占位 */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                          animate-shimmer" />
          </div>
        )}

        {/* 标签 */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start">
          {game.rating && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 bg-black/50 backdrop-blur-sm 
                       rounded-lg px-3 py-1.5"
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-white font-medium">{game.rating}</span>
            </motion.div>
          )}
          
          {game.discount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center bg-green-500 text-white font-bold 
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
              className="absolute inset-0 flex flex-col justify-end p-6"
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
            <p className="text-sm text-gray-400">{game.developer}</p>
          </div>
          <div className="text-right">
            {game.discount > 0 && (
              <div className="text-sm text-gray-400 line-through">
                ¥{game.originalPrice.toFixed(2)}
              </div>
            )}
            <div className="text-lg font-bold text-purple-400">
              ¥{game.currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 
                         text-white rounded-lg transition-all duration-300 
                         hover:opacity-90 transform hover:scale-[1.02]">
          了解更多
        </button>
      </div>
    </motion.div>
  );
});

// 主组件
const GameShowcase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // 示例游戏数据
  const games = [
    {
      id: 1,
      title: "赛博朋克 2077",
      coverImage: "/api/placeholder/800/450",
      description: "在赛博朋克 2077 这款开放世界动作冒险 RPG 中，您将在夜之城这座权力、魅力和义体改造的狂热重镇中展开冒险。",
      developer: "CD Projekt Red",
      tags: [
        { id: 1, name: "开放世界" },
        { id: 2, name: "RPG" },
        { id: 3, name: "动作" }
      ],
      rating: 4.5,
      originalPrice: 299,
      currentPrice: 199,
      discount: 33,
    },
    // 可以添加更多游戏数据...
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ShowcaseHeader
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          selectedFilter={selectedFilter}
          onFilterChange={(e) => setSelectedFilter(e.target.value)}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

GameShowcase.propTypes = {
  // 可以添加需要的props类型检查
};

export default memo(GameShowcase);
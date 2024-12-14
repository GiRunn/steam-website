// E:\Steam\steam-website\src\pages\home\components\ProductFeatures\index.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_GAMES } from '../../constants';
import { Star, Tag, Calendar, Users } from 'lucide-react';

const FeatureGame = ({ game, isActive, onMouseEnter }) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 ${
        isActive ? 'lg:col-span-2 lg:row-span-2' : ''
      }`}
      onMouseEnter={onMouseEnter}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <motion.img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-[#0a0f16]/60 to-transparent" />
        
        {/* 折扣标签 */}
        {game.discount > 0 && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded">
            -{game.discount}%
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
          
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {game.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-400 text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  {game.rating} 分
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {game.releaseDate}
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Tag className="w-4 h-4 mr-2" />
                  {game.developer}
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  {game.publisher}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {game.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {game.originalPrice !== game.currentPrice && (
                <span className="text-gray-500 line-through">
                  ¥{game.originalPrice}
                </span>
              )}
              <span className="text-white font-bold">
                ¥{game.currentPrice}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-colors"
            >
              立即购买
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductFeatures = () => {
  const [activeGameId, setActiveGameId] = useState(1);
  const displayedGames = MOCK_GAMES.slice(0, 5); // 只显示前5个游戏

  return (
    <div className="bg-[#0a0f16] py-20 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-blue-500/10 rotate-12 blur-3xl" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-purple-500/10 -rotate-12 blur-3xl" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            探索精彩游戏
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            发现来自世界各地的精彩游戏，享受无与伦比的游戏体验
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedGames.map((game) => (
            <FeatureGame
              key={game.id}
              game={game}
              isActive={game.id === activeGameId}
              onMouseEnter={() => setActiveGameId(game.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFeatures;
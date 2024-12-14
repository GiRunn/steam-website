// pages/Store.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown, Star, ShoppingCart, Heart } from 'lucide-react';

const Store = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // 分类数据
  const categories = [
    { id: 'all', name: '全部' },
    { id: 'action', name: '动作' },
    { id: 'adventure', name: '冒险' },
    { id: 'rpg', name: 'RPG' },
    { id: 'simulation', name: '模拟' },
    { id: 'strategy', name: '策略' },
    { id: 'sports', name: '体育' }
  ];

  // 游戏数据
  const games = [
    {
      id: 1,
      title: "幻想冒险",
      price: 299,
      originalPrice: 399,
      discount: 25,
      image: "https://picsum.photos/400/225",
      rating: 4.8,
      tags: ['动作', 'RPG', '开放世界'],
      releaseDate: '2024-03-15'
    },
    // ... 更多游戏数据
  ];

  return (
    <div className="min-h-screen bg-[#1b2838]">
      {/* 顶部筛选区 */}
      <div className="sticky top-0 z-40 bg-[#1b2838]/95 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="搜索游戏..."
                className="w-full h-10 pl-12 pr-4 rounded-lg bg-[#316282]/30 
                  text-white placeholder-gray-400 outline-none
                  focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg 
                bg-[#316282]/30 text-white hover:bg-[#316282]/50 transition-all"
            >
              <Filter className="w-5 h-5" />
              筛选
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 
                ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* 展开的筛选面板 */}
          <motion.div
            initial={false}
            animate={{ height: showFilters ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="py-4 space-y-4">
              {/* 分类选择 */}
              <div className="flex gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full transition-all
                      ${selectedCategory === category.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#316282]/30 text-gray-300 hover:bg-[#316282]/50'
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* 其他筛选选项 */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">价格区间</label>
                  <select className="w-full bg-[#316282]/30 rounded-lg px-4 py-2 text-white">
                    <option>全部</option>
                    <option>¥0-100</option>
                    <option>¥100-200</option>
                    <option>¥200+</option>
                  </select>
                </div>
                {/* ... 更多筛选选项 */}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 游戏列表 */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-[#1e2837] rounded-xl overflow-hidden
                hover:transform hover:scale-105 transition-all duration-300"
            >
              {/* 游戏封面 */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover transform 
                    group-hover:scale-110 transition-transform duration-700"
                />
                {/* 折扣标签 */}
                {game.discount && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white 
                    px-2 py-1 rounded-lg font-bold">
                    -{game.discount}%
                  </div>
                )}
                {/* 愿望单按钮 */}
                <button className="absolute top-4 left-4 p-2 rounded-full 
                  bg-black/50 text-white opacity-0 group-hover:opacity-100 
                  transition-opacity hover:bg-black/70">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* 游戏信息 */}
              <div className="p-4 space-y-4">
                <h3 className="text-lg font-bold text-white">{game.title}</h3>
                
                {/* 标签 */}
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full 
                        bg-[#316282]/30 text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 评分 */}
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-white">{game.rating}</span>
                </div>

                {/* 价格区域 */}
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    {game.originalPrice > game.price && (
                      <span className="text-sm text-gray-400 line-through">
                        ¥{game.originalPrice}
                      </span>
                    )}
                    <div className="text-xl font-bold text-white">
                      ¥{game.price}
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-gradient-to-r from-blue-500 to-blue-600
                    hover:from-blue-600 hover:to-blue-700
                    text-white transition-all">
                    <ShoppingCart className="w-5 h-5" />
                    购买
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Store;
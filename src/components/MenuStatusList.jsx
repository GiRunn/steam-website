import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, AlertTriangle, XCircle } from 'lucide-react';

const MenuStatusList = () => {
  // 状态管理
  const [activeCategory, setActiveCategory] = useState('主食类');
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 菜单数据
  const categories = {
    '主食类': [
      {
        id: 1,
        name: '经典牛肉汉堡',
        price: 29.99,
        status: 'available',
        tags: ['热销', '推荐'],
        image: 'https://picsum.photos/300/300'
      },
      {
        id: 2,
        name: '意大利面',
        price: 25.99,
        status: 'maintenance',
        tags: ['特色'],
        image: 'https://picsum.photos/300/300'
      },
      {
        id: 3,
        name: '披萨',
        price: 35.99,
        status: 'discontinued',
        tags: ['经典'],
        image: 'https://picsum.photos/300/300'
      }
    ],
    '小吃类': [
      {
        id: 101,
        name: '薯条',
        price: 12.99,
        status: 'available',
        tags: ['人气'],
        image: 'https://picsum.photos/300/300'
      }
    ],
    '饮品类': [
      {
        id: 201,
        name: '可乐',
        price: 5.99,
        status: 'available',
        tags: ['饮料'],
        image: 'https://picsum.photos/300/300'
      }
    ]
  };

  // 状态配置
  const statusConfig = {
    all: { 
      label: '全部', 
      color: 'from-blue-400 to-purple-400',
      icon: Search
    },
    available: { 
      label: '可用', 
      color: 'from-green-400 to-emerald-400',
      icon: Check
    },
    maintenance: { 
      label: '维护中', 
      color: 'from-yellow-400 to-amber-400',
      icon: AlertTriangle
    },
    discontinued: { 
      label: '已停用', 
      color: 'from-red-400 to-rose-400',
      icon: XCircle
    }
  };

  // 筛选逻辑
  const filteredItems = categories[activeCategory]?.filter(item => {
    const matchesStatus = activeStatus === 'all' || item.status === activeStatus;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  }) || [];

  // 状态标签样式
  const getStatusStyle = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1923]">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
        
        {/* 动态光效 */}
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-slow-spin"
          style={{
            background: `
              conic-gradient(
                from 0deg at 50% 50%,
                rgba(56, 189, 248, 0.1),
                rgba(168, 85, 247, 0.1),
                rgba(236, 72, 153, 0.1),
                rgba(56, 189, 248, 0.1)
              )
            `
          }}
        />
        
        {/* 点状装饰 */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)
            `,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 min-h-screen px-6 py-12">
        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              菜单状态一览
            </span>
          </h1>

          {/* 搜索框 */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索菜品名称或标签..."
                className="w-full px-6 py-3 rounded-full bg-white/10 backdrop-blur-lg 
                  text-white placeholder-gray-400 outline-none border border-white/10
                  focus:border-cyan-500/50 transition-all duration-300"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* 状态筛选器 */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {Object.entries(statusConfig).map(([key, { label, color, icon: Icon }]) => (
              <button
                key={key}
                onClick={() => setActiveStatus(key)}
                className={`
                  px-6 py-2 rounded-full backdrop-blur-lg transition-all duration-300
                  flex items-center gap-2
                  ${activeStatus === key 
                    ? `bg-gradient-to-r ${color} text-white shadow-lg` 
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'}
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* 分类切换器 */}
          <div className="flex justify-center flex-wrap gap-4">
            {Object.keys(categories).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  relative px-6 py-3 rounded-xl transition-all duration-300
                  ${activeCategory === category 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'}
                `}
              >
                {category}
                {activeCategory === category && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 
                      rounded-xl -z-10"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 内容区域 */}
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 text-gray-400"
              >
                未找到匹配的菜品
              </motion.div>
            ) : (
              <motion.div
                key={`${activeCategory}-${activeStatus}-${searchTerm}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
              >
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div className="relative bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm
                      hover:transform hover:scale-105 transition-all duration-500">
                      {/* 图片区域 */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923] via-transparent to-transparent" />
                        
                        {/* 状态标签 */}
                        <div className="absolute top-4 right-4">
                          <div className={`
                            px-4 py-1 rounded-full border backdrop-blur-md
                            ${getStatusStyle(item.status)}
                          `}>
                            {statusConfig[item.status]?.label || '已停用'}
                          </div>
                        </div>
                      </div>

                      {/* 内容区域 */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white">
                            {item.name}
                          </h3>
                          <span className="text-cyan-400 font-bold text-xl">
                            ${item.price}
                          </span>
                        </div>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-sm
                                bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 发光边框效果 */}
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10
                        group-hover:ring-cyan-500/30 transition-all duration-500" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MenuStatusList;
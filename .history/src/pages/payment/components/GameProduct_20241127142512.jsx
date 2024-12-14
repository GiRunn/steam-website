// E:\Steam\steam-website\src\pages\payment\components\GameProduct.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, HardDrive, Globe, Star, Award, Clock } from 'lucide-react';

// 信息小部件组件
const InfoWidget = ({ icon: Icon, text, className = "" }) => (
  <motion.div 
    className={`flex items-center space-x-2 bg-[#1a2234] p-2 rounded-lg ${className}`}
    whileHover={{ scale: 1.02, backgroundColor: '#1f2937' }}
    transition={{ duration: 0.2 }}
  >
    <Icon className="w-4 h-4 text-blue-500" />
    <span className="text-gray-300 text-sm">{text}</span>
  </motion.div>
);

// 游戏标签组件
const GameTag = ({ tag }) => (
  <motion.span
    whileHover={{ scale: 1.05 }}
    className="px-3 py-1 bg-[#1a2234] rounded-full text-sm text-gray-300 hover:bg-[#1f2937] 
               transition-colors duration-200 cursor-pointer border border-gray-700"
  >
    {tag}
  </motion.span>
);

// 评分徽章组件
const RatingBadge = ({ rating }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="absolute top-2 right-2 flex items-center space-x-1 bg-gradient-to-r 
               from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full shadow-lg"
  >
    <Award className="w-4 h-4" />
    <span className="font-bold">{rating}</span>
  </motion.div>
);

const GameProduct = ({ product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111827] rounded-lg shadow-xl overflow-hidden border border-gray-800 
                 hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="flex flex-col md:flex-row">
        {/* 游戏图片区域 */}
        <motion.div 
          className="relative w-full md:w-80 h-56 md:h-auto overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <RatingBadge rating={product.rating} />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#111827] to-transparent" />
        </motion.div>
        
        {/* 游戏信息区域 */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
              <h3 className="text-2xl font-bold text-white bg-clip-text text-transparent 
                           bg-gradient-to-r from-blue-400 to-blue-600">
                {product.name}
              </h3>
              <p className="text-gray-400 mt-2 leading-relaxed">{product.description}</p>
            </motion.div>
            
            <motion.div 
              className="text-right"
              initial={{ x: 20 }} 
              animate={{ x: 0 }}
            >
              <div className="text-3xl font-bold text-white">${product.price}</div>
              <div className="text-sm text-gray-400 mt-1">含税价</div>
              <div className="mt-2 flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                <span>24小时内发货</span>
              </div>
            </motion.div>
          </div>

          {/* 游戏详细信息 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoWidget icon={Gamepad2} text={product.platform} />
            <InfoWidget icon={HardDrive} text={product.size} />
            <InfoWidget 
              icon={Globe} 
              text={`${product.languages.slice(0, 2).join(', ')}${product.languages.length > 2 ? ' 等' : ''}`}
            />
            <InfoWidget icon={Star} text={product.publisher} />
          </div>

          {/* 游戏标签 */}
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-sm text-gray-400 mb-2">游戏类型</div>
            <div className="flex flex-wrap gap-2">
              {product.genre.map((tag) => (
                <GameTag key={tag} tag={tag} />
              ))}
            </div>
          </motion.div>

          {/* 底部提示信息 */}
          <motion.div 
            className="mt-6 text-sm text-gray-400 bg-[#1a2234] p-3 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-blue-500" />
              <span>该游戏支持Steam云存档和成就系统</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameProduct;
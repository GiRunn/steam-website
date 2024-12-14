import React from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, Shield, Settings, Gamepad, 
  ThumbsUp, Award, Trophy, Clock } from 'lucide-react';

const FeatureCard = ({ feature, icon: Icon, description }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="relative p-6 rounded-xl bg-white/5 hover:bg-white/10 
      transition-all duration-300 group cursor-pointer"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20
        group-hover:from-blue-600/30 group-hover:to-purple-600/30 transition-colors">
        <Icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-white mb-1">{feature}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
    
    {/* 悬停效果 */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 
      opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
  </motion.div>
);

const StatCard = ({ icon: Icon, value, label }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all 
      duration-300 group relative overflow-hidden"
  >
    <div className="relative z-10">
      <Icon className="w-8 h-8 text-gray-400 mb-4 group-hover:text-blue-400 
        transition-colors" />
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
    
    {/* 背景动画 */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 
      translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
  </motion.div>
);

const Overview = ({ game }) => {
  // 定义游戏特性
  const features = [
    {
      icon: Users,
      feature: '多人游戏',
      description: '支持在线多人游戏模式，与好友一起体验游戏乐趣。'
    },
    {
      icon: Globe,
      feature: '云存档',
      description: '游戏进度自动同步至云端，随时随地继续您的游戏。'
    },
    {
      icon: Shield,
      feature: '反作弊系统',
      description: '先进的反作弊系统，确保公平的游戏环境。'
    },
    {
      icon: Settings,
      feature: '高度自定义',
      description: '丰富的游戏设置选项，打造专属游戏体验。'
    }
  ];

  return (
    <section className="space-y-12">
      {/* 标题 */}
      <div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-white mb-4"
        >
          游戏概览
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 leading-relaxed"
        >
          {game.description}
        </motion.p>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Trophy}
          value={game.rating}
          label="用户评分"
        />
        <StatCard 
          icon={ThumbsUp}
          value={`${game.reviews.positive}%`}
          label="好评率"
        />
        <StatCard 
          icon={Clock}
          value="25小时"
          label="平均游戏时长"
        />
        <StatCard 
          icon={Award}
          value={game.reviews.total.toLocaleString()}
          label="用户评价"
        />
      </div>

      {/* 游戏特性 */}
      <div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-white mb-6"
        >
          游戏特性
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.feature}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* 发行信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-xl bg-white/5"
      >
        <h3 className="text-xl font-medium text-white mb-4">发行信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">开发商</span>
              <span className="text-white">{game.publisher}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">发行日期</span>
              <span className="text-white">{game.releaseDate}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">游戏模式</span>
              <span className="text-white">{game.playerCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">平台</span>
              <span className="text-white">Windows</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Overview;
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// 标题组件
const SectionHeader = () => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 
      bg-clip-text text-transparent">
      猜你喜欢
    </h2>
    <Link 
      to="/recommendations"
      className="text-gray-400 hover:text-white transition-colors"
    >
      查看更多
    </Link>
  </div>
);

// 评分组件
const GameRating = ({ rating }) => (
  <div className="flex flex-col items-center">
    <span className="text-2xl font-bold text-white">
      {rating}
    </span>
    <span className="text-sm text-gray-400">
      用户评分
    </span>
  </div>
);

// 游戏卡片内容组件
const CardContent = ({ title, description, rating }) => (
  <div className="absolute inset-0 bg-black/80 p-4 flex flex-col 
    opacity-0 group-hover:opacity-100 transition-opacity">
    <div className="flex-1 space-y-2">
      <h4 className="text-xl font-bold text-white">{title}</h4>
      <p className="text-sm text-gray-300 line-clamp-3">
        {description}
      </p>
    </div>
    <GameRating rating={rating} />
  </div>
);

// 游戏卡片组件
const GameCard = ({ game, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="relative aspect-[16/9] rounded-xl overflow-hidden group"
  >
    <Link to={`/store/game/${game.id}`}>
      <div className="relative w-full h-full">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-300 
            group-hover:scale-110"
        />
        <CardContent 
          title={game.title}
          description={game.description}
          rating={game.rating}
        />
      </div>
    </Link>
  </motion.div>
);

// 游戏网格组件
const GamesGrid = ({ games }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {games.map((game, index) => (
      <GameCard key={game.id} game={game} index={index} />
    ))}
  </div>
);

// 主组件
const RecommendSection = ({ games }) => {
  return (
    <section className="space-y-6">
      <SectionHeader />
      <GamesGrid games={games} />
    </section>
  );
};

export default RecommendSection;
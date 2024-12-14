import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Gift, Clock, Users, Share } from 'lucide-react';

// 格式化数字的工具函数
const formatNumber = (num) => new Intl.NumberFormat('zh-CN').format(num);

// 折扣价格组件
const DiscountPrice = ({ discount, originalPrice, price }) => {
  if (!discount) return null;
  
  return (
    <div className="flex items-center gap-4">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="px-3 py-1 rounded-full bg-green-500 text-white font-bold"
      >
        -{discount}%
      </motion.div>
      <div>
        <div className="text-gray-400 line-through">
          ¥{formatNumber(originalPrice)}
        </div>
        <div className="text-3xl font-bold text-white">
          ¥{formatNumber(price)}
        </div>
      </div>
    </div>
  );
};

// 更新原有 ActionButtons 组件代码
const ActionButtons = ({ game, onPurchase }) => {
  const navigate = useNavigate(); // 添加路由导航

  const handlePurchase = () => {
    // 跳转到支付页面,并传递游戏信息
    navigate('/payment', { 
      state: { 
        product: {
          id: game.id,
          name: game.name,
          description: game.description,
          price: game.discount ? game.price : game.originalPrice,
          originalPrice: game.originalPrice,
          platform: game.platform || "PC / Steam",
          image: game.coverImage,
          publisher: game.publisher,
          releaseDate: game.releaseDate,
          genre: game.features,
          rating: game.rating,
          size: game.size || "70 GB",
          languages: game.languages || ["简体中文", "英语", "日语", "韩语"]
        }
      }
    });
  };

  return (
    <div className="space-y-3">
      <motion.button
        onClick={handlePurchase}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 
          to-purple-600 text-white font-medium flex items-center justify-center 
          gap-2 hover:from-blue-500 hover:to-purple-500 transition-colors group"
      >
        <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
        立即购买
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-3 rounded-xl bg-white/10 text-white font-medium
          flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
      >
        <Gift className="w-5 h-5" />
        添加至愿望清单
      </motion.button>
    </div>
  );
};


// 游戏信息组件
const GameDetails = ({ publisher, releaseDate, playerCount }) => {
  const details = [
    { label: '开发商', value: publisher },
    { label: '发售日期', value: releaseDate },
    { label: '游戏模式', value: playerCount }
  ];

  return (
    <div className="space-y-4">
      {details.map(({ label, value }) => (
        <div key={label} className="flex justify-between text-sm">
          <span className="text-gray-400">{label}</span>
          <span className="text-white">{value}</span>
        </div>
      ))}
    </div>
  );
};

// 功能标签组件
const FeatureTags = ({ features }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {features.map((feature) => (
        <span
          key={feature}
          className="px-3 py-1 rounded-full text-sm bg-white/10 text-gray-200"
        >
          {feature}
        </span>
      ))}
    </div>
  );
};

// 底部统计组件
const Statistics = ({ totalReviews }) => {
  return (
    <div className="px-6 py-4 bg-white/5 flex items-center justify-between">
      <div className="flex items-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{formatNumber(totalReviews)}+ 用户</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>游戏时长 20h+</span>
        </div>
      </div>
      <Share className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white 
        transition-colors" />
    </div>
  );
};

// 主组件
const Purchase = ({ game }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm"
    >
      <div className="p-6 space-y-6">
        <DiscountPrice 
          discount={game.discount}
          originalPrice={game.originalPrice}
          price={game.price}
        />

        <ActionButtons />

        <GameDetails 
          publisher={game.publisher}
          releaseDate={game.releaseDate}
          playerCount={game.playerCount}
        />

        <FeatureTags features={game.features} />
      </div>

      <Statistics totalReviews={game.reviews.total} />
    </motion.div>
  );
};

export default Purchase;
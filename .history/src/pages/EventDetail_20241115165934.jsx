import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';

import { eventService } from '../services/api';

import {
  Calendar,
  Clock,
  Users,
  Bell,
  Share,
  ChevronLeft,
  Trophy,
  Gift,
  Star,
  Heart,
  Bookmark,
  XCircle
} from 'lucide-react';

// 错误提示组件
const ErrorScreen = ({ message = "加载失败" }) => (
  <motion.div 
    className="min-h-screen bg-[#1b2838] flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      </motion.div>
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-white mb-2"
      >
        {message}
      </motion.h2>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 mb-4"
      >
        请稍后重试
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Link 
          to="/store"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 
            rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors text-white"
        >
          返回商店
        </Link>
      </motion.div>
    </div>
  </motion.div>
);

// 活动头图组件
const EventHero = ({ event }) => (
  <div className="relative h-[600px] overflow-hidden">
    <motion.div 
      className="absolute inset-0"
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1.5 }}
    >
      <img
        src={event.coverImage}
        alt={event.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1b2838] via-[#1b2838]/50 to-transparent">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            background: [
              "linear-gradient(45deg, #1b2838 0%, transparent 100%)",
              "linear-gradient(45deg, transparent 0%, #1b2838 100%)",
              "linear-gradient(45deg, #1b2838 0%, transparent 100%)"
            ]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="absolute bottom-0 left-0 right-0 container mx-auto px-6 pb-12"
    >
      <div className="max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl font-bold text-white mb-4"
        >
          {event.title}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl text-gray-300 mb-8"
        >
          {event.subtitle}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-8 text-gray-300"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>{new Date(event.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>{event.participants.toLocaleString()} 人关注</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  </div>
);


// 倒计时组件
// 倒计时组件
const EventCountdown = ({ startDate, endDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      // 检查活动是否已开始或结束
      if (now >= start && now < end) {
        setIsStarted(true);
        const timeToEnd = end - now;
        setTimeLeft({
          days: Math.floor(timeToEnd / (1000 * 60 * 60 * 24)),
          hours: Math.floor((timeToEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((timeToEnd % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeToEnd % (1000 * 60)) / 1000)
        });
      } else if (now >= end) {
        setIsEnded(true);
        clearInterval(timer);
      } else {
        const timeToStart = start - now;
        setTimeLeft({
          days: Math.floor(timeToStart / (1000 * 60 * 60 * 24)),
          hours: Math.floor((timeToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((timeToStart % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeToStart % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate, endDate]);

  const timeBlocks = [
    { label: '天', value: timeLeft.days },
    { label: '时', value: timeLeft.hours },
    { label: '分', value: timeLeft.minutes },
    { label: '秒', value: timeLeft.seconds }
  ];

  return (
    <div className="bg-gradient-to-br from-[#1e2837] to-[#1e2837]/80 rounded-xl p-8 sticky top-24 
      backdrop-blur-sm shadow-xl border border-white/5">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        {/* 状态标题 */}
        <motion.div
          animate={{ 
            scale: [1, 1.02, 1],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative"
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 
            bg-clip-text text-transparent">
            {isEnded ? '活动已结束' : isStarted ? '距离活动结束还有' : '距离活动开始还有'}
          </h3>
          {/* 装饰光效 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
            rounded-lg blur animate-pulse" />
        </motion.div>
        
        {/* 倒计时数字 */}
        <div className="grid grid-cols-4 gap-4">
          {timeBlocks.map(({ label, value }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center relative group"
            >
              <motion.div 
                className="relative bg-gradient-to-br from-[#253447] to-[#1e2837] rounded-xl 
                  p-4 w-full aspect-square flex items-center justify-center shadow-lg 
                  border border-white/5 overflow-hidden group-hover:border-blue-500/30 
                  transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  boxShadow: ['0 0 0 rgba(59, 130, 246, 0)', '0 0 20px rgba(59, 130, 246, 0.3)', '0 0 0 rgba(59, 130, 246, 0)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* 数字 */}
                <motion.span 
                  key={value}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="text-3xl font-bold font-mono text-white relative z-10"
                >
                  {String(Math.abs(value)).padStart(2, '0')}
                </motion.span>

                {/* 背景动效 */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 
                  blur-xl transition-opacity duration-300" />
              </motion.div>

              {/* 标签 */}
              <motion.span 
                className="text-sm text-gray-400 mt-3 block"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {label}
              </motion.span>

              {/* 分隔符 */}
              {index < timeBlocks.length - 1 && (
                <motion.div
                  className="absolute top-1/2 -right-2 transform -translate-y-1/2 
                    text-gray-500 font-bold text-lg"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  :
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 状态提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-400"
        >
          {isStarted ? (
            <span>活动正在火热进行中</span>
          ) : isEnded ? (
            <span>感谢参与，下次活动再见</span>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>活动即将开始</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-500"
              />
            </div>
          )}
        </motion.div>

        {/* 活动时间信息 */}
        <div className="text-sm text-gray-400 space-y-1">
          <div>开始时间: {new Date(startDate).toLocaleString()}</div>
          <div>结束时间: {new Date(endDate).toLocaleString()}</div>
        </div>
      </motion.div>
    </div>
  );
};

// 奖励展示组件
const EventRewards = ({ rewards }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#1e2837] rounded-xl p-6"
  >
    <h3 className="text-xl font-bold text-white mb-4">活动奖励</h3>
    <div className="space-y-4">
      {rewards.map((reward, index) => (
        <motion.div 
          key={reward.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-4 p-4 bg-white/5 rounded-lg 
            hover:bg-white/10 transition-colors group"
        >
          <motion.img
            whileHover={{ rotate: 360 }}
            transition={{ duration: 1 }}
            src={reward.image}
            alt={reward.name}
            className="w-12 h-12 rounded-lg"
          />
          <div className="flex-1">
            <h4 className="text-white font-medium group-hover:text-blue-400 
              transition-colors">
              {reward.name}
            </h4>
            <p className="text-sm text-gray-400">{reward.description}</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="p-2 rounded-full bg-white/5 text-gray-400 
              group-hover:text-white transition-colors"
          >
            <Gift className="w-5 h-5" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// 图片画廊组件
const EventGallery = ({ images }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className="space-y-4"
  >
    <h2 className="text-2xl font-bold text-white mb-6">活动图片</h2>
    <div className="grid grid-cols-3 gap-4">
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, zIndex: 10 }}
          className="relative aspect-[16/9] rounded-xl overflow-hidden group"
        >
          <img
            src={image}
            alt={`Event gallery ${index + 1}`}
            className="w-full h-full object-cover transition-transform 
              duration-500 group-hover:scale-110"
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 
              to-transparent flex items-end p-4"
          >
            <span className="text-white text-sm">点击查看大图</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// 特惠游戏组件
const EventGames = ({ games }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-white mb-6">参与特惠的游戏</h2>
    <div className="grid grid-cols-3 gap-6">
      {games.map((game, index) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="bg-[#1e2837] rounded-xl overflow-hidden group"
        >
          <div className="relative aspect-[2/1] overflow-hidden">
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-full object-cover transition-transform 
                duration-500 group-hover:scale-110"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="absolute top-2 right-2 bg-gradient-to-r from-green-500 
                to-emerald-500 text-white px-2 py-1 rounded-full text-sm 
                shadow-lg"
            >
              -{game.discount}%
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e2837] 
              to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="p-4">
            <h3 className="text-white font-medium mb-2 group-hover:text-blue-400 
              transition-colors">
              {game.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-gray-400 line-through text-sm">
                  ¥{game.originalPrice}
                </div>
                <div className="text-green-400 font-bold">
                  ¥{game.discountPrice}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 
                  text-white rounded-lg font-medium shadow-lg shadow-blue-500/20"
              >
                <motion.span
                  initial={false}
                  animate={{ x: [-20, 0], opacity: [0, 1] }}
                >
                  购买
                </motion.span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// 活动描述组件
const EventDescription = ({ event }) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className="bg-[#1e2837] rounded-xl p-8"
  >
    <h2 className="text-2xl font-bold text-white mb-6">活动详情</h2>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: event.longDescription }}
    />
  </motion.div>
);

// 主组件
const EventDetail = ({ darkMode, locale, toggleDarkMode, toggleLocale }) => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // 获取事件数据
  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      try {
        // 模拟API调用
        setTimeout(() => {
          setEvent({
            id: 1,
            title: "春节特惠活动",
            subtitle: "数千款游戏低至1折",
            description: "新春佳节，Steam为您带来史上最大规模的游戏特惠活动。",
            longDescription: `
              <h3>活动亮点</h3>
              <ul>
                <li>超过10,000款游戏参与特惠</li>
                <li>每日闪购，折扣高达95%</li>
                <li>完成任务获得新春限定徽章</li>
                <li>购物返利，最高可获得2000点数</li>
              </ul>
            `,
            startDate: "2024-02-10T10:00:00Z",
            endDate: "2024-02-25T10:00:00Z",
            coverImage: "https://picsum.photos/1920/1080",
            gallery: [
              "https://picsum.photos/800/450",
              "https://picsum.photos/800/450",
              "https://picsum.photos/800/450"
            ],
            participants: 12567,
            rewards: [
              {
                name: "限定头像框",
                description: "新春主题头像框",
                image: "https://picsum.photos/100/100"
              }
            ],
            featuredGames: [
              {
                id: 1,
                title: "幻想冒险",
                image: "https://picsum.photos/300/150",
                originalPrice: 199,
                discountPrice: 59.7,
                discount: 70
              }
            ]
          });
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching event:', error);
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!event) return <ErrorScreen message="活动不存在" />;

  return (
    <div className="min-h-screen bg-[#1b2838]">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLocale}
      />

      {/* 返回按钮 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-4"
      >
        <Link 
          to="/store"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white 
            transition-all hover:translate-x-[-4px]"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>返回商店</span>
        </Link>
      </motion.div>

      <EventHero event={event} />

      <div className="container mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* 左侧主要内容 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-12"
          >
            <EventDescription event={event} />
            <EventGallery images={event.gallery} />
            <EventGames games={event.featuredGames} />
          </motion.div>

          {/* 右侧信息栏 */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex-shrink-0 space-y-6"
          >
            <EventCountdown startDate={event.startDate} />
            <EventRewards rewards={event.rewards} />
          </motion.div>
        </div>
      </div>

      <Footer
        darkMode={darkMode}
        showVideo={false}
        setShowVideo={() => {}}
        showScrollTop={true}
      />
    </div>
  );
};

export default EventDetail;

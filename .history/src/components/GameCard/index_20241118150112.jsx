// src/components/GameCard/index.jsx
import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, ChevronDown, Play, Heart, Share2, Info } from 'lucide-react';
import { MOCK_GAMES, GAME_FILTERS, GAME_STATUS} from '../../pages/home/constants';
import { Tooltip } from '../../components/ui/Tooltip';

import './styles.css';





// 头部搜索和筛选组件
const ShowcaseHeader = memo(({ searchQuery, onSearchChange, selectedFilter, onFilterChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // 监听滚动来改变header样式
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0a0f16]/95 backdrop-blur-lg shadow-lg' : ''
      }`}
    >
      <div className="relative flex flex-col gap-4 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <h2 className="text-4xl font-bold text-[#e6e7e8]">
              探索游戏
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '48px' }}
                className="h-1 bg-gradient-to-r from-[#3c89e8] to-[#1b5eb8] mt-2 rounded-full"
                transition={{ delay: 0.2, duration: 0.5 }}
              />
            </h2>
            <span className="text-sm text-[#4d5969] bg-[#141c28] px-3 py-1 rounded-full">
              {MOCK_GAMES.length} 款精选
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            <Tooltip content="搜索游戏、开发商或标签">
              <div className="relative group">
                <motion.div 
                  className="absolute inset-0 bg-[#3c89e8]/5 rounded-full blur"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="relative flex items-center">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3c89e8] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="发现新游戏..."
                    className="w-80 h-12 pl-12 pr-4 bg-[#141c28]/80 rounded-full text-[#e6e7e8] {/* 增加宽度和高度 */}
                             placeholder-[#4d5969] outline-none border border-[#1b2736]
                             focus:border-[#3c89e8]/50 focus:ring-2 focus:ring-[#3c89e8]/20
                             transition-all duration-300"
                    value={searchQuery}
                    onChange={onSearchChange}
                  />
                </div>
              </div>
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {GAME_FILTERS.map(filter => (
            <motion.button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                        ${selectedFilter === filter.id 
                          ? 'bg-gradient-to-r from-[#3c89e8] to-[#1b5eb8] text-white shadow-lg shadow-[#3c89e8]/20' 
                          : 'bg-[#141c28]/80 text-[#4d5969] hover:bg-[#1b2736] hover:text-[#8f98a0]'
                        } whitespace-nowrap`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.name}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
});



// 动态背景组件 
const DynamicBackground = memo(() => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mousePosition = { x: undefined, y: undefined };
    
    // 设置canvas尺寸并处理窗口大小变化
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 粒子类定义
    class Particle {
      constructor() {
        this.reset();
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.baseSpeedX = Math.random() * 0.3 - 0.15;
        this.baseSpeedY = Math.random() * 0.3 - 0.15;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.color = `rgba(60, 137, 232, ${this.opacity})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // 鼠标交互逻辑
        if (mousePosition.x !== undefined) {
          const dx = mousePosition.x - this.x;
          const dy = mousePosition.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            this.speedX = this.baseSpeedX - (dx / distance) * force * 0.5;
            this.speedY = this.baseSpeedY - (dy / distance) * force * 0.5;
          } else {
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;
          }
        }
        
        // 边界检测
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    // 初始化粒子
    const initParticles = () => {
      particles = [];
      // 根据屏幕大小计算粒子数量，但设置上限以保证性能
      const numberOfParticles = Math.min(
        Math.floor((canvas.width * canvas.height) / 20000),
        100
      );
      
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };
    
    // 连接临近的粒子
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = (120 - distance) / 600;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(60, 137, 232, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    // 处理鼠标移动
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mousePosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    };
    
    // 处理鼠标离开
    const handleMouseLeave = () => {
      mousePosition = { x: undefined, y: undefined };
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // 初始化粒子
    initParticles();
    
    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{
          background: '#0a0f16',
          zIndex: -1
        }}
      />
      {/* 添加径向渐变效果 */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          background: 'radial-gradient(circle at center, rgba(60, 137, 232, 0.02) 0%, transparent 70%)',
          zIndex: -1
        }}
      />
      {/* 添加上下渐变遮罩 */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(10, 15, 22, 0.8) 0%, rgba(10, 15, 22, 0.2) 20%, rgba(10, 15, 22, 0.2) 80%, rgba(10, 15, 22, 0.8) 100%)',
          zIndex: -1
        }}
      />
    </>
  );
});



// 游戏卡片组件
const GameCard = memo(({ game, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef(null);

  // 处理视频预加载
  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isHovered]);

  // 处理卡片停用状态的样式
  const isDisabled = game.status === 'disabled';
  const cardOpacity = isDisabled ? 'opacity-60' : 'opacity-100';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`group relative rounded-2xl overflow-hidden bg-[#141c28]/80 border border-[#1b2736]
                 hover:border-[#3c89e8]/30 transition-all duration-300
                 hover:shadow-2xl hover:shadow-[#3c89e8]/10 ${cardOpacity}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 图片/视频容器 */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* 主图片 */}
        <motion.img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover"
          animate={{
            scale: isHovered ? 1.1 : 1,
            filter: isHovered ? 'brightness(0.3) blur(2px)' : 'brightness(1)'
          }}
          transition={{ duration: 0.4 }}
          onLoad={() => setIsImageLoaded(true)}
        />

        {/* 图片加载骨架屏 */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-[#141c28] animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-[#141c28] via-[#1b2736] to-[#141c28] 
                          animate-shimmer" />
          </div>
        )}

        {/* 标签容器 */}
        <AnimatePresence>
          {!isHovered && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 inset-x-0 p-6 flex flex-col gap-4 z-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* 游戏状态标签 */}
                  {game.status && <StatusTag status={game.status} />}
                  
                  {/* 营销标签 */}
                  <MarketingTag sectionId={game.sectionId} />

                  {/* 评分标签 */}
                  {game.rating && (
                    <div className="flex items-center gap-2 bg-[#0a0f16]/90 backdrop-blur-sm 
                                  rounded-full px-4 py-2">
                      <Star className="w-5 h-5 text-[#3c89e8] fill-current" />
                      <span className="text-lg font-medium text-[#e6e7e8]">{game.rating}</span>
                    </div>
                  )}
                </div>
                
                {/* 折扣标签 */}
                {game.discount > 0 && (
                  <div className="flex items-center bg-[#3c89e8] text-white font-bold 
                                rounded-full px-4 py-2 text-lg">
                    -{game.discount}%
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 视频预览 */}
        <AnimatePresence>
          {isHovered && game.videos?.[0]?.url && !isDisabled && (
            <motion.video
              ref={videoRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full object-cover"
              src={game.videos[0].url}
              muted
              loop
              playsInline
            />
          )}
        </AnimatePresence>

        {/* 悬停内容层 */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-[#0a0f16]/90 to-[#0a0f16]/80"
            >
              {/* 悬停时的内容 */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* 游戏标题 */}
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-[#e6e7e8]"
                  >
                    {game.title}
                  </motion.h3>
                  
                  {/* 游戏描述 */}
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-base leading-relaxed text-[#8f98a0] line-clamp-2"
                  >
                    {game.description}
                  </motion.p>

                  {/* 游戏标签 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-3"
                  >
                    {game.tags.map(tag => (
                      <span 
                        key={tag.id}
                        className="px-4 py-2 text-sm font-medium text-[#3c89e8] 
                                 rounded-full bg-[#1b2736]/80 backdrop-blur-sm
                                 hover:bg-[#3c89e8] hover:text-white transition-colors"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </motion.div>
                </div>

                {/* 底部操作按钮组 */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => !isDisabled && setIsLiked(!isLiked)}
                      className={`flex items-center gap-2 text-[#8f98a0] 
                               hover:text-[#3c89e8] transition-colors
                               ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          isLiked ? 'fill-[#3c89e8] text-[#3c89e8]' : ''
                        }`} 
                      />
                      <span>收藏</span>
                    </button>
                    
                    <button 
                      className={`flex items-center gap-2 text-[#8f98a0] 
                               hover:text-[#3c89e8] transition-colors
                               ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Share2 className="w-5 h-5" />
                      <span>分享</span>
                    </button>
                  </div>

                  {game.videos?.length > 0 && !isDisabled && (
                    <motion.button 
                      className="flex items-center gap-2 px-4 py-2 rounded-full
                                bg-[#3c89e8]/10 backdrop-blur-sm border border-[#3c89e8]/20
                                text-[#3c89e8] font-medium
                                hover:bg-[#3c89e8] hover:text-white hover:border-transparent
                                transition-all duration-200 group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-5 h-5 group-hover:animate-pulse" />
                      <span className="text-sm">视频</span>
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 卡片底部信息 */}
      <div className="p-8 border-t border-[#1b2736]">
        {/* 游戏信息 */}
        <div className="flex items-start justify-between mb-8">
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-xl font-semibold text-[#e6e7e8] line-clamp-1">
          {game.title}
        </h3>
        {/* 状态标签放在标题旁边 */}
        {game.status && <StatusTag status={game.status} />}
        {/* 营销标签放在标题旁边 */}
        <MarketingTag sectionId={game.sectionId} />
      </div>
      <div className="text-base text-[#8f98a0]">{game.developer}</div>
    </div>
    <div className="text-right">
      {game.discount > 0 && (
        <div className="text-base text-[#8f98a0] line-through mb-2">
          ¥{game.originalPrice.toFixed(2)}
        </div>
      )}
      <div className="text-2xl font-bold text-[#3c89e8]">
        ¥{game.currentPrice.toFixed(2)}
      </div>
    </div>
  </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <motion.button 
            className={`flex-1 py-4 px-6 bg-gradient-to-r
                       ${isDisabled 
                         ? 'from-gray-400 to-gray-500 cursor-not-allowed' 
                         : 'from-[#3c89e8] to-[#1b5eb8] hover:shadow-[#3c89e8]/20'}
                       text-white rounded-xl font-medium text-lg
                       shadow-lg shadow-[#3c89e8]/10 transition-all duration-300 
                       group/btn`}
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            disabled={isDisabled}
          >
            <span className="group-hover/btn:translate-x-0.5 transition-transform inline-block">
              {isDisabled ? '暂时无法购买' : '立即购买'}
            </span>
          </motion.button>

          <Tooltip content="了解更多">
            <motion.button
              className={`p-4 bg-[#1b2736] rounded-xl transition-colors duration-300
                         ${isDisabled 
                           ? 'text-gray-500 cursor-not-allowed' 
                           : 'text-[#3c89e8] hover:bg-[#3c89e8] hover:text-white'}`}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              disabled={isDisabled}
            >
              <Info className="w-6 h-6" />
            </motion.button>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
});



// 营销标签组件
const MarketingTag = ({ sectionId }) => {
  // 直接使用 GAME_FILTERS 查找对应的标签名称
  const filter = GAME_FILTERS.find(f => f.id === sectionId);
  if (!filter || sectionId === 'all') return null;

  // 为不同类型设置不同的颜色
  const getTagStyle = (id) => {
    switch(id) {
      case 'new-releases':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'specials':
        return 'text-red-500 bg-red-500/10';
      case 'top-sellers':
        return 'text-orange-500 bg-orange-500/10';
      case 'upcoming':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                     ${getTagStyle(sectionId)}`}>
      {filter.name}
    </span>
  );
};


// 状态标签组件
const StatusTag = ({ status, gameStatus = GAME_STATUS }) => {
  const statusConfig = gameStatus[status.toUpperCase()];
  if (!statusConfig) return null;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                     ${statusConfig.bgColor} ${statusConfig.color}`}>
      {statusConfig.label}
    </span>
  );
};


// 主展示组件
const GameShowcase = memo(() => {  // 使用 memo 包裹组件
  // 添加详细的日志追踪
  useEffect(() => {
    console.log('GameShowcase mounted', {
      time: new Date().toISOString(),
      reason: 'Initial mount'
    });
    return () => {
      console.log('GameShowcase unmounted', {
        time: new Date().toISOString(),
        reason: 'Cleanup'
      });
    };
  }, []);




  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // 优化过滤逻辑 - 保持现有实现
  const filteredGames = useMemo(() => {
    if (!Array.isArray(MOCK_GAMES)) return [];
    
    return MOCK_GAMES.filter(game => {
      const matchesSearch = !searchQuery || 
                          game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = selectedFilter === 'all' || game.sectionId === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

  // 处理搜索变化的回调函数
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // 处理过滤器变化的回调函数
  const handleFilterChange = useCallback((filterId) => {
    setSelectedFilter(filterId);
  }, []);

  return (
    <section className="relative py-1 min-h-screen overflow-hidden">
      <DynamicBackground />
      
      <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <ShowcaseHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
        />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <div 
                  key={`skeleton-${i}`}
                  className="rounded-xl overflow-hidden bg-[#141c28]/80 border border-[#1b2736]"
                >
                  <div className="aspect-[16/9] bg-[#1b2736] animate-pulse" />
                  <div className="p-4 space-y-4">
                    <div className="h-4 bg-[#1b2736] rounded animate-pulse" />
                    <div className="h-4 bg-[#1b2736] rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredGames.length > 0 ? (
                filteredGames.map((game) => (
                  <GameCard key={`game-${game.id}`} game={game} index={game.id} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[#4d5969]"
                  >
                    <Search className="w-16 h-16 mb-4 mx-auto" />
                    <h3 className="text-xl font-medium mb-2">未找到相关游戏</h3>
                    <p>试试其他关键词或浏览全部游戏</p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredGames.length > 0 && !isLoading && (
          <div className="mt-16 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[#4d5969]"
            >
              <div className="w-2 h-2 bg-[#3c89e8] rounded-full animate-ping" />
              <span className="text-sm">更多菜单接入中...</span>
            </motion.div>
          </div>
        )}

        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-4 rounded-full bg-[#1b2736]/80 
                     backdrop-blur-sm text-[#3c89e8] shadow-lg
                     hover:bg-[#3c89e8] hover:text-white
                     transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronDown className="w-6 h-6 rotate-180" />
        </motion.button>
      </div>
    </section>
  );
});



GameShowcase.displayName = 'GameShowcase';

// 确保导出组件
export default GameShowcase;



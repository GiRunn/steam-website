// src/pages/home/components/BrandShowcase/index.jsx
import React, { memo, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import './styles.css';

const DynamicBackground = memo(() => (
  <div className="dynamic-background">
    <div className="particle-field">
      {Array(20).fill().map((_, i) => (
        <div key={i} className="particle" />
      ))}
    </div>
    <div className="glow-lines">
      {Array(3).fill().map((_, i) => (
        <div key={i} className="glow-line" />
      ))}
    </div>
  </div>
));

const SectionTitle = memo(({ title }) => (
  <div className="title-container">
    <h2 className="animated-title">{title}</h2>
    <div className="title-decoration">
      <div className="title-line left" />
      <div className="title-icon" />
      <div className="title-line right" />
    </div>
  </div>
));

const BrandCard = memo(({ brand, index, isDragging, onCardInteraction }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);
  const moveCountRef = useRef(0);
  const touchStartRef = useRef(null);

  const handleClick = useCallback((e) => {
    // 防止事件冒泡到父容器
    e.stopPropagation();
    
    // 如果是拖动，则不触发翻转
    if (moveCountRef.current > 2) {
      moveCountRef.current = 0;
      return;
    }

    setIsFlipped(prev => !prev);
    onCardInteraction(!isFlipped);
  }, [isFlipped, onCardInteraction]);

  // 处理触摸开始事件
  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  // 处理触摸结束事件
  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const touchDiff = Math.abs(touchEnd - touchStartRef.current);
    
    // 如果移动距离小，视为点击
    if (touchDiff < 10) {
      handleClick(e);
    }
    touchStartRef.current = null;
  }, [handleClick]);

  useEffect(() => {
    if (isDragging) {
      moveCountRef.current += 1;
    } else {
      moveCountRef.current = 0;
    }
  }, [isDragging]);

  return (
    <div 
      ref={cardRef}
      className="brand-card-container"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`brand-card ${isFlipped ? 'flipped' : ''}`}>
        <div className="card-inner">
          <div className="card-front">
            <img
              src={brand.image}
              alt={brand.name}
              className="brand-image"
              draggable="false"
            />
            <div className="brand-info">
              <h3 className="brand-name">{brand.name}</h3>
            </div>
          </div>
          <div className="card-back">
            <div className="card-content">
              <h3 className="brand-name-back">{brand.name}</h3>
              <p className="brand-description">{brand.description}</p>
              <div className="interaction-hints">
                <span className="pulse-dot" />
                <span className="hint-text">点击返回</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});


const BrandShowcase = memo(({ brandLogos }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const trackRef = useRef(null);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const autoScrollRef = useRef(null);
  const dragStartTime = useRef(0);
  const dragDistance = useRef(0);
  const lastScrollPos = useRef(0);
  const scrollSpeed = 0.8; // 降低默认滚动速度

  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
    }

    const scroll = () => {
      if (!isDragging && trackRef.current) {
        const container = trackRef.current;
        const currentScroll = container.scrollLeft;
        
        // 检查是否有活动卡片
        if (activeCardIndex !== null) {
          // 如果有活动卡片，暂停自动滚动
          lastScrollPos.current = currentScroll;
        } else {
          // 正常滚动
          container.scrollLeft += scrollSpeed;
          
          // 处理循环滚动
          if (currentScroll >= container.scrollWidth - container.clientWidth - 1) {
            container.scrollLeft = 0;
          }
        }
        
        autoScrollRef.current = requestAnimationFrame(scroll);
      }
    };

    autoScrollRef.current = requestAnimationFrame(scroll);
  }, [isDragging, activeCardIndex, scrollSpeed]);

  // 处理卡片交互
  const handleCardInteraction = useCallback((isFlipped) => {
    // 当卡片被点击时，暂时减慢滚动速度而不是完全停止
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
    }
    startAutoScroll();
  }, [startAutoScroll]);

  // 鼠标按下事件处理
  const handleMouseDown = useCallback((e) => {
    // 如果点击的是卡片内部，不启动拖动
    if (e.target.closest('.brand-card')) {
      return;
    }

    if (e.button !== 0) return;
    
    setIsDragging(true);
    setShowScrollHint(false);
    dragStartTime.current = Date.now();
    startX.current = e.pageX;
    scrollLeft.current = trackRef.current.scrollLeft;
    dragDistance.current = 0;

    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
    }
  }, []);

  // 优化的鼠标移动处理
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX.current) * 1.5;
    dragDistance.current = Math.abs(walk);
    
    if (trackRef.current) {
      trackRef.current.scrollLeft = scrollLeft.current - walk;
    }
  }, [isDragging]);

  // 优化的鼠标抬起处理
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const dragDuration = Date.now() - dragStartTime.current;

    // 仅在拖动距离大于阈值时才视为拖动
    if (dragDistance.current > 10 || dragDuration > 200) {
      setTimeout(startAutoScroll, 50);
    }
  }, [isDragging, startAutoScroll]);

  // 鼠标进入容器
  const handleMouseEnter = useCallback(() => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
    }
    // 减慢滚动速度而不是停止
    const slowScroll = () => {
      if (trackRef.current && !isDragging) {
        trackRef.current.scrollLeft += scrollSpeed * 0.3;
        autoScrollRef.current = requestAnimationFrame(slowScroll);
      }
    };
    autoScrollRef.current = requestAnimationFrame(slowScroll);
  }, [isDragging, scrollSpeed]);

  // 鼠标离开容器
  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      startAutoScroll();
    }
  }, [isDragging, startAutoScroll]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [startAutoScroll]);

  // 事件监听
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const extendedLogos = useMemo(() => {
    return [...brandLogos, ...brandLogos, ...brandLogos];
  }, [brandLogos]);

  return (
    <section className="brand-showcase-section">
      <DynamicBackground />
      <SectionTitle title="合作伙伴" />
      <div className="showcase-container">
        {showScrollHint && (
          <div className="scroll-hint">
            <span>← 拖动或点击查看详情 →</span>
          </div>
        )}
        <div 
          ref={trackRef}
          className={`showcase-track ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {extendedLogos.map((brand, index) => (
            <BrandCard 
              key={`${brand.id}-${index}`}
              brand={brand}
              index={index}
              isDragging={isDragging}
              onCardInteraction={handleCardInteraction}
            />
          ))}
        </div>
      </div>
    </section>
  );
});


BrandShowcase.propTypes = {
  brandLogos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired
};

SectionTitle.propTypes = {
  title: PropTypes.string.isRequired
};

BrandCard.propTypes = {
  brand: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired
};

export default BrandShowcase;
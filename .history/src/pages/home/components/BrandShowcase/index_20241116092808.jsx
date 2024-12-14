// src/pages/home/components/BrandShowcase/index.jsx
import React, { memo, useEffect, useState, useCallback, useRef } from 'react';
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

const BrandCard = memo(({ brand, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = (e) => {
    if (!e.target.closest('.brand-card')) return;
    setIsFlipped(!isFlipped);
    e.stopPropagation();
  };

  return (
    <div className="brand-card-container">
      <div 
        className={`brand-card ${isFlipped ? 'flipped' : ''}`}
        onClick={handleClick}
      >
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
  const trackRef = useRef(null);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const animationRef = useRef(null);
  const velocity = useRef(0);
  const lastMouseX = useRef(0);
  const lastTimestamp = useRef(0);

  // 创建循环列表
  const createInfiniteItems = useCallback(() => {
    // 复制3份以确保滚动的连续性
    return [...brandLogos, ...brandLogos, ...brandLogos].map((brand, index) => ({
      ...brand,
      uniqueId: `${brand.id}-${index}`
    }));
  }, [brandLogos]);

  const [items, setItems] = useState(createInfiniteItems());

  // 处理无限滚动
  const handleScroll = useCallback(() => {
    if (!trackRef.current) return;
    
    const track = trackRef.current;
    const itemWidth = track.children[0].offsetWidth;
    const totalWidth = itemWidth * brandLogos.length;
    
    if (track.scrollLeft >= totalWidth * 2) {
      track.scrollLeft -= totalWidth;
    } else if (track.scrollLeft <= totalWidth) {
      track.scrollLeft += totalWidth;
    }
  }, [brandLogos.length]);

  // 自动滚动动画
  const autoScroll = useCallback(() => {
    if (!isDragging && trackRef.current) {
      if (Math.abs(velocity.current) > 0.1) {
        trackRef.current.scrollLeft += velocity.current;
        velocity.current *= 0.95; // 减速
      }
      handleScroll();
    }
    animationRef.current = requestAnimationFrame(autoScroll);
  }, [isDragging, handleScroll]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(autoScroll);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoScroll]);

  // 鼠标事件处理
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setShowScrollHint(false);
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
    lastMouseX.current = e.pageX;
    lastTimestamp.current = Date.now();
    velocity.current = 0;
    
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grabbing';
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();

    const currentX = e.pageX;
    const currentTime = Date.now();
    const dx = currentX - lastMouseX.current;
    const dt = currentTime - lastTimestamp.current;
    
    if (dt > 0) {
      velocity.current = dx * 0.8; // 调整这个系数可以改变惯性强度
    }

    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current);
    trackRef.current.scrollLeft = scrollLeft.current - walk;

    lastMouseX.current = currentX;
    lastTimestamp.current = currentTime;

    handleScroll();
  }, [isDragging, handleScroll]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grab';
    }
  }, []);

  // 防止文本选择
  const preventDefault = useCallback((e) => {
    if (isDragging) {
      e.preventDefault();
    }
  }, [isDragging]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectstart', preventDefault);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectstart', preventDefault);
    };
  }, [handleMouseMove, handleMouseUp, preventDefault]);

  return (
    <section className="brand-showcase-section">
      <DynamicBackground />
      <SectionTitle title="合作伙伴" />
      <div className="showcase-container">
        {showScrollHint && (
          <div className="scroll-hint">
            <span>← 拖动查看更多 →</span>
          </div>
        )}
        <div 
          ref={trackRef}
          className={`showcase-track ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        >
          {items.map((brand) => (
            <BrandCard 
              key={brand.uniqueId}
              brand={brand}
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
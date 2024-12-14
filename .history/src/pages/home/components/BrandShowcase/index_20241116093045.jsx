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

const BrandCard = memo(({ brand, index, isDragging }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const clickTimeoutRef = useRef(null);
  const moveCountRef = useRef(0);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (moveCountRef.current < 3) { // 如果移动次数少于3次，认为是点击
      setIsFlipped(!isFlipped);
    }
    moveCountRef.current = 0;
  }, [isFlipped]);

  useEffect(() => {
    if (isDragging) {
      moveCountRef.current += 1;
    }
  }, [isDragging]);

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
  const autoScrollRef = useRef(null);
  const dragStartTime = useRef(0);
  const dragDistance = useRef(0);

  // 自动滚动
  const startAutoScroll = useCallback(() => {
    if (isDragging || !trackRef.current) return;

    const scroll = () => {
      if (!isDragging && trackRef.current) {
        trackRef.current.scrollLeft += 1;
        
        // 处理循环滚动
        if (trackRef.current.scrollLeft >= trackRef.current.scrollWidth / 2) {
          trackRef.current.scrollLeft = 0;
        }
      }
      autoScrollRef.current = requestAnimationFrame(scroll);
    };

    autoScrollRef.current = requestAnimationFrame(scroll);
  }, [isDragging]);

  // 初始化自动滚动
  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [startAutoScroll]);

  const handleMouseDown = useCallback((e) => {
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

  const handleMouseUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const dragDuration = Date.now() - dragStartTime.current;

    // 如果拖动时间短且距离小，视为点击
    if (dragDuration < 200 && dragDistance.current < 10) {
      const clickTarget = e.target.closest('.brand-card');
      if (clickTarget) {
        clickTarget.click();
      }
    }

    setTimeout(() => {
      startAutoScroll();
    }, 50);
  }, [isDragging, startAutoScroll]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // 创建循环数组
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
        >
          {extendedLogos.map((brand, index) => (
            <BrandCard 
              key={`${brand.id}-${index}`}
              brand={brand}
              index={index}
              isDragging={isDragging}
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
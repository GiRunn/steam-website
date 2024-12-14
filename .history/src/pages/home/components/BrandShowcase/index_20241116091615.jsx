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

const BrandCard = memo(({ brand, index }) => (
  <div className="brand-card-container">
    <div className="brand-card">
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
              <span className="hint-text">了解更多</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

const BrandShowcase = memo(({ brandLogos }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const trackRef = useRef(null);
  const scrollPos = useRef(0);

  // 自动滚动
  useEffect(() => {
    const track = trackRef.current;
    let animationFrameId;
    let speed = 1; // 滚动速度

    const scroll = () => {
      if (!isDragging && track) {
        scrollPos.current += speed;
        if (scrollPos.current >= track.scrollWidth - track.clientWidth) {
          scrollPos.current = 0;
        }
        track.scrollLeft = scrollPos.current;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging]);

  // 鼠标事件处理
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // 只响应左键
    setIsDragging(true);
    setShowScrollHint(false);
    trackRef.current.style.cursor = 'grabbing';
    scrollPos.current = trackRef.current.scrollLeft;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.movementX;
    if (trackRef.current) {
      scrollPos.current -= dx;
      trackRef.current.scrollLeft = scrollPos.current;
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grab';
    }
  }, []);

  // 停止选择
  const preventDefault = useCallback((e) => {
    if (isDragging) {
      e.preventDefault();
    }
  }, [isDragging]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('selectstart', preventDefault);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('selectstart', preventDefault);
    };
  }, [handleMouseUp, handleMouseMove, preventDefault]);

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
          {brandLogos.concat(brandLogos).map((brand, index) => (
            <BrandCard 
              key={`${brand.id}-${index}`}
              brand={brand}
              index={index}
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
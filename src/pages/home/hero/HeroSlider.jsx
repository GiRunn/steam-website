import React, { useState, useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './styles.css';

/**
 * 轮播控制按钮组件
 */
const SliderControls = memo(({ onPrev, onNext }) => (
  <>
    <button
      className="slider-control left-4" 
      onClick={onPrev}
      aria-label="上一张"
    >
      <ChevronLeft className="h-6 w-6" />
    </button>
    <button
      className="slider-control right-4"
      onClick={onNext}
      aria-label="下一张"
    >
      <ChevronRight className="h-6 w-6" />
    </button>
  </>
));

/**
 * 主轮播图组件
 * @param {Object} props
 * @param {Array} props.slides - 轮播图片数据
 * @param {number} props.currentSlide - 当前显示的图片索引
 * @param {Function} props.setCurrentSlide - 设置当前图片的函数
 */
const HeroSlider = memo(({ slides, currentSlide, setCurrentSlide }) => {
  // 状态管理
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);
  const touchStartX = useRef(0);
  
  // 自动播放控制
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, slides.length, setCurrentSlide]);

  // 触摸事件处理
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlaying(false);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      } else {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      }
    }
    setIsAutoPlaying(true);
  };

  return (
    <div 
      className="hero-slider"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="slider-track"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="slide-image"
            />
            <div className={`slide-content ${index === currentSlide ? 'active' : ''}`}>
              <h2 className="slide-title">{slide.title}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="slider-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`切换到第${index + 1}张图片`}
          />
        ))}
      </div>

      <SliderControls
        onPrev={() => {
          setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
          setIsAutoPlaying(false);
        }}
        onNext={() => {
          setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
          setIsAutoPlaying(false);
        }}
      />
    </div>
  );
});

// PropTypes类型检查
HeroSlider.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired
    })
  ).isRequired,
  currentSlide: PropTypes.number.isRequired,
  setCurrentSlide: PropTypes.func.isRequired
};

SliderControls.propTypes = {
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
};

export default HeroSlider;
import React from 'react';
import './styles.css';

const FEATURES = [
  {
    icon: '🎮',
    title: '沉浸体验',
    description: '身临其境的游戏世界'
  },
  {
    icon: '🌍',
    title: '开放世界',
    description: '自由探索的广阔天地'
  },
  {
    icon: '⚔️',
    title: '精彩战斗',
    description: '紧张刺激的战斗系统'
  },
  {
    icon: '🎨',
    title: '精美画面',
    description: '震撼人心的视觉效果'
  }
];

const ProductFeatures = () => {
  return (
    <div className="features-section">
      <div className="background-effects">
        <div className="bg-overlay"/>
        <div className="bg-particles">
          <div className="particle blue"/>
          <div className="particle purple"/>
        </div>
        <div className="bg-blur"/>
      </div>

      <div className="content-container">
        <div className="features-content">
          <div className="section-header">
            <h2 className="title">产品特性</h2>
            <p className="subtitle">
              探索游戏的无限可能，体验前所未有的游戏世界
            </p>
            <div className="title-underline"/>
          </div>

          <div className="main-feature">
            <div className="feature-image-container">
              <img 
                src="https://picsum.photos/1920/820" 
                alt="Feature Highlight"
                className="feature-image"
              />
              <div className="image-overlay"/>
              <div className="feature-description">
                <h3 className="feature-title">震撼视觉体验</h3>
                <p className="feature-text">
                  采用最新渲染技术，带来极致逼真的画面表现，让您沉浸在精心打造的游戏世界中。
                </p>
              </div>
            </div>
          </div>

          <div className="features-grid">
            {FEATURES.map(feature => (
              <div key={feature.title} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-name">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFeatures;
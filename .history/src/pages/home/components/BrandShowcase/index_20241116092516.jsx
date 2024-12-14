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
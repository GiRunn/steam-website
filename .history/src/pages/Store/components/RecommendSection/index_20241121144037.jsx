import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './styles.css';

const RecommendSection = ({ games }) => {
  return (
    <section className="recommend-section">
      <div className="section-header">
        <h2 className="gradient-text">猜你喜欢</h2>
        <Link to="/recommendations" className="view-all">
          查看更多
        </Link>
      </div>

      <div className="recommendations-grid">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="recommend-card group"
          >
            <Link to={`/game/${game.id}`}>
              <div className="card-image-container">
                <img
                  src={game.image}
                  alt={game.title}
                  className="card-image"
                />
                <div className="image-overlay">
                  <div className="overlay-content">
                    <h4 className="game-title">{game.title}</h4>
                    <p className="game-description">
                      {game.description}
                    </p>
                    <div className="rating">
                      <span className="rating-value">
                        {game.rating}
                      </span>
                      <span className="rating-label">
                        用户评分
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RecommendSection;
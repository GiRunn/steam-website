import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import './styles.css';

const GameSection = ({ games, currentPage, itemsPerPage }) => {
  // 计算当前页面显示的游戏
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleGames = games.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="game-section">
      <AnimatePresence mode="wait">
        <div className="games-grid">
          {visibleGames.map((game, index) => (
            <Link 
              to={`/game/${game.id}`}
              key={game.id}
              className="game-card-link"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="game-card group"
              >
                {/* 游戏封面 */}
                <div className="card-image-container">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="card-image"
                  />
                  {game.discount > 0 && (
                    <div className="discount-badge">
                      -{game.discount}%
                    </div>
                  )}
                  <div className="image-overlay" />
                </div>

                {/* 游戏信息 */}
                <div className="card-content">
                  <div className="card-header">
                    <h3 className="game-title">{game.title}</h3>
                    <div className="rating">
                      <Star className="star-icon" />
                      <span>{game.rating}</span>
                    </div>
                  </div>

                  {/* 标签 */}
                  <div className="tags-container">
                    {game.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 价格和操作 */}
                  <div className="card-footer">
                    <div className="price-container">
                      {game.discount > 0 ? (
                        <>
                          <span className="original-price">
                            ¥{game.originalPrice}
                          </span>
                          <span className="discounted-price">
                            ¥{game.price}
                          </span>
                        </>
                      ) : (
                        <span className="regular-price">
                          ¥{game.price}
                        </span>
                      )}
                    </div>

                    <div className="actions">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="wishlist-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          // 收藏逻辑
                        }}
                      >
                        <Heart className="heart-icon" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="buy-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          // 购买逻辑
                        }}
                      >
                        购买
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default GameSection;
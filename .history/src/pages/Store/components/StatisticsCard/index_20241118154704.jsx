import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Gamepad,
  Download,
  Trophy
} from 'lucide-react';
import './styles.css';

const ICON_MAP = {
  Users,
  Gamepad,
  Download,
  Trophy
};

const StatisticsCard = ({ statistics }) => {
  return (
    <div className="statistics-section">
      <div className="stats-grid">
        {statistics.map((stat, index) => {
          const Icon = ICON_MAP[stat.icon];
          
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
            >
              <div className="stat-content">
                <div className="icon-container">
                  <Icon className="stat-icon" />
                </div>
                <div className="stat-info">
                  <h4 className="stat-label">{stat.label}</h4>
                  <div className="stat-values">
                    <span className="stat-value">{stat.value}</span>
                    <span className={`stat-change ${
                      stat.trend === 'up' ? 'positive' : 'negative'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StatisticsCard;
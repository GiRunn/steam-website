import React from 'react';
import { motion } from 'framer-motion';
import { OptimizationSuggestion } from '../../../types';
import './styles.css';

interface OptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
}

const OptimizationSuggestions: React.FC<OptimizationSuggestionsProps> = ({ suggestions }) => {
  return (
    <motion.div 
      className="optimization-suggestions glass-effect"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="section-title">优化建议</h3>
      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <motion.div 
            key={index}
            className={`suggestion-card ${suggestion.impact}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="suggestion-header">
              <span className={`impact-badge ${suggestion.impact}`}>
                {suggestion.impact === 'high' ? '高优先级' :
                 suggestion.impact === 'medium' ? '中优先级' : '低优先级'}
              </span>
              <span className="suggestion-type">{suggestion.type}</span>
            </div>
            
            <p className="suggestion-description">{suggestion.description}</p>
            
            <div className="suggestion-recommendation">
              <h4>建议操作:</h4>
              <p>{suggestion.recommendation}</p>
            </div>
            
            <motion.button 
              className="action-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              查看详情
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default OptimizationSuggestions; 
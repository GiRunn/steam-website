import React from 'react';
import { motion } from 'framer-motion';

interface OptimizationSuggestion {
  id: string;
  type: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface OptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
}

const OptimizationSuggestions: React.FC<OptimizationSuggestionsProps> = ({ suggestions }) => {
  return (
    <div className="optimization-suggestions">
      <h2>优化建议</h2>
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            className={`suggestion-item ${suggestion.impact}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="suggestion-header">
              <span className="suggestion-type">{suggestion.type}</span>
              <span className={`impact-badge ${suggestion.impact}`}>
                {suggestion.impact}
              </span>
            </div>
            <p className="suggestion-description">{suggestion.description}</p>
            <div className="suggestion-recommendation">
              <strong>建议：</strong>
              {suggestion.recommendation}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OptimizationSuggestions; 
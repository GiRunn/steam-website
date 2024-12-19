import React from 'react';
import './OptimizationSuggestions.css';

const OptimizationSuggestions: React.FC<{ suggestions: any[] }> = ({ suggestions }) => {
    return (
        <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                    <h4>慢查询 #{index + 1}</h4>
                    <p>{suggestion.query}</p>
                </div>
            ))}
        </div>
    );
};

export default OptimizationSuggestions; 
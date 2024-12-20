import React from 'react';
import './styles.css';

interface StatisticProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  precision?: number;
}

const Statistic: React.FC<StatisticProps> = ({ 
  title, 
  value, 
  prefix,
  precision 
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'number' && precision !== undefined) {
      return val.toFixed(precision);
    }
    return val;
  };

  return (
    <div className="statistic">
      <div className="statistic-title">{title}</div>
      <div className="statistic-content">
        {prefix && <span className="statistic-prefix">{prefix}</span>}
        <span className="statistic-value">{formatValue(value)}</span>
      </div>
    </div>
  );
};

export default Statistic; 
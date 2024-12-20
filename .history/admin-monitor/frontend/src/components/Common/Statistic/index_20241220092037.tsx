import React from 'react';
import './Statistic.css';

interface StatisticProps {
  title: React.ReactNode;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  precision?: number;
  loading?: boolean;
  className?: string;
}

const Statistic: React.FC<StatisticProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision,
  loading = false,
  className = '',
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'number' && precision !== undefined) {
      return val.toFixed(precision);
    }
    return val;
  };

  return (
    <div className={`statistic ${className}`}>
      <div className="statistic-title">{title}</div>
      <div className="statistic-content">
        {loading ? (
          <div className="statistic-loading">Loading...</div>
        ) : (
          <>
            {prefix && <span className="statistic-prefix">{prefix}</span>}
            <span className="statistic-value">{formatValue(value)}</span>
            {suffix && <span className="statistic-suffix">{suffix}</span>}
          </>
        )}
      </div>
    </div>
  );
};

export default Statistic; 
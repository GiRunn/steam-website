import React from 'react';
import './styles.css';

interface StatisticProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  precision?: number;
  loading?: boolean;
}

const Statistic: React.FC<StatisticProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision,
  loading
}) => {
  const formatValue = () => {
    if (typeof value === 'number' && precision !== undefined) {
      return value.toFixed(precision);
    }
    return value;
  };

  return (
    <div className="statistic">
      <div className="statistic-title">{title}</div>
      <div className="statistic-content">
        {loading ? (
          <div className="statistic-loading">加载中...</div>
        ) : (
          <>
            {prefix && <span className="statistic-prefix">{prefix}</span>}
            <span className="statistic-value">{formatValue()}</span>
            {suffix && <span className="statistic-suffix">{suffix}</span>}
          </>
        )}
      </div>
    </div>
  );
};

export default Statistic; 
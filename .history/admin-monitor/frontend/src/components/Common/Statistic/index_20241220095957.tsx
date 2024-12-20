import React from 'react';
import { Statistic as AntStatistic } from 'antd';

interface StatisticProps {
  // 数值
  value: number | string;
  // 标题
  title: string;
  // 数值前缀
  prefix?: React.ReactNode;
  // 数值后缀
  suffix?: React.ReactNode;
  // 精确到小数点后几位
  precision?: number;
  // 是否显示千分位分隔符
  groupSeparator?: boolean;
  // 自定义数值样式
  valueStyle?: React.CSSProperties;
  // 自定义标题样式
  titleStyle?: React.CSSProperties;
}

/**
 * 统计数值组件
 * @description 用于展示某个带有标题的统计数值
 * @example
 * // 基础用法
 * <Statistic title="活跃用户" value={112893} />
 * 
 * // 带前缀的统计数值
 * <Statistic 
 *   title="账户余额" 
 *   value={112893} 
 *   prefix="¥"
 *   precision={2}
 * />
 * 
 * // 自定义样式
 * <Statistic
 *   title="增长率"
 *   value={11.28}
 *   precision={2}
 *   suffix="%"
 *   valueStyle={{ color: '#3f8600' }}
 * />
 */
const Statistic: React.FC<StatisticProps> = ({
  value,
  title,
  prefix,
  suffix,
  precision,
  groupSeparator = true,
  valueStyle,
  titleStyle,
}) => {
  return (
    <AntStatistic
      value={value}
      title={title}
      prefix={prefix}
      suffix={suffix}
      precision={precision}
      groupSeparator={groupSeparator}
      valueStyle={valueStyle}
      titleStyle={titleStyle}
    />
  );
};

export default Statistic; 
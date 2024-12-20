import React from 'react';
import { Progress as AntProgress } from 'antd';

interface ProgressProps {
  // 进度值,范围0-100
  percent: number;
  // 进度条尺寸,可选 'default' | 'small'
  size?: 'default' | 'small';
  // 是否显示进度数值
  showInfo?: boolean;
  // 进度条状态,'success' | 'exception' | 'normal' | 'active'
  status?: 'success' | 'exception' | 'normal' | 'active';
  // 进度条颜色
  strokeColor?: string;
  // 未完成分段的颜色
  trailColor?: string;
}

/**
 * 进度条组件
 * @description 用于展示操作进度、等待状态等场景
 * @example
 * // 基础用法
 * <Progress percent={30} />
 * 
 * // 小型进度条
 * <Progress percent={50} size="small" />
 * 
 * // 自定义颜色
 * <Progress percent={70} strokeColor="#1890ff" />
 */
const Progress: React.FC<ProgressProps> = ({
  percent,
  size = 'default',
  showInfo = true,
  status = 'normal',
  strokeColor,
  trailColor,
}) => {
  return (
    <AntProgress
      percent={percent}
      size={size}
      showInfo={showInfo}
      status={status}
      strokeColor={strokeColor}
      trailColor={trailColor}
    />
  );
};

export default Progress; 
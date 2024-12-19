import React from 'react';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip 
} from 'recharts';

interface MetricsChartProps {
    data: Array<{
        timestamp: string;
        value: number;
    }>;
    title: string;
    color: string;
    dataKey: string;
    timeRange: string;
    onTimeRangeChange: (range: string) => void;
}

const MetricsChart: React.FC<MetricsChartProps> = ({
    data = [],
    title,
    color,
    dataKey,
    timeRange,
    onTimeRangeChange
}) => {
    if (!data || data.length === 0) {
        return (
            <div 
                className="chart-card glass-effect"
                role="region"
                aria-label={`${title}图表`}
            >
                <div className="chart-header">
                    <h3>{title}</h3>
                </div>
                <div className="chart-container">
                    <div className="no-data">暂无数据</div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="chart-card glass-effect"
            role="region"
            aria-label={`${title}图表`}
        >
            <div className="chart-header">
                <h3 id={`chart-title-${dataKey}`}>{title}</h3>
                <div className="chart-controls" aria-labelledby={`chart-title-${dataKey}`}>
                    <select 
                        className="time-range"
                        value={timeRange}
                        onChange={(e) => onTimeRangeChange(e.target.value)}
                        aria-label="时间范围"
                        title="选择数据显示的时间范围"
                    >
                        <option value="1h">1小时</option>
                        <option value="24h">24小时</option>
                        <option value="7d">7天</option>
                    </select>
                </div>
            </div>
            <div 
                className="chart-container"
                role="img" 
                aria-label={`显示${title}的趋势图表`}
            >
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart 
                        data={data} 
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id={`gradient${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="rgba(255,255,255,0.1)" 
                            vertical={false}
                        />
                        <XAxis 
                            dataKey="timestamp" 
                            stroke="#8884d8" 
                            tick={{ fill: '#acb2b8' }}
                        />
                        <YAxis 
                            stroke="#8884d8" 
                            tick={{ fill: '#acb2b8' }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                background: 'rgba(42, 71, 94, 0.9)',
                                border: '1px solid #66c0f4',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#gradient${dataKey})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MetricsChart; 
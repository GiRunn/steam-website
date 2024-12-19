import React from 'react';
import { motion } from 'framer-motion';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip 
} from 'recharts';
import './styles.css';

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
    index: number;
}

const MetricsChart: React.FC<MetricsChartProps> = ({
    data,
    title,
    color,
    dataKey,
    timeRange,
    onTimeRangeChange,
    index
}) => {
    return (
        <motion.div 
            className="chart-card glass-effect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.01 }}
        >
            <motion.div 
                className="chart-header"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: index * 0.2 + 0.1 }}
            >
                <h3>{title}</h3>
                <motion.select 
                    className="time-range-select"
                    value={timeRange}
                    onChange={(e) => onTimeRangeChange(e.target.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <option value="1h">1小时</option>
                    <option value="24h">24小时</option>
                    <option value="7d">7天</option>
                </motion.select>
            </motion.div>
            
            <motion.div 
                className="chart-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.2 }}
            >
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data}>
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
                            stroke={color} 
                            tick={{ fill: '#acb2b8' }}
                        />
                        <YAxis 
                            stroke={color} 
                            tick={{ fill: '#acb2b8' }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                background: 'rgba(42, 71, 94, 0.9)',
                                border: `1px solid ${color}`,
                                borderRadius: '8px'
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
            </motion.div>
        </motion.div>
    );
};

export default MetricsChart; 
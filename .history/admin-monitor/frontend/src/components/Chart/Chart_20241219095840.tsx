import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import './Chart.css';

const Chart: React.FC<{ data: any[]; title: string; color: string }> = ({ data, title, color }) => {
    return (
        <div className="chart-card glass-effect">
            <h3>{title}</h3>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill="url(#gradient)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Chart; 
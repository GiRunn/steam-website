const renderChart = (data: any[], title: string, dataKey: string, color: string, timeRange: string) => (
    <motion.div 
        className="chart-card glass-effect"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
    >
        <div className="chart-header">
            <h3>{title}</h3>
            <div className="chart-controls">
                <select 
                    className="time-range"
                    value={timeRange}
                    onChange={(e) => handleTimeRangeChange(dataKey, e.target.value)}
                >
                    <option value="1h">1小时</option>
                    <option value="24h">24小时</option>
                    <option value="7d">7天</option>
                </select>
            </div>
        </div>
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    {/* ... 其他图表配置 ... */}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </motion.div>
); 
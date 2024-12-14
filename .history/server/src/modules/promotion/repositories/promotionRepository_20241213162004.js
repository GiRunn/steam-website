const query = `
    SELECT 
        p.banner_url,
        p.name,
        p.start_time,
        p.min_purchase,
        p.status  -- 添加状态输出用于调试
    FROM promotions p
    WHERE p.status IN ('active', 'scheduled')  -- 使用IN语句
        AND p.start_time <= CURRENT_TIMESTAMP
        AND (p.end_time IS NULL OR p.end_time > CURRENT_TIMESTAMP)
    ORDER BY 
        p.priority DESC,
        p.created_at DESC
    LIMIT 2;
`;

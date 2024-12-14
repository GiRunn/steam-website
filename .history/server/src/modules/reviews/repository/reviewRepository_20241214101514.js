class ReviewRepository {
    // 查询游戏的所有评论
    async findByGameId(gameId) {
        const result = await db.query(
            `SELECT * FROM review_system.reviews_partitioned 
             WHERE game_id = $1 
             ORDER BY created_at DESC`,
            [gameId]
        );
        return result.rows;
    }

    // 查询特定月份的评论
    async findByGameIdAndMonth(gameId, year, month) {
        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month + 1}-01`;
        
        const result = await db.query(
            `SELECT * FROM review_system.reviews_partitioned 
             WHERE game_id = $1 
             AND created_at >= $2 
             AND created_at < $3
             ORDER BY created_at DESC`,
            [gameId, startDate, endDate]
        );
        return result.rows;
    }

    // 查询最近的评论
    async findRecent(limit = 10) {
        const result = await db.query(
            `SELECT * FROM review_system.reviews_partitioned 
             ORDER BY created_at DESC 
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    }

    // 按评分查询
    async findByRating(gameId, minRating) {
        const result = await db.query(
            `SELECT * FROM review_system.reviews_partitioned 
             WHERE game_id = $1 
             AND rating >= $2
             ORDER BY created_at DESC`,
            [gameId, minRating]
        );
        return result.rows;
    }
} 
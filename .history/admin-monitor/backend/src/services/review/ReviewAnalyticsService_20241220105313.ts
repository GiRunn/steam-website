import BaseService from '../base/BaseService';

export default class ReviewAnalyticsService extends BaseService {
    async getReviewSystemStats() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                WITH daily_stats AS (
                    SELECT 
                        date_trunc('day', created_at) as date,
                        count(*) as count
                    FROM review_system.reviews_partitioned
                    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY date_trunc('day', created_at)
                )
                SELECT json_build_object(
                    'total_reviews', (SELECT count(*) FROM review_system.reviews_partitioned),
                    'reviews_today', (SELECT count(*) FROM review_system.reviews_partitioned WHERE created_at >= CURRENT_DATE),
                    'active_reviews', (SELECT count(*) FROM review_system.reviews_partitioned WHERE review_status = 'active'),
                    'deleted_reviews', (SELECT count(*) FROM review_system.reviews_partitioned WHERE deleted_at IS NOT NULL),
                    'average_rating', (SELECT avg(rating) FROM review_system.reviews_partitioned),
                    'total_replies', (SELECT count(*) FROM review_system.review_replies_partitioned),
                    'review_distribution', (SELECT json_agg(row_to_json(daily_stats)) FROM daily_stats)
                ) as stats
            `);
            return result.rows[0].stats;
        });
    }

    async getPartitionStatus() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                WITH partition_stats AS (
                    SELECT
                        schemaname,
                        relname,
                        seq_scan,
                        idx_scan,
                        n_live_tup,
                        n_dead_tup,
                        last_vacuum,
                        last_autovacuum
                    FROM pg_stat_user_tables
                    WHERE schemaname = 'review_system'
                ),
                analyzed_stats AS (
                    SELECT
                        relname as table_name,
                        CASE
                            WHEN n_dead_tup > n_live_tup * 0.2 THEN '建议执行VACUUM'
                            WHEN last_vacuum IS NULL AND last_autovacuum IS NULL THEN '建议配置自动VACUUM'
                            WHEN seq_scan > idx_scan AND n_live_tup > 1000 THEN '建议添加索引'
                            ELSE '性能正常'
                        END as optimization_suggestion,
                        n_live_tup as live_rows,
                        n_dead_tup as dead_rows,
                        last_vacuum,
                        last_autovacuum
                    FROM partition_stats
                )
                SELECT json_agg(
                    json_build_object(
                        'table_name', table_name,
                        'optimization_suggestion', optimization_suggestion,
                        'live_rows', live_rows,
                        'dead_rows', dead_rows,
                        'last_vacuum', last_vacuum,
                        'last_autovacuum', last_autovacuum
                    )
                ) as partitions
                FROM analyzed_stats;
            `);

            const partitions = result.rows[0]?.partitions || [];
            return {
                partitions,
                message: partitions.length > 0 ? 'success' : '暂无分区数据',
                total_partitions: partitions.length,
                needs_attention: partitions.filter((p: { optimization_suggestion: string; }) => p.optimization_suggestion !== '性能正常').length
            };
        });
    }
} 
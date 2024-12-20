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
                        nspname as schema_name,
                        relname as table_name,
                        pg_size_pretty(pg_total_relation_size(pg_class.oid)) as size,
                        pg_total_relation_size(pg_class.oid) as size_bytes,
                        pg_stat_get_live_tuples(pg_class.oid) as row_count,
                        pg_stat_get_dead_tuples(pg_class.oid) as dead_tuples,
                        CASE 
                            WHEN pg_stat_get_live_tuples(pg_class.oid) = 0 THEN 0
                            ELSE ROUND(100.0 * pg_stat_get_dead_tuples(pg_class.oid) / 
                                NULLIF(pg_stat_get_live_tuples(pg_class.oid) + 
                                pg_stat_get_dead_tuples(pg_class.oid), 0), 2)
                        END as dead_tuple_percent,
                        pg_stat_get_last_vacuum_time(pg_class.oid) as last_vacuum,
                        pg_stat_get_last_analyze_time(pg_class.oid) as last_analyze
                    FROM pg_class
                    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
                    WHERE nspname = 'review_system'
                    AND relkind = 'r'
                    AND relname LIKE 'reviews_p%'
                )
                SELECT 
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'table_name', schema_name || '.' || table_name,
                                'partition_name', table_name,
                                'size', size,
                                'size_bytes', size_bytes,
                                'row_count', row_count,
                                'dead_tuples', dead_tuples,
                                'dead_tuple_percent', dead_tuple_percent,
                                'last_vacuum', last_vacuum,
                                'last_analyze', last_analyze,
                                'status', CASE 
                                    WHEN dead_tuple_percent > 20 THEN 'needs_vacuum'
                                    WHEN size_bytes > 1073741824 THEN 'large_partition'
                                    ELSE 'healthy'
                                END
                            )
                        ),
                        '[]'::json
                    ) as partitions
                FROM partition_stats;
            `);

            const partitions = result.rows[0].partitions || [];
            return {
                partitions,
                message: partitions.length > 0 ? 'success' : '暂无分区数据'
            };
        });
    }
} 
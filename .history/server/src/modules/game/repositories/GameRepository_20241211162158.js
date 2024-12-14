// src/modules/game/repositories/GameRepository.js
const { Pool } = require('pg');
const Redis = require('ioredis');
const { DatabaseConfig, RedisConfig } = require('../../../config');

class GameRepository {
    constructor() {
        this.pool = new Pool(DatabaseConfig);
        this.redis = new Redis(RedisConfig);
        this.CACHE_KEY_PREFIX = 'game:info:';
        this.CACHE_DURATION = 3600; // 1小时
    }

    async getGameInfo(gameId) {
        try {
            // 尝试从缓存获取
            const cachedData = await this.redis.get(`${this.CACHE_KEY_PREFIX}${gameId}`);
            if (cachedData) {
                return JSON.parse(cachedData);
            }

            // 构建游戏信息查询
            const query = `
                WITH game_base AS (
                    SELECT 
                        g.game_id,
                        g.title,
                        g.player_count,
                        g.release_date,
                        g.system_requirements,
                        d.developer_name,
                        d.description as developer_description
                    FROM games g
                    LEFT JOIN developers d ON g.developer_id = d.developer_id
                    WHERE g.game_id = $1
                ),
                game_tags AS (
                    SELECT 
                        t.name as tag_name,
                        t.type as tag_type,
                        t.description as tag_description
                    FROM game_tags gt
                    JOIN tags t ON gt.tag_id = t.tag_id
                    WHERE gt.game_id = $1
                )
                SELECT 
                    gb.*,
                    json_agg(
                        json_build_object(
                            'name', gt.tag_name,
                            'type', gt.tag_type,
                            'description', gt.tag_description
                        )
                    ) as tags
                FROM game_base gb
                LEFT JOIN game_tags gt ON true
                GROUP BY 
                    gb.game_id, 
                    gb.title, 
                    gb.player_count,
                    gb.release_date,
                    gb.system_requirements,
                    gb.developer_name,
                    gb.developer_description
            `;

            const result = await this.pool.query(query, [gameId]);
            
            if (result.rows.length === 0) {
                return null;
            }

            const gameInfo = result.rows[0];
            
            // 处理system_requirements中的平台信息
            const platformInfo = this.extractPlatformInfo(gameInfo.system_requirements);
            
            const formattedData = {
                gameInfo: {
                    id: gameInfo.game_id,
                    title: gameInfo.title,
                    playerCount: gameInfo.player_count,
                    releaseDate: gameInfo.release_date,
                    platform: platformInfo,
                    developer: {
                        name: gameInfo.developer_name,
                        description: gameInfo.developer_description
                    }
                },
                tags: gameInfo.tags || []
            };

            // 缓存数据
            await this.redis.setex(
                `${this.CACHE_KEY_PREFIX}${gameId}`,
                this.CACHE_DURATION,
                JSON.stringify(formattedData)
            );

            return formattedData;
        } catch (error) {
            console.error('Error in getGameInfo:', error);
            throw new Error('Database operation failed');
        }
    }

    extractPlatformInfo(systemRequirements) {
        try {
            if (typeof systemRequirements === 'string') {
                systemRequirements = JSON.parse(systemRequirements);
            }
            return systemRequirements?.minimum?.os || 'Unknown';
        } catch (error) {
            console.error('Error parsing system requirements:', error);
            return 'Unknown';
        }
    }
}

module.exports = GameRepository;
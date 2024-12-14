class GameBasicInfoService {
    constructor(repository) {
        if (!repository) throw new Error('Repository is required');
        this.repository = repository;
    }

    async getGameBasicInfo(gameId) {
        try {
            const gameInfo = await this.repository.getGameBasicInfo(gameId);
            if (!gameInfo) {
                throw new Error('Game not found');
            }

            return {
                game_id: gameInfo.game_id,
                price_info: {
                    current_price: gameInfo.current_price,
                    discount: gameInfo.discount || 0
                },
                developer: gameInfo.developer_name,
                release_date: gameInfo.release_date,
                player_mode: gameInfo.player_count,
                tags: gameInfo.tags
            };
        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    }
}

module.exports = GameBasicInfoService; 
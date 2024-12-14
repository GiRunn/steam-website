// src/modules/gameFeature/services/gameFeatureService.js
class GameFeatureService {
    constructor(repository) {
        if (!repository) throw new Error('Repository is required');
        this.repository = repository;
    }

    async getGameFeatureInfo(gameId) {
        try {
            const gameInfo = await this.repository.getGameFeatureInfo(gameId);
            if (!gameInfo) {
                throw new Error('Game not found');
            }
            return gameInfo;
        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    }
}

module.exports = GameFeatureService;
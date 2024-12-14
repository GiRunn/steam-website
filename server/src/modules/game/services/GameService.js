// src/modules/game/services/GameService.js
class GameService {
    constructor(gameRepository) {
        if (!gameRepository) {
            throw new Error('GameRepository is required');
        }
        this.gameRepository = gameRepository;
    }

    async getGameInfo(gameId) {
        if (!gameId || isNaN(gameId)) {
            throw new Error('Invalid game ID');
        }

        try {
            const gameInfo = await this.gameRepository.getGameInfo(gameId);
            if (!gameInfo) {
                throw new Error('Game not found');
            }
            return gameInfo;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = GameService;
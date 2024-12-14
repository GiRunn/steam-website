// src/modules/game/controllers/GameController.js
class GameController {
    constructor(gameService) {
        if (!gameService) {
            throw new Error('GameService is required');
        }
        this.gameService = gameService;
    }

    async getGameInfo(req, res) {
        const { gameId } = req.params;

        try {
            const gameInfo = await this.gameService.getGameInfo(gameId);
            res.json({
                data: gameInfo,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getGameInfo controller:', error);
            res.status(error.message === 'Game not found' ? 404 : 500).json({
                error: error.message,
                status: error.message === 'Game not found' ? 404 : 500,
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = GameController;
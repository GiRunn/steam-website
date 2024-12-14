// server/src/modules/gameOverview/controllers/gameOverviewController.js
class GameOverviewController {
    constructor(gameOverviewService) {
        this.gameOverviewService = gameOverviewService;
    }

    async getGameOverview(req, res) {
        try {
            const gameId = parseInt(req.params.gameId);
            
            if (isNaN(gameId)) {
                return res.status(400).json({
                    error: 'Invalid game ID'
                });
            }

            const overview = await this.gameOverviewService.getGameOverview(gameId);
            
            return res.json(overview);
        } catch (error) {
            console.error('Error fetching game overview:', error);
            
            if (error.message === 'Game not found') {
                return res.status(404).json({
                    error: 'Game not found'
                });
            }
            
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
}

module.exports = GameOverviewController;
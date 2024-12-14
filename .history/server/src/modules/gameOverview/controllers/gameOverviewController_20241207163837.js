// src/modules/gameOverview/controllers/gameOverviewController.js
class GameOverviewController {
    constructor(service) {
        if (!service) throw new Error('Service is required');
        this.service = service;
    }

    async getGameOverview(req, res) {
        try {
            const gameId = parseInt(req.params.gameId);
            
            if (isNaN(gameId)) {
                return res.status(400).json({
                    error: 'Invalid game ID'
                });
            }

            const overview = await this.service.getGameOverview(gameId);
            return res.json(overview);
            
        } catch (error) {
            console.error('Controller error:', {
                message: error.message,
                stack: error.stack,
                gameId: req.params.gameId
            });
            
            if (error.message === 'Game not found') {
                return res.status(404).json({
                    error: 'Game not found'
                });
            }
            
            return res.status(500).json({
                error: process.env.NODE_ENV === 'development' 
                    ? error.message 
                    : 'Internal server error'
            });
        }
    }
}

module.exports = GameOverviewController;